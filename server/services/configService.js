const { supabaseAdmin } = require('../config/supabase')

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
    'আনলিমিটেড প্রশ্নপত্র',
    'আনলিমিটেড প্রশ্ন ব্যাংক',
    'আনলিমিটেড AI স্ক্যান',
    'নিজের লোগো ব্যবহার',
    'ওয়াটারমার্ক ছাড়া প্রিন্ট',
    'OMR জেনারেটর',
    'এক্সক্লুসিভ পিডিএফ লেআউট',
    'ডেডিকেটেড সাপোর্ট',
  ],
  rate_limits: DEFAULT_RATE_LIMITS,
}

// Sanitize / merge user-supplied rate limits with defaults so partial
// updates from admin UI don't drop fields we still need. The `ai` limiter
// has extra byoMax/byoWindowMinutes fields for users with their own keys.
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
    // BYO fields — only meaningful for `ai`. byoMax: 0 means UNLIMITED for
    // BYO users (skip rate limit entirely).
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

function rowToConfig(row) {
  if (!row) return null
  return {
    proPrice: row.pro_price,
    trialDays: row.trial_days,
    isTrialActive: row.is_trial_active,
    manualPaymentMethods: row.manual_payment_methods,
    features: row.features,
    rateLimits: normalizeRateLimits(row.rate_limits),
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
      })
      return {
        proPrice: DEFAULT_CONFIG.pro_price,
        trialDays: DEFAULT_CONFIG.trial_days,
        isTrialActive: DEFAULT_CONFIG.is_trial_active,
        manualPaymentMethods: DEFAULT_CONFIG.manual_payment_methods,
        features: DEFAULT_CONFIG.features,
        rateLimits: DEFAULT_CONFIG.rate_limits,
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
