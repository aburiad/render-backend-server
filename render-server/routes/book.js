const express = require('express')
const { AppError } = require('../middleware/errorHandler')
const bookService = require('../services/bookService')
const { generateFromBook } = require('../services/aiService')
const { TEXT_CHAIN: DEFAULT_TEXT, ALL_MAP } = require('../services/aiProviders')
const configService = require('../services/configService')
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

// ─── Smart Prompt ─────────────────────────────────────────────────────
// Accept a natural-language prompt (Bangla/English), parse with AI,
// fetch existing book questions, optionally generate more with AI.
router.post('/smart-prompt', checkAiCredit(() => 5), async (req, res, next) => {
  try {
    const { prompt } = req.body
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new AppError('প্রম্পট লিখুন', 400)
    }

    // Step 1: Parse the prompt with AI
    const parsePrompt = `তুমি একটি JSON parser। ব্যবহারকারীর বাংলা/ইংরেজি লেখা থেকে structured data বের করো।
নিয়ম: class (6-10 সংখ্যা, null যদি না পাও), subject (bangla/english/math/science/accounting, null যদি না পাও), chapterId (চ্যাপ্টার নম্বর বা id, null যদি না পাও), questionTypes (MCQ/CQ/short/broad/fill_blank এর array), count (সংখ্যা, ডিফল্ট 5, সর্বোচ্চ 15), topic (প্রম্পট থেকে বিষয়বস্তু বাংলায়)।
শুধুমাত্র valid JSON, কোনো ব্যাখ্যা নয়।
প্রম্পট: "${prompt.trim()}"`

    const configData = await configService.getConfig()
    const providerNames = configData?.aiProviderConfig?.text_chain || DEFAULT_TEXT.map(p => p.name)
    const textChain = providerNames.map(name => ALL_MAP[name]).filter(Boolean)

    let parsed
    try {
      // Race all text providers — first response wins
      const aiResponse = await Promise.any(
        textChain.map(async (provider) => {
          return await provider.chat({
            messages: [{ role: 'user', content: parsePrompt }],
            vision: false, jsonMode: true, temperature: 0,
          })
        })
      )
      const cleaned = String(aiResponse).replace(/```json/gi, '').replace(/```/g, '').trim()
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      parsed = JSON.parse(cleaned.slice(Math.max(0, start), end + 1))
    } catch (parseErr) {
      console.warn('[smart-prompt] AI parse failed, using defaults:', parseErr.message)
      parsed = { class: null, subject: null, chapterId: null, questionTypes: ['MCQ'], count: 5, topic: prompt.trim().slice(0, 100) }
    }

    const classNum = parsed.class ? Math.min(Math.max(Number(parsed.class) || 0, 6), 10) : null
    const subject = parsed.subject || null
    const questionTypes = Array.isArray(parsed.questionTypes) && parsed.questionTypes.length > 0
      ? parsed.questionTypes.filter(t => ['MCQ', 'CQ', 'short', 'broad', 'fill_blank'].includes(t))
      : ['MCQ']
    const requestedCount = Math.min(Math.max(Number(parsed.count) || 5, 1), 15)
    const topic = parsed.topic || prompt.trim().slice(0, 100)

    console.log(`[smart-prompt] parsed: class=${classNum}, subject=${subject}, types=${questionTypes}, count=${requestedCount}`)

    // Step 2: Fetch existing questions from DB
    let dbQuestions = []
    let sourceChapters = []

    if (classNum && subject) {
      try {
        if (parsed.chapterId) {
          dbQuestions = await bookService.getExistingQuestions(classNum, subject,
            [{ chapterId: parsed.chapterId, subchapterIds: ['all'] }],
            { types: questionTypes.map(t => t.toLowerCase()) })
        } else {
          const chapters = await bookService.getChapters(classNum, subject)
          if (chapters.length > 0) {
            const selections = chapters.slice(0, 5).map(ch => ({ chapterId: ch.id, subchapterIds: ['all'] }))
            dbQuestions = await bookService.getExistingQuestions(classNum, subject, selections,
              { types: questionTypes.map(t => t.toLowerCase()) })
            sourceChapters = chapters.slice(0, 5).map(c => c.title)
          }
        }
      } catch (dbErr) {
        console.warn('[smart-prompt] DB fetch failed:', dbErr.message)
      }
    }

    // Normalize DB questions
    const normalizedDb = dbQuestions.slice(0, requestedCount).map((q) => {
      const d = q.data || {}
      if (q.type === 'mcq') {
        return { type: 'MCQ', question: d.question, option_a: d.options?.['ক'] || d.options?.['i'], option_b: d.options?.['খ'] || d.options?.['ii'], option_c: d.options?.['গ'] || d.options?.['iii'], option_d: d.options?.['ঘ'], _source: q.source || 'book', _id: q.id }
      }
      if (q.type === 'cq') {
        return { type: 'CQ', stimulus: d.scenario, question: d.scenario, sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({ label: k, text: v })), _source: q.source || 'book', _id: q.id }
      }
      return { type: 'short', question: d.question, sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({ label: k, text: v })), _source: q.source || 'book', _id: q.id }
    })

    const dbCount = normalizedDb.length
    let aiQuestions = []
    let aiCount = 0

    // Step 3: Generate more with AI if needed
    const shortfall = requestedCount - dbCount
    if (shortfall > 0) {
      try {
        let contextForAi = topic
        if (classNum && subject) {
          try {
            const chapters = await bookService.getChapters(classNum, subject)
            if (chapters.length > 0) {
              const target = parsed.chapterId
                ? chapters.find(c => c.id === parsed.chapterId || c.id === `ch-${parsed.chapterId}`)
                : chapters[0]
              if (target) {
                const blocks = await bookService.getContentForSelections(classNum, subject,
                  [{ chapterId: target.id, subchapterIds: ['all'] }])
                if (blocks.length > 0) {
                  contextForAi = blocks.map(b => `## ${b.title}\n${b.content}`).join('\n\n---\n\n').slice(0, 8000)
                  if (!sourceChapters.includes(target.title)) sourceChapters.push(target.title)
                }
              }
            }
          } catch (ctxErr) { console.warn('[smart-prompt] context fetch failed:', ctxErr.message) }
        }

        const aiResult = await generateFromBook(contextForAi,
          { subject: subject || 'general', classNum: classNum || 0, questionTypes, count: shortfall },
          req.user.uid)
        aiQuestions = (aiResult.questions || []).map(q => ({ ...q, _source: 'ai', _provider: aiResult.provider }))
        aiCount = aiQuestions.length
      } catch (aiErr) {
        console.warn('[smart-prompt] AI generation failed:', aiErr.message)
      }
    }

    // Step 4: Merge and return
    const allQuestions = [...normalizedDb, ...aiQuestions].slice(0, requestedCount)

    res.json({
      success: true,
      questions: allQuestions,
      count: allQuestions.length,
      dbCount,
      aiCount,
      parsed: { class: classNum, subject, chapterId: parsed.chapterId || null, questionTypes, count: requestedCount, topic },
      sourceChapters,
    })
  } catch (err) {
    console.error('Smart Prompt Error:', err)
    next(err)
  }
})

module.exports = router
