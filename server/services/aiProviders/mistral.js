// mistral-small-latest is multimodal in current Mistral releases.
const VISION_MODELS = ['mistral-small-latest', 'pixtral-12b-2409']
const TEXT_MODELS = ['mistral-small-latest', 'mistral-medium-latest']
const URL = 'https://api.mistral.ai/v1/chat/completions'

async function tryModel({ apiKey, model, messages, jsonMode, temperature }) {
  const body = { model, messages, temperature, max_tokens: 4096 }
  if (jsonMode) body.response_format = { type: 'json_object' }

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    const isModelMissing = res.status === 404 || /not.found|invalid.model/i.test(text)
    const err = new Error(`Mistral ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6 }) {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set')

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
  throw lastErr || new Error('Mistral: no usable model')
}

module.exports = { name: 'mistral', supportsVision: true, supportsText: true, chat }
