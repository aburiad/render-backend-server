const { supabaseAdmin } = require('../config/supabase')

const FREE_LIMITS = {
  papers: 10,
  question_bank: 30,
  ai_scan: 30, // per calendar month
}

const LIMIT_MESSAGES = {
  paper_count: `Free user-দের জন্য সর্বোচ্চ ${FREE_LIMITS.papers}টি প্রশ্নপত্র। Pro-তে আপগ্রেড করুন।`,
  question_bank: `Free user-দের জন্য সর্বোচ্চ ${FREE_LIMITS.question_bank}টি Question Bank। Pro-তে আপগ্রেড করুন।`,
  ai_scan: `এই মাসের AI scan সীমা (${FREE_LIMITS.ai_scan}টি) শেষ। Pro-তে আপগ্রেড করুন।`,
  omr: 'OMR Generator একটি Pro ফিচার। Pro-তে আপগ্রেড করুন।',
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

async function countRows(table, userId, extraFilter = null) {
  let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true }).eq('user_id', userId)
  if (extraFilter) {
    for (const [k, v] of Object.entries(extraFilter)) q = q.eq(k, v)
  }
  const { count, error } = await q
  if (error) {
    console.error(`[checkLimit] count(${table}) error:`, error.message)
    return 0
  }
  return count || 0
}

/**
 * Per-feature usage limits.
 * - 'pro' and 'trial' tiers: bypass all limits.
 * - 'free' tier (trial expired, no active subscription):
 *     paper_count   → max FREE_LIMITS.papers total (excluding soft-deleted)
 *     question_bank → max FREE_LIMITS.question_bank total
 *     ai_scan       → max FREE_LIMITS.ai_scan per calendar month
 *     omr           → fully blocked
 */
function checkLimit(limitType) {
  return async (req, res, next) => {
    try {
      const tier = req.user?.tier
      if (tier === 'pro' || tier === 'trial') return next()

      if (limitType === 'paper_count') {
        const count = await countRows('papers', req.user.uid, { deleted: false })
        if (count >= FREE_LIMITS.papers) {
          return res.status(403).json({ success: false, message: LIMIT_MESSAGES.paper_count, limitReached: true })
        }
      } else if (limitType === 'question_bank') {
        const count = await countRows('question_bank', req.user.uid)
        if (count >= FREE_LIMITS.question_bank) {
          return res.status(403).json({ success: false, message: LIMIT_MESSAGES.question_bank, limitReached: true })
        }
      } else if (limitType === 'ai_scan') {
        const month = currentMonth()
        const profile = req.profile
        let used = profile?.ai_scan_count || 0
        if (profile?.ai_scan_month !== month) used = 0
        if (used >= FREE_LIMITS.ai_scan) {
          return res.status(403).json({ success: false, message: LIMIT_MESSAGES.ai_scan, limitReached: true })
        }
      } else if (limitType === 'omr') {
        return res.status(403).json({ success: false, message: LIMIT_MESSAGES.omr, limitReached: true })
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}

/**
 * Increment monthly AI scan counter. Resets if month rolled over.
 * Called by AI route handlers AFTER a successful scan/generate.
 */
async function recordAiScan(userId, profile) {
  const month = currentMonth()
  const sameMonth = profile?.ai_scan_month === month
  const next = (sameMonth ? profile?.ai_scan_count || 0 : 0) + 1
  await supabaseAdmin
    .from('profiles')
    .update({
      ai_scan_count: next,
      ai_scan_month: month,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

module.exports = { checkLimit, recordAiScan, FREE_LIMITS }
