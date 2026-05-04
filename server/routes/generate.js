const express = require('express')
const { checkLimit, recordAiScan } = require('../middleware/subscription')
const { scanImage } = require('../services/aiService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

router.post('/generate-question', checkLimit('ai_scan'), async (req, res, next) => {
  try {
    const { image } = req.body
    if (!image) throw new AppError('Image is required', 400)
    const result = await scanImage(image)
    if (req.profile) {
      await recordAiScan(req.user.uid, req.profile)
    }
    res.json({ success: true, questions: result.questions, count: result.count, provider: result.provider })
  } catch (err) {
    next(err)
  }
})

module.exports = router
