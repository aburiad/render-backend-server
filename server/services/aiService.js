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

// Vercel Hobby plan hard limit is 10s per function invocation.
// We give each provider up to 8s so there is still headroom for
// HTTP overhead. Gemini vision calls on flash-lite typically take 3-7s.
const DEFAULT_TIMEOUT = process.env.VERCEL === '1' ? 8000 : 30000
const PROVIDER_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT

// Hedging: fire fallbacks after this delay if preferred hasn't responded.
// On Render (persistent server) the timeout is 30s, so we can afford a
// longer hedge. Gemini vision with a 226KB image takes 3-9s; we need to
// give it enough headroom to finish before launching fallbacks.
// Default 8s: Gemini typically responds in 3-7s; fallbacks fire only if slow.
const HEDGE_DELAY_MS_BASE = Number(process.env.AI_HEDGE_DELAY_MS) || 8000

/**
 * Calculate hedge delay based on image size in the params.
 * Small image (<100KB)  → 3s
 * Medium image (100-300KB) → 4s (default)
 * Large image (>300KB)  → 5s
 */
function getHedgeDelay(params) {
  // On Render (persistent server, 30s timeout) we always use the base delay.
  // Image size no longer reduces hedge — Gemini needs time for vision calls.
  // Only override via env var AI_HEDGE_DELAY_MS if needed.
  return HEDGE_DELAY_MS_BASE
}

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
  // Gemini supports multiple system keys (round-robin inside gemini.js).
  // We intentionally do NOT pass a single apiKey here — passing no key lets
  // gemini.js read all GEMINI_API_KEY / _TWO / _THREE / _FOUR env vars and
  // distribute load across them. Passing only GEMINI_API_KEY would silently
  // drop the other 3 keys.
  gemini: null,
}

/**
 * For a given chain, return the list of providers that have an effective
 * API key — either user-supplied OR the system .env fallback. Each item
 * also carries the resolved key + a flag identifying its source.
 *
 * Special case — gemini: ENV_KEY is null, meaning gemini.js manages its own
 * multi-key pool internally. We still include it in the chain as long as at
 * least one GEMINI_API_KEY* env var is set, but we pass apiKey=undefined so
 * gemini.js uses its full round-robin pool instead of a single key.
 */
function buildEffectiveProviders(chain, userKeys) {
  return chain
    .map((provider) => {
      const userKey = userKeys[provider.name]

      // Gemini: self-managed multi-key pool — check any key exists
      if (ENV_KEY[provider.name] === null) {
        const hasSystemKey = !!(
          process.env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY_TWO ||
          process.env.GEMINI_API_KEY_THREE ||
          process.env.GEMINI_API_KEY_FOUR
        )
        if (!userKey && !hasSystemKey) return null
        // Pass userKey if set, otherwise undefined → gemini.js uses its pool
        return { provider, apiKey: userKey || undefined, isUserKey: !!userKey }
      }

      const envKey = process.env[ENV_KEY[provider.name]]
      const apiKey = userKey || envKey
      if (!apiKey) return null
      return { provider, apiKey, isUserKey: !!userKey }
    })
    .filter(Boolean)
}

/**
 * Try a single provider entry. Returns { questions, provider, source } on
 * success, throws on failure. Side-effects: logs to Supabase, marks user key.
 */
async function tryProvider({ provider, apiKey, isUserKey }, params, label, userId) {
  const text = await withTimeout(
    provider.chat({ ...params, apiKey }),
    PROVIDER_TIMEOUT_MS,
    provider.name,
  )
  const questions = parseQuestionsJson(text)
  console.log(`[ai:${label}] ✓ ${provider.name} returned ${questions.length} questions`)
  if (isUserKey && userId) {
    userApiKeyService.markUsed(userId, provider.name).catch(() => {})
  }
  supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: provider.name, p_success: true })
    .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
  return { questions, provider: provider.name, source: isUserKey ? 'user' : 'system' }
}

/**
 * Hedged fallback strategy:
 *
 *  1. Fire the PREFERRED provider (first in chain, usually gemini) immediately.
 *  2. After HEDGE_DELAY_MS, if preferred hasn't resolved yet, fire ALL remaining
 *     providers in parallel.
 *  3. Return whichever resolves first with a valid response.
 *  4. Abort / ignore the rest.
 *
 * This keeps Gemini as the quality-first choice while bounding worst-case
 * latency to roughly HEDGE_DELAY_MS + fastest-fallback-time instead of
 * PROVIDER_TIMEOUT_MS (45s) + fallback-time.
 *
 * If the preferred provider fails immediately (hard error, not slow), the
 * hedge timer is cancelled and fallbacks fire right away — no 8s penalty.
 */
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

  // ── Single provider: simple path, no hedging overhead ──────────────────
  if (enabled.length === 1) {
    const entry = enabled[0]
    try {
      console.log(`[ai:${label}] trying ${entry.provider.name} (${entry.isUserKey ? 'user-key' : 'system-key'})…`)
      return await tryProvider(entry, params, label, userId)
    } catch (err) {
      const msg = err?.message || String(err)
      console.warn(`[ai:${label}] ✗ ${entry.provider.name}: ${msg}`)
      supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: entry.provider.name, p_success: false })
        .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
      errors.push({ provider: entry.provider.name, message: msg })
    }
  } else {
    // ── Hedged path ─────────────────────────────────────────────────────
    const [preferred, ...fallbacks] = enabled
    const hedgeDelay = getHedgeDelay(params)

    console.log(`[ai:${label}] trying ${preferred.provider.name} (preferred, hedge=${hedgeDelay}ms)…`)

    // Wrap preferred in a promise we can race against the hedge timer.
    // We need to track whether it resolved/rejected to decide if we should
    // fire fallbacks immediately or wait for the hedge delay.
    let preferredDone = false
    let hedgeTimer = null

    const preferredPromise = tryProvider(preferred, params, label, userId)
      .then((result) => { preferredDone = true; return result })
      .catch((err) => {
        preferredDone = true
        const msg = err?.message || String(err)
        console.warn(`[ai:${label}] ✗ ${preferred.provider.name}: ${msg}`)
        supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: preferred.provider.name, p_success: false })
          .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
        errors.push({ provider: preferred.provider.name, message: msg })
        // Re-throw so the race knows preferred failed
        throw err
      })

    // Returns a promise that fires all fallbacks in parallel after the hedge
    // delay (or immediately if called before the delay). Resolves with the
    // first successful fallback result, rejects if all fail.
    const fireFallbacks = () => {
      if (hedgeTimer) { clearTimeout(hedgeTimer); hedgeTimer = null }

      console.log(`[ai:${label}] hedging — firing ${fallbacks.length} fallback(s) in parallel…`)

      // Each fallback races independently; we want the first SUCCESS.
      // Promise.any rejects only when ALL reject (AggregateError).
      return Promise.any(
        fallbacks.map(async (entry) => {
          try {
            console.log(`[ai:${label}] trying ${entry.provider.name} (${entry.isUserKey ? 'user-key' : 'system-key'})…`)
            return await tryProvider(entry, params, label, userId)
          } catch (err) {
            const msg = err?.message || String(err)
            console.warn(`[ai:${label}] ✗ ${entry.provider.name}: ${msg}`)
            supabaseAdmin.rpc('log_ai_provider_usage', { p_provider: entry.provider.name, p_success: false })
              .then(({ error }) => { if (error) console.warn('AI stat log error:', error.message) })
            errors.push({ provider: entry.provider.name, message: msg })
            throw err
          }
        })
      )
    }

    // Build a hedge-delay promise: after HEDGE_DELAY_MS, if preferred hasn't
    // finished yet, fire fallbacks in parallel and race them against preferred.
    const hedgePromise = new Promise((resolve, reject) => {
      hedgeTimer = setTimeout(() => {
        if (preferredDone) return // preferred already resolved/rejected — no-op
        console.log(`[ai:${label}] ${preferred.provider.name} slow (>${hedgeDelay}ms) — launching fallbacks…`)
        fireFallbacks().then(resolve, reject)
      }, hedgeDelay)
    })

    try {
      // Race: preferred vs hedge-triggered fallbacks.
      // If preferred wins (fast response), hedgeTimer is cleared below.
      const result = await Promise.race([preferredPromise, hedgePromise])
      if (hedgeTimer) clearTimeout(hedgeTimer)
      return result
    } catch {
      // Both preferred AND hedge-triggered fallbacks failed.
      // If preferred failed fast (before hedge fired), try remaining fallbacks
      // sequentially as a last resort.
      if (hedgeTimer) clearTimeout(hedgeTimer)

      if (!preferredDone || errors.filter(e => fallbacks.some(f => f.provider.name === e.provider)).length === 0) {
        // Fallbacks haven't been tried yet (preferred failed before hedge delay)
        try {
          return await fireFallbacks()
        } catch {
          // all fallbacks also failed — fall through to error below
        }
      }
    }
  }

  // ── All providers exhausted ─────────────────────────────────────────────
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

  // System message: OCR-first instruction — read EVERYTHING, skip nothing.
  // Key change from old prompt: removed "do not guess / output [unreadable]"
  // which was causing Gemini to skip unclear words instead of reading them.
  // Gemini vision is accurate enough that we want it to attempt every word.
  const SYSTEM_MSG = [
    'You are an expert OCR engine for Bengali/English question papers.',
    'Your job: read EVERY line of the image from top to bottom, left to right — skip nothing.',
    'Extract ALL questions exactly as written. Do NOT summarize, skip, merge, or reorder.',
    'Preserve every word, number, punctuation, and symbol exactly as it appears.',
    'CRITICAL: Copy text EXACTLY as it appears in the image. Do NOT paraphrase, substitute, or invent words. If a word is unclear, write your best reading of it — never replace it with a different word.',
    'For Bangla text: copy Unicode characters exactly — do not transliterate.',
    'For math: use LaTeX inline notation $...$ for all equations, fractions, symbols.',
    'Output ONLY a valid JSON array. No markdown fences, no explanation, no extra text.',
  ].join(' ')

  // Per-type prompts: explicit "read every question" instruction + format.
  const PROMPTS = {
    mcq: [
      'Read every MCQ question in this image from top to bottom. Do not skip any.',
      'For each MCQ extract: question text, all 4 options (ক/খ/গ/ঘ or a/b/c/d), correct answer if marked, marks.',
      'Output format: [{"type":"MCQ","question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"...","marks":1}]',
    ].join(' '),

    cq: [
      'Read every creative/সৃজনশীল question in this image from top to bottom. Do not skip any.',
      'Each CQ has a stimulus (উদ্দীপক) followed by sub-questions ক, খ, গ, ঘ.',
      'Output format: [{"type":"CQ","stimulus":"...","sub_questions":[{"label":"ক","text":"...","marks":1}]}]',
    ].join(' '),

    creative: [
      'Read every descriptive/broad question in this image from top to bottom. Do not skip any.',
      'Output format: [{"type":"broad","question":"...","marks":5}]',
    ].join(' '),

    short: [
      'Read every short question in this image from top to bottom. Do not skip any.',
      'Output format: [{"type":"short","question":"...","marks":2}]',
    ].join(' '),

    fill_blank: [
      'Read every fill-in-the-blank sentence in this image. Do not skip any.',
      'Use ___ for the blank. Include any word clues given.',
      'Output format: [{"type":"fill_blank","sentence":"... ___ ...","clues":"...","marks":1}]',
    ].join(' '),

    matching: [
      'Read the matching question columns in this image exactly.',
      'Output format: [{"type":"matching","column_a":["..."],"column_b":["..."],"marks":5}]',
    ].join(' '),

    true_false: [
      'Read every true/false statement in this image. Do not skip any.',
      'Output format: [{"type":"true_false","statements":[{"text":"...","answer":"true"}],"marks":1}]',
    ].join(' '),

    math: [
      'Read every math problem in this image from top to bottom. Do not skip any.',
      'Write all equations, fractions, symbols in LaTeX $...$.',
      'Output format: [{"type":"math","question":"...","equations":["$...$"],"answer":"...","marks":5}]',
    ].join(' '),

    passage: [
      'Read the full passage and all comprehension questions in this image. Do not skip any.',
      'Output format: [{"type":"passage","passage":"...","questions":[{"no":1,"text":"...","marks":2}]}]',
    ].join(' '),

    accounting: [
      'Read the full accounting table/ledger in this image exactly — every row, every column.',
      'Output format: [{"type":"accounting","title_lines":["..."],"headers":["..."],"rows":[["..."]],"total_row":["..."],"notes":"...","marks":10}]',
    ].join(' '),

    grammar: [
      'Read every grammar question in this image. Do not skip any.',
      'Output format: [{"type":"grammar","question":"...","instruction":"...","answer":"...","marks":2}]',
    ].join(' '),

    poem: [
      'Read the full poem in this image — every line, every stanza. Do not skip any lines.',
      'Output format: [{"type":"poem","lines":["..."],"author":"...","marks":5}]',
    ].join(' '),

    essay: [
      'Read every essay/রচনা question in this image. Do not skip any.',
      'Output format: [{"type":"essay","question":"...","word_limit":"...","marks":10}]',
    ].join(' '),

    paragraph: [
      'Read every paragraph writing topic in this image. Do not skip any.',
      'Output format: [{"type":"paragraph","question":"...","hints":["..."],"marks":5}]',
    ].join(' '),

    translation: [
      'Read every translation question in this image. Do not skip any.',
      'Output format: [{"type":"translation","question":"...","marks":3}]',
    ].join(' '),

    arabic: [
      'Read every Arabic text block in this image exactly — preserve all Arabic characters.',
      'Output format: [{"type":"arabic","arabic_text":"...","question":"...","marks":5}]',
    ].join(' '),

    hadith: [
      'Read every Hadith/Tafseer block in this image — Arabic text, translation, and question.',
      'Output format: [{"type":"hadith","arabic_block":"...","translation":"...","question":"...","marks":5}]',
    ].join(' '),

    fiqh: [
      'Read every Fiqh question in this image. Do not skip any.',
      'Output format: [{"type":"fiqh","question":"...","marks":5}]',
    ].join(' '),

    letter_app: [
      'Read every letter/application writing question in this image. Do not skip any.',
      'Output format: [{"type":"letter_app","question":"...","marks":10}]',
    ].join(' '),

    rearrange: [
      'Read every sentence rearrangement question in this image. Do not skip any.',
      'Output format: [{"type":"rearrange","sentences":["..."],"marks":3}]',
    ].join(' '),

    graph_chart: [
      'Read every graph/chart question in this image. Do not skip any.',
      'Output format: [{"type":"graph_chart","question":"...","marks":5}]',
    ].join(' '),

    summary: [
      'Read the full passage and summary/theme question in this image.',
      'Output format: [{"type":"summary","passage":"...","question":"...","marks":5}]',
    ].join(' '),

    dialogue: [
      'Read every dialogue/story writing question in this image. Do not skip any.',
      'Output format: [{"type":"dialogue","question":"...","marks":5}]',
    ].join(' '),
  }

  const langRule = ' Bangla text: copy Unicode exactly. Math: use $...$ LaTeX. Return ONLY the JSON array.'
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

module.exports = { scanImage, generateFromBook, parseQuestionsJson, callWithFallback }
