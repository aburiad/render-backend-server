const express = require('express')
const { scanImage } = require('../services/aiService')
const { AppError } = require('../middleware/errorHandler')
const { checkAiCredit, withChargedCredit } = require('../middleware/credits')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * POST /api/ai/scan
 *
 * Vision OCR: extracts one or more questions from an uploaded image.
 * Cost model (race-safe — see `withChargedCredit` for rationale):
 *   - Pre-charge 1 credit BEFORE calling AI provider (atomic).
 *   - On AI success, charge `result.count - 1` extra credits if multi-question.
 *   - On AI failure, refund the 1 credit atomically.
 */
router.post('/scan', checkAiCredit(1), async (req, res, next) => {
  try {
    const { image, paperId, questionType } = req.body
    if (!image) {
      throw new AppError('Image is required', 400)
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const imageSizeKB = imageBuffer.length / 1024
    
    console.log(`[ai:scan] Received image size: ${Math.round(imageSizeKB)}KB (Question Type: ${questionType})`)

    if (imageSizeKB > 500) {
      throw new AppError(`ছবি অনেক বড় (${Math.round(imageSizeKB)}KB) — 500KB এর মধ্যে রাখুন`, 400)
    }

    const result = await withChargedCredit(
      req.user.uid,
      paperId || null,
      1,
      () => scanImage(image, 'image/webp', req.user.uid, questionType),
      (out) => Math.max(0, (Number(out?.count) || 1) - 1),
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
    console.error('AI Scan Route Error:', err)
    next(err)
  }
})

module.exports = router
