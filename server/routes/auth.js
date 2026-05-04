const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth, computeTier } = require('../middleware/auth')
const configService = require('../services/configService')
const { FREE_LIMITS } = require('../middleware/subscription')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

const ROLES = new Set(['school', 'coaching', 'admission', 'private_tutor', 'admin'])

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

async function buildUserPayload(profile, trialDays) {
  if (!profile) return null
  const { tier, trialEndAt } = computeTier(profile, trialDays || 0)

  const month = currentMonth()
  const aiScanCount = profile.ai_scan_month === month ? profile.ai_scan_count || 0 : 0

  // Counts only matter for free tier UI; cheap to compute.
  let papersCount = 0
  let questionBankCount = 0
  if (tier === 'free' || tier === 'trial') {
    const [{ count: pCount }, { count: qCount }] = await Promise.all([
      supabaseAdmin
        .from('papers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('deleted', false),
      supabaseAdmin.from('question_bank').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    ])
    papersCount = pCount || 0
    questionBankCount = qCount || 0
  }

  return {
    uid: profile.id,
    email: profile.email,
    name: profile.display_name,
    role: profile.role,
    subscription: profile.subscription || 'free',
    subscriptionEndDate: profile.subscription_end_at || null,
    isBanned: profile.is_banned || false,
    createdAt: profile.created_at,
    tier,
    trialEndAt,
    usage: {
      aiScan: aiScanCount,
      aiScanLimit: FREE_LIMITS.ai_scan,
      papers: papersCount,
      papersLimit: FREE_LIMITS.papers,
      questionBank: questionBankCount,
      questionBankLimit: FREE_LIMITS.question_bank,
    },
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile + computed tier and usage.
 * Auto-creates the profile row on first hit.
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
      const { data, error } = await supabaseAdmin.from('profiles').insert(insert).select().single()
      if (error) throw error
      profile = data
    }
    const config = await configService.getConfig().catch(() => ({ trialDays: 0 }))
    const user = await buildUserPayload(profile, config.trialDays || 0)
    res.json({ success: true, user })
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

    const { data, error } = await supabaseAdmin.from('profiles').upsert(upsert, { onConflict: 'id' }).select().single()
    if (error) throw error

    const config = await configService.getConfig().catch(() => ({ trialDays: 0 }))
    const user = await buildUserPayload(data, config.trialDays || 0)
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
})

module.exports = router
