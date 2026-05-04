const express = require('express')
const { scanImage } = require('../services/aiService')
const { AppError } = require('../middleware/errorHandler')
const { checkLimit } = require('../middleware/subscription')
const { supabaseAdmin } = require('../config/supabase')
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

    const result = await scanImage(image)

    if (req.profile) {
      const nextCount = (req.profile.ai_scan_count || 0) + 1
      await supabaseAdmin
        .from('profiles')
        .update({ ai_scan_count: nextCount, updated_at: new Date().toISOString() })
        .eq('id', req.user.uid)
    }

    res.json({
      success: true,
      questions: result.questions,
      count: result.count,
      provider: result.provider,
    })
  } catch (err) {
    console.error('AI Scan Route Error:', err)
    next(err)
  }
})

module.exports = router
