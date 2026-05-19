const { VISION_CHAIN: DEFAULT_VISION, TEXT_CHAIN: DEFAULT_TEXT, ALL_MAP } = require('./aiProviders')
const configService = require('./configService')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const userApiKeyService = require('./userApiKeyService')

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

// Vercel Hobby caps a serverless function at 10s, but since we are on Cloud Run / custom backend,
// we can safely increase this. Google Gemini vision often takes 15-20s.
const PROVIDER_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS) || 30000

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
  gemini: 'GEMINI_API_KEY',
}

/**
 * For a given chain, return the list of providers that have an effective
 * API key — either user-supplied OR the system .env fallback. Each item
 * also carries the resolved key + a flag identifying its source.
 */
function buildEffectiveProviders(chain, userKeys) {
  return chain
    .map((provider) => {
      const userKey = userKeys[provider.name]
      const envKey = process.env[ENV_KEY[provider.name]]
      const apiKey = userKey || envKey
      if (!apiKey) return null
      return { provider, apiKey, isUserKey: !!userKey }
    })
    .filter(Boolean)
}

async function callWithFallback(chain, params, label, userId = null) {
  const userKeys = userId ? await userApiKeyService.loadAllForUser(userId) : {}
  const enabled = buildEffectiveProviders(chain, userKeys)

  if (enabled.length === 0) {
    throw new AppError(
      'কোনো AI provider configure করা নেই। সেটিংস → AI Providers থেকে নিজের API key যোগ করুন অথবা .env-এ system key বসান।',
      503,
    )
  }

  const errors = []
  for (const { provider, apiKey, isUserKey } of enabled) {
    try {
      console.log(`[ai:${label}] trying ${provider.name} (${isUserKey ? 'user-key' : 'system-key'})…`)
      const text = await withTimeout(
        provider.chat({ ...params, apiKey }),
        PROVIDER_TIMEOUT_MS,
        provider.name,
      )
      const questions = parseQuestionsJson(text)
      console.log(`[ai:${label}] ✓ ${provider.name} returned ${questions.length} questions`)
      // Best-effort: bump last_used_at when the user's own key was used.
      if (isUserKey && userId) {
        userApiKeyService.markUsed(userId, provider.name).catch(() => {})
      }
      // Log usage for dashboard graph
      supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: provider.name, p_success: true })
        .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
      
      return { questions, provider: provider.name, source: isUserKey ? 'user' : 'system' }
    } catch (err) {
      const msg = err?.message || String(err)
      console.warn(`[ai:${label}] ✗ ${provider.name}: ${msg}`)
      errors.push({ provider: provider.name, message: msg, source: isUserKey ? 'user' : 'system' })
      
      // Log failure for dashboard graph
      supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: provider.name, p_success: false })
        .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
    }
  }

  const triedNames = enabled.map((e) => e.provider.name).join(', ')
  const userMsg =
    label === 'scan'
      ? `প্রশ্ন স্ক্যান করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। আবার চেষ্টা করুন বা ছবি পরিষ্কার তুলে দেখুন। (${triedNames})`
      : `প্রশ্ন তৈরি করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন। (${triedNames})`

  const wrapped = new AppError(userMsg, 502)
  wrapped.providerErrors = errors
  throw wrapped
}

/**
 * Vision: extract questions from an image of a question paper.
 * @param {string} base64Image
 * @param {string} mimeType
 * @param {string|null} userId — when supplied, user's stored API keys are
 *   tried before .env fallback for each provider.
 */
async function scanImage(base64Image, mimeType = 'image/jpeg', userId = null) {
  if (!base64Image) throw new AppError('Image data is missing', 400)

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`

  const config = await configService.getConfig()
  const providerNames = config?.aiProviderConfig?.vision_chain || DEFAULT_VISION.map(p => p.name)
  const visionChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

  const prompt = `You are a strict OCR text extraction engine.

Your ONLY task is to accurately extract text that is directly visible in the image.

STRICT RULES:

* Do NOT explain anything
* Do NOT summarize anything
* Do NOT answer questions
* Do NOT translate text
* Do NOT infer missing content
* Do NOT complete incomplete sentences
* Do NOT guess unclear words
* Do NOT add extra information
* Do NOT hallucinate content
* Do NOT rewrite the text
* Do NOT correct grammar or spelling
* Do NOT generate interpretations

TEXT EXTRACTION RULES:

* Extract ONLY clearly visible text
* Preserve the original structure and line breaks as much as possible
* Preserve paragraphs exactly
* Preserve spacing where possible
* Preserve question numbering exactly
* Preserve bullets, symbols, punctuation, and special characters
* Preserve Bangla, English, and Arabic exactly as written
* Preserve Quranic Arabic and madrasha text exactly without modification
* Preserve math equations, fractions, subscripts, superscripts, and symbols exactly
* Preserve tables and lists in readable text form
* Preserve handwritten text exactly if readable

UNREADABLE CONTENT RULES:

* If a word or line is unclear, write: [unreadable]
* If partially readable, preserve readable parts and mark unclear parts with [unreadable]
* Never invent missing text

OUTPUT RULES:

* Return plain text only
* No markdown
* No code blocks
* No commentary
* No labels
* No metadata
* No explanations before or after the extracted text

PRIORITY ORDER:

1. Structural Matching: Match the JSON "type" to the question's visual layout pattern in the image (e.g., if a question has a stimulus and sub-questions like ক/খ/গ/ঘ, it MUST be parsed as "CQ"; if it is a passage with questions, it is "passage"; if it has choices/options, it is "MCQ" — regardless of whether the language is Bangla, English, Arabic, or Islamic Studies. Do NOT force Arabic/Islamic questions into "arabic", "hadith", or "ebtedayi" types if they follow a CQ, MCQ, passage, or other structured layout).
2. Accuracy & No Hallucination: Extract only visible text, do not invent or translate text.
3. Exact preservation of original text, symbols, formatting, and line breaks.

Task: Extract every question from this question paper image into a JSON array, prioritizing structural matching.

Schema per question type:
- MCQ: { type: "MCQ", question, option_a, option_b, option_c, option_d, correct_answer, marks, confidence } — Use for any question with options, regardless of language.
- CQ:  { type: "CQ", stimulus, sub_questions: [{ label, text, marks }], confidence } — Use for ANY creative question with a stimulus/passage and sub-questions (e.g., ক, খ, গ, ঘ), regardless of the language (Bangla, English, Arabic, etc.).
- accounting (USE THIS for accounting/finance questions that contain a tabular ledger/trial-balance/journal followed by adjustments and ক/খ/গ sub-questions — NOT plain CQ):
  {
    type: "accounting",
    description: "intro line ABOVE the table (e.g. 'X কোম্পানির ৩১ ডিসেম্বর তারিখের রেওয়ামিল নিম্নরূপ:')",
    title_lines: ["company name", "table type like রেওয়ামিল / জাবেদা", "date"],
    headers: ["হিসাবের নাম", "ডেবিট (টাকা)", "ক্রেডিট (টাকা)"],
    alignments: ["left", "right", "right"],
    rows: [["account name", "debit", "credit"], ...],
    show_total: true,
    total_row: ["মোট", "total debit", "total credit"],
    notes_label: "সমন্বয়সমূহ",
    notes: "adjustments paragraph below the table",
    sub_questions: [{ label: "ক", text, marks }, { label: "খ", text, marks }, { label: "গ", text, marks }],
    confidence
  }
  Detection signals: words ডেবিট / ক্রেডিট / রেওয়ামিল / জাবেদা / খতিয়ান / নগদান বই / হিসাব শিরোনাম, monetary amounts in two columns, "মোট" total row, follow-up "সমন্বয়সমূহ" or "অন্যান্য তথ্যাবলি" paragraph, ক/খ/গ sub-questions. If ALL of these are present, output ONE accounting object — do NOT split it into separate table + CQ entries.
- table: { type: "table", question, headers: [], rows: [[]], marks, confidence } — for non-accounting plain tables
- short_question: { type: "short_question", question, marks, confidence }
- one_word: { type: "one_word", question, answer, marks, confidence }
- essay: { type: "essay", topic, word_limit, marks, confidence }
- paragraph: { type: "paragraph", topic, hints: [], marks, confidence }
- letter: { type: "letter", subtype: "application" | "letter", scenario, marks, confidence }
- dialogue: { type: "dialogue", scenario, turns, marks, confidence }
- grammar: { type: "grammar", subtype, sentence, instruction, answer, marks, confidence }
- math: { type: "math", question, equations: [], answer, marks, confidence }
- finance: { type: "finance", question, formula, values: {}, marks, confidence }
- diagram_question: { type: "diagram_question", diagram_ref, labels: [], question, marks, confidence }
- arabic: { type: "arabic", subtype: "ayat" | "hadith" | "generic", arabic_text, source, instruction, bangla_translation, marks, confidence } — Use ONLY for plain Arabic sentence translation/explanation questions that DO NOT follow a CQ, MCQ, or passage structure.
- hifz: { type: "hifz", prompt, surah_name, arabic_text, zero_hallucination: true, verify_against: "quran_corpus", marks, confidence }
- hadith: { type: "hadith", arabic_text, source, bangla_text, instruction, marks, confidence } — Use ONLY for plain Hadith translation/explanation questions that DO NOT follow a CQ, MCQ, or passage structure.
- ebtedayi: { type: "ebtedayi", masala_number, arabic_block, bangla_block, instruction, marks, confidence } — Use ONLY for plain Ebtedayi Masala explanation questions that DO NOT follow a CQ, MCQ, or passage structure.
- poem: { type: "poem", lines: [], author, instruction, marks, confidence }
- passage: { type: "passage", passage, questions: [{ no, text, marks }], confidence }
- true_false: { type: "true_false", statements: [{ text, answer: true|false }], marks, confidence }
- fill_blank: { type: "fill_blank", sentence, clues, marks, confidence }
- matching: { type: "matching", column_a: [], column_b: [], marks, confidence }
- rearranging: { type: "rearranging", sentences: [], marks, confidence }
- translation: { type: "translation", source_text, direction, marks, confidence }
- short / broad: { type: "short" | "broad", question, marks, confidence }

Math: wrap math expressions in $...$ using LaTeX (e.g. $\\frac{a}{b}$, $\\sqrt{x}$, $x^{2}$). Keep an entire equation inside a SINGLE $...$ pair — don't split around + or =.

Numbers in accounting tables: keep Bengali numerals as shown in the image (যেমন: ৮০,০০০ — do NOT convert to 80,000).

Final Output Format: Output ONLY the valid JSON array containing the extracted questions. No markdown fences (e.g. do not wrap in triple-backtick json blocks), no commentary. Use \\n for line breaks inside text fields — never <br> tags.`

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ]

  const { questions, provider, source } = await callWithFallback(
    visionChain,
    // Temperature 0 → deterministic transcription. Higher temp lets the
    // model "creatively" swap letters/digits, which is the exact failure
    // mode (x ↔ y, m ↔ n, fraction flip) we are trying to eliminate.
    { messages, vision: true, jsonMode: false, temperature: 0 },
    'scan',
    userId,
  )
  return { questions, count: questions.length, provider, source }
}

/**
 * Text: generate questions from book chapter content.
 * @param {string} chapterContext
 * @param {object} config
 * @param {string|null} userId — when supplied, user's stored API keys are
 *   tried before .env fallback for each provider.
 */
async function generateFromBook(chapterContext, config = {}, userId = null) {
  const { subject = '', classNum = 0, questionTypes = ['MCQ'], count = 5 } = config

  const SUBJECTS_BN = {
    bangla: 'বাংলা',
    english: 'English',
    math: 'গণিত',
    science: 'বিজ্ঞান',
    accounting: 'হিসাববিজ্ঞান',
  }
  const subjectBn = SUBJECTS_BN[subject] || subject
  
  const configServiceData = await configService.getConfig()
  const providerNames = configServiceData?.aiProviderConfig?.text_chain || DEFAULT_TEXT.map(p => p.name)
  const textChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

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

  const { questions, provider, source } = await callWithFallback(
    textChain,
    { messages, vision: false, jsonMode: true, temperature: 0.6 },
    'book-generate',
    userId,
  )
  return { questions, provider, source }
}

module.exports = { scanImage, generateFromBook, parseQuestionsJson }
