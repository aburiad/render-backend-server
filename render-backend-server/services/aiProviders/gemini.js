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
//
// Updated: Removed async.queue bottleneck. Direct calls with round-robin
// key distribution handles concurrent load efficiently — matches Vercel's
// proven approach (20/20 Gemini, avg 8.9s vs old queue's 15/20, avg 10.2s).
const VISION_MODELS = [
  'gemini-3.1-flash-lite',   // 15 RPM, 500 RPD 🏆 HIGHEST QUOTA
  'gemini-3.5-flash',        // 5 RPM, 20 RPD — fast (~5s)
  'gemini-2.5-flash-lite',   // 10 RPM, 20 RPD — fast (~5.5s)
  'gemini-2.5-flash',        // 5 RPM, 20 RPD — good quality (~9s)
]
const TEXT_MODELS = [
  'gemma-4-31b-it',          // 15 RPM, Unlimited TPM, 1.5K RPD 🏆 TEXT #1
  'gemma-4-26b-a4b-it',      // 15 RPM, Unlimited TPM, 1.5K RPD 🏆 TEXT #2
  'gemini-3.1-flash-lite',   // 15 RPM, 500 RPD — fallback
  'gemini-3.5-flash',        // 5 RPM, 20 RPD — fast (~5s)
  'gemini-2.5-flash-lite',   // 10 RPM, 20 RPD — fast (~5.5s)
  'gemini-2.5-flash',        // 5 RPM, 20 RPD — good quality (~9s)
]

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

async function tryModel({ apiKey, model, messages, jsonMode, temperature, vision }) {
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
    generationConfig.responseMimeType = 'application/json'
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
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
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

// Direct chat — no queue bottleneck. Round-robin distributes concurrent
// requests across keys automatically. Each of 5 keys handles 15 RPM,
// so 5 keys × 15 RPM = 75 RPM sustained throughput without queuing.
async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
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
        const text = await tryModel({ apiKey, model, messages, jsonMode, temperature, vision })
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

// Stub getQueueInfo for aiService compatibility (no queue = always empty)
function getQueueInfo() {
  return { waiting: 0, active: 0, concurrency: 5 }
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat, getQueueInfo }