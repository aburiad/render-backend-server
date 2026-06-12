const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * GET /api/vault/chapters/:classNum/:subject
 * List all chapters with vault question counts.
 */
router.get('/chapters/:classNum/:subject', async (req, res, next) => {
  try {
    const classNum = parseInt(req.params.classNum)
    const { subject } = req.params

    if (classNum < 0 || classNum > 10) {
      throw new AppError('Class must be between 0 (Nursery) and 10', 400)
    }

    const { data, error } = await supabaseAdmin
      .from('vault_questions')
      .select('chapter_id, chapter_title_bn, chapter_title_en, question_type')
      .eq('class_num', classNum)
      .eq('subject', subject)

    if (error) throw new AppError(error.message, 500)

    // Group by chapter
    const chapters = {}
    for (const row of data || []) {
      if (!chapters[row.chapter_id]) {
        chapters[row.chapter_id] = {
          id: row.chapter_id,
          titleBn: row.chapter_title_bn,
          titleEn: row.chapter_title_en,
          mcq: 0,
          cq: 0,
          saq: 0,
          total: 0,
        }
      }
      chapters[row.chapter_id][row.question_type]++
      chapters[row.chapter_id].total++
    }

    res.json({
      success: true,
      chapters: Object.values(chapters).sort((a, b) => a.id.localeCompare(b.id)),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/vault/questions/:classNum/:subject/:chapterId
 * Get vault questions for a specific chapter with optional type filter.
 * Query params: type=mcq|cq|saq, limit=50, offset=0
 */
router.get('/questions/:classNum/:subject/:chapterId', async (req, res, next) => {
  try {
    const classNum = parseInt(req.params.classNum)
    const { subject, chapterId } = req.params
    const { type, limit, offset } = req.query

    if (classNum < 0 || classNum > 10) {
      throw new AppError('Class must be between 0 (Nursery) and 10', 400)
    }

    let query = supabaseAdmin
      .from('vault_questions')
      .select('*', { count: 'exact' })
      .eq('class_num', classNum)
      .eq('subject', subject)
      .eq('chapter_id', chapterId)
      .order('question_type', { ascending: true })
      .order('question_number', { ascending: true })

    if (type && ['mcq', 'cq', 'saq'].includes(type)) {
      query = query.eq('question_type', type)
    }

    const lim = Math.min(parseInt(limit) || 200, 500)
    const off = parseInt(offset) || 0
    query = query.range(off, off + lim - 1)

    const { data, count, error } = await query

    if (error) throw new AppError(error.message, 500)

    // Normalize questions for frontend
    const questions = (data || []).map((q) => {
      const d = q.question_data
      if (q.question_type === 'mcq') {
        return {
          id: q.id,
          type: 'MCQ',
          chapterId: q.chapter_id,
          question: d.question,
          options: d.options,
          answer: d.answer,
          marks: d.marks || 1,
          source: 'vault',
          isVerified: q.is_verified,
        }
      }
      if (q.question_type === 'cq') {
        return {
          id: q.id,
          type: 'CQ',
          chapterId: q.chapter_id,
          stimulus: d.stimulus || '',
          parts: d.parts || {},
          totalMarks: d.totalMarks || 10,
          ggb_commands: d.ggb_commands || null,
          source: 'vault',
          isVerified: q.is_verified,
        }
      }
      // saq
      return {
        id: q.id,
        type: 'short',
        chapterId: q.chapter_id,
        question: d.question,
        marks: d.marks || 2,
        source: 'vault',
        isVerified: q.is_verified,
      }
    })

    res.json({
      success: true,
      questions,
      count: count || 0,
      chapterId,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/vault/bulk
 * Bulk fetch vault questions for multiple chapters.
 * Body: { classNum, subject, selections: [{ chapterId, types: ['mcq', 'cq'] }], limitPerType: 50 }
 */
router.post('/bulk', async (req, res, next) => {
  try {
    const { classNum, subject, selections, limitPerType } = req.body

    if (!classNum || !subject || !Array.isArray(selections) || selections.length === 0) {
      throw new AppError('classNum, subject, and selections[] are required', 400)
    }

    const perType = Math.min(limitPerType || 100, 200)
    const allQuestions = []

    for (const sel of selections) {
      const types = sel.types || ['mcq', 'cq', 'saq']

      for (const type of types) {
        const { data, error } = await supabaseAdmin
          .from('vault_questions')
          .select('*')
          .eq('class_num', classNum)
          .eq('subject', subject)
          .eq('chapter_id', sel.chapterId)
          .eq('question_type', type)
          .order('question_number', { ascending: true })
          .limit(perType)

        if (error) {
          console.error(`[vault/bulk] Error for ${sel.chapterId}/${type}:`, error.message)
          continue
        }

        for (const q of data || []) {
          const d = q.question_data
          if (q.question_type === 'mcq') {
            allQuestions.push({
              id: q.id,
              type: 'MCQ',
              chapterId: q.chapter_id,
              question: d.question,
              options: d.options,
              answer: d.answer,
              marks: d.marks || 1,
              source: 'vault',
              isVerified: q.is_verified,
            })
          } else if (q.question_type === 'cq') {
            allQuestions.push({
              id: q.id,
              type: 'CQ',
              chapterId: q.chapter_id,
              stimulus: d.stimulus || '',
              parts: d.parts || {},
              totalMarks: d.totalMarks || 10,
              ggb_commands: d.ggb_commands || null,
              source: 'vault',
              isVerified: q.is_verified,
            })
          } else {
            allQuestions.push({
              id: q.id,
              type: 'short',
              chapterId: q.chapter_id,
              question: d.question,
              marks: d.marks || 2,
              source: 'vault',
              isVerified: q.is_verified,
            })
          }
        }
      }
    }

    res.json({
      success: true,
      questions: allQuestions,
      count: allQuestions.length,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router