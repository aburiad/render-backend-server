const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth, computeTier } = require('../middleware/auth')
const configService = require('../services/configService')
const creditService = require('../services/creditService')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

const ROLES = new Set(['school', 'coaching', 'admission', 'private_tutor', 'admin'])

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

async function buildUserPayload(profile, config) {
  if (!profile) return null
  const trialDays = config?.trialDays || 0
  const { tier, trialEndAt } = computeTier(profile, trialDays)

  const month = currentMonth()
  const aiScanCount = profile.ai_scan_month === month ? profile.ai_scan_count || 0 : 0

  const opsPerPaper = config?.creditConfig?.ops_per_paper || 25
  const bdtPerPaper = config?.creditConfig?.bdt_per_paper || 10
  const balance = profile.ai_op_credits ?? 0

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
    credits: {
      aiOps: balance,
      papersEquivalent: Math.floor(balance / opsPerPaper),
      opsPerPaper,
      bdtPerPaper,
    },
    usage: {
      aiScan: aiScanCount,
      papers: 0,         // counts removed — kept fields for backwards-compat with frontend
      questionBank: 0,
    },
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile + credit balance.
 * Auto-creates the profile row on first hit and grants signup bonus ops.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let profile = req.profile
    const config = await configService.getConfig().catch(() => null)
    const signupBonus = config?.creditConfig?.signup_bonus_ops || 25

    if (!profile) {
      // Fresh signup — apply admin-configured bonus on profile create.
      const insert = {
        id: req.user.uid,
        email: req.user.email,
        display_name: req.user.name,
        role: req.user.role || 'school',
        subscription: 'free',
        ai_op_credits: signupBonus,
      }
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(insert)
        .select()
        .single()
      if (error) throw error
      profile = data

      try {
        await supabaseAdmin.from('credit_purchases').insert({
          user_id: profile.id,
          amount_bdt: 0,
          ai_ops_added: signupBonus,
          source: 'signup',
          note: 'Welcome bonus on signup',
        })
      } catch (e) {
        console.warn('[auth/me] signup bonus history insert failed:', e.message)
      }
    } else {
      // Existing profile — retroactively apply current signup_bonus_ops if
      // this user has NEVER received any credit grant (no row in
      // credit_purchases). Covers two cases:
      //   1. Users created BEFORE the credit migration (got DB default 25 via backfill)
      //   2. Users created via a Supabase trigger that bypasses our /me path
      try {
        const { count, error: histErr } = await supabaseAdmin
          .from('credit_purchases')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
        if (!histErr && (count || 0) === 0 && signupBonus > 0) {
          // No prior history → grant current admin-configured signup bonus.
          // We OVERWRITE existing ai_op_credits with signupBonus instead of
          // adding, so admins can re-run with different value safely.
          const { error: upErr } = await supabaseAdmin
            .from('profiles')
            .update({
              ai_op_credits: signupBonus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
          if (!upErr) {
            await supabaseAdmin.from('credit_purchases').insert({
              user_id: profile.id,
              amount_bdt: 0,
              ai_ops_added: signupBonus,
              source: 'signup',
              note: 'Retroactive welcome bonus',
            })
            profile = { ...profile, ai_op_credits: signupBonus }
          }
        }
      } catch (e) {
        console.warn('[auth/me] retroactive signup bonus check failed:', e.message)
      }
    }
    const user = await buildUserPayload(profile, config)
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/auth/credits — quick balance + history endpoint for the dashboard widget.
 */
router.get('/credits', requireAuth, async (req, res, next) => {
  try {
    const [config, history] = await Promise.all([
      configService.getConfig().catch(() => null),
      creditService.getPurchaseHistory(req.user.uid, 20),
    ])
    const opsPerPaper = config?.creditConfig?.ops_per_paper || 25
    const balance = req.profile?.ai_op_credits ?? 0
    res.json({
      success: true,
      balance,
      papersEquivalent: Math.floor(balance / opsPerPaper),
      opsPerPaper,
      bdtPerPaper: config?.creditConfig?.bdt_per_paper || 10,
      history,
    })
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

    const config = await configService.getConfig().catch(() => null)
    const user = await buildUserPayload(data, config)
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
})

module.exports = router
