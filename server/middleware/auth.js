const { supabaseAdmin } = require('../config/supabase')

/**
 * Verify Supabase JWT (sent as `Authorization: Bearer <token>`) and load profile.
 * On success, populates:
 *   req.user    = { uid, email, name, role, subscription }
 *   req.profile = full row from `profiles` table (or null on first hit)
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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', sUser.id)
      .maybeSingle()

    req.user = {
      uid: sUser.id,
      email: sUser.email,
      name: profile?.display_name || meta.full_name || meta.name || sUser.email?.split('@')[0] || 'User',
      role: profile?.role || meta.role || null,
      subscription: profile?.subscription || 'free',
    }
    req.profile = profile || null
    next()
  } catch (err) {
    console.error('[auth] verify failed:', err.message)
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

/**
 * Optional auth — populates req.user if a valid token is present, otherwise lets the request through.
 * Useful for public endpoints that personalize when logged in.
 */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  try {
    await requireAuth(req, res, () => next())
  } catch {
    next()
  }
}

module.exports = { requireAuth, optionalAuth }
