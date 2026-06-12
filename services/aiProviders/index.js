const groq = require('./groq')
const openrouter = require('./openrouter')
const mistral = require('./mistral')
const novita = require('./novita')
const huggingface = require('./huggingface')
const sambanova = require('./sambanova')
const cohere = require('./cohere')
const zai = require('./zai')
const gemini = require('./gemini')

/**
 * Fallback chains. Order = preference (speed × free-tier headroom × reliability).
 *
 * Free providers go first so we exhaust free quota before touching paid Z.ai.
 * Z.ai (GLM family — paid) is last as the reliable safety net.
 *
 * Every provider in the pool has at least one multimodal model:
 *   - Groq + SambaNova + HF: Llama-4 Scout/Maverick
 *   - OpenRouter: Gemma-3 / Mistral-Small / Llama-4
 *   - Mistral: mistral-small-latest / Pixtral
 *   - Cohere: command-a-vision-07-2025
 *   - Novita: Qwen2.5-VL-72B
 *   - Z.ai: glm-4.5v / glm-4.6v
 */
const VISION_CHAIN = [gemini, groq, openrouter, mistral, sambanova, cohere, novita, huggingface, zai]
const TEXT_CHAIN = [gemini, groq, sambanova, mistral, openrouter, cohere, novita, huggingface, zai]

const ALL = [gemini, groq, openrouter, mistral, sambanova, cohere, novita, huggingface, zai]
const ALL_MAP = Object.fromEntries(ALL.map((p) => [p.name, p]))

module.exports = { VISION_CHAIN, TEXT_CHAIN, ALL, ALL_MAP }
