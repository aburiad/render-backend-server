const { supabaseAdmin } = require('../config/supabase')
const configService = require('../services/configService')

let cachedConfig = { value: null, expires: 0 }
async function getCachedConfig() {
  if (cachedConfig.value && cachedConfig.expires > Date.now()) return cachedConfig.value
  try {
    const config = await configService.getConfig()
    cachedConfig = { value: config, expires: Date.now() + 60_000 }
    return config
  } catch (err) {
    console.error('[auth] config fetch failed:', err.message)
    return cachedConfig.value || { trialDays: 0 }
  }
}

function computeTier(profile, trialDays) {
  const now = new Date()

  if (profile.subscription === 'pro' && profile.subscription_end_at) {
    if (new Date(profile.subscription_end_at) > now) {
      return { tier: 'pro', trialEndAt: null }
    }
  }

  const created = profile.created_at ? new Date(profile.created_at) : now
  const trialEnd = new Date(created.getTime() + (trialDays || 0) * 24 * 60 * 60 * 1000)
  if (trialEnd > now) {
    return { tier: 'trial', trialEndAt: trialEnd.toISOString() }
  }
  return { tier: 'free', trialEndAt: trialEnd.toISOString() }
}

/**
 * Verify Supabase JWT (sent as `Authorization: Bearer <token>`) and load profile.
 * On success, populates:
 *   req.user    = { uid, email, name, role, subscription, tier, trialEndAt }
 *   req.profile = full row from `profiles` table (or null on first hit)
 *
 * `tier` is the *effective* access level: 'pro' | 'trial' | 'free'
 *   - pro  : paid, subscription_end_at in the future
 *   - trial: not paid, but within (created_at + trialDays)
 *   - free : trial expired, no active pro subscription
 */
async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({ message: 'Auth service unavailable (Supabase not configured)' })
  }

  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized — token missing' })
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    const sUser = data.user
    const meta = sUser.user_metadata || {}

    const [profileRes, config] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', sUser.id).maybeSingle(),
      getCachedConfig(),
    ])
    const profile = profileRes.data

    if (profile?.is_banned) {
      return res.status(403).json({ message: 'আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।', banned: true })
    }

    let tier = 'free'
    let trialEndAt = null
    if (profile) {
      const t = computeTier(profile, config.trialDays || 0)
      tier = t.tier
      trialEndAt = t.trialEndAt
    }

    req.user = {
      uid: sUser.id,
      email: sUser.email,
      name: profile?.display_name || meta.full_name || meta.name || sUser.email?.split('@')[0] || 'User',
      role: profile?.role || meta.role || null,
      subscription: profile?.subscription || 'free',
      tier,
      trialEndAt,
    }
    req.profile = profile || null
    next()
  } catch (err) {
    console.error('[auth] verify failed:', err.message)
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  try {
    await requireAuth(req, res, () => next())
  } catch {
    next()
  }
}

/**
 * requireAdmin — gate admin-only routes.
 * MUST run AFTER `requireAuth` so `req.profile` is populated.
 *
 * Security note: only trust `req.profile.role` (DB-side). Never trust
 * `req.user.role` because that falls back to `user_metadata.role`, which
 * is CLIENT-CONTROLLED at signup and can be set to "admin" by anyone.
 * The DB `profiles.role` column is server-managed and authoritative.
 */
async function requireAdmin(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin, optionalAuth, computeTier }
