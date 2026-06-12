// Groq deprecates older preview models periodically.
const VISION_MODELS = [
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
]
const TEXT_MODELS = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-70b-versatile',
]
const URL = 'https://api.groq.com/openai/v1/chat/completions'

async function tryModel({ apiKey, model, messages, jsonMode, temperature, vision }) {
  const body = { model, messages, temperature, max_tokens: 4096 }
  if (jsonMode && !vision) body.response_format = { type: 'json_object' }

  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    const isModelGone = res.status === 400 && /decommission|model_not_found|not.*supported/i.test(text)
    const err = new Error(`Groq ${res.status}: ${text}`)
    err.modelDecommissioned = isModelGone
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const cleanMessages = vision ? messages.filter((m) => m.role !== 'system') : messages
  const models = vision ? VISION_MODELS : TEXT_MODELS

  let lastErr
  for (const model of models) {
    try {
      const text = await tryModel({ apiKey, model, messages: cleanMessages, jsonMode, temperature, vision })
      if (text) return text
    } catch (err) {
      lastErr = err
      if (!err.modelDecommissioned) throw err
    }
  }
  throw lastErr || new Error('Groq: no usable model')
}

module.exports = { name: 'groq', supportsVision: true, supportsText: true, chat }
