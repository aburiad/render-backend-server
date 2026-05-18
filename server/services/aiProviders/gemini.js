const VISION_MODELS = ['gemini-2.5-flash']
const TEXT_MODELS = ['gemini-2.5-flash']
const URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'

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
    const isModelGone = res.status === 400 || res.status === 404
    const err = new Error(`Gemini ${res.status}: ${text}`)
    err.modelDecommissioned = isModelGone
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  // Clean messages similarly to other providers if needed
  const cleanMessages = messages

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
  throw lastErr || new Error('Gemini: no usable model')
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat }
