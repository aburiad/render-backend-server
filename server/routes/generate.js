const express = require('express')
const { checkLimit } = require('../middleware/subscription')
const { scanImage } = require('../services/aiService')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.post('/generate-question', checkLimit('ai_scan'), async (req, res, next) => {
  try {
    const { image } = req.body
    if (!image) throw new AppError('Image is required', 400)
    const result = await scanImage(image)
    const nextCount = (req.profile?.ai_scan_count || 0) + 1
    if (req.profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ ai_scan_count: nextCount, updated_at: new Date().toISOString() })
        .eq('id', req.user.uid)
    }
    res.json({ success: true, questions: result.questions, count: result.count, provider: result.provider })
  } catch (err) {
    next(err)
  }
})

module.exports = router
