// Z.ai (Zhipu AI / GLM family) — paid provider, used as the last-resort fallback
// after all free options are exhausted.
const VISION_MODELS = ['glm-5v-turbo', 'glm-4.6v', 'glm-4.5v']
const TEXT_MODELS = ['glm-5.1', 'glm-5', 'glm-4.6', 'glm-4.5']
const URL = 'https://api.z.ai/api/paas/v4/chat/completions'

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
    const isModelMissing = res.status === 404 || /model.*not.*found|invalid.model/i.test(text)
    const err = new Error(`Z.ai ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.Z_API_KEY
  if (!apiKey) throw new Error('Z_API_KEY not set')

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
  throw lastErr || new Error('Z.ai: no usable model')
}

module.exports = { name: 'zai', supportsVision: true, supportsText: true, chat }
