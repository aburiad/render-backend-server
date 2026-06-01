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
  checkAiCredit(1),
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

⚠️ CRITICAL RULE: যদি prompt-এ একাধিক (multiple) chapter mention থাকে, তাহলে প্রতিটি chapter-এর জন্য আলাদা item বানাও এবং প্রতিটি item-এ সেই chapter-এর chapterId দাও। কখনোই top-level chapterId ব্যবহার করো না।

Output format (শুধুমাত্র JSON, কোনো ব্যাখ্যা নয়):

CASE 1: যদি একাধিক chapter mention থাকে (সবচেয়ে সাধারণ):
Input: "class 8 math 2nd chapter 2ta cq, 4th theke 3ta cq, 5th theke 2ta cq, 7th theke 3ta cq"
Output:
{
  "classNum": 8,
  "subject": "math",
  "items": [
    { "chapterId": "ch-2", "type": "CQ", "count": 2 },
    { "chapterId": "ch-4", "type": "CQ", "count": 3 },
    { "chapterId": "ch-5", "type": "CQ", "count": 2 },
    { "chapterId": "ch-7", "type": "CQ", "count": 3 }
  ]
}

Input: "class 9 science 1 no 5ta mcq, 3 no 3ta cq"
Output:
{
  "classNum": 9,
  "subject": "science",
  "items": [
    { "chapterId": "ch-1", "type": "MCQ", "count": 5 },
    { "chapterId": "ch-3", "type": "CQ", "count": 3 }
  ]
}

CASE 2: যদি single chapter থাকে:
Input: "3rd chapter theke 5 ta CQ"
Output:
{
  "classNum": 9,
  "subject": "math",
  "items": [
    { "chapterId": "ch-3", "type": "CQ", "count": 5 }
  ]
}

CASE 3: যদি শুধু type count থাকে, chapter না থাকে:
Input: "2ta CQ, 3ta MCQ"
Output:
{
  "classNum": 9,
  "subject": "math",
  "items": [
    { "type": "CQ", "count": 2 },
    { "type": "MCQ", "count": 3 }
  ]
}

CASE 4: যদি শুধু overall count থাকে:
Input: "10 ta question"
Output:
{
  "classNum": 9,
  "subject": "math",
  "items": [
    { "type": "MCQ", "count": 10 }
  ]
}

নিয়ম:
- chapterId: chapter number বুঝলো "ch-N" format-e দাও (যেমন "2nd chapter" → "ch-2", "4th theke" → "ch-4", "7th theke" → "ch-7")।
- ⚠️ যদি prompt-এ একাধিক ভিন্ন chapter number থাকে, প্রতিটি chapter-এর জন্য আলাদা item বানাও এবং সেই item-এ chapterId দাও। top-level chapterId দিও না।
- যদি chapter-এর কথা না থাকে কিন্তু type থাকে → item-এ chapterId বাদ দাও।
- type mapping:
  - "creative"/"সৃজনশীল"/"CQ"/"সজনশীল" → "CQ"
  - "mcq"/"বহুনির্বাচনি"/"বহুনির্বাচনী" → "MCQ"
  - "short"/"সংক্ষিপ্ত"/"সংক্ষপ্ত" → "short"
  - "broad"/"রচনামূলক"/"রচনামুলক" → "broad"
  - "fill_blank"/"শূন্যস্থান"/"শুন্যস্থান" → "fill_blank"
- যদি prompt-এ per-type count থাকে → items array-তে আলাদা করে দাও
- যদি শুধু overall count থাকে → items = [{ "type": "MCQ", "count": N }]
- যদি কোনো count না থাকে → প্রতিটির count: 5 রাখো
- subject mapping: "math"/"গণিত"→"math", "বিজ্ঞান"/"science"→"science", "বাংলা"/"bangla"→"bangla", "english"/"ইংরেজি"→"english", "হিসাববিজ্ঞান"/"accounting"→"accounting"
- যদি prompt-এ ক্লাস না থাকে, classNum: null রাখো
- যদি subject বোঝা না যায়, subject: null রাখো
- ⚠️ output-এ শুধুমাত্র JSON দাও, কোনো ব্যাখ্যা বা markdown code block নয়।

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
      let items = []
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        items = parsed.items.map((it) => ({
          chapterId: it.chapterId || null,
          type: it.type || 'MCQ',
          count: Math.min(it.count || 5, 20),
        }))
      } else if (Array.isArray(parsed.questionTypes) && parsed.questionTypes.length > 0) {
        const total = Math.min(parsed.count || 5, 20)
        const perType = Math.max(1, Math.ceil(total / parsed.questionTypes.length))
        items = parsed.questionTypes.map((t) => ({ type: t, count: perType }))
      } else {
        items = [{ type: 'MCQ', count: 5 }]
      }

      // ── Fallback: regex-extract chapter numbers from the original prompt ────
      // AI (Mistral/Groq) often fails to put chapterId inside items for
      // multi-chapter prompts like "2nd chapter 2ta CQ, 4th theke 3ta CQ".
      // We split by comma and extract (chapter_number, count) from each segment.
      const hasAnyChapterInItems = items.some((it) => it.chapterId)
      if (!hasAnyChapterInItems && items.length > 1) {
        const chapterCountPairs = []

        // Split prompt by comma, "এবং", "and" to get individual segments
        const segments = prompt.split(/[,،]|এবং|\band\b/gi)

        for (const seg of segments) {
          // Extract chapter number: "2nd chapter", "4th theke", "1 no", "7th", "5 নং"
          const chMatch = seg.match(/(\d+)\s*(?:th|rd|st|nd|no|নং|নম্বর|chapter|অধ্যায়)/i)
            || seg.match(/(\d+)\s*(?:theke|থেকে|thek)/i)
          // Extract count: "2ta", "3টা", "5 টি"
          const cntMatch = seg.match(/(\d+)\s*(?:ta|টা|টি)/i)

          if (chMatch && cntMatch) {
            const chNum = parseInt(chMatch[1])
            const count = parseInt(cntMatch[1])
            if (chNum >= 1 && chNum <= 30 && count >= 1 && count <= 20) {
              chapterCountPairs.push({ chNum, count })
            }
          }
        }

        if (chapterCountPairs.length === items.length) {
          // Exact match — perfect alignment
          chapterCountPairs.forEach((pair, i) => {
            items[i].chapterId = `ch-${pair.chNum}`
            items[i].count = pair.count
          })
          console.log('[smart-prompt] regex fallback (exact) assigned:', items.map(it => `${it.chapterId}(${it.count})`))
        } else if (chapterCountPairs.length > 0) {
          // Partial — assign what we can in order
          const minLen = Math.min(chapterCountPairs.length, items.length)
          for (let i = 0; i < minLen; i++) {
            items[i].chapterId = `ch-${chapterCountPairs[i].chNum}`
            items[i].count = chapterCountPairs[i].count
          }
          console.log('[smart-prompt] regex fallback (partial) assigned:', items.map(it => `${it.chapterId}(${it.count})`))
        }
      }

      const requestedCount = items.reduce((s, it) => s + it.count, 0)

      if (!classNum || !subject) {
        throw new AppError(
          'ক্লাস ও বিষয় বোঝা যায়নি। যেমন: "class 8 math er 2 no chapter theke 5 ta CQ daw"',
          400,
        )
      }

      const allChapters = await bookService.getChapters(classNum, subject)

      // Check if we have per-chapter items (multi-chapter mode)
      const hasPerChapterItems = items.some(it => it.chapterId)

      if (hasPerChapterItems) {
        // ── Multi-chapter mode: process each chapter separately ─────────────
        const allQuestions = []
        let totalDbCount = 0
        let totalAiCount = 0

        // Group items by chapterId
        const chapterGroups = new Map()
        for (const item of items) {
          let chId = item.chapterId
          // Resolve chapterId to actual chapter ID
          if (chId) {
            let found = allChapters.find((c) => c.id === chId)
            if (!found) {
              const num = parseInt(String(chId).replace(/\D/g, ''))
              if (num) {
                found = allChapters.find((c) => c.chapterNumber === num)
                  || allChapters.find((c) => String(c.id).includes(String(num)))
              }
            }
            if (found) {
              chId = found.id
              if (!chapterGroups.has(chId)) {
                chapterGroups.set(chId, { title: found.title, items: [] })
              }
              chapterGroups.get(chId).items.push(item)
            }
          }
        }

        // Process each chapter in PARALLEL (was sequential — caused 50-60s timeouts for 4+ chapters)
        const chapterResults = await Promise.all(
          Array.from(chapterGroups.entries()).map(async ([chId, group]) => {
            const localQs = []
            let localDb = 0
            let localAi = 0

            const selections = [{ chapterId: chId, subchapterIds: ['all'] }]
            const contentBlocks = await bookService.getContentForSelections(classNum, subject, selections)
            let combinedContext = ''
            if (contentBlocks.length > 0) {
              combinedContext = contentBlocks
                .map((b) => {
                  const head = b.subchapterId ? `## ${b.subchapterId} ${b.title}` : `## ${b.title}`
                  return `${head}\n\n${b.content}`
                })
                .join('\n\n---\n\n')
            }

            for (const item of group.items) {
              const typeDbFilter = item.type.toLowerCase() === 'short' ? 'saq' : item.type.toLowerCase()

              const dbQs = await bookService.getExistingQuestions(
                classNum,
                subject,
                selections,
                { types: [typeDbFilter] },
              )

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

              localQs.push(...normalizedDb)
              localDb += normalizedDb.length

              const shortfall = item.count - normalizedDb.length
              if (shortfall > 0 && combinedContext.trim()) {
                console.log(`[smart-prompt] ${group.title} ${item.type}: DB=${normalizedDb.length}, shortfall=${shortfall}`)

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
                  localQs.push(...aiQs)
                  localAi += aiQs.length
                  console.log(`[smart-prompt] ${group.title} ${item.type}: AI generated ${aiQs.length} via ${aiResult.provider}`)
                } catch (err) {
                  console.warn(`[smart-prompt] ${group.title} ${item.type}: AI generation failed:`, err.message)
                }
              }
            }

            return { questions: localQs, dbCount: localDb, aiCount: localAi }
          })
        )

        // Merge parallel results into shared accumulators
        for (const r of chapterResults) {
          allQuestions.push(...r.questions)
          totalDbCount += r.dbCount
          totalAiCount += r.aiCount
        }

        const sourceChapters = Array.from(chapterGroups.values()).map(g => g.title)

        console.log('[smart-prompt] Multi-chapter DONE: questions=', allQuestions.length, 'db=', totalDbCount, 'ai=', totalAiCount)
        
        res.json({
          success: true,
          questions: allQuestions,
          count: allQuestions.length,
          dbCount: totalDbCount,
          aiCount: totalAiCount,
          source: 'smart',
          parsed: { classNum, subject, items, count: requestedCount },
          sourceChapters,
          creditsCharged: 1,
        })
        return
      }

      // ── Single-chapter/all-chapters mode (existing logic) ─────────────────
      // Build selections
      let selections = []
      let sourceChapters = []

      if (chapterId) {
        let found = allChapters.find((c) => c.id === chapterId)
        if (!found) {
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

      // ── Per-type DB fetch + AI fill (PARALLEL — was sequential) ────────────
      const allQuestions = []
      let totalDbCount = 0
      let totalAiCount = 0

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

      const itemResults = await Promise.all(
        items.map(async (item) => {
          const localQs = []
          let localDb = 0
          let localAi = 0

          const typeDbFilter = item.type.toLowerCase() === 'short' ? 'saq' : item.type.toLowerCase()

          // Fetch from DB for this specific type
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

          localQs.push(...normalizedDb)
          localDb += normalizedDb.length

          // If shortfall for this type, AI generates the rest
          const shortfall = item.count - normalizedDb.length
          if (shortfall > 0 && combinedContext.trim()) {
            console.log(`[smart-prompt] ${item.type}: DB=${normalizedDb.length}, shortfall=${shortfall}`)

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
              localQs.push(...aiQs)
              localAi += aiQs.length
              console.log(`[smart-prompt] ${item.type}: AI generated ${aiQs.length} via ${aiResult.provider}`)
            } catch (err) {
              console.warn(`[smart-prompt] ${item.type}: AI generation failed:`, err.message)
            }
          }

          return { questions: localQs, dbCount: localDb, aiCount: localAi }
        })
      )

      // Merge parallel results into shared accumulators
      for (const r of itemResults) {
        allQuestions.push(...r.questions)
        totalDbCount += r.dbCount
        totalAiCount += r.aiCount
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
