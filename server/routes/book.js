const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const bookService = require('../services/bookService')
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
 * Body: {
 *   classNum: 8,
 *   subject: 'math',
 *   selections: [
 *     { chapterId: 'ch-1', subchapterIds: ['1.1', '1.3'] },
 *     { chapterId: 'ch-3', subchapterIds: ['all'] }
 *   ],
 *   filters: { types: ['mcq', 'cq', 'saq'] }  // optional
 * }
 */
router.post('/existing-questions', async (req, res, next) => {
  try {
    const { classNum, subject, selections, filters } = req.body

    if (!classNum || !subject || !Array.isArray(selections) || selections.length === 0) {
      throw new AppError('ক্লাস, বিষয় এবং কমপক্ষে ১টি অধ্যায় সিলেক্ট করুন', 400)
    }

    const questions = await bookService.getExistingQuestions(
      classNum,
      subject,
      selections,
      filters || {},
    )

    res.json({
      success: true,
      questions,
      count: questions.length,
      source: 'book',
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
  checkAiCredit((req) => Math.min(Math.max(1, Number(req.body?.count) || 5), 15)),
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

    // Race-safe credit flow: pre-charge `requestedCount` credits BEFORE
    // calling the provider. If AI fails, refund. If AI returns fewer than
    // requested, the extra pre-charge stays (cost-protective for us — the
    // user got what they asked for capacity-wise).
    const result = await withChargedCredit(
      req.user.uid,
      paperId || null,
      requestedCount,
      () =>
        generateFromBook(
          combinedContext,
          { subject, classNum, questionTypes, count: requestedCount },
          req.user.uid,
        ),
      // If the model returned MORE questions than asked (rare — extra batches),
      // charge the surplus too.
      (out) => Math.max(0, (out.questions?.length || 0) - requestedCount),
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

/**
 * POST /api/book/smart-prompt
 * Accept natural-language prompt (Bangla/Banglish/English), use AI to parse
 * it into structured params, then fetch existing questions from the DB.
 *
 * Body: { prompt: "class 8 er 2 no chapter theke 10 ta creative question daw" }
 *
 * Returns: { questions, count, parsed: { classNum, subject, chapterId, questionTypes, count } }
 */
router.post(
  '/smart-prompt',
  checkAiCredit(() => 1),
  async (req, res, next) => {
    try {
      const { prompt } = req.body
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        throw new AppError('প্রম্পট লিখুন', 400)
      }

      // Step 1: Use AI to parse the natural-language prompt into structured params
      const { callWithFallback } = require('../services/aiService')
      const { TEXT_CHAIN: DEFAULT_TEXT, ALL_MAP } = require('../services/aiProviders')
      const configService = require('../services/configService')

      const configData = await configService.getConfig()
      const providerNames = configData?.aiProviderConfig?.text_chain || DEFAULT_TEXT.map(p => p.name)
      const textChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

      const parsePrompt = `তুমি একটি JSON parser। ইউজারের বাংলা/Banglish/ইংরেজি prompt থেকে শুধুমাত্র JSON output দাও।

উপলব্ধ subjects: bangla, english, math, science, accounting
উপলব্ধ ক্লাস: 6, 7, 8, 9, 10

Output format (শুধুমাত্র JSON, কোনো ব্যাখ্যা নয়):
{
  "classNum": 8,
  "subject": "math",
  "chapterId": "ch-2",
  "questionTypes": ["CQ"],
  "count": 10,
  "mode": "existing"
}

নিয়ম:
- chapterId যদি না বোঝা যায়, null রাখো
- "creative"/"সৃজনশীল"/"CQ" → ["CQ"]
- "mcq"/"বহুনির্বাচনি" → ["MCQ"]
- "short"/"সংক্ষিপ্ত" → ["short"]
- "math"/"গণিত" → subject: "math"
- "বিজ্ঞান"/"science" → subject: "science"
- "বাংলা"/"bangla" → subject: "bangla"
- "english"/"ইংরেজি" → subject: "english"
- "হিসাববিজ্ঞান"/"accounting" → subject: "accounting"
- mode: "existing" (default) — DB থেকে আনবে
- যদি prompt-এ ক্লাস না থাকে, classNum: null রাখো
- যদি subject বোঝা না যায়, subject: null রাখো
- count যদি না থাকে, 5 রাখো
- questionTypes যদি না থাকে, ["MCQ"] রাখো

User prompt: "${prompt.replace(/"/g, '\\"').trim()}"`

      const messages = [{ role: 'user', content: parsePrompt }]

      const parseResult = await callWithFallback(
        textChain,
        { messages, vision: false, jsonMode: true, temperature: 0 },
        'smart-parse',
        req.user.uid,
      )

      // Extract parsed params from AI response
      let parsed = {}
      try {
        const raw = parseResult.questions?.[0] || {}
        // AI returns parsed JSON as the "question" — extract it
        if (raw.classNum || raw.subject) {
          parsed = raw
        } else {
          // Try parsing from the raw text response
          const { parseQuestionsJson } = require('../services/aiService')
          const arr = parseQuestionsJson(JSON.stringify(parseResult.questions))
          parsed = arr[0] || {}
        }
      } catch {
        parsed = {}
      }

      console.log('[smart-prompt] parsed:', JSON.stringify(parsed))

      const classNum = parsed.classNum
      const subject = parsed.subject
      const chapterId = parsed.chapterId
      const questionTypes = parsed.questionTypes || ['MCQ']
      const count = Math.min(parsed.count || 5, 20)

      if (!classNum || !subject) {
        throw new AppError(
          'ক্লাস ও বিষয় বোঝা যায়নি। যেমন: "class 8 math er 2 no chapter theke 5 ta CQ daw"',
          400,
        )
      }

      // Step 2: Build selections — if chapterId provided, use it; otherwise fetch all chapters
      let selections = []
      if (chapterId) {
        selections = [{ chapterId, subchapterIds: ['all'] }]
      } else {
        // No specific chapter — get all chapters for the subject
        const chapters = await bookService.getChapters(classNum, subject)
        if (chapters.length === 0) {
          throw new AppError(`${classNum} শ্রেণির ${subject} বিষয়ে কোনো অধ্যায় পাওয়া যায়নি`, 404)
        }
        selections = chapters.map((ch) => ({ chapterId: ch.id, subchapterIds: ['all'] }))
      }

      // Step 3: Fetch existing questions from DB
      const questions = await bookService.getExistingQuestions(
        classNum,
        subject,
        selections,
        { types: questionTypes.map((t) => t.toLowerCase()) },
      )

      // Step 4: Limit to requested count
      const limited = questions.slice(0, count)

      // Charge credit for the operation
      const sourceChapters = []
      if (chapterId) {
        const chapters = await bookService.getChapters(classNum, subject)
        const found = chapters.find((c) => c.id === chapterId)
        if (found) sourceChapters.push(found.title)
      }

      res.json({
        success: true,
        questions: limited,
        count: limited.length,
        source: 'smart',
        parsed: { classNum, subject, chapterId, questionTypes, count },
        sourceChapters,
        creditsCharged: 1,
      })

      if (limited.length === 0) {
        // Will still return 200 but frontend shows toast
      }
    } catch (err) {
      console.error('Smart Prompt Error:', err)
      next(err)
    }
  },
)

module.exports = router
