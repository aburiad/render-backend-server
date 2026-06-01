// Model cascade — tried in order per key. Each model has INDEPENDENT rate
// limits, so when one model is rate-limited we continue to the next model
// with the SAME key before moving to the next key.
//
// Free tier limits per key (as of 2026-05):
//   gemma-4-31b-it          — 15 RPM, Unlimited TPM, 1.5K RPD 🏆 BEST FOR TEXT
//   gemma-4-26b-a4b-it      — 15 RPM, Unlimited TPM, 1.5K RPD 🏆 BEST FOR TEXT
//   gemini-3.1-flash-lite   — 15 RPM, 250K TPM,  500 RPD  ← highest flash cap
//   gemini-3.5-flash        —  5 RPM, 250K TPM,   20 RPD
//   gemini-2.5-flash-lite   — 10 RPM, 250K TPM,   20 RPD
//   gemini-2.5-flash        —  5 RPM, 250K TPM,   20 RPD
//
// Gemma 4 models: Unlimited TPM + 1.5K RPD × 5 keys = 15K text calls/day!
// Per-key total (all models): ~3.5K RPD × 5 keys = 17.5K calls/day on Gemini
const VISION_MODELS = [
  'gemini-3.1-flash-lite',   // 15 RPM, 500 RPD 🏆 HIGHEST QUOTA
  'gemini-3.5-flash',        // 5 RPM, 20 RPD — fast (~5s)
  'gemini-2.5-flash-lite',   // 10 RPM, 20 RPD — fast (~5.5s)
  'gemini-2.5-flash',        // 5 RPM, 20 RPD — good quality (~9s)
]
const TEXT_MODELS = [
  'gemini-3.1-flash-lite',   // 15 RPM, 250K TPM, 500 RPD 🏆 TEXT #1 (native JSON)
  'gemini-3.5-flash',        // 5 RPM, 250K TPM, 20 RPD — fast (~5s)
  'gemini-2.5-flash-lite',   // 10 RPM, 250K TPM, 20 RPD — fast (~5.5s)
  'gemini-2.5-flash',        // 5 RPM, 250K TPM, 20 RPD — good quality (~9s)
  'gemma-4-31b-it',          // 15 RPM, Unlimited TPM, 1.5K RPD — fallback (echoes JSON)
  'gemma-4-26b-a4b-it',      // 15 RPM, Unlimited TPM, 1.5K RPD — fallback
]

const async = require('async')

// ── Queue (async.queue, concurrency=4) ──────────────────────────────────
// Render = single persistent process with a shared event loop. Without a
// queue, 20 concurrent requests all hit Gemini simultaneously, causing
// retry cascades (20 requests × 20 attempts = 400 API calls) that choke
// the event loop → 60s+ response times and 5-15% failure rate.
//
// With concurrency=4, the queue processes 4 requests at a time. This
// matches Gemini's rate limits (5 keys × 15 RPM = ~1 request/200ms per key)
// and keeps the event loop calm. Queue-aware hedge delay in aiService.js
// adjusts the hedge timer based on queue depth so fallbacks fire at the
// right time.
//
// Vercel = serverless (isolated per request) — queue is harmless there
// since each function invocation has at most 1 request.
const QUEUE_CONCURRENCY = 4

const geminiQueue = async.queue(async (task) => {
  return await task.fn()
}, QUEUE_CONCURRENCY)

// NOTE: async.queue push() is callback-based, NOT Promise-based.
// We wrap push in a Promise so chat() can await the result.
function queuePush(fn) {
  return new Promise((resolve, reject) => {
    geminiQueue.push({ fn }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

// Translate OpenAI-style messages to Gemini-style contents
function convertMessagesToGemini(messages) {
  return messages.map(msg => {
    // Gemini roles are 'user' and 'model'
    let role = msg.role === 'assistant' ? 'model' : 'user'

    // Handle string content
    if (typeof msg.content === 'string') {
      return { role, parts: [{ text: msg.content }] }
    }

    // Handle array content (usually text + image_url)
    if (Array.isArray(msg.content)) {
      const parts = msg.content.map(part => {
        if (part.type === 'text') {
          return { text: part.text }
        }
        if (part.type === 'image_url') {
          // url is "data:image/jpeg;base64,..."
          const match = part.image_url.url.match(/^data:(image\/\w+);base64,(.+)$/)
          if (match) {
            return {
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            }
          }
        }
        return null
      }).filter(Boolean)

      return { role, parts }
    }

    return { role, parts: [{ text: '' }] }
  })
}

async function tryModel({ apiKey, model, messages, jsonMode, temperature }) {
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = convertMessagesToGemini(messages.filter(m => m.role !== 'system'))

  // Extract system message and pass as Gemini's native systemInstruction field
  const systemMsg = messages.find(m => m.role === 'system')

  const generationConfig = {
    temperature,
  }

  const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
  ]

  if (jsonMode) {
    // Gemma models don't support responseMimeType — they return JSON schemas
    // like {"type": string} instead of actual data. Skip for Gemma; the prompt
    // already asks for JSON output and parseQuestionsJson() handles extraction.
    // Gemini Flash models (vision) are unaffected — they support it fully.
    if (!model.startsWith('gemma')) {
      generationConfig.responseMimeType = 'application/json'
      console.log(`[gemini] model=${model} → responseMimeType=application/json`)
    } else {
      console.log(`[gemini] model=${model} → SKIPPING responseMimeType (Gemma fix)`)
    }
  }

  const body = { contents, generationConfig, safetySettings }

  // Attach system instruction if present (Gemini native format)
  if (systemMsg) {
    body.systemInstruction = {
      parts: [{ text: typeof systemMsg.content === 'string' ? systemMsg.content : systemMsg.content?.[0]?.text || '' }]
    }
  }

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    
    // Detect quota exhaustion (daily limit reached)
    const isQuotaExhausted = res.status === 429 && (
      text.includes('RESOURCE_EXHAUSTED') ||
      text.includes('quota') ||
      text.includes('GenerateRequestsPerDay')
    )
    
    // Only treat as "model gone" when the error explicitly says so.
    const isModelGone = res.status === 404 ||
      (res.status === 400 && (text.includes('not found') || text.includes('deprecated')))
    const isRateLimit = res.status === 429 || res.status === 503
    
    console.error(`[gemini] ❌ ${model} key=${apiKey.slice(0, 8)}... status=${res.status} body=${text.slice(0, 500)}`)
    
    const err = new Error(`Gemini ${res.status}: ${text}`)
    err.modelDecommissioned = isModelGone
    err.isRateLimit = isRateLimit
    err.isQuotaExhausted = isQuotaExhausted
    
    if (isQuotaExhausted) {
      console.warn(`[gemini] ⚠️  Daily quota exhausted for key "${apiKey.slice(0, 8)}..." — model: ${model}`)
    }
    
    throw err
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (text) {
    console.log(`[gemini] ✓ model=${model} response (${text.length} chars): ${text.slice(0, 200)}`)
  } else {
    console.warn(`[gemini] ⚠ model=${model} returned empty. Full response:`, JSON.stringify(data).slice(0, 500))
  }
  return text
}

// Cache quota-exhausted models so we don't waste time retrying them.
// Key: model name, Value: timestamp when quota will reset (next day).
const quotaExhaustedModels = {}

function isModelQuotaExhausted(model) {
  if (!quotaExhaustedModels[model]) return false
  if (Date.now() > quotaExhaustedModels[model]) {
    delete quotaExhaustedModels[model]
    return false
  }
  return true
}

// Atomic round-robin counter — incremented before key selection so that
// concurrent requests each get a different starting key (true distribution).
let rrCounter = 0
const cooldowns = {}

// Core logic — tries models × keys with retry. Runs INSIDE the queue.
async function _chatDirect({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  let apiKeys = []
  if (providedKey) {
    apiKeys.push(providedKey)
  } else {
    const envKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_TWO,
      process.env.GEMINI_API_KEY_THREE,
      process.env.GEMINI_API_KEY_FOUR,
      process.env.GEMINI_API_KEY_FIVE
    ].filter(Boolean)

    if (envKeys.length === 0) {
      throw new Error('No GEMINI_API_KEY set (tried 1 to 5)')
    }

    // Atomic round-robin: grab a slot before any async work so concurrent
    // requests each start from a different key index.
    const startIdx = (rrCounter++) % envKeys.length

    // Build ordered list starting from this request's assigned key.
    // Keys in cooldown are moved to the end (still tried as fallback).
    const now = Date.now()
    const ordered = []
    const cooled = []
    for (let i = 0; i < envKeys.length; i++) {
      const key = envKeys[(startIdx + i) % envKeys.length]
      if (!cooldowns[key] || now > cooldowns[key]) {
        ordered.push(key)
      } else {
        cooled.push(key)
      }
    }

    // If all keys are in cooldown, use them anyway rather than blocking
    if (ordered.length === 0) {
      console.warn('[gemini] All keys in cooldown — using them anyway (no block)')
      apiKeys = cooled
    } else {
      apiKeys = [...ordered, ...cooled]
    }
  }

  if (apiKeys.length === 0) {
    throw new Error('No GEMINI_API_KEY set (tried 1 to 5)')
  }

  const models = vision ? VISION_MODELS : TEXT_MODELS

  let lastErr
  // OUTER loop = models, INNER loop = keys
  for (const model of models) {
    // Skip models with known exhausted quota (cached until next day)
    if (isModelQuotaExhausted(model)) {
      console.log(`[gemini] Skipping "${model}" — daily quota already exhausted`)
      continue
    }

    for (const apiKey of apiKeys) {
      try {
        const text = await tryModel({ apiKey, model, messages, jsonMode, temperature })
        if (text) return text
      } catch (err) {
        lastErr = err
        if (err.modelDecommissioned) {
          console.warn(`[gemini] Model "${model}" not found/deprecated — skipping to next model`)
          break // skip remaining keys for this model, try next model
        }

        if (err.isQuotaExhausted) {
          // Cache this model as exhausted until next midnight UTC
          const tomorrow = new Date()
          tomorrow.setUTCHours(24, 0, 0, 0)
          quotaExhaustedModels[model] = tomorrow.getTime()
          console.warn(`[gemini] Daily quota exhausted for model "${model}" — cached until reset, skipping to next model`)
          break
        }

        if (err.isRateLimit) {
          console.warn(`[gemini] Key "${apiKey.slice(0, 8)}..." model "${model}" rate-limited — trying next key`)
          continue // try next KEY with same model (distribute load)
        }
      }
    }
    // All keys rate-limited for this model → move to next model
  }
  throw lastErr || new Error('Gemini: all keys failed')
}

// Public chat — queues requests with concurrency control.
// On Render (persistent server), this prevents event loop congestion by
// limiting concurrent Gemini API calls to 4. On Vercel (serverless), each
// function has at most 1 request so the queue is effectively a no-op.
async function chat(params) {
  return queuePush(() => _chatDirect(params))
}

// Queue info for aiService.js queue-aware hedge delay
function getQueueInfo() {
  return {
    waiting: geminiQueue.waiting,
    active: geminiQueue.active,
    concurrency: QUEUE_CONCURRENCY,
  }
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat, getQueueInfo }