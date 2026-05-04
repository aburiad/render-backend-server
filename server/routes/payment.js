const express = require('express')
const router = express.Router()
const manualPaymentService = require('../services/manualPaymentService')
const configService = require('../services/configService')
const { requireAuth } = require('../middleware/auth')

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
router.post('/manual', requireAuth, async (req, res, next) => {
  try {
    const { amount, method, tranId, phone, screenshot } = req.body
    const payment = await manualPaymentService.submitManualPayment(req.user.uid, {
      amount,
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
