const express = require('express')
const router = express.Router()
const manualPaymentService = require('../services/manualPaymentService')
const configService = require('../services/configService')
const { requireAuth } = require('../middleware/auth')
const { paymentLimiter } = require('../middleware/rateLimit')

const isTest = process.env.NODE_ENV === 'test'
const noop = (_, __, n) => n()

/**
 * GET /api/payment/config — public subscription settings (price, methods, features)
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
 * POST /api/payment/manual — User submits a manual transaction (tranId and/or screenshot)
 */
// requireAuth must run BEFORE paymentLimiter so the limiter's keyGenerator
// reads req.user.uid (matches the read-side /api/limits/status call).
router.post('/manual', requireAuth, isTest ? noop : paymentLimiter, async (req, res, next) => {
  try {
    // Note: `amount` is intentionally NOT pulled from req.body. The service
    // looks it up from subscription_config so users can't fake a low price.
    const { method, tranId, phone, screenshot } = req.body
    const payment = await manualPaymentService.submitManualPayment(req.user.uid, {
      method,
      tranId,
      phone,
      screenshot,
      email: req.user.email,
    })
    res.json({
      success: true,
      message: 'আপনার পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। ভেরিফিকেশনের জন্য অপেক্ষা করুন।',
      payment,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
