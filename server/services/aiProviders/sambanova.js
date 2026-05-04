// Llama-4 Maverick on SambaNova is multimodal (vision + text).
const VISION_MODELS = [
  'Llama-4-Maverick-17B-128E-Instruct',
  'Llama-4-Scout-17B-16E-Instruct',
]
const TEXT_MODELS = [
  'Meta-Llama-3.3-70B-Instruct',
  'Meta-Llama-3.1-405B-Instruct',
  'Llama-4-Maverick-17B-128E-Instruct',
  'Meta-Llama-3.1-70B-Instruct',
]
const URL = 'https://api.sambanova.ai/v1/chat/completions'

async function tryModel({ apiKey, model, messages, jsonMode, temperature }) {
  const body = { model, messages, temperature, max_tokens: 4096 }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    const isModelMissing = res.status === 404 || /not.found|model.*invalid/i.test(text)
    const err = new Error(`SambaNova ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6 }) {
  const apiKey = process.env.SAMBANOVA_API_KEY
  if (!apiKey) throw new Error('SAMBANOVA_API_KEY not set')

  const models = vision ? VISION_MODELS : TEXT_MODELS

  let lastErr
  for (const model of models) {
    try {
      const text = await tryModel({ apiKey, model, messages, jsonMode, temperature })
      if (text) return text
    } catch (err) {
      lastErr = err
      if (!err.modelDecommissioned) throw err
    }
  }
  throw lastErr || new Error('SambaNova: no usable model')
}

module.exports = { name: 'sambanova', supportsVision: true, supportsText: true, chat }
