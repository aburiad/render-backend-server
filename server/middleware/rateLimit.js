const { rateLimit, ipKeyGenerator } = require('express-rate-limit')
const configService = require('../services/configService')
const SupabaseStore = require('./rateLimitStore')

/**
 * Tiered rate limiting with admin-configurable values.
 *
 * Limits live in `subscription_config.rate_limits` (JSONB). Admin updates
 * via /admin/subscription/config; backend caches the values for 60 seconds
 * and serves them to the limiters via dynamic `max` functions.
 *
 * `windowMs` cannot be dynamic per-request in express-rate-limit, so we
 * cache it with `max`. When admin changes a window, the active counter
 * keeps its OLD reset time until it expires; the next window starts fresh
 * with the new size. Acceptable trade-off for rare admin changes.
 *
 * Stores stay in-memory per Vercel function instance — counters reset on
 * cold start. Production scale: swap for Redis-backed store.
 */

// IPv6 addresses can be partially mocked to bypass per-IP limits unless we
// canonicalise them via ipKeyGenerator. For per-user limits we still prefer
// the authenticated UID; IP is the unauthenticated fallback.
const userKey = (req, res) => req.user?.uid || ipKeyGenerator(req, res)

const friendlyHandler = (key) => (req, res /*, next, options */) => {
  const limit = cachedLimits[key]
  const window = limit ? Math.round(limit.windowMs / 60000) : '?'
  const max = limit ? limit.max : '?'
  const messages = {
    ai: `${window} মিনিটে ${max} AI request limit — পরে আবার চেষ্টা করুন`,
    payment: `${window} মিনিটে ${max}টি payment submission limit`,
    userKey: `${window} মিনিটে ${max} API key request limit`,
    auth: `অনেক login/register চেষ্টা — ${window} মিনিট পর আবার চেষ্টা করুন`,
    global: 'অনেক request — কিছুক্ষণ পর চেষ্টা করুন',
  }
  res.status(429).json({
    success: false,
    message: messages[key] || 'Rate limit exceeded',
    retryAfter: res.getHeader('Retry-After'),
  })
}

// Stores — Supabase-backed so counters survive Vercel cold starts and
// are consistent across all function instances. Each scope gets its own
// store; the underlying table partitions counters by (scope, key).
const aiStore = new SupabaseStore('ai')
const paymentStore = new SupabaseStore('payment')
const userKeyStore = new SupabaseStore('userKey')
const globalStore = new SupabaseStore('global')
const authStore = new SupabaseStore('auth')

// In-memory cache of admin-configured limits. Refreshed on demand from
// configService (which itself caches Supabase reads). On boot we use safe
// defaults; the first request after deploy populates real values.
const DEFAULT = {
  ai: { max: 30, windowMs: 60 * 60 * 1000 },
  payment: { max: 5, windowMs: 60 * 60 * 1000 },
  userKey: { max: 20, windowMs: 60 * 60 * 1000 },
  auth: { max: 10, windowMs: 15 * 60 * 1000 },
  global: { max: 200, windowMs: 15 * 60 * 1000 },
}
const cachedLimits = { ...DEFAULT }
let lastFetchAt = 0
const REFRESH_MS = 60_000

async function refreshLimits() {
  const now = Date.now()
  if (now - lastFetchAt < REFRESH_MS) return cachedLimits
  lastFetchAt = now
  try {
    const config = await configService.getConfig()
    const rl = config?.rateLimits
    if (rl) {
      for (const key of Object.keys(DEFAULT)) {
        if (rl[key] && Number.isFinite(rl[key].max) && Number.isFinite(rl[key].windowMinutes)) {
          cachedLimits[key] = {
            max: Math.max(1, Math.floor(rl[key].max)),
            windowMs: Math.max(60_000, Math.floor(rl[key].windowMinutes) * 60_000),
          }
        }
      }
    }
  } catch (err) {
    // Config fetch failed (DB hiccup, etc.) — fall back to whatever we had.
    // Logging once per refresh window prevents log spam.
    console.warn('[rateLimit] config refresh failed:', err.message)
  }
  return cachedLimits
}

// Refresh limits proactively in background; reads cached values on each request.
function dynamicMax(key) {
  return async () => {
    refreshLimits().catch(() => {})
    return cachedLimits[key].max
  }
}

// `windowMs` cannot be a function in express-rate-limit; the limiter reads it
// once at construction. We pass the largest reasonable starting window so the
// instance accommodates either a long or short admin-configured window. The
// counter resetTime gets recomputed each time it ticks, using the windowMs
// that was active at first hit. Effective window = current cachedLimits.
//
// To keep this faithful to the configured window, we set windowMs at the limit
// from cache — the express-rate-limit instance will then reset windows based
// on this. If admin changes window mid-flight, only fresh windows pick up the
// new value (acceptable for rare admin tweaks).
function makeLimiter(key, opts = {}) {
  const initial = cachedLimits[key]
  return rateLimit({
    windowMs: initial.windowMs,
    max: dynamicMax(key),
    store:
      key === 'ai' ? aiStore
      : key === 'payment' ? paymentStore
      : key === 'userKey' ? userKeyStore
      : key === 'auth' ? authStore
      : globalStore,
    standardHeaders: true,
    legacyHeaders: false,
    handler: friendlyHandler(key),
    ...opts,
  })
}

const globalLimiter = makeLimiter('global')
const authLimiter = makeLimiter('auth')
const aiLimiter = makeLimiter('ai', { keyGenerator: userKey })
const paymentLimiter = makeLimiter('payment', { keyGenerator: userKey })
const userKeyLimiter = makeLimiter('userKey', { keyGenerator: userKey })

/**
 * Read current usage for a user. Used by /api/limits/status.
 * Returns the LATEST max from cached config so the dashboard reflects
 * admin changes within ~60s.
 */
async function readUsageForUser(userId, ip) {
  const key = userId || ip
  if (!key) return null

  // Trigger a fresh fetch so dashboard sees admin changes quickly.
  await refreshLimits()

  async function peek(store, current) {
    try {
      const data = await store.get(key)
      const used = data?.totalHits ?? 0
      const resetAt = data?.resetTime ? new Date(data.resetTime).toISOString() : null
      return {
        used,
        max: current.max,
        windowMs: current.windowMs,
        resetAt,
        remaining: Math.max(0, current.max - used),
      }
    } catch {
      return { used: 0, max: current.max, windowMs: current.windowMs, resetAt: null, remaining: current.max }
    }
  }

  const [ai, payment, userKeyUsage] = await Promise.all([
    peek(aiStore, cachedLimits.ai),
    peek(paymentStore, cachedLimits.payment),
    peek(userKeyStore, cachedLimits.userKey),
  ])

  return { ai, payment, userKey: userKeyUsage }
}

module.exports = {
  globalLimiter,
  authLimiter,
  aiLimiter,
  paymentLimiter,
  userKeyLimiter,
  readUsageForUser,
  refreshLimits,
}
