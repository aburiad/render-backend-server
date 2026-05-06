const VISION_MODELS = [
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-4-scout:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'qwen/qwen2.5-vl-32b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
]
const TEXT_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
]
const URL = 'https://openrouter.ai/api/v1/chat/completions'

async function tryModel({ apiKey, model, messages, jsonMode, temperature }) {
  const body = { model, messages, temperature, max_tokens: 4096 }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'Proshno Shala',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    const isModelMissing =
      (res.status === 404 || res.status === 400) &&
      /no.endpoints|not.found|invalid.model|model_not_found/i.test(text)
    const err = new Error(`OpenRouter ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

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
  throw lastErr || new Error('OpenRouter: no usable model')
}

module.exports = { name: 'openrouter', supportsVision: true, supportsText: true, chat }
