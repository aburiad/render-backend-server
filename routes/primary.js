/**
 * Primary Education Routes (Nursery - Class 5)
 * Handles SVG assets and primary-specific question types
 */

const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * GET /api/primary/assets
 * List SVG assets with optional filtering
 * Query params: category, search, limit
 */
router.get('/assets', async (req, res, next) => {
  try {
    const { category, search, limit = 100 } = req.query

    let query = supabaseAdmin
      .from('svg_assets')
      .select('*')
      .order('category', { ascending: true })
      .order('asset_key', { ascending: true })
      .limit(parseInt(limit))

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`asset_key.ilike.%${search}%,tags.cs.{${search}}`)
    }

    const { data, error } = await query

    if (error) throw new AppError(error.message, 500)

    // Group by category for easier display
    const grouped = {}
    for (const asset of data || []) {
      if (!grouped[asset.category]) {
        grouped[asset.category] = []
      }
      grouped[asset.category].push({
        id: asset.id,
        key: asset.asset_key,
        svg: asset.svg_content,
        preview: asset.preview_url,
        tags: asset.tags || [],
      })
    }

    res.json({
      success: true,
      assets: data || [],
      grouped,
      categories: Object.keys(grouped),
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/primary/assets/categories
 * List all available asset categories
 */
router.get('/assets/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('svg_assets')
      .select('category')
      .order('category')

    if (error) throw new AppError(error.message, 500)

    const categories = [...new Set((data || []).map((a) => a.category))]

    res.json({
      success: true,
      categories,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/primary/templates
 * Get available templates for primary classes
 */
router.get('/templates', async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'kids-worksheet',
        name: 'Kids Worksheet',
        nameBn: 'কিডস ওয়ার্কশিট',
        description: 'Question-cum-answer layout for Nursery-Class 2',
        classes: ['nursery', 'kg', '1', '2'],
        features: ['large_fonts', 'answer_boxes', 'cute_icons'],
      },
      {
        id: 'ruled-lab',
        name: 'Ruled / Four-Line Lab',
        nameBn: 'রুলড / ফোর-লাইন ল্যাব',
        description: 'Handwriting practice with ruled lines',
        classes: ['1', '2', '3'],
        features: ['four_line', 'ruled', 'handwriting'],
      },
      {
        id: 'matching-matrix',
        name: 'Matching & Math Matrix',
        nameBn: 'মিলকরণ ও গণিত ম্যাট্রিক্স',
        description: 'Grid layouts for matching and comparison',
        classes: ['1', '2', '3', '4', '5'],
        features: ['grid_layout', 'matching', 'comparison'],
      },
      {
        id: 'compact-exam',
        name: 'Compact Exam Paper',
        nameBn: 'কমপ্যাক্ট এক্সাম পেপার',
        description: 'Tightly packed layout for Class 4-5',
        classes: ['4', '5'],
        features: ['compact', 'no_answer_space', 'exam_format'],
      },
    ]

    res.json({
      success: true,
      templates,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/primary/questions/shuffle-matching
 * Shuffle column_b for matching questions (for print preview)
 */
router.post('/questions/shuffle-matching', async (req, res, next) => {
  try {
    const { pairs } = req.body

    if (!Array.isArray(pairs)) {
      throw new AppError('pairs must be an array', 400)
    }

    // Fisher-Yates shuffle for column_b values
    const columnB = pairs.map((p) => p.column_b)
    for (let i = columnB.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[columnB[i], columnB[j]] = [columnB[j], columnB[i]]
    }

    const shuffled = pairs.map((p, i) => ({
      column_a: p.column_a,
      column_b: columnB[i],
    }))

    res.json({
      success: true,
      pairs: shuffled,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/primary/vault/bulk
 * Bulk fetch vault questions for primary classes
 * Body: { classNum, subject, selections[], limitPerType }
 */
router.post('/vault/bulk', async (req, res, next) => {
  try {
    const { classNum, subject, selections, limitPerType } = req.body

    if (!classNum || !subject || !Array.isArray(selections)) {
      throw new AppError('classNum, subject, and selections[] required', 400)
    }

    // Primary class range validation
    const cn = parseInt(classNum)
    if (cn < 0 || cn > 5) {
      throw new AppError('classNum must be between 0 (Nursery) and 5', 400)
    }

    const perType = Math.min(parseInt(limitPerType) || 50, 100)
    const allQuestions = []

    for (const sel of selections) {
      const types = sel.types || ['mcq', 'cq', 'saq']

      for (const type of types) {
        const { data, error } = await supabaseAdmin
          .from('vault_questions')
          .select('*')
          .eq('class_num', cn)
          .eq('subject', subject)
          .eq('chapter_id', sel.chapterId)
          .eq('question_type', type)
          .order('question_number', { ascending: true })
          .limit(perType)

        if (error) {
          console.error(`[vault/bulk] Error:`, error.message)
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
            })
          } else if (q.question_type === 'cq') {
            allQuestions.push({
              id: q.id,
              type: 'CQ',
              chapterId: q.chapter_id,
              stimulus: d.stimulus || '',
              parts: d.parts || {},
              totalMarks: d.totalMarks || 10,
              source: 'vault',
            })
          } else {
            allQuestions.push({
              id: q.id,
              type: 'short',
              chapterId: q.chapter_id,
              question: d.question,
              marks: d.marks || 2,
              source: 'vault',
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
