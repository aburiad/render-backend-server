const { VISION_CHAIN, TEXT_CHAIN } = require('./aiProviders')
const { AppError } = require('../middleware/errorHandler')

/**
 * Robust JSON-array extraction from any LLM output.
 * LLMs love wrapping JSON in ```json ... ``` or adding prose around it.
 */
function parseQuestionsJson(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty model response')
  }
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions
    return [parsed]
  } catch {
    // Slice out the first [...] block
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    if (start !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1)
      const parsed = JSON.parse(slice)
      if (Array.isArray(parsed)) return parsed
    }
  }
  throw new Error('Could not parse JSON array from model output')
}

// Vercel Hobby caps a serverless function at 10s. Cap each provider attempt
// so a stalled one cannot drain the budget for the rest of the chain.
const PROVIDER_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS) || 8000

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

const ENV_KEY = {
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  novita: 'NOVITA_API_KEY',
  huggingface: 'HUGGINGFACE_API_KEY',
  sambanova: 'SAMBANOVA_API_KEY',
  cohere: 'COHERE_API_KEY',
  zai: 'Z_API_KEY',
}

function configuredProviders(chain) {
  return chain.filter((p) => !!process.env[ENV_KEY[p.name]])
}

async function callWithFallback(chain, params, label) {
  const enabled = configuredProviders(chain)

  if (enabled.length === 0) {
    throw new AppError(
      'কোনো AI provider configure করা নেই। .env ফাইলে অন্তত একটি API key বসান।',
      503,
    )
  }

  const errors = []
  for (const provider of enabled) {
    try {
      console.log(`[ai:${label}] trying ${provider.name}…`)
      const text = await withTimeout(provider.chat(params), PROVIDER_TIMEOUT_MS, provider.name)
      const questions = parseQuestionsJson(text)
      console.log(`[ai:${label}] ✓ ${provider.name} returned ${questions.length} questions`)
      return { questions, provider: provider.name }
    } catch (err) {
      const msg = err?.message || String(err)
      // Full technical detail for server logs
      console.warn(`[ai:${label}] ✗ ${provider.name}: ${msg}`)
      errors.push({ provider: provider.name, message: msg })
    }
  }

  // User-facing message: short, actionable, Bengali. Technical detail stays in logs.
  const triedNames = enabled.map((p) => p.name).join(', ')
  const userMsg =
    label === 'scan'
      ? `প্রশ্ন স্ক্যান করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। আবার চেষ্টা করুন বা ছবি পরিষ্কার তুলে দেখুন। (${triedNames})`
      : `প্রশ্ন তৈরি করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন। (${triedNames})`

  const wrapped = new AppError(userMsg, 502)
  wrapped.providerErrors = errors // available to logs / debug endpoints
  throw wrapped
}

/**
 * Vision: extract questions from an image of a question paper.
 */
async function scanImage(base64Image, mimeType = 'image/jpeg') {
  if (!base64Image) throw new AppError('Image data is missing', 400)

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`

  const prompt = `Extract every question from this Bengali question paper image into a JSON array.

Schema per question type:
- MCQ: { type: "MCQ", question, option_a, option_b, option_c, option_d, correct_answer, marks, confidence }
- CQ:  { type: "CQ", stimulus, sub_questions: [{ label, text, marks }], confidence }
- short / broad: { type, question, marks, confidence }
- fill_blank: { type: "fill_blank", sentence, clues, marks, confidence }
- matching: { type: "matching", column_a: [], column_b: [], marks, confidence }
- rearranging: { type: "rearranging", sentences: [], marks, confidence }
- translation: { type: "translation", source_text, direction, marks, confidence }

Math: wrap math expressions in $...$ using LaTeX (e.g. $\\frac{a}{b}$, $\\sqrt{x}$, $x^{2}$). Keep an entire equation inside a SINGLE $...$ pair — don't split around + or =.

Output: ONLY the JSON array. No markdown fences, no commentary. Use \\n for line breaks inside text — never <br> tags.`

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ]

  const { questions, provider } = await callWithFallback(
    VISION_CHAIN,
    // Temperature 0 → deterministic transcription. Higher temp lets the
    // model "creatively" swap letters/digits, which is the exact failure
    // mode (x ↔ y, m ↔ n, fraction flip) we are trying to eliminate.
    { messages, vision: true, jsonMode: false, temperature: 0 },
    'scan',
  )
  return { questions, count: questions.length, provider }
}

/**
 * Text: generate questions from book chapter content.
 */
async function generateFromBook(chapterContext, config = {}) {
  const { subject = '', classNum = 0, questionTypes = ['MCQ'], count = 5 } = config

  const SUBJECTS_BN = {
    bangla: 'বাংলা',
    english: 'English',
    math: 'গণিত',
    science: 'বিজ্ঞান',
    accounting: 'হিসাববিজ্ঞান',
  }
  const subjectBn = SUBJECTS_BN[subject] || subject

  const typeInstructions = questionTypes
    .map((t) => {
      switch (t) {
        case 'MCQ':
          return 'MCQ: { "type": "MCQ", "question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "...", "marks": 1 }'
        case 'CQ':
          return 'CQ: { "type": "CQ", "stimulus": "...", "sub_questions": [{ "label": "ক", "text": "...", "marks": 1 }] }'
        case 'short':
          return 'Short: { "type": "short", "question": "...", "marks": 2 }'
        case 'broad':
          return 'Broad: { "type": "broad", "question": "...", "marks": 5 }'
        case 'fill_blank':
          return 'Fill: { "type": "fill_blank", "sentence": "... ___ ...", "clues": "...", "marks": 1 }'
        case 'matching':
          return 'Matching: { "type": "matching", "column_a": [...], "column_b": [...], "marks": 5 }'
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n')

  const isMath = /math|গণিত/i.test(subject) || /math|গণিত/i.test(subjectBn)

  const mathBlock = isMath
    ? `
### গণিতের সূত্র / সমীকরণ ফরম্যাট (গুরুত্বপূর্ণ):
সব গাণিতিক রাশি, সমীকরণ, সূত্র — অবশ্যই inline LaTeX-এ লিখবে: $ ... $

ঠিক:
  $\\frac{a}{b}$, $\\sqrt{x}$, $\\sqrt[3]{x}$, $x^{2}$, $x_{1}$
  $\\int_{0}^{1} f(x) dx$, $\\sum_{i=1}^{n} x_i$
  $\\sin\\theta$, $\\cos\\theta$, $\\pi r^2$
  $f(x) = ax^2 + bx + c$
  $\\geq$, $\\leq$, $\\neq$, $\\pm$, $\\times$, $\\overline{AB}$, $\\angle ABC$

ভুল:
  ✗ 1/2  →  $\\frac{1}{2}$
  ✗ x^2  →  $x^{2}$
  ✗ sqrt(x)  →  $\\sqrt{x}$
  ✗ অতিরিক্ত বন্ধনী বা markdown bold/italic
  ✗ unicode ², ³, ₁, ₂ — math mode-এ $x^{2}$, $x_{1}$ লিখো

মিশ্র উদাহরণ:
  "যদি $x^{2} + 2x + 1 = 0$ হয়, তবে $x$ এর মান নির্ণয় কর।"
`
    : ''

  const prompt = `তুমি একজন বাংলাদেশের অভিজ্ঞ শিক্ষক। নিচে ক্লাস ${classNum} এর ${subjectBn} বিষয়ের পাঠ্যবই থেকে নেওয়া গুরুত্বপূর্ণ তথ্য দেওয়া হলো।

এই তথ্যগুলো ব্যবহার করে ঠিক ${count} টি প্রশ্ন তৈরি করো।

### চ্যাপ্টার তথ্য:
${chapterContext}

### প্রশ্নের ধরন ও JSON ফরম্যাট:
${typeInstructions}
${mathBlock}
### নিয়ম:
- ভাষা: বাংলা (Unicode), গণিতের অংশ $...$ LaTeX-এ।
- Output: শুধুমাত্র একটি valid JSON array দাও। কোনো markdown fence, কোনো ব্যাখ্যা দেওয়া যাবে না।
- প্রশ্নগুলো যেন পাঠ্যবইয়ের তথ্যের বাইরে না যায়।
- MCQ-তে সঠিক উত্তর correct_answer ফিল্ডে দাও।
- CQ-তে stimulus দাও এবং ক, খ, গ, ঘ সাব-প্রশ্ন দাও।
- প্রশ্নগুলো Bloom's Taxonomy (জ্ঞানমূলক, অনুধাবনমূলক, প্রয়োগমূলক) মিশ্রণে হওয়া উচিত।
- প্রতিটি প্রশ্ন ইউনিক এবং বোর্ড পরীক্ষার মানসম্পন্ন হতে হবে।`

  const messages = [{ role: 'user', content: prompt }]

  const { questions, provider } = await callWithFallback(
    TEXT_CHAIN,
    { messages, vision: false, jsonMode: true, temperature: 0.6 },
    'book-generate',
  )
  return { questions, provider }
}

module.exports = { scanImage, generateFromBook, parseQuestionsJson }
