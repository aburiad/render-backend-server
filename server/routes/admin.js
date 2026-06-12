const express = require('express')
const configService = require('../services/configService')
const manualPaymentService = require('../services/manualPaymentService')
const creditService = require('../services/creditService')
const { supabaseAdmin } = require('../config/supabase')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()
// CRITICAL: every admin route requires BOTH (a) valid JWT AND (b) profiles.role === 'admin'.
// Without requireAdmin, any authenticated user could verify their own payment, change
// the pro price, or promote themselves — full privilege escalation.
router.use(requireAuth)
router.use(requireAdmin)

router.get('/subscription/config', async (req, res, next) => {
  try {
    const config = await configService.getConfig()
    res.json({ success: true, config })
  } catch (err) {
    next(err)
  }
})

router.put('/subscription/config', async (req, res, next) => {
  try {
    const newConfig = await configService.updateConfig(req.body)
    res.json({ success: true, config: newConfig })
  } catch (err) {
    next(err)
  }
})

router.get('/payments/manual', async (req, res, next) => {
  try {
    const payments = await manualPaymentService.listPendingPayments()
    res.json({ success: true, payments })
  } catch (err) {
    next(err)
  }
})

router.post('/payments/verify', async (req, res, next) => {
  try {
    const { paymentId, status } = req.body
    await manualPaymentService.verifyPayment(paymentId, status, req.user.uid)
    res.json({ success: true, message: `Payment ${status} successfully` })
  } catch (err) {
    next(err)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, email, display_name, role, subscription, subscription_end_at, is_banned, ai_op_credits, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    const users = (data || []).map((u) => ({
      uid: u.id,
      name: u.display_name,
      email: u.email,
      role: u.role,
      subscription: u.subscription,
      subscriptionEndDate: u.subscription_end_at,
      isBanned: u.is_banned,
      aiOpCredits: u.ai_op_credits ?? 0,
      createdAt: u.created_at,
    }))
    res.json({ success: true, users })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /admin/users/:uid/credits/adjust
 *
 * Add or subtract credits from a user's pool. Used for refunds, promo
 * grants, or correcting a verification mistake. Adjustment is logged in
 * credit_purchases with source='admin_grant' for audit.
 *
 * Body: { delta: number, note?: string }
 *   delta > 0 → add credits, delta < 0 → subtract
 */
router.post('/users/:uid/credits/adjust', async (req, res, next) => {
  try {
    const { uid } = req.params
    const delta = Math.floor(Number(req.body?.delta) || 0)
    const note = req.body?.note ? String(req.body.note).slice(0, 200) : null

    if (!delta) {
      throw new AppError('delta must be non-zero integer', 400)
    }

    if (delta > 0) {
      await creditService.addCredits(uid, {
        amountBdt: 0,
        opsAdded: delta,
        source: 'admin_grant',
        note: note || `Admin grant by ${req.user.uid}`,
      })
    } else {
      await creditService.decrementCredits(uid, -delta)
      try {
        await supabaseAdmin.from('credit_purchases').insert({
          user_id: uid,
          amount_bdt: 0,
          ai_ops_added: delta, // negative — audit shows deduction
          source: 'admin_grant',
          note: note || `Admin deduction by ${req.user.uid}`,
        })
      } catch (e) {
        console.warn('[admin credit adjust] history insert failed:', e.message)
      }
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('ai_op_credits')
      .eq('id', uid)
      .maybeSingle()

    res.json({
      success: true,
      balance: profile?.ai_op_credits ?? 0,
      message: delta > 0 ? `${delta} credit যোগ হয়েছে` : `${-delta} credit বাদ হয়েছে`,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /admin/users/:uid/credits/history — recent credit transactions for one user.
 */
router.get('/users/:uid/credits/history', async (req, res, next) => {
  try {
    const history = await creditService.getPurchaseHistory(req.params.uid, 50)
    res.json({ success: true, history })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /admin/credits/apply-signup-bonus
 *
 * Retroactively grant the current admin-configured `signup_bonus_ops` to
 * every user who has NEVER received any credit grant (no rows in
 * credit_purchases). Used after the admin first sets a non-default bonus
 * value to ensure existing users benefit too.
 *
 * Safe to re-run — only touches users with empty credit_purchases history.
 */
router.post('/credits/apply-signup-bonus', async (req, res, next) => {
  try {
    const config = await configService.getConfig()
    const bonus = config?.creditConfig?.signup_bonus_ops ?? 0
    if (!Number.isFinite(bonus) || bonus <= 0) {
      throw new AppError('signup_bonus_ops is 0 — set a positive value first', 400)
    }

    // Single atomic call — handles arbitrarily large user bases in one
    // round-trip and survives Vercel function timeout. See
    // migrations/2026-05-13b_bulk_signup_bonus.sql for the function body.
    const { data, error } = await supabaseAdmin.rpc('grant_bulk_signup_bonus', {
      p_bonus: bonus,
      p_admin_uid: req.user.uid,
    })
    if (error) throw error

    const row = Array.isArray(data) ? data[0] : data
    const eligible = Number(row?.eligible) || 0
    const updated = Number(row?.updated) || 0

    res.json({
      success: true,
      bonus,
      eligible,
      updated,
      message: `${updated}/${eligible} user-কে ${bonus} ops signup bonus দেওয়া হয়েছে`,
    })
  } catch (err) {
    next(err)
  }
})

// Allowed role values. Mirror the set in routes/auth.js — keep in sync.
const ALLOWED_ROLES = new Set(['school', 'coaching', 'admission', 'private_tutor', 'admin'])
const ALLOWED_SUBSCRIPTIONS = new Set(['free', 'pro'])

router.put('/users/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params
    const { role, subscription, subscriptionEndDate, isBanned } = req.body
    const patch = { updated_at: new Date().toISOString() }

    if (role !== undefined) {
      if (role !== null && !ALLOWED_ROLES.has(role)) {
        throw new AppError(
          'Invalid role. Allowed: ' + [...ALLOWED_ROLES].join(', '),
          400,
        )
      }
      patch.role = role
    }
    if (subscription !== undefined) {
      if (subscription !== null && !ALLOWED_SUBSCRIPTIONS.has(subscription)) {
        throw new AppError(
          'Invalid subscription. Allowed: ' + [...ALLOWED_SUBSCRIPTIONS].join(', '),
          400,
        )
      }
      patch.subscription = subscription
    }
    if (subscriptionEndDate !== undefined) {
      // Validate ISO date string if provided
      if (subscriptionEndDate !== null && Number.isNaN(Date.parse(subscriptionEndDate))) {
        throw new AppError('subscriptionEndDate must be a valid ISO date', 400)
      }
      patch.subscription_end_at = subscriptionEndDate
    }
    if (isBanned !== undefined) {
      patch.is_banned = !!isBanned
    }

    const { error } = await supabaseAdmin.from('profiles').update(patch).eq('id', uid)
    if (error) throw error
    res.json({ success: true, message: 'ইউজারের তথ্য আপডেট করা হয়েছে' })
  } catch (err) {
    next(err)
  }
})

router.get('/stats', async (req, res, next) => {
  try {
    const [{ count: uCount }, { count: pCount }, { data: payRows }, { data: aiStats }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('papers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('manual_payments').select('amount, status'),
      supabaseAdmin.from('ai_provider_stats').select('*').order('success_count', { ascending: false }),
    ])

    let totalRevenue = 0
    ;(payRows || []).forEach((p) => {
      if (p.status === 'verified') {
        totalRevenue += Number(p.amount) || 0
      }
    })

    res.json({
      success: true,
      totalUsers: uCount || 0,
      totalPapers: pCount || 0,
      totalPayments: (payRows || []).length,
      totalRevenue,
      aiStats: aiStats || [],
    })
  } catch (err) {
    next(err)
  }
})

router.get('/payments/all', async (req, res, next) => {
  try {
    const payments = await manualPaymentService.listAllPayments()
    res.json({ success: true, payments })
  } catch (err) {
    next(err)
  }
})

module.exports = router
