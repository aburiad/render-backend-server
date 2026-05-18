const { supabaseAdmin } = require('../config/supabase')

const DEFAULT_AI_PROVIDER_CONFIG = {
  vision_chain: ['gemini', 'groq', 'openrouter', 'mistral', 'sambanova', 'cohere', 'novita', 'huggingface', 'zai'],
  text_chain: ['gemini', 'groq', 'sambanova', 'mistral', 'openrouter', 'cohere', 'novita', 'huggingface', 'zai'],
}

const DEFAULT_RATE_LIMITS = {
  ai: {
    max: 30, // limit when user uses SYSTEM AI keys (our cost)
    windowMinutes: 60,
    byoMax: 0, // limit when user has VERIFIED OWN keys; 0 = unlimited
    byoWindowMinutes: 60,
  },
  payment: { max: 5, windowMinutes: 60 },
  userKey: { max: 20, windowMinutes: 60 },
  auth: { max: 10, windowMinutes: 15 },
  global: { max: 200, windowMinutes: 15 },
}

// Credit-system defaults. Admin can override every value via the admin UI;
// these are applied only when the corresponding field is missing in the
// `subscription_config.credit_config` JSON.
const DEFAULT_CREDIT_CONFIG = {
  bdt_per_paper: 10,            // 1 paper = 10 BDT
  ops_per_paper: 25,            // 1 paper budget = 25 AI ops
  signup_bonus_ops: 25,         // free trial on signup (≈ 1 paper)
  referral_bonus_ops: 25,       // bonus when referred user makes first top-up
  min_topup_bdt: 10,            // minimum top-up amount
  max_topup_bdt: 100000,        // safety ceiling — admin can raise for enterprise
  suggested_topups_bdt: [10, 50, 200, 500, 1000, 5000],
  byo_unlimited_price_bdt: 999, // optional side offer: own-key monthly fee
  enable_byo_subscription: false, // hidden by default, admin can enable
}

const DEFAULT_CONFIG = {
  pro_price: 299,
  trial_days: 90,
  is_trial_active: true,
  manual_payment_methods: [
    { name: 'bKash', number: '01XXXXXXXXX', type: 'Personal' },
    { name: 'Nagad', number: '01XXXXXXXXX', type: 'Personal' },
    { name: 'Rocket', number: '01XXXXXXXXX', type: 'Personal' },
  ],
  features: [
    'প্রতি পেপার মাত্র ১০ ৳',
    '১ পেপার = ২৫টি AI prompt',
    'কোনো subscription বা মাসিক ফি নেই',
    'ক্রেডিট কখনো expire হবে না',
    'ম্যানুয়াল edit + print সবসময় ফ্রি',
    'নিজের লোগো ব্যবহার',
    'OMR জেনারেটর',
    'WhatsApp সাপোর্ট',
  ],
  rate_limits: DEFAULT_RATE_LIMITS,
  credit_config: DEFAULT_CREDIT_CONFIG,
  ai_provider_config: DEFAULT_AI_PROVIDER_CONFIG,
}

function normalizeRateLimits(input) {
  const out = { ...DEFAULT_RATE_LIMITS }
  if (!input || typeof input !== 'object') return out
  for (const key of Object.keys(DEFAULT_RATE_LIMITS)) {
    const incoming = input[key]
    if (!(incoming && typeof incoming === 'object')) continue

    const defaults = DEFAULT_RATE_LIMITS[key]
    const max = Number(incoming.max)
    const windowMinutes = Number(incoming.windowMinutes)
    const next = {
      max: Number.isFinite(max) && max > 0 ? Math.floor(max) : defaults.max,
      windowMinutes:
        Number.isFinite(windowMinutes) && windowMinutes > 0
          ? Math.floor(windowMinutes)
          : defaults.windowMinutes,
    }
    if (key === 'ai') {
      const byoMax = Number(incoming.byoMax)
      const byoWindowMinutes = Number(incoming.byoWindowMinutes)
      next.byoMax =
        Number.isFinite(byoMax) && byoMax >= 0 ? Math.floor(byoMax) : defaults.byoMax
      next.byoWindowMinutes =
        Number.isFinite(byoWindowMinutes) && byoWindowMinutes > 0
          ? Math.floor(byoWindowMinutes)
          : defaults.byoWindowMinutes
    }
    out[key] = next
  }
  return out
}

// Merge admin-supplied credit_config with defaults. Every field individually
// validated so partial admin updates from the UI don't drop other fields.
function normalizeCreditConfig(input) {
  const out = { ...DEFAULT_CREDIT_CONFIG }
  if (!input || typeof input !== 'object') return out

  const intField = (val, fallback, { min = 0 } = {}) => {
    const n = Number(val)
    return Number.isFinite(n) && n >= min ? Math.floor(n) : fallback
  }

  out.bdt_per_paper = intField(input.bdt_per_paper, DEFAULT_CREDIT_CONFIG.bdt_per_paper, { min: 1 })
  out.ops_per_paper = intField(input.ops_per_paper, DEFAULT_CREDIT_CONFIG.ops_per_paper, { min: 1 })
  out.signup_bonus_ops = intField(input.signup_bonus_ops, DEFAULT_CREDIT_CONFIG.signup_bonus_ops, { min: 0 })
  out.referral_bonus_ops = intField(input.referral_bonus_ops, DEFAULT_CREDIT_CONFIG.referral_bonus_ops, { min: 0 })
  out.min_topup_bdt = intField(input.min_topup_bdt, DEFAULT_CREDIT_CONFIG.min_topup_bdt, { min: 1 })
  out.max_topup_bdt = intField(input.max_topup_bdt, DEFAULT_CREDIT_CONFIG.max_topup_bdt, { min: 1 })
  out.byo_unlimited_price_bdt = intField(
    input.byo_unlimited_price_bdt,
    DEFAULT_CREDIT_CONFIG.byo_unlimited_price_bdt,
    { min: 0 },
  )
  out.enable_byo_subscription = !!input.enable_byo_subscription

  if (Array.isArray(input.suggested_topups_bdt)) {
    const cleaned = input.suggested_topups_bdt
      .map((v) => intField(v, NaN, { min: 1 }))
      .filter((v) => Number.isFinite(v))
    out.suggested_topups_bdt = cleaned.length
      ? cleaned
      : DEFAULT_CREDIT_CONFIG.suggested_topups_bdt
  }

  return out
}

function normalizeAiProviderConfig(input) {
  const out = { ...DEFAULT_AI_PROVIDER_CONFIG }
  if (!input || typeof input !== 'object') return out
  
  if (Array.isArray(input.vision_chain) && input.vision_chain.length > 0) {
    out.vision_chain = input.vision_chain.map(String)
  }
  if (Array.isArray(input.text_chain) && input.text_chain.length > 0) {
    out.text_chain = input.text_chain.map(String)
  }
  
  return out
}

function rowToConfig(row) {
  if (!row) return null
  return {
    proPrice: row.pro_price,
    trialDays: row.trial_days,
    isTrialActive: row.is_trial_active,
    manualPaymentMethods: row.manual_payment_methods,
    features: row.features,
    rateLimits: normalizeRateLimits(row.rate_limits),
    creditConfig: normalizeCreditConfig(row.credit_config),
    aiProviderConfig: normalizeAiProviderConfig(row.ai_provider_config),
    updatedAt: row.updated_at,
  }
}

const configService = {
  async getConfig() {
    const { data, error } = await supabaseAdmin
      .from('subscription_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (error) throw error
    if (!data) {
      await this.updateConfig({
        proPrice: DEFAULT_CONFIG.pro_price,
        trialDays: DEFAULT_CONFIG.trial_days,
        isTrialActive: DEFAULT_CONFIG.is_trial_active,
        manualPaymentMethods: DEFAULT_CONFIG.manual_payment_methods,
        features: DEFAULT_CONFIG.features,
        rateLimits: DEFAULT_CONFIG.rate_limits,
        creditConfig: DEFAULT_CONFIG.credit_config,
        aiProviderConfig: DEFAULT_CONFIG.ai_provider_config,
      })
      return {
        proPrice: DEFAULT_CONFIG.pro_price,
        trialDays: DEFAULT_CONFIG.trial_days,
        isTrialActive: DEFAULT_CONFIG.is_trial_active,
        manualPaymentMethods: DEFAULT_CONFIG.manual_payment_methods,
        features: DEFAULT_CONFIG.features,
        rateLimits: DEFAULT_CONFIG.rate_limits,
        creditConfig: DEFAULT_CONFIG.credit_config,
        aiProviderConfig: DEFAULT_CONFIG.ai_provider_config,
      }
    }
    return rowToConfig(data)
  },

  async updateConfig(newConfig) {
    const patch = {
      pro_price: newConfig.pro_price ?? newConfig.proPrice,
      trial_days: newConfig.trial_days ?? newConfig.trialDays,
      is_trial_active: newConfig.is_trial_active ?? newConfig.isTrialActive,
      manual_payment_methods: newConfig.manual_payment_methods ?? newConfig.manualPaymentMethods,
      features: newConfig.features,
      rate_limits:
        newConfig.rate_limits !== undefined
          ? normalizeRateLimits(newConfig.rate_limits)
          : newConfig.rateLimits !== undefined
          ? normalizeRateLimits(newConfig.rateLimits)
          : undefined,
      credit_config:
        newConfig.credit_config !== undefined
          ? normalizeCreditConfig(newConfig.credit_config)
          : newConfig.creditConfig !== undefined
          ? normalizeCreditConfig(newConfig.creditConfig)
          : undefined,
      ai_provider_config:
        newConfig.ai_provider_config !== undefined
          ? normalizeAiProviderConfig(newConfig.ai_provider_config)
          : newConfig.aiProviderConfig !== undefined
          ? normalizeAiProviderConfig(newConfig.aiProviderConfig)
          : undefined,
      updated_at: new Date().toISOString(),
    }
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])

    const { data, error } = await supabaseAdmin
      .from('subscription_config')
      .upsert({ id: 1, ...patch }, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error
    return rowToConfig(data)
  },
}

module.exports = configService
module.exports.DEFAULT_RATE_LIMITS = DEFAULT_RATE_LIMITS
module.exports.DEFAULT_CREDIT_CONFIG = DEFAULT_CREDIT_CONFIG
module.exports.DEFAULT_AI_PROVIDER_CONFIG = DEFAULT_AI_PROVIDER_CONFIG
