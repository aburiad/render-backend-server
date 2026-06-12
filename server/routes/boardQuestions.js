const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * Board & Subject constants for frontend dropdowns
 */
const BOARD_EXAMS = ['SSC', 'HSC']
const BOARD_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
const BOARDS = [
  { value: 'dhaka', label: 'ঢাকা বোর্ড' },
  { value: 'comilla', label: 'কুমিল্লা বোর্ড' },
  { value: 'rajshahi', label: 'রাজশাহী বোর্ড' },
  { value: 'jessore', label: 'যশোর বোর্ড' },
  { value: 'chittagong', label: 'চট্টগ্রাম বোর্ড' },
  { value: 'barishal', label: 'বরিশাল বোর্ড' },
  { value: 'sylhet', label: 'সিলেট বোর্ড' },
  { value: 'dinajpur', label: 'দিনাজপুর বোর্ড' },
  { value: 'mymensingh', label: 'ময়মনসিংহ বোর্ড' },
  { value: 'all', label: 'সকল বোর্ড' },
]
const SUBJECTS = [
  { value: 'general_math', label: 'সাধারণ গণিত', exam: 'SSC' },
  { value: 'higher_math', label: 'উচ্চতর গণিত', exam: 'SSC' },
  { value: 'physics', label: 'পদার্থবিজ্ঞান', exam: 'SSC' },
  { value: 'chemistry', label: 'রসায়ন', exam: 'SSC' },
  { value: 'biology', label: 'জীববিজ্ঞান', exam: 'SSC' },
  { value: 'bangla', label: 'বাংলা', exam: 'SSC' },
  { value: 'english', label: 'ইংরেজি', exam: 'SSC' },
  { value: 'ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি', exam: 'SSC' },
  { value: 'accounting', label: 'হিসাববিজ্ঞান', exam: 'SSC' },
  { value: 'bgs', label: 'বাংলাদেশ ও বিশ্বপরিচয়', exam: 'SSC' },
  { value: 'h_physics', label: 'পদার্থবিজ্ঞান', exam: 'HSC' },
  { value: 'h_chemistry', label: 'রসায়ন', exam: 'HSC' },
  { value: 'h_math', label: 'উচ্চতর গণিত', exam: 'HSC' },
  { value: 'h_biology', label: 'জীববিজ্ঞান', exam: 'HSC' },
  { value: 'h_bangla', label: 'বাংলা', exam: 'HSC' },
  { value: 'h_english', label: 'ইংরেজি', exam: 'HSC' },
  { value: 'h_ict', label: 'তথ্য ও যোগাযোগ প্রযুক্তি', exam: 'HSC' },
  { value: 'h_accounting', label: 'হিসাববিজ্ঞান', exam: 'HSC' },
]

/**
 * GET /api/board-questions/config
 * Returns available filters: exams, years, boards, subjects
 */
router.get('/config', async (_req, res, next) => {
  try {
    // Try to get distinct years/subjects from DB for dynamic config
    let availableYears = BOARD_YEARS
    let availableSubjects = SUBJECTS

    try {
      const { data: yearData } = await supabaseAdmin
        .from('board_questions')
        .select('year')
        .order('year', { ascending: false })

      if (yearData && yearData.length > 0) {
        const uniqueYears = [...new Set(yearData.map((y) => y.year))]
        availableYears = uniqueYears.length > 0 ? uniqueYears : BOARD_YEARS
      }
    } catch { /* fallback to defaults */ }

    res.json({
      success: true,
      config: {
        exams: BOARD_EXAMS,
        years: availableYears,
        boards: BOARDS,
        subjects: availableSubjects,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/board-questions
 * Query params: exam, year, board, subject, type, limit, offset
 */
router.get('/', async (req, res, next) => {
  try {
    const { exam, year, board, subject, type, limit, offset } = req.query

    if (!exam || !year || !subject) {
      throw new AppError('exam, year, and subject are required query params', 400)
    }

    let query = supabaseAdmin
      .from('board_questions')
      .select('*', { count: 'exact' })
      .eq('exam_type', exam)
      .eq('year', parseInt(year))
      .eq('subject', subject)

    // Board filter — 'all' means don't filter by board
    if (board && board !== 'all') {
      query = query.eq('board', board)
    }

    // Question type filter
    if (type && ['mcq', 'cq', 'saq'].includes(type)) {
      query = query.eq('question_type', type)
    }

    query = query.order('question_type', { ascending: true })
    query = query.order('question_number', { ascending: true })

    const lim = Math.min(parseInt(limit) || 200, 500)
    const off = parseInt(offset) || 0
    query = query.range(off, off + lim - 1)

    const { data, count, error } = await query

    if (error) throw new AppError(error.message, 500)

    // Normalize questions for frontend
    const questions = (data || []).map(normalizeBoardQuestion)

    res.json({
      success: true,
      questions,
      count: count || 0,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/board-questions/subjects/:exam
 * Returns subjects for a given exam type from the DB
 */
router.get('/subjects/:exam', async (req, res, next) => {
  try {
    const { exam } = req.params
    if (!['SSC', 'HSC'].includes(exam)) {
      throw new AppError('exam must be SSC or HSC', 400)
    }

    // Return static subjects filtered by exam
    const filtered = SUBJECTS.filter((s) => s.exam === exam)
    res.json({ success: true, subjects: filtered })
  } catch (err) {
    next(err)
  }
})

/**
 * Normalize a board_questions row to frontend-friendly format
 */
function normalizeBoardQuestion(q) {
  const d = q.question_data
  const meta = {
    exam_type: q.exam_type,
    year: q.year,
    board: q.board,
    subject: q.subject,
  }

  if (q.question_type === 'mcq') {
    return {
      id: q.id,
      type: 'MCQ',
      question: d.question || '',
      options: d.options || {},
      answer: d.answer || null,
      marks: d.marks || 1,
      question_number: q.question_number,
      source: 'board',
      board_meta: meta,
      isVerified: q.is_verified,
    }
  }

  if (q.question_type === 'cq') {
    return {
      id: q.id,
      type: 'CQ',
      stimulus: d.stimulus || '',
      parts: d.parts || {},
      totalMarks: d.totalMarks || 10,
      question_number: q.question_number,
      source: 'board',
      board_meta: meta,
      isVerified: q.is_verified,
    }
  }

  // saq
  return {
    id: q.id,
    type: 'short',
    question: d.question || '',
    marks: d.marks || 2,
    question_number: q.question_number,
    source: 'board',
    board_meta: meta,
    isVerified: q.is_verified,
  }
}

module.exports = router