const creditService = require('../services/creditService')
const userApiKeyService = require('../services/userApiKeyService')

/**
 * Credit middleware. Must run AFTER `requireAuth` so `req.user` and
 * `req.profile` are populated.
 *
 * BYO bypass: users who have AT LEAST ONE verified own API key are paying
 * the provider directly — we MUST NOT bill them credits on top. Both
 * `checkAiCredit` and `withChargedCredit` short-circuit when
 * `userApiKeyService.userHasOwnKeys(uid)` is true.
 *
 * Usage:
 *   router.post('/scan',
 *     requireAuth,
 *     checkAiCredit(1),           // ensures balance >= 1 (or BYO bypass)
 *     async (req, res, next) => {
 *       const result = await withChargedCredit(
 *         req.user.uid,
 *         req.body.paperId,
 *         1,
 *         async () => aiService.scan(...),
 *       )
 *       res.json(result)
 *     }
 *   )
 *
 * Why pre-charge + refund instead of post-charge?
 *   Parallel-request abuse: N concurrent calls all pass `checkAiCredit`
 *   (each sees cached balance from requireAuth), each fires an AI provider
 *   call (we pay), but only the first chargeAiCredit succeeds — net result:
 *   we eat N-1 AI calls for free. Pre-charging via atomic RPC eliminates
 *   the race entirely: only N requests with enough credit can pass the
 *   decrement, the rest fail BEFORE the AI call ever fires.
 */

/**
 * Factory: returns a middleware that ensures the user has at least
 * `requiredOps` credits available. Pass a function to compute dynamically
 * from `req` (e.g., a multi-question prompt may need N credits).
 */
function checkAiCredit(requiredOpsOrFn = 1) {
  return async (req, res, next) => {
    try {
      const required =
        typeof requiredOpsOrFn === 'function'
          ? requiredOpsOrFn(req)
          : Number(req.body?.expectedOps) || requiredOpsOrFn

      const need = Number.isFinite(required) && required > 0 ? Math.floor(required) : 1

      // BYO short-circuit: if the user has ANY stored API key of their
      // own (verified or not), the AI cost is paid directly to the
      // provider — they are not billed system credits. We deliberately
      // don't require `is_verified` here because the post-save verify
      // ping sometimes fails transiently, leaving a working key flagged
      // unverified — which would otherwise charge credits despite the
      // user having paid for their own provider access.
      if (await userApiKeyService.userHasAnyOwnKey(req.user?.uid)) {
        req.byoActive = true
        req.creditCheck = { need: 0, balance: 'BYO', byo: true }
        return next()
      }

      // Use profile snapshot from requireAuth — saves an extra DB round-trip.
      // The actual decrement (after AI success) is atomic via RPC so this
      // pre-check is purely a fast-path UX optimisation. If balance changes
      // between check and charge, RPC will reject and we surface 402.
      const balance = req.profile?.ai_op_credits ?? 0

      if (balance < need) {
        return res.status(402).json({
          success: false,
          message: 'AI কোটা শেষ — credit top-up করুন',
          available: balance,
          needed: need,
          topUpRequired: true,
        })
      }

      req.creditCheck = { need, balance }
      next()
    } catch (err) {
      next(err)
    }
  }
}

/**
 * Helper for direct AI charges (NOT the wrapped flow — for cases where
 * the route already knows the exact charge count after work is done).
 *
 * @param {string} userId
 * @param {string|null} paperId — for per-paper analytics counter
 * @param {number} count — how many ops to charge (default 1)
 */
async function chargeAiCredit(userId, paperId, count = 1) {
  await creditService.decrementCredits(userId, count)
  if (paperId) {
    await creditService.incrementPaperOps(paperId, count)
  }
}

/**
 * Wrap an AI-using route handler with atomic pre-charge + refund-on-failure
 * + extra-charge for multi-question results.
 *
 * Flow:
 *   1. Atomically decrement `initialCharge` credits BEFORE calling the work
 *      function. If user doesn't have enough, 402 is thrown by RPC and
 *      no AI call happens.
 *   2. Execute work() — typically the AI provider call.
 *   3. If work succeeds and `extraChargeFn` returns N>0, charge N more.
 *      If user runs out at this step (rare — race within same request),
 *      we log and continue: the user got more value than billed, but
 *      every cent of OUR cost has already incurred so we don't want to
 *      return an error after delivering value.
 *   4. If work throws, refund the initialCharge atomically.
 *
 * @param {string} userId
 * @param {string|null} paperId
 * @param {number} initialCharge — credits to consume up-front (typically 1)
 * @param {Function} work — async () => result
 * @param {Function} [extraChargeFn] — (result) => number — additional ops
 */
async function withChargedCredit(userId, paperId, initialCharge, work, extraChargeFn) {
  // BYO short-circuit: user pays the provider directly, no system credit.
  // Matches the middleware: ANY stored key (verified or not) qualifies.
  if (await userApiKeyService.userHasAnyOwnKey(userId)) {
    const result = await work()
    if (result && typeof result === 'object') {
      result.creditsCharged = 0
      result.byo = true
    }
    return result
  }

  // Step 1: atomic pre-charge — race-safe via Postgres RPC.
  await creditService.decrementCredits(userId, initialCharge)

  let result
  try {
    // Step 2: do the actual AI work.
    result = await work()
  } catch (err) {
    // Step 3a: AI call failed → refund the pre-charge atomically.
    try {
      await creditService.incrementCredits(userId, initialCharge)
    } catch (refundErr) {
      console.warn('[credits] refund failed after AI error:', refundErr.message)
    }
    throw err
  }

  // Step 3b: success — bump per-paper analytics for initialCharge.
  if (paperId) {
    await creditService.incrementPaperOps(paperId, initialCharge)
  }

  // Step 4: charge any extra credits (e.g., multi-question scan).
  const extra = extraChargeFn ? extraChargeFn(result) : 0
  if (extra > 0) {
    try {
      await creditService.decrementCredits(userId, extra)
      if (paperId) await creditService.incrementPaperOps(paperId, extra)
    } catch (chargeErr) {
      // Edge case: user ran out mid-flight. We've already delivered the
      // result and incurred the AI cost — don't error out, just log so
      // the small revenue leak is visible.
      console.warn(
        '[credits] extra charge of',
        extra,
        'failed for',
        userId.slice(0, 8) + '…',
        '—',
        chargeErr.message,
      )
    }
  }

  // Stamp the response with how much was charged so frontend can refresh.
  if (result && typeof result === 'object') {
    result.creditsCharged = initialCharge + Math.max(0, extra || 0)
  }
  return result
}

module.exports = { checkAiCredit, chargeAiCredit, withChargedCredit }
