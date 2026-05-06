/**
 * BYO-key UI metadata for each AI provider in the fallback chain.
 *
 * Frontend reads this list to render the Settings → AI Providers page.
 * `envVar` matches the existing keys in aiService.js / .env, and `name`
 * matches the provider module's `name` field — that's how user keys get
 * looked up at request time.
 */
const PROVIDER_META = [
  {
    name: 'groq',
    label: 'Groq',
    envVar: 'GROQ_API_KEY',
    signupUrl: 'https://console.groq.com/keys',
    description: 'দ্রুত, vision-capable, generous free tier — Llama-4 মডেল',
    supportsVision: true,
    supportsText: true,
    keyPrefix: 'gsk_',
    recommended: true,
  },
  {
    name: 'openrouter',
    label: 'OpenRouter',
    envVar: 'OPENROUTER_API_KEY',
    signupUrl: 'https://openrouter.ai/keys',
    description: 'একটি কী দিয়ে অনেক মডেল — Gemma, Mistral, Llama-4',
    supportsVision: true,
    supportsText: true,
    keyPrefix: 'sk-or-',
  },
  {
    name: 'mistral',
    label: 'Mistral',
    envVar: 'MISTRAL_API_KEY',
    signupUrl: 'https://console.mistral.ai/api-keys/',
    description: 'Mistral Small / Pixtral — স্থিতিশীল ফ্রি কোটা',
    supportsVision: true,
    supportsText: true,
  },
  {
    name: 'sambanova',
    label: 'SambaNova',
    envVar: 'SAMBANOVA_API_KEY',
    signupUrl: 'https://cloud.sambanova.ai/apis',
    description: 'Llama-4 Scout / Maverick দ্রুত inference',
    supportsVision: true,
    supportsText: true,
  },
  {
    name: 'cohere',
    label: 'Cohere',
    envVar: 'COHERE_API_KEY',
    signupUrl: 'https://dashboard.cohere.com/api-keys',
    description: 'Command-A vision + text মডেল',
    supportsVision: true,
    supportsText: true,
  },
  {
    name: 'novita',
    label: 'Novita',
    envVar: 'NOVITA_API_KEY',
    signupUrl: 'https://novita.ai/settings/key-management',
    description: 'Qwen2.5-VL / Llama মডেল',
    supportsVision: true,
    supportsText: true,
  },
  {
    name: 'huggingface',
    label: 'HuggingFace',
    envVar: 'HUGGINGFACE_API_KEY',
    signupUrl: 'https://huggingface.co/settings/tokens',
    description: 'Inference API — Llama-4 Scout',
    supportsVision: true,
    supportsText: true,
    keyPrefix: 'hf_',
  },
  {
    name: 'zai',
    label: 'Z.ai',
    envVar: 'Z_API_KEY',
    signupUrl: 'https://z.ai/manage-apikey/apikey-list',
    description: 'GLM-4.5v / GLM-4.6 — paid, reliable safety net',
    supportsVision: true,
    supportsText: true,
  },
]

const PROVIDER_BY_NAME = Object.fromEntries(PROVIDER_META.map((p) => [p.name, p]))

module.exports = { PROVIDER_META, PROVIDER_BY_NAME }
