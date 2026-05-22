const VISION_MODELS = ['gemini-2.5-flash-lite']
const TEXT_MODELS = ['gemini-2.5-flash-lite']

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
    thinkingConfig: {
      thinkingBudget: 0
    }
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
    // Only treat as "model gone" when the error explicitly says so.
    // A generic 400 (e.g. bad thinkingConfig param) must NOT set
    // modelDecommissioned=true — that flag skips ALL remaining key retries.
    const isModelGone = res.status === 404 ||
      (res.status === 400 && (text.includes('not found') || text.includes('deprecated')))
    const isRateLimit = res.status === 429 || res.status === 503
    const err = new Error(`Gemini ${res.status}: ${text}`)
    err.modelDecommissioned = isModelGone
    err.isRateLimit = isRateLimit
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
  for (const apiKey of apiKeys) {
    for (const model of models) {
      try {
        const text = await tryModel({ apiKey, model, messages, jsonMode, temperature, vision })
        if (text) return text
      } catch (err) {
        lastErr = err
        if (err.modelDecommissioned) throw err // Do not retry if model doesn't exist

        // Rate-limited keys get a longer cooldown (60s); other failures get 15s.
        // Only apply cooldown when we have multiple keys to rotate through.
        if (!providedKey && apiKeys.length > 1) {
          const cooldownMs = err.isRateLimit ? 60000 : 15000
          cooldowns[apiKey] = Date.now() + cooldownMs
          failureCount[apiKey] = (failureCount[apiKey] || 0) + 1
        }

        console.warn(`[gemini] Key "${apiKey.slice(0, 8)}..." failed for ${model}: ${err.message}`)
        // Immediately try the next key/model in the loop
      }
    }
  }
  throw lastErr || new Error('Gemini: all keys failed')
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat }
