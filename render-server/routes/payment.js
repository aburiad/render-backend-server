const express = require('express')
const router = express.Router()
const manualPaymentService = require('../services/manualPaymentService')
const creditService = require('../services/creditService')
const configService = require('../services/configService')
const { requireAuth } = require('../middleware/auth')
const { paymentLimiter } = require('../middleware/rateLimit')

// Rate limit only in production — dev iteration loop shouldn't be blocked.
const isProd = process.env.NODE_ENV === 'production'
const noop = (_, __, n) => n()

/**
 * GET /api/payment/config — public payment settings.
 *
 * Exposes:
 *   - Manual payment methods (bKash/Nagad/Rocket numbers, admin-configured)
 *   - Credit pricing (BDT per paper, ops per paper, min top-up, suggested amounts)
 *   - Feature highlights for the pricing page
 *
 * No auth required — pricing page is public marketing.
 */
router.get('/config', async (req, res, next) => {
  try {
    const config = await configService.getConfig()
    res.json({ success: true, config })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/payment/quote?amount=100
 *
 * Compute how many AI ops a given BDT amount buys at the current rate.
 * Used by the top-up modal to show a live preview as user types.
 */
router.get('/quote', requireAuth, async (req, res, next) => {
  try {
    const amount = Math.floor(Number(req.query.amount) || 0)
    const quote = await creditService.quoteTopUp(amount)
    res.json({ success: true, ...quote })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/payment/topup
 *
 * Submit a manual top-up payment (bKash/Nagad/Rocket).
 * Credits are added AFTER admin verification, not immediately.
 *
 * Body: { amount, method, tranId, phone, screenshot }
 */
router.post(
  '/topup',
  requireAuth,
  isProd ? paymentLimiter : noop,
  async (req, res, next) => {
    try {
      const { amount, method, tranId, phone, screenshot } = req.body
      const payment = await manualPaymentService.submitTopUp(req.user.uid, {
        amount,
        method,
        tranId,
        phone,
        screenshot,
        email: req.user.email,
      })
      res.json({
        success: true,
        message:
          'টপ-আপ রিকোয়েস্ট পাঠানো হয়েছে। ভেরিফিকেশনের পর ক্রেডিট যোগ হবে (সাধারণত ২৪ ঘণ্টার মধ্যে)।',
        payment,
      })
    } catch (err) {
      next(err)
    }
  },
)

/**
 * POST /api/payment/manual — LEGACY alias for /topup.
 * Kept so old Pricing.jsx submissions still work during rollout. Internally
 * routes through the same submitTopUp path; amount falls back to proPrice
 * when client doesn't send one.
 */
router.post(
  '/manual',
  requireAuth,
  isProd ? paymentLimiter : noop,
  async (req, res, next) => {
    try {
      const { method, tranId, phone, screenshot, amount } = req.body
      const payment = await manualPaymentService.submitManualPayment(req.user.uid, {
        method,
        tranId,
        phone,
        screenshot,
        amount,
        email: req.user.email,
      })
      res.json({
        success: true,
        message: 'পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। ভেরিফিকেশনের জন্য অপেক্ষা করুন।',
        payment,
      })
    } catch (err) {
      next(err)
    }
  },
)

module.exports = router
