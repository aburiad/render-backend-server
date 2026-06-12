const VISION_MODELS = [
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'Qwen/Qwen2.5-VL-72B-Instruct',
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
]
const TEXT_MODELS = [
  'meta-llama/Llama-3.3-70B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mistral-Small-24B-Instruct-2501',
]
const URL = 'https://router.huggingface.co/v1/chat/completions'

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
    const isModelMissing = /not.*supported|model_not_supported|not.found/i.test(text)
    const err = new Error(`HuggingFace ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not set')

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
  throw lastErr || new Error('HuggingFace: no usable model')
}

module.exports = { name: 'huggingface', supportsVision: true, supportsText: true, chat }
