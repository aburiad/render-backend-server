const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

const ROLES = new Set(['school', 'coaching', 'admission', 'private_tutor', 'admin'])

function profileToUser(p) {
  if (!p) return null
  return {
    uid: p.id,
    email: p.email,
    name: p.display_name,
    role: p.role,
    subscription: p.subscription || 'free',
    subscriptionEndDate: p.subscription_end_at || null,
    isBanned: p.is_banned || false,
    createdAt: p.created_at,
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile. Auto-creates a row on first hit
 * (e.g. immediately after Google OAuth signup) using session metadata.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let profile = req.profile
    if (!profile) {
      const insert = {
        id: req.user.uid,
        email: req.user.email,
        display_name: req.user.name,
        role: req.user.role || null,
        subscription: 'free',
      }
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(insert)
        .select()
        .single()
      if (error) throw error
      profile = data
    }
    res.json({ success: true, user: profileToUser(profile) })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/auth/set-role
 * Used by the role-selection step after OAuth signup, or to update role.
 */
router.put('/set-role', requireAuth, async (req, res, next) => {
  try {
    const { role } = req.body
    if (!role || !ROLES.has(role)) {
      throw new AppError('Invalid role', 400)
    }

    const upsert = {
      id: req.user.uid,
      email: req.user.email,
      display_name: req.user.name,
      role,
      subscription: req.profile?.subscription || 'free',
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(upsert, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error

    res.json({ success: true, user: profileToUser(data) })
  } catch (err) {
    next(err)
  }
})

module.exports = router
