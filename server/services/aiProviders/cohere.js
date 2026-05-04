// command-a-vision-* is Cohere's multimodal model. command-r-* are text only.
const VISION_MODELS = ['command-a-vision-07-2025']
const TEXT_MODELS = ['command-r-08-2024', 'command-r-plus-08-2024', 'command-r7b-12-2024']
const URL = 'https://api.cohere.com/v2/chat'

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
    const err = new Error(`Cohere ${res.status}: ${text}`)
    err.modelDecommissioned = isModelMissing
    throw err
  }
  const data = await res.json()
  const parts = data?.message?.content
  return Array.isArray(parts)
    ? parts.filter((p) => p.type === 'text').map((p) => p.text).join('')
    : data?.text
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6 }) {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) throw new Error('COHERE_API_KEY not set')

  // Vision models accept the OpenAI-style content array as-is.
  // Text models need plain string content (strip image_url parts).
  const cleanMessages = vision
    ? messages
    : messages.map((m) => ({
        role: m.role,
        content: Array.isArray(m.content)
          ? m.content.filter((p) => p.type === 'text').map((p) => p.text).join('\n')
          : m.content,
      }))

  const models = vision ? VISION_MODELS : TEXT_MODELS
  let lastErr
  for (const model of models) {
    try {
      const text = await tryModel({ apiKey, model, messages: cleanMessages, jsonMode, temperature })
      if (text) return text
    } catch (err) {
      lastErr = err
      if (!err.modelDecommissioned) throw err
    }
  }
  throw lastErr || new Error('Cohere: no usable model')
}

module.exports = { name: 'cohere', supportsVision: true, supportsText: true, chat }
