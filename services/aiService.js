const { VISION_CHAIN: DEFAULT_VISION, TEXT_CHAIN: DEFAULT_TEXT, ALL_MAP } = require('./aiProviders')
const configService = require('./configService')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const userApiKeyService = require('./userApiKeyService')
const imagePreprocessor = require('../utils/imagePreprocessor')
const imageQualityAssessor = require('../utils/imageQualityAssessor')
const { buildPrompt } = require('../utils/strictOcrPrompts')
const { validateQuestion, buildFeedbackPrompt, bnMessageForHardErrors } = require('../utils/questionValidator')

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

// Quality window: after a fallback resolves first, we wait this long for
// the preferred provider (gemini) to ALSO resolve and prefer its answer.
// Gemini's OCR is typically more accurate than weaker fallbacks like
// Llama-Scout; a faster-but-wrong answer is worse than a slightly slower
// correct one when teachers are building real question papers.
const HEDGE_QUALITY_MS = Number(process.env.AI_HEDGE_QUALITY_MS) || 2000

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
      // Quality-aware: when a fallback resolves FIRST, we give the preferred
      // provider an extra HEDGE_QUALITY_MS to also resolve and prefer its
      // answer. Speed-only races let weaker-but-faster models overwrite the
      // higher-quality Gemini transcription on the user's screen.
      const tag = (p, src) => p.then(r => ({ r, src }), e => { throw Object.assign(e, { _src: src }) })

      const winner = await Promise.race([
        tag(preferredPromise, 'preferred'),
        tag(hedgePromise, 'hedge'),
      ])
      if (hedgeTimer) clearTimeout(hedgeTimer)

      if (winner.src === 'preferred') {
        return winner.r
      }

      // Fallback won speed race — wait briefly for preferred to catch up.
      const preferredCatchup = await Promise.race([
        preferredPromise.then(r => r, () => null),
        new Promise(resolve => setTimeout(() => resolve(null), HEDGE_QUALITY_MS)),
      ])
      if (preferredCatchup) {
        console.log(`[ai:${label}] preferred (${preferred.provider.name}) caught up in <${HEDGE_QUALITY_MS}ms — using its result over ${winner.r.provider}`)
        return preferredCatchup
      }
      console.log(`[ai:${label}] preferred missed quality window — using ${winner.r.provider} fallback result`)
      return winner.r
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
// ─── Vision token budget per question type ─────────────────────────────────
//
// Gemini bills vision input in 768×768 tiles, 258 tokens each. A 3000×4000
// phone photo = 9 tiles = 2322 tokens. We cap the longest side via
// preprocessor.opts.maxDim so the model only ever sees as many tiles as the
// question type actually needs:
//
//   768  → 1 tile  ≈ 258 tokens   (simple single-glyph visuals)
//   1024 → 1-2 tiles ≈ 258-516    (default — standard text questions)
//   1280 → 2-4 tiles ≈ 516-1032   (dense / multi-element / tables)
//
// Going below 768 hurts Bangla matra (ি, ী, ু, ৃ) recognition; going above
// 1280 burns tokens without measurable accuracy gain on this dataset.

const LOW_RES_TYPES = new Set([
  // Nursery/KG style — large simple glyphs or counting visuals
  'primary_tracing',
  'primary_comparison',
  'primary_image_matching',
  'primary_visual_math',
  'primary_picture_grid',
  'primary_inline_box',
])

const HIGH_RES_TYPES = new Set([
  // Dense multi-element questions
  'cq',
  'primary_cq',
  'primary_science_cq',
  'primary_passage',
  'primary_3col_matching',
  'passage',
  'summary',
  'hadith',
  'arabic',
  'fiqh',
  'math',
  'graph_chart',
  'primary_graph',
  // Accounting tables — many columns; 1024 squashes columns past legibility
  'accounting',
  'acc_equation',
  'acc_t_ledger',
  'acc_moving_ledger',
  'acc_general_journal',
  'acc_special_journal',
  'acc_trial_balance',
  'acc_financial_stmt',
])

function maxDimForType(qt) {
  if (LOW_RES_TYPES.has(qt)) return 768
  if (HIGH_RES_TYPES.has(qt)) return 1280
  return 1024
}

// Question types where color carries signal — red-ink corrections, table-row
// shading, colored stamps, Arabic text with diacritical marks rendered in
// color, etc. For these we skip the grayscale step in preprocessing.
const COLOR_PRESERVING_TYPES = new Set([
  'accounting',
  'acc_equation',
  'acc_t_ledger',
  'acc_moving_ledger',
  'acc_general_journal',
  'acc_special_journal',
  'acc_trial_balance',
  'acc_financial_stmt',
  'acc_mcq',
  'math',
  'arabic',
  'hadith',
  'fiqh',
  'graph_chart',
  'primary_geometry',
  'primary_graph',
])

async function scanImage(base64Image, mimeType = 'image/jpeg', userId = null, questionType = 'mcq') {
  if (!base64Image) throw new AppError('Image data is missing', 400)

  // Step 1: Quality assessment is ADVISORY ONLY. We used to throw a 400
  // here when score < 60 with the dreaded "ইমেজ কোয়ালিটি খুব খারাপ" popup.
  // That gate false-rejected normal cropped MCQ snips. Now we just log the
  // score and let the model decide — modern vision LLMs handle small/soft
  // crops fine, and treating empty model responses as failure (below) gives
  // us a much better signal than a heuristic checklist.
  let quality
  try {
    quality = await imageQualityAssessor.assess(base64Image)
    console.log(`[ai:scan] Image quality: ${quality.score}/100 (${quality.quality}) — ${quality.isUsable ? 'OK' : 'low, proceeding anyway'}`)
  } catch (err) {
    console.warn('[ai:scan] Quality assessment failed:', err.message, '— proceeding without preprocessing tier hint')
    quality = { score: 70, isUsable: true, needsPreprocessing: true, metadata: { sizeKB: 0 } }
  }

  // Step 2: Preprocess. We never apply destructive transforms (threshold,
  // median) — see imagePreprocessor.applyProcessingPipeline for why. The
  // tier just controls how strong the sharpen/contrast bumps are.
  //
  // `maxDim` caps the longest side so Gemini bills only as many 768×768
  // tiles as the question type actually needs (see maxDimForType comment).
  const preserveColor = COLOR_PRESERVING_TYPES.has(questionType)
  const maxDim = maxDimForType(questionType)
  const ppOpts = { preserveColor, maxDim }

  let processedImage
  if (quality.score < 70) {
    processedImage = await imagePreprocessor.aggressiveProcess(base64Image, ppOpts)
  } else if (quality.score < 85) {
    processedImage = await imagePreprocessor.process(base64Image, ppOpts)
  } else {
    processedImage = await imagePreprocessor.lightProcess(base64Image, ppOpts)
  }

  console.log(`[ai:scan] Preprocessing complete (preserveColor=${preserveColor}, maxDim=${maxDim}px → ~${Math.ceil(maxDim / 768) ** 2} tiles). Original size: ${quality.metadata?.sizeKB ?? '?'}KB`)

  const cleanBase64 = processedImage.replace(/^data:image\/\w+;base64,/, '')
  const dataUrl = `data:${mimeType};base64,${cleanBase64}`

  const config = await configService.getConfig()
  const providerNames = config?.aiProviderConfig?.vision_chain || DEFAULT_VISION.map(p => p.name)
  const visionChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

  // Build the messages array. We use the single-question contract (the
  // Magic Scan workflow has the teacher tell us the type up front, then
  // crop ONE question). Single mode forbids the model from returning
  // multiple items or a different type than user picked.
  const buildMessages = (feedback = '') => {
    const { system: SYSTEM_MSG, user: userPrompt } = buildPrompt(questionType, {
      single: true,
      feedback,
    })
    return [
      { role: 'system', content: SYSTEM_MSG },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ]
  }

  // Vision params shared between first attempt + retries:
  //   - temperature 0  → deterministic transcription (no creative letter/digit swaps)
  //   - jsonMode true  → triggers responseMimeType=application/json in gemini.js
  //   - questionType   → lets gemini.js attach a responseSchema for known types,
  //     which eliminates field-name hallucination on free-tier Flash Lite
  //   - topP/topK      → tighter sampling, complements temperature=0
  //   - maxOutputTokens → guard against truncated arrays on long papers
  const baseParams = {
    vision: true,
    jsonMode: true,
    temperature: 0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
    questionType,
  }

  let result = await callWithFallback(
    visionChain,
    { ...baseParams, messages: buildMessages() },
    'scan',
    userId,
  )

  // ─── Step 3a: Empty-result handling ────────────────────────────────────
  // Free-tier models occasionally return `[]`. Retry once with the top
  // Gemini model skipped, then throw 422 if still empty (refunds credit).
  if (Array.isArray(result.questions) && result.questions.length === 0) {
    console.warn(`[ai:scan] Empty result from ${result.provider} — retrying once with next model`)
    const retryParams = { ...baseParams, messages: buildMessages() }
    if (result.provider === 'gemini') {
      retryParams._skipModels = ['gemini-3.1-flash-lite']
    }
    try {
      result = await callWithFallback(visionChain, retryParams, 'scan', userId)
    } catch (err) {
      console.warn('[ai:scan] Empty-result retry also failed:', err.message)
    }

    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      throw new AppError(
        'ছবি থেকে কোনো প্রশ্ন বের করা গেল না — দয়া করে আরও স্পষ্ট ছবি দিন অথবা ভিন্নভাবে crop করে চেষ্টা করুন।',
        422,
      )
    }
  }

  // ─── Step 3b: Structural validation against user-selected type ─────────
  // Because the teacher told us the type before the AI saw the image, we
  // can hard-check the model's output. If the AI returned the wrong shape
  // (3 options on an MCQ, no stimulus on a CQ, type mismatch), retry ONCE
  // with explicit feedback. If still wrong, throw 422 with a specific
  // Bangla message so the teacher knows exactly what to re-crop.
  const validations = result.questions.map(q => validateQuestion(q, questionType))
  let allHard = validations.flatMap(v => v.hard)

  if (allHard.length > 0) {
    const feedback = buildFeedbackPrompt(allHard, questionType)
    console.warn(`[ai:scan] Validation hard errors after pass 1: ${allHard.join(', ')} — retrying with feedback`)

    const retryParams = {
      ...baseParams,
      messages: buildMessages(feedback),
      // On a structural retry we want the BEST model to take a fresh look —
      // skip the top of the cascade since it just failed structure check.
      _skipModels: result.provider === 'gemini' ? ['gemini-3.1-flash-lite'] : [],
    }

    try {
      const retryResult = await callWithFallback(visionChain, retryParams, 'scan', userId)
      // Only accept the retry if it has at least one question AND its
      // validation is no worse than pass 1.
      if (Array.isArray(retryResult.questions) && retryResult.questions.length > 0) {
        const retryValidations = retryResult.questions.map(q => validateQuestion(q, questionType))
        const retryHard = retryValidations.flatMap(v => v.hard)
        if (retryHard.length < allHard.length) {
          result = retryResult
          allHard = retryHard
          // Re-attach soft warnings from the retry's validations below.
          validations.length = 0
          validations.push(...retryValidations)
          console.log(`[ai:scan] Retry improved validation (${retryHard.length} hard errors remaining)`)
        }
      }
    } catch (err) {
      console.warn('[ai:scan] Validation-feedback retry failed:', err.message)
    }

    if (allHard.length > 0) {
      throw new AppError(bnMessageForHardErrors(allHard, questionType), 422)
    }
  }

  // ─── Step 3c: Attach soft warnings so the review UI can flag fields ────
  const { questions, provider, source } = result
  questions.forEach((q, i) => {
    const soft = validations[i]?.soft || []
    if (soft.length > 0) q._warnings = soft
  })

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
