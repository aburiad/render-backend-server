const express = require('express')
const paperService = require('../services/paperService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

// Paper creation itself costs nothing — only AI operations (scan/generate)
// inside the paper consume credits. See `server/middleware/credits.js`.
router.post('/', async (req, res, next) => {
  try {
    const {
      institution_name,
      exam_title,
      class_name,
      subject,
      instructions,
      session_year,
      time_minutes,
      total_marks,
      header_alignment,
      layout,
      watermark,
      set_variant,
      logo_url,
      section_mode,
      questions,
      print_settings,
    } = req.body

    if (!exam_title || !String(exam_title).trim()) {
      throw new AppError('পরীক্ষার নাম (Exam Title) প্রয়োজন', 400)
    }

    const paper = await paperService.create(req.user.uid, {
      institution_name,
      exam_title,
      class_name,
      subject,
      instructions,
      session_year,
      time_minutes,
      total_marks,
      header_alignment,
      layout,
      // Tier removed — credit system lets every user customise watermark and logo.
      watermark: watermark ?? null,
      set_variant,
      logo_url: logo_url || null,
      section_mode: !!section_mode,
      questions: questions || [],
      print_settings: print_settings ?? null,
    })

    res.status(201).json({ success: true, paper })
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const papers = await paperService.listByUser(req.user.uid)
    res.json({ success: true, papers })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const paper = await paperService.getById(req.params.id, req.user.uid)
    if (!paper) throw new AppError('Paper not found', 404)
    res.json({ success: true, paper })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const allowedFields = [
      'institution_name',
      'exam_title',
      'class_name',
      'subject',
      'instructions',
      'session_year',
      'time_minutes',
      'total_marks',
      'header_alignment',
      'layout',
      'watermark',
      'set_variant',
      'logo_url',
      'section_mode',
      'questions',
      'print_settings',
    ]
    const updates = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }
    // Tier-based watermark/logo gating removed — credit system treats all users equally.

    const paper = await paperService.update(req.params.id, req.user.uid, updates)
    if (!paper) throw new AppError('Paper not found', 404)
    res.json({ success: true, paper })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await paperService.softDelete(req.params.id, req.user.uid)
    res.json({ success: true, message: 'Paper deleted' })
  } catch (err) {
    next(err)
  }
})

// OMR rendering uses only existing paper data — no AI call, always free.
router.get('/:id/omr', async (req, res, next) => {
  try {
    const paper = await paperService.getById(req.params.id, req.user.uid)
    if (!paper) throw new AppError('Paper not found', 404)
    res.json({ success: true, paper })
  } catch (err) {
    next(err)
  }
})

module.exports = router
