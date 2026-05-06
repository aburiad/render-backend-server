const express = require('express')
const { scanImage } = require('../services/aiService')
const { AppError } = require('../middleware/errorHandler')
const { checkLimit, recordAiScan } = require('../middleware/subscription')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.post('/scan', checkLimit('ai_scan'), async (req, res, next) => {
  try {
    const { image } = req.body
    if (!image) {
      throw new AppError('Image is required', 400)
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    Buffer.from(base64Data, 'base64')

    // Pass userId so the chain runner picks up the user's BYO API keys
    // (when configured) before falling back to system .env keys.
    const result = await scanImage(image, 'image/jpeg', req.user.uid)

    if (req.profile) {
      await recordAiScan(req.user.uid, req.profile)
    }

    res.json({
      success: true,
      questions: result.questions,
      count: result.count,
      provider: result.provider,
      source: result.source, // 'user' | 'system' — which key was actually used
    })
  } catch (err) {
    console.error('AI Scan Route Error:', err)
    next(err)
  }
})

module.exports = router
