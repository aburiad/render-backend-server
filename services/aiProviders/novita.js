const VISION_MODELS = [
  'qwen/qwen2.5-vl-72b-instruct',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'meta-llama/llama-3.2-90b-vision-instruct',
]
const TEXT_MODELS = [
  'meta-llama/llama-3.3-70b-instruct',
  'qwen/qwen-2.5-72b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
]
// Novita has two endpoints in the wild — newer accounts use /openai/, older docs use /v3/openai/.
const URLS = [
  'https://api.novita.ai/openai/chat/completions',
  'https://api.novita.ai/v3/openai/chat/completions',
]

async function tryEndpoint({ apiKey, url, model, messages, jsonMode, temperature }) {
  const body = { model, messages, temperature, max_tokens: 4096 }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    const isModelMissing = res.status === 404 || /MODEL_NOT_FOUND|not.found/i.test(text)
    const err = new Error(`Novita ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    err.endpointMissing = res.status === 404 && /endpoint|path/i.test(text)
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.NOVITA_API_KEY
  if (!apiKey) throw new Error('NOVITA_API_KEY not set')

  const models = vision ? VISION_MODELS : TEXT_MODELS
  let lastErr
  for (const url of URLS) {
    for (const model of models) {
      try {
        const text = await tryEndpoint({ apiKey, url, model, messages, jsonMode, temperature })
        if (text) return text
      } catch (err) {
        lastErr = err
        if (!err.modelDecommissioned && !err.endpointMissing) throw err
      }
    }
  }
  throw lastErr || new Error('Novita: no usable model')
}

module.exports = { name: 'novita', supportsVision: true, supportsText: true, chat }
