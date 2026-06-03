const express = require('express')
const noticeService = require('../services/noticeService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const ALLOWED_FIELDS = [
  'header_top_line', 'header_logo_url', 'header_org_name', 'header_subtitle',
  'header_address', 'header_extra', 'header_contact', 'header_alignment',
  'header_band_color', 'reference_no', 'notice_date', 'date_label',
  'title', 'show_title', 'subject', 'body_blocks',
  'signature_image_url', 'signature_name', 'signature_title', 'signature_org',
  'signature_align', 'copy_to', 'footer_text', 'footer_color', 'style_preset',
]

function pickAllowed(body) {
  const out = {}
  for (const f of ALLOWED_FIELDS) {
    if (body[f] !== undefined) out[f] = body[f]
  }
  return out
}

router.post('/', async (req, res, next) => {
  try {
    const data = pickAllowed(req.body)
    const notice = await noticeService.create(req.user.uid, data)
    res.status(201).json({ success: true, notice })
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const notices = await noticeService.listByUser(req.user.uid)
    res.json({ success: true, notices })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const notice = await noticeService.getById(req.params.id, req.user.uid)
    if (!notice) throw new AppError('Notice not found', 404)
    res.json({ success: true, notice })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const updates = pickAllowed(req.body)
    const notice = await noticeService.update(req.params.id, req.user.uid, updates)
    if (!notice) throw new AppError('Notice not found', 404)
    res.json({ success: true, notice })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await noticeService.softDelete(req.params.id, req.user.uid)
    res.json({ success: true, message: 'Notice deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
