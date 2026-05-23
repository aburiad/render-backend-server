const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const configService = require('./configService')

/**
 * Credit service — pay-as-you-go AI op pool.
 *
 * All credit-modifying operations go through Postgres RPCs that perform
 * the read-modify-write atomically. This is what makes the system
 * race-safe under concurrent AI calls and admin top-ups.
 *
 * Schema lives in `migrations/2026-05-13_ai_credits.sql`.
 */

async function getBalance(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('ai_op_credits')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.ai_op_credits ?? 0
}

/**
 * Atomically decrement N credits. Throws if insufficient.
 * The Postgres function returns the new balance after deduction.
 *
 * NEVER call this before the AI provider call succeeds — refund flow is
 * complicated. Call it AFTER provider returns 200 with a usable response.
 */
async function decrementCredits(userId, count) {
  if (!Number.isFinite(count) || count <= 0) {
    throw new AppError('Invalid credit count', 400)
  }
  const { data, error } = await supabaseAdmin.rpc('decrement_ai_credits', {
    p_uid: userId,
    p_count: count,
  })
  if (error) {
    if (/insufficient_credits/i.test(error.message)) {
      const err = new AppError('AI কোটা শেষ — credit top-up করুন', 402)
      err.code = 'INSUFFICIENT_CREDITS'
      throw err
    }
    throw error
  }
  return data
}

async function incrementCredits(userId, count) {
  if (!Number.isFinite(count) || count <= 0) {
    throw new AppError('Invalid credit count', 400)
  }
  const { data, error } = await supabaseAdmin.rpc('increment_ai_credits', {
    p_uid: userId,
    p_count: count,
  })
  if (error) throw error
  return data
}

/**
 * Increment per-paper analytics counter. Best-effort — failure logged
 * but does not surface to caller (analytics shouldn't block AI flow).
 */
async function incrementPaperOps(paperId, count) {
  if (!paperId || !Number.isFinite(count) || count <= 0) return
  try {
    await supabaseAdmin.rpc('increment_paper_ai_ops', {
      p_paper_id: paperId,
      p_count: count,
    })
  } catch (err) {
    console.warn('[creditService] paper ops counter failed:', err.message)
  }
}

/**
 * Add purchased credits. Atomic: balance increment + history row insert.
 * Called after admin verifies a manual payment, or for promo grants.
 *
 * @param {string} userId
 * @param {object} opts
 * @param {number} opts.amountBdt — money paid by user (0 for grants/bonuses)
 * @param {number} opts.opsAdded — main credit amount
 * @param {number} [opts.bonusOps=0] — extra bonus ops (visible separately)
 * @param {string} [opts.source='purchase'] — 'purchase'|'signup'|'referral'|'admin_grant'|'promo'
 * @param {string|null} [opts.paymentId=null]
 * @param {string|null} [opts.note=null]
 */
async function addCredits(userId, opts) {
  const {
    amountBdt = 0,
    opsAdded,
    bonusOps = 0,
    source = 'purchase',
    paymentId = null,
    note = null,
  } = opts

  if (!Number.isFinite(opsAdded) || opsAdded <= 0) {
    throw new AppError('Invalid opsAdded', 400)
  }

  const totalOps = opsAdded + (bonusOps || 0)

  // 1. Increment balance atomically (RPC handles race).
  const newBalance = await incrementCredits(userId, totalOps)

  // 2. Record history (best-effort — balance change is the source of truth).
  try {
    await supabaseAdmin.from('credit_purchases').insert({
      user_id: userId,
      amount_bdt: Math.max(0, Math.floor(amountBdt || 0)),
      ai_ops_added: opsAdded,
      bonus_ops: bonusOps || 0,
      payment_id: paymentId,
      source,
      note,
    })
  } catch (err) {
    console.warn('[creditService] history insert failed:', err.message)
  }

  return newBalance
}

/**
 * Compute how many AI ops a top-up amount buys, per current admin config.
 * Formula:  ops = floor(amountBdt / bdtPerPaper) * opsPerPaper
 * Example:  100 BDT @ 10 BDT/paper × 25 ops/paper = 10 * 25 = 250 ops
 *
 * Returns { ops, papersEquivalent, effectiveAmount }.
 *   - effectiveAmount = the amount actually paying for credits
 *     (e.g., 105 BDT → only 100 BDT counts, 5 BDT change-on-table)
 */
async function quoteTopUp(amountBdt) {
  const config = await configService.getConfig()
  const { bdt_per_paper: bdtPerPaper, ops_per_paper: opsPerPaper, min_topup_bdt: minBdt } =
    config.creditConfig

  const amount = Math.floor(Number(amountBdt) || 0)
  if (amount < minBdt) {
    throw new AppError(`Minimum top-up ${minBdt} BDT`, 400)
  }

  const papers = Math.floor(amount / bdtPerPaper)
  if (papers < 1) {
    throw new AppError(`Minimum 1 paper = ${bdtPerPaper} BDT`, 400)
  }
  const ops = papers * opsPerPaper
  const effectiveAmount = papers * bdtPerPaper

  return {
    ops,
    papersEquivalent: papers,
    effectiveAmount,
    bdtPerPaper,
    opsPerPaper,
  }
}

/**
 * List a user's credit purchase history (most recent first).
 */
async function getPurchaseHistory(userId, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('credit_purchases')
    .select('id, amount_bdt, ai_ops_added, bonus_ops, source, note, payment_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    amountBdt: row.amount_bdt,
    aiOpsAdded: row.ai_ops_added,
    bonusOps: row.bonus_ops,
    source: row.source,
    note: row.note,
    paymentId: row.payment_id,
    createdAt: row.created_at,
  }))
}

module.exports = {
  getBalance,
  decrementCredits,
  incrementCredits,
  incrementPaperOps,
  addCredits,
  quoteTopUp,
  getPurchaseHistory,
}
