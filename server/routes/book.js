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
 * Hybrid: DB first → AI fills the gap.
 *
 * Flow:
 *   1. AI parses the Bangla/Banglish/English prompt → { classNum, subject, chapterId, questionTypes, count }
 *   2. Fetch existing questions from DB (book_questions table)
 *   3. If DB has fewer than requested → fetch chapter content → AI generates the rest
 *   4. Merge & return
 *
 * Uses Gemini text model (high RPM/RPD) for both parsing & generation.
 *
 * Body: { prompt: "class 8 er 2 no chapter theke 10 ta creative question daw" }
 * Returns: { questions, count, parsed, sourceChapters, dbCount, aiCount }
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

      const { callWithFallback, generateFromBook, parseQuestionsJson } = require('../services/aiService')
      const { TEXT_CHAIN: DEFAULT_TEXT, ALL_MAP } = require('../services/aiProviders')
      const configService = require('../services/configService')

      const configData = await configService.getConfig()
      const providerNames = configData?.aiProviderConfig?.text_chain || DEFAULT_TEXT.map(p => p.name)
      const textChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

      // ── Step 1: Parse prompt with AI ────────────────────────────────────
      const parsePrompt = `তুমি একটি JSON parser। ইউজারের বাংলা/Banglish/ইংরেজি prompt থেকে শুধুমাত্র JSON output দাও।

উপলব্ধ subjects: bangla, english, math, science, accounting
উপলব্ধ ক্লাস: 6, 7, 8, 9, 10

Output format (শুধুমাত্র JSON, কোনো ব্যাখ্যা নয়):
{
  "classNum": 9,
  "subject": "math",
  "chapterId": "ch-3",
  "items": [
    { "type": "CQ", "count": 2 },
    { "type": "short", "count": 2 },
    { "type": "MCQ", "count": 3 }
  ]
}

নিয়ম:
- chapterId: chapter number বুঝলো "ch-N" format-e দাও (যেমন "3rd chapter" → "ch-3")। না বুঝলে null রাখো।
- type mapping:
  - "creative"/"সৃজনশীল"/"CQ"/"সজনশীল" → "CQ"
  - "mcq"/"বহুনির্বাচনি"/"বহুনির্বাচনী" → "MCQ"
  - "short"/"সংক্ষিপ্ত"/"সংক্ষপ্ত" → "short"
  - "broad"/"রচনামূলক"/"রচনামুলক" → "broad"
  - "fill_blank"/"শূন্যস্থান"/"শুন্যস্থান" → "fill_blank"
- যদি prompt-এ per-type count থাকে (যেমন "2ta CQ, 3ta MCQ") → items array-তে আলাদা করে দাও
- যদি শুধু overall count থাকে (যেমন "10 ta question") → items = [{ "type": "MCQ", "count": 10 }]
- যদি কোনো count না থাকে → প্রতিটির count: 5 রাখো
- subject mapping: "math"/"গণিত"→"math", "বিজ্ঞান"/"science"→"science", "বাংলা"/"bangla"→"bangla", "english"/"ইংরেজি"→"english", "হিসাববিজ্ঞান"/"accounting"→"accounting"
- যদি prompt-এ ক্লাস না থাকে, classNum: null রাখো
- যদি subject বোঝা না যায়, subject: null রাখো

User prompt: "${prompt.replace(/"/g, '\\"').trim()}"`

      const parseResult = await callWithFallback(
        textChain,
        { messages: [{ role: 'user', content: parsePrompt }], vision: false, jsonMode: true, temperature: 0 },
        'smart-parse',
        req.user.uid,
      )

      // Extract parsed params from AI response
      let parsed = {}
      try {
        const raw = parseResult.questions?.[0] || {}
        if (raw.classNum || raw.subject) {
          parsed = raw
        } else {
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

      // Support both new `items` format and legacy `questionTypes`/`count`
      // items: [{ type: "CQ", count: 2 }, { type: "MCQ", count: 3 }]
      let items = []
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        items = parsed.items.map((it) => ({
          type: it.type || 'MCQ',
          count: Math.min(it.count || 5, 20),
        }))
      } else if (Array.isArray(parsed.questionTypes) && parsed.questionTypes.length > 0) {
        // Legacy: single count split across types
        const total = Math.min(parsed.count || 5, 20)
        const perType = Math.max(1, Math.ceil(total / parsed.questionTypes.length))
        items = parsed.questionTypes.map((t) => ({ type: t, count: perType }))
      } else {
        items = [{ type: 'MCQ', count: 5 }]
      }

      const requestedCount = items.reduce((s, it) => s + it.count, 0)

      if (!classNum || !subject) {
        throw new AppError(
          'ক্লাস ও বিষয় বোঝা যায়নি। যেমন: "class 8 math er 2 no chapter theke 5 ta CQ daw"',
          400,
        )
      }

      // ── Step 2: Build selections ────────────────────────────────────────
      let selections = []
      let sourceChapters = []
      const allChapters = await bookService.getChapters(classNum, subject)

      if (chapterId) {
        // Try exact match first, then try partial/numeric match
        let found = allChapters.find((c) => c.id === chapterId)
        if (!found) {
          // Try: "ch-2" or "2" → match chapterNumber or id containing the number
          const num = parseInt(String(chapterId).replace(/\D/g, ''))
          if (num) {
            found = allChapters.find((c) => c.chapterNumber === num)
              || allChapters.find((c) => String(c.id).includes(String(num)))
          }
        }
        if (found) {
          selections = [{ chapterId: found.id, subchapterIds: ['all'] }]
          sourceChapters.push(found.title)
        } else if (allChapters.length > 0) {
          // Fallback: use all chapters
          selections = allChapters.map((ch) => ({ chapterId: ch.id, subchapterIds: ['all'] }))
          sourceChapters = allChapters.map((ch) => ch.title)
        }
      } else {
        if (allChapters.length === 0) {
          throw new AppError(`${classNum} শ্রেণির ${subject} বিষয়ে কোনো অধ্যায় পাওয়া যায়নি`, 404)
        }
        selections = allChapters.map((ch) => ({ chapterId: ch.id, subchapterIds: ['all'] }))
        sourceChapters = allChapters.map((ch) => ch.title)
      }

      // ── Step 3: Per-type DB fetch + AI fill ─────────────────────────────
      // For each item type, fetch from DB first. If shortfall, AI generates.
      const allQuestions = []
      let totalDbCount = 0
      let totalAiCount = 0

      // Fetch chapter content once (shared across all types for AI)
      let combinedContext = ''
      const contentBlocks = await bookService.getContentForSelections(classNum, subject, selections)
      if (contentBlocks.length > 0) {
        combinedContext = contentBlocks
          .map((b) => {
            const head = b.subchapterId ? `## ${b.subchapterId} ${b.title}` : `## ${b.title}`
            return `${head}\n\n${b.content}`
          })
          .join('\n\n---\n\n')
      }

      for (const item of items) {
        const typeLower = item.type.toLowerCase() === 'cq' ? 'cq'
          : item.type.toLowerCase() === 'mcq' ? 'mcq'
          : item.type.toLowerCase() === 'short' ? 'saq'
          : item.type.toLowerCase()
        const typeDbFilter = item.type.toLowerCase() === 'short' ? 'saq' : item.type.toLowerCase()

        // 3a: Fetch from DB for this specific type
        const dbQs = await bookService.getExistingQuestions(
          classNum,
          subject,
          selections,
          { types: [typeDbFilter] },
        )

        // Normalize DB questions
        const normalizedDb = dbQs.slice(0, item.count).map((q) => {
          const d = q.data || {}
          if (q.type === 'mcq') {
            return {
              type: 'MCQ',
              question: d.question,
              option_a: d.options?.['ক'] || d.options?.['i'],
              option_b: d.options?.['খ'] || d.options?.['ii'],
              option_c: d.options?.['গ'] || d.options?.['iii'],
              option_d: d.options?.['ঘ'],
              _source: q.source,
              _id: q.id,
            }
          }
          if (q.type === 'cq') {
            return {
              type: 'CQ',
              stimulus: d.scenario,
              question: d.scenario,
              sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({ label: k, text: v })),
              _source: q.source,
              _id: q.id,
            }
          }
          return {
            type: q.type === 'saq' ? 'short' : q.type,
            question: d.question,
            sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({ label: k, text: v })),
            _source: q.source,
            _id: q.id,
          }
        })

        allQuestions.push(...normalizedDb)
        totalDbCount += normalizedDb.length

        // 3b: If shortfall for this type, AI generates the rest
        const shortfall = item.count - normalizedDb.length
        if (shortfall > 0 && combinedContext.trim()) {
          console.log(`[smart-prompt] ${item.type}: DB=${normalizedDb.length}, shortfall=${shortfall}`)

          // Build style reference from DB questions of this type
          let ctx = combinedContext
          if (normalizedDb.length > 0) {
            const styleRef = normalizedDb.slice(0, 2).map((q, i) =>
              `Style Example ${i + 1}:\n${JSON.stringify(q, null, 2)}`
            ).join('\n\n')
            ctx += `\n\n---\nSTYLE REFERENCES (use similar format, do NOT copy):\n${styleRef}`
          }

          try {
            const aiResult = await generateFromBook(
              ctx,
              { subject, classNum, questionTypes: [item.type], count: shortfall },
              req.user.uid,
            )
            const aiQs = (aiResult.questions || []).map((q) => ({ ...q, _source: 'ai-generated' }))
            allQuestions.push(...aiQs)
            totalAiCount += aiQs.length
            console.log(`[smart-prompt] ${item.type}: AI generated ${aiQs.length} via ${aiResult.provider}`)
          } catch (err) {
            console.warn(`[smart-prompt] ${item.type}: AI generation failed:`, err.message)
          }
        }
      }

      res.json({
        success: true,
        questions: allQuestions,
        count: allQuestions.length,
        dbCount: totalDbCount,
        aiCount: totalAiCount,
        source: 'smart',
        parsed: { classNum, subject, chapterId, items, count: requestedCount },
        sourceChapters,
        creditsCharged: 1,
      })
    } catch (err) {
      console.error('Smart Prompt Error:', err)
      next(err)
    }
  },
)

module.exports = router
