const VISION_MODELS = ['gemini-2.5-flash-lite']
const TEXT_MODELS = ['gemini-2.5-flash-lite']

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
  
  const contents = convertMessagesToGemini(messages)
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

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig, safetySettings }),
  })
  
  if (!res.ok) {
    const text = await res.text()
    const isModelGone = res.status === 404 || res.status === 400
    const err = new Error(`Gemini ${res.status}: ${text}`)
    err.modelDecommissioned = isModelGone
    throw err
  }
  
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
}

async function chat({ messages, vision = false, jsonMode = false, temperature = 0.6, apiKey: providedKey }) {
  const apiKey = providedKey || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  // Filter out system messages as Gemini native API handles system instructions differently,
  // but aiService currently just sends everything as user messages anyway.
  const cleanMessages = messages.filter((m) => m.role !== 'system')
  
  const models = vision ? VISION_MODELS : TEXT_MODELS
  const maxRetries = 2 // 1 initial attempt + 1 retry

  let lastErr
  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const text = await tryModel({ apiKey, model, messages: cleanMessages, jsonMode, temperature, vision })
        if (text) return text
      } catch (err) {
        lastErr = err
        if (err.modelDecommissioned) throw err // Do not retry if model doesn't exist
        
        console.warn(`[gemini] Attempt ${attempt} failed for ${model}: ${err.message}`)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 // 2 seconds
          console.log(`[gemini] Waiting ${waitTime / 1000}s before next try...`)
          await delay(waitTime)
        }
      }
    }
  }
  throw lastErr || new Error('Gemini: no usable model')
}

module.exports = { name: 'gemini', supportsVision: true, supportsText: true, chat }
