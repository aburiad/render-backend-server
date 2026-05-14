const express = require('express')
const { checkAiCredit, withChargedCredit } = require('../middleware/credits')
const { scanImage } = require('../services/aiService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * POST /api/generate-question
 * Legacy alias for /api/ai/scan — same race-safe charge model.
 */
router.post('/generate-question', checkAiCredit(1), async (req, res, next) => {
  try {
    const { image, paperId } = req.body
    if (!image) throw new AppError('Image is required', 400)

    // Flat 1 credit per scan, regardless of how many questions are detected.
    const result = await withChargedCredit(
      req.user.uid,
      paperId || null,
      1,
      () => scanImage(image, 'image/jpeg', req.user.uid),
    )

    res.json({
      success: true,
      questions: result.questions,
      count: result.count,
      provider: result.provider,
      source: result.source,
      creditsCharged: result.creditsCharged,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
