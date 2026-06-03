const express = require('express')
const questionService = require('../services/questionService')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

/**
 * POST /api/questions
 * Save a question to the bank. No AI involved → no credit charge.
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, data, subject, chapter, difficulty, tags } = req.body
    
    if (!type || !data) {
      throw new AppError('Question type and data are required', 400)
    }

    const question = await questionService.saveToBank(req.user.uid, {
      type,
      data,
      subject: subject || '',
      chapter: chapter || '',
      difficulty: difficulty || null,
      tags: tags || []
    })

    res.status(201).json({
      success: true,
      question
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/questions
 * List questions for the current user.
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      subject: req.query.subject,
      type: req.query.type,
      difficulty: req.query.difficulty,
      search: req.query.search
    }

    const questions = await questionService.listQuestions(req.user.uid, filters)

    res.json({
      success: true,
      questions,
      count: questions.length
    })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/questions/:id
 * Remove a question from the bank.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await questionService.deleteQuestion(req.user.uid, req.params.id)
    res.json({
      success: true,
      message: 'Question removed from bank'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
