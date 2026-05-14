const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const bookService = require('../services/bookService')
const creditService = require('../services/creditService')
const userApiKeyService = require('../services/userApiKeyService')
const { generateFromBook } = require('../services/aiService')
const { requireAuth } = require('../middleware/auth')
const { checkAiCredit, withChargedCredit } = require('../middleware/credits')

const router = express.Router()
// All book endpoints (subjects/chapters listing + AI generation) require auth.
// Without this, any visitor could spam /api/book/generate and burn the
// system's AI quota.
router.use(requireAuth)

/**
 * GET /api/book/subjects/:classNum
 * List available subjects for a class.
 */
router.get('/subjects/:classNum', async (req, res, next) => {
  try {
    const classNum = parseInt(req.params.classNum)
    if (classNum < 6 || classNum > 10) {
      throw new AppError('Class must be between 6 and 10', 400)
    }

    const subjects = await bookService.getSubjects(classNum)
    res.json({ success: true, subjects })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/book/chapters/:classNum/:subject
 * List chapters for a class + subject.
 */
router.get('/chapters/:classNum/:subject', async (req, res, next) => {
  try {
    const classNum = parseInt(req.params.classNum)
    const { subject } = req.params

    if (classNum < 6 || classNum > 10) {
      throw new AppError('Class must be between 6 and 10', 400)
    }

    const chapters = await bookService.getChapters(classNum, subject)
    res.json({ success: true, chapters })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/book/subchapters/:classNum/:subject/:chapterId
 * List subchapters with question counts for a given chapter.
 */
router.get('/subchapters/:classNum/:subject/:chapterId', async (req, res, next) => {
  try {
    const classNum = parseInt(req.params.classNum)
    const { subject, chapterId } = req.params

    if (classNum < 6 || classNum > 10) {
      throw new AppError('Class must be between 6 and 10', 400)
    }

    const subchapters = await bookService.getSubchapters(classNum, subject, chapterId)
    res.json({ success: true, subchapters })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/book/existing-questions
 * Get existing book questions (অনুশীলনী + নমুনা প্রশ্ন) — no AI call.
 *
 * Pricing: FLAT 1 credit per call, regardless of how many questions are
 * returned. The intent (per owner): "যত প্রশ্নই আসুক, ১ credit-ই কাটবে।"
 *
 *   - balance == 0 → 402, top-up required
 *   - balance >= 1 → charge exactly 1 credit, return whatever the
 *     selection yielded (sliced to selections[].count cap so a single
 *     credit can't be used to siphon the entire chapter dump)
 *   - 0 questions returned → refund the 1 credit (no value delivered)
 *   - fetch error → refund the 1 credit
 *
 * Body: {
 *   classNum: 8,
 *   subject: 'math',
 *   selections: [
 *     { chapterId: 'ch-1', subchapterIds: ['1.1', '1.3'], count: 5 },
 *     { chapterId: 'ch-3', subchapterIds: ['all'], count: 3 }
 *   ],
 *   filters: { types: ['mcq', 'cq', 'saq'] },  // optional
 *   paperId: 'uuid'                            // optional, for analytics
 * }
 */
function sumExistingCount(req) {
  const sels = Array.isArray(req.body?.selections) ? req.body.selections : []
  const total = sels.reduce((s, x) => s + (Number(x?.count) || 0), 0)
  return Math.min(Math.max(1, total || 5), 50)
}

router.post('/existing-questions', async (req, res, next) => {
  try {
    const { classNum, subject, selections, filters, paperId } = req.body

    if (!classNum || !subject || !Array.isArray(selections) || selections.length === 0) {
      throw new AppError('ক্লাস, বিষয় এবং কমপক্ষে ১টি অধ্যায় সিলেক্ট করুন', 400)
    }

    const requestedTotal = sumExistingCount(req)

    // BYO short-circuit: users with their own stored API key bypass
    // system credits entirely. Matches the AI middleware behaviour.
    const byoActive = await userApiKeyService.userHasAnyOwnKey(req.user.uid)

    if (!byoActive) {
      const balance = req.profile?.ai_op_credits ?? 0
      if (balance <= 0) {
        return res.status(402).json({
          success: false,
          message: 'AI কোটা শেষ — credit top-up করুন',
          available: 0,
          needed: 1,
          topUpRequired: true,
        })
      }
    }

    // Flat 1-credit-per-call pricing for non-BYO users. Atomic decrement
    // → race-safe. BYO users skip the charge entirely.
    const FLAT_CHARGE = byoActive ? 0 : 1
    if (FLAT_CHARGE > 0) {
      await creditService.decrementCredits(req.user.uid, FLAT_CHARGE)
    }

    let limited
    try {
      const all = await bookService.getExistingQuestions(
        classNum,
        subject,
        selections,
        filters || {},
      )
      // Still slice to the user-requested count so the flat 1-credit
      // doesn't unlock arbitrary bulk fetches.
      limited = all.slice(0, requestedTotal)
    } catch (err) {
      if (FLAT_CHARGE > 0) {
        try {
          await creditService.incrementCredits(req.user.uid, FLAT_CHARGE)
        } catch (refundErr) {
          console.warn('[book/existing] refund failed:', refundErr.message)
        }
      }
      throw err
    }

    // No value delivered → refund.
    if (limited.length === 0) {
      if (FLAT_CHARGE > 0) {
        try {
          await creditService.incrementCredits(req.user.uid, FLAT_CHARGE)
        } catch (refundErr) {
          console.warn('[book/existing] empty-result refund failed:', refundErr.message)
        }
      }
      return res.json({
        success: true,
        questions: [],
        count: 0,
        source: 'book',
        creditsCharged: 0,
        requestedCount: requestedTotal,
        byo: byoActive,
      })
    }

    if (paperId && FLAT_CHARGE > 0) {
      await creditService.incrementPaperOps(paperId, FLAT_CHARGE)
    }

    res.json({
      success: true,
      questions: limited,
      count: limited.length,
      source: 'book',
      creditsCharged: FLAT_CHARGE,
      requestedCount: requestedTotal,
      byo: byoActive,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/book/generate
 * Generate questions from selected chapters using Gemini.
 *
 * Body: {
 *   classNum: 9,
 *   subject: 'bangla',
 *   chapters: ['chapter_1', 'chapter_2'],
 *   questionTypes: ['MCQ', 'CQ'],
 *   count: 5
 * }
 */
router.post(
  '/generate',
  checkAiCredit(1),
  async (req, res, next) => {
  try {
    const { classNum, subject, chapters, selections, questionTypes, count, paperId } = req.body

    if (!classNum || !subject) {
      throw new AppError('ক্লাস ও বিষয় সিলেক্ট করুন', 400)
    }

    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      throw new AppError('কমপক্ষে ১টি প্রশ্নের ধরন সিলেক্ট করুন', 400)
    }

    const requestedCount = Math.min(count || 5, 15)

    // Support both old format (chapters: [...]) and new format (selections: [{chapterId, subchapterIds}])
    let chapterData = []
    let combinedContext = ''

    if (Array.isArray(selections) && selections.length > 0) {
      // NEW: subchapter-aware mode — fetch full_text content from book_chapters
      const blocks = await bookService.getContentForSelections(classNum, subject, selections)
      if (blocks.length === 0) {
        throw new AppError('সিলেক্ট করা অংশে কোনো ডাটা পাওয়া যায়নি', 404)
      }

      // Optionally pull a few existing sample questions for style reference
      const sampleQuestions = await bookService.getExistingQuestions(
        classNum,
        subject,
        selections.map((s) => ({ chapterId: s.chapterId, subchapterIds: ['all'] })),
        { types: questionTypes.map((t) => t.toLowerCase()) },
      )
      const styleExamples = sampleQuestions
        .slice(0, 3)
        .map((q, i) => `Style Example ${i + 1} (${q.type.toUpperCase()}):\n${JSON.stringify(q.data, null, 2)}`)
        .join('\n\n')

      combinedContext = blocks
        .map((b) => {
          const head = b.subchapterId ? `## ${b.subchapterId} ${b.title}` : `## ${b.title}`
          return `${head}\n\n${b.content}`
        })
        .join('\n\n---\n\n')

      if (styleExamples) {
        combinedContext += `\n\n---\nSTYLE REFERENCES (use as templates, do NOT copy):\n${styleExamples}`
      }

      chapterData = blocks.map((b) => ({
        title: b.title,
        chapterId: b.chapterId,
        subchapterId: b.subchapterId,
      }))
    } else if (Array.isArray(chapters) && chapters.length > 0) {
      // LEGACY: chapter-level mode (kept for backward compatibility)
      chapterData = await bookService.getChapterPoints(classNum, subject, chapters)
      if (chapterData.length === 0) {
        throw new AppError('সিলেক্ট করা চ্যাপ্টারে কোন ডাটা পাওয়া যায়নি', 404)
      }
      chapterData = chapterData.filter((ch) => Array.isArray(ch.points) && ch.points.length > 0)
      if (chapterData.length === 0) {
        throw new AppError(
          'সিলেক্ট করা চ্যাপ্টারে question_points খালি। বই/পিডিএফ কনটেন্ট সীড চেক করুন।',
          404,
        )
      }
      combinedContext = chapterData
        .map((ch) => {
          const pointsText = ch.points.map((p, i) => `  ${i + 1}. ${p}`).join('\n')
          return `## ${ch.title}\n${ch.summary ? ch.summary + '\n' : ''}Key Points:\n${pointsText}`
        })
        .join('\n\n---\n\n')
    } else {
      throw new AppError('চ্যাপ্টার বা সাবচ্যাপ্টার সিলেক্ট করুন', 400)
    }

    // Pricing: FLAT 1 credit per AI generate call, regardless of how many
    // questions the model returns. Pre-charge 1 atomically → AI call →
    // refund-on-failure. `requestedCount` is still passed to the AI as a
    // hint for output size, but does not affect what we bill.
    const result = await withChargedCredit(
      req.user.uid,
      paperId || null,
      1,
      () =>
        generateFromBook(
          combinedContext,
          { subject, classNum, questionTypes, count: requestedCount },
          req.user.uid,
        ),
    )

    res.json({
      success: true,
      questions: result.questions,
      count: result.questions.length,
      provider: result.provider,
      keySource: result.source,
      sourceChapters: chapterData.map((ch) => ch.title),
      creditsCharged: result.creditsCharged,
    })
  } catch (err) {
    console.error('Book Generate Error:', err)
    next(err)
  }
  },
)

module.exports = router
