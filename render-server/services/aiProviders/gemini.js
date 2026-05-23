// Model cascade — models are the OUTER loop, keys are INNER.
// This distributes load evenly across all 4 keys per model:
//   10 concurrent requests → ~2-3 per key on the same model.
//   When ALL keys are rate-limited for a model, move to next model.
//
// Free tier limits per key (as of 2026-05):
//   gemini-3.1-flash-lite  — 15 RPM, 250K TPM, 500 RPD  ← highest daily cap
//   gemini-3.5-flash       —  5 RPM, 250K TPM,  20 RPD
//   gemini-3-flash         —  5 RPM, 250K TPM,  20 RPD
//   gemini-2.5-flash-lite  — 10 RPM, 250K TPM,  20 RPD
//   gemini-2.5-flash       —  5 RPM, 250K TPM,  20 RPD
//
// Per-key total: 580 RPD × 4 keys = 2,320 scans/day on Gemini alone
// Model cascade — ordered by speed + reliability.
// Each model has INDEPENDENT 20 req/day free quota per project.
// More models in cascade = more total free scans (4 working × 20 = 80/day).
// gemini-2.0-flash* also work but quota-exhausted today; will work after reset.
const VISION_MODELS = [
  'gemini-3.5-flash',        // ~5s ✅ fastest
  'gemini-2.5-flash-lite',   // ~5.5s ✅ fast, reliable
  'gemini-2.5-flash',        // ~9s — good quality
  'gemini-2.0-flash-lite',   // fast (when quota available)
  'gemini-2.0-flash',        // fast (when quota available)
  'gemini-3.1-flash-lite',   // ~10s — slow, sometimes 503
]
const TEXT_MODELS = [
  'gemini-3.5-flash',        // ~5s ✅ fastest
  'gemini-2.5-flash-lite',   // ~5.5s ✅ fast, reliable
  'gemini-2.5-flash',        // ~9s — good quality
  'gemini-2.0-flash-lite',   // fast (when quota available)
  'gemini-2.0-flash',        // fast (when quota available)
  'gemini-3.1-flash-lite',   // ~10s — slow, sometimes 503
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

  // thinkingConfig only supported on models that explicitly support it.
  // gemini-2.5-flash-lite does NOT support thinkingBudget — omit entirely.

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
    // A generic 400 (e.g. bad thinkingConfig param) must NOT set
    // modelDecommissioned=true — that flag skips ALL remaining key retries.
    const isModelGone = res.status === 404 ||
      (res.status === 400 && (text.includes('not found') || text.includes('deprecated')))
    const isRateLimit = res.status === 429 || res.status === 503
    
    // Debug: log full error for Render deployment diagnostics
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

// Atomic round-robin counter — incremented before key selection so that
// concurrent requests each get a different starting key (true distribution).
let rrCounter = 0
const cooldowns = {}
const failureCount = {}  // Track failures per key

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  let apiKeys = []
  if (providedKey) {
    apiKeys.push(providedKey)
  } else {
    const envKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_TWO,
      process.env.GEMINI_API_KEY_THREE,
      process.env.GEMINI_API_KEY_FOUR
    ].filter(Boolean)

    if (envKeys.length === 0) {
      throw new Error('No GEMINI_API_KEY set (tried 1 to 4)')
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
    throw new Error('No GEMINI_API_KEY set (tried 1 to 4)')
  }

  // system messages are now handled via systemInstruction field above

  const models = vision ? VISION_MODELS : TEXT_MODELS

  let lastErr
  // OUTER loop = models, INNER loop = keys
  // This distributes requests evenly across all keys for each model.
  // Round-robin already gives each request a different starting key,
  // so concurrent requests naturally spread across keys.
  for (const model of models) {
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
          // Daily quota exhausted for this model — ALL keys share the same
          // project quota, so trying more keys is pointless. Skip to next model.
          console.warn(`[gemini] Daily quota exhausted for model "${model}" — skipping to next model (all keys share project quota)`)
          break
        }

        if (err.isRateLimit) {
          console.warn(`[gemini] Key "${apiKey.slice(0, 8)}..." model "${model}" rate-limited — trying next key`)
          continue // try next KEY with same model (distribute load)
        }
      }
    }
    // All keys rate-limited for this model → move to next model
    console.warn(`[gemini] All keys rate-limited for model "${model}" — trying next model`)
  }
  throw lastErr || new Error('Gemini: all keys failed')
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat }
