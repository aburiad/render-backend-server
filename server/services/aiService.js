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
// When running on Vercel, we default to 5s (5000ms) to ensure fallbacks can try other providers before timeout.
const DEFAULT_TIMEOUT = process.env.VERCEL === '1' ? 20000 : 30000
const PROVIDER_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT

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
      ? `প্রশ্ন স্ক্যান করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। দয়া করে ১-২ মিনিট অপেক্ষা করে আবার চেষ্টা করুন। (${triedNames})`
      : `প্রশ্ন তৈরি করতে পারিনি — সব AI provider সাড়া দিচ্ছে না। দয়া করে ১-২ মিনিট অপেক্ষা করে আবার চেষ্টা করুন। (${triedNames})`

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
async function scanImage(base64Image, mimeType = 'image/jpeg', userId = null, questionType = 'mcq') {
  if (!base64Image) throw new AppError('Image data is missing', 400)

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`

  const config = await configService.getConfig()
  const providerNames = config?.aiProviderConfig?.vision_chain || DEFAULT_VISION.map(p => p.name)
  const visionChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

  // System message: tells the model its ONLY job is to output JSON. Added hallucination control and example.
  const SYSTEM_MSG = 'You are a strict JSON extractor. Output ONLY a valid JSON array. No explanation, no comments, no markdown. Rule: Do not guess or hallucinate any text. If any word is totally illegible, output "[unreadable]". Example Output: [{"type": "MCQ", "question": "What is the capital of BD?", "option_a": "Dhaka", "correct_answer": "Dhaka"}]'

  // Ultra-compact type-specific prompts (~20-30 tokens each).
  // Keeping them minimal eliminates layout-detection reasoning entirely.
  const PROMPTS = {
    mcq:        'Extract MCQ: [{type:"MCQ",question,option_a,option_b,option_c,option_d,correct_answer,marks,confidence}]',
    cq:         'Extract CQ: [{type:"CQ",stimulus,sub_questions:[{label,text,marks}],confidence}]',
    creative:   'Extract descriptive: [{type:"broad",question,marks,confidence}]',
    short:      'Extract short Q: [{type:"short",question,marks,confidence}]',
    fill_blank: 'Extract fill-in-blank: [{type:"fill_blank",sentence,clues,marks,confidence}]',
    matching:   'Extract matching: [{type:"matching",column_a:[],column_b:[],marks,confidence}]',
    true_false: 'Extract true/false: [{type:"true_false",statements:[{text,answer}],marks,confidence}]',
    math:       'Extract math: [{type:"math",question,equations:[],answer,marks,confidence}]',
    passage:    'Extract passage: [{type:"passage",passage,questions:[{no,text,marks}],confidence}]',
    accounting: 'Extract accounting table: [{type:"accounting",title_lines:[],headers:[],rows:[[]],total_row:[],notes,marks,confidence}]',
    grammar:    'Extract grammar: [{type:"grammar",question,instruction,answer,marks,confidence}]',
    poem:       'Extract poem: [{type:"poem",lines:[],author,marks,confidence}]',
    essay:      'Extract essay: [{type:"essay",question,word_limit,marks,confidence}]',
    paragraph:  'Extract paragraph topic: [{type:"paragraph",question,hints:[],marks,confidence}]',
    translation:'Extract translation: [{type:"translation",question,marks,confidence}]',
    arabic:     'Extract Arabic block: [{type:"arabic",arabic_text,question,marks,confidence}]',
    hadith:     'Extract Hadith/Tafseer: [{type:"hadith",arabic_block,translation,question,marks,confidence}]',
    fiqh:       'Extract Fiqh question: [{type:"fiqh",question,marks,confidence}]',
    letter_app: 'Extract letter/application: [{type:"letter_app",question,marks,confidence}]',
    rearrange:  'Extract rearrange: [{type:"rearrange",sentences:[],marks,confidence}]',
    graph_chart:'Extract graph/chart: [{type:"graph_chart",question,marks,confidence}]',
    summary:    'Extract summary/theme: [{type:"summary",passage,question,marks,confidence}]',
    dialogue:   'Extract dialogue/story: [{type:"dialogue",question,marks,confidence}]'
  }
  const langRule = ' Preserve Bangla/Arabic/English exactly. Math in LaTeX $...$. Return ONLY JSON array.'
  const userPrompt = (PROMPTS[questionType] || PROMPTS.mcq) + langRule

  const messages = [
    {
      role: 'system',
      content: SYSTEM_MSG,
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
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
