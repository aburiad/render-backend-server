const express = require('express')
const routineService = require('../services/routineService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const ALLOWED = [
  'header_logo_url', 'header_top_line', 'school_name', 'school_subtitle', 'school_address',
  'title', 'class_name', 'section', 'year', 'effective_from',
  'days', 'periods', 'subjects', 'cells',
  'orientation', 'show_period_time', 'show_teacher_name', 'cell_height',
  'footer_note', 'signature_name', 'signature_title',
]

function pick(body) {
  const out = {}
  for (const f of ALLOWED) if (body[f] !== undefined) out[f] = body[f]
  return out
}

router.post('/', async (req, res, next) => {
  try {
    const routine = await routineService.create(req.user.uid, pick(req.body))
    res.status(201).json({ success: true, routine })
  } catch (err) { next(err) }
})

router.get('/', async (req, res, next) => {
  try {
    const routines = await routineService.listByUser(req.user.uid)
    res.json({ success: true, routines })
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const routine = await routineService.getById(req.params.id, req.user.uid)
    if (!routine) throw new AppError('Routine not found', 404)
    res.json({ success: true, routine })
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const routine = await routineService.update(req.params.id, req.user.uid, pick(req.body))
    if (!routine) throw new AppError('Routine not found', 404)
    res.json({ success: true, routine })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await routineService.softDelete(req.params.id, req.user.uid)
    res.json({ success: true, message: 'Routine deleted' })
  } catch (err) { next(err) }
})

module.exports = router
