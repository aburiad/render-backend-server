/**
 * Seed Class 7 Math Content from Markdown Files
 *
 * Reads all chapter-XX.md files from server/data/books/class-7/math/
 * and loads them into:
 *   - book_chapters (one row per subchapter + one row per full chapter)
 *   - book_questions (parsed MCQ/CQ/SAQ from অনুশীলনী + নমুনা প্রশ্ন sections)
 *
 * Usage: node server/scripts/seedClass7Math.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const fs = require('fs')
const path = require('path')
const { supabaseAdmin } = require('../config/supabase')

const CLASS_NUM = 7
const SUBJECT = 'math'
const BOOKS_DIR = path.resolve(__dirname, '../data/books/class-7/math')

// --- Minimal frontmatter parser (no external dependency) ---
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, body: content }
  const yamlBlock = match[1]
  const body = match[2]
  const data = {}

  // Simple YAML parser for our specific format (key: value + nested lists)
  const lines = yamlBlock.split('\n')
  let currentArrayKey = null
  let currentObject = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Top-level key: value
    const topMatch = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (topMatch && !line.startsWith(' ')) {
      const [, key, value] = topMatch
      if (value === '' || value === undefined) {
        // Could be start of an array
        if (lines[i + 1] && lines[i + 1].trim().startsWith('-')) {
          currentArrayKey = key
          data[key] = []
        } else {
          data[key] = ''
        }
      } else {
        // Strip quotes
        data[key] = value.replace(/^["'](.*)["']$/, '$1')
      }
      continue
    }

    // Array item: `  - key: value` (start of new object)
    if (line.match(/^\s+-\s+/)) {
      if (!currentArrayKey) continue
      currentObject = {}
      const itemContent = line.replace(/^\s+-\s+/, '')
      const kv = itemContent.match(/^([a-zA-Z_]+):\s*(.*)$/)
      if (kv) {
        currentObject[kv[1]] = (kv[2] || '').replace(/^["'](.*)["']$/, '$1')
      }
      data[currentArrayKey].push(currentObject)
      continue
    }

    // Object property: `    key: value`
    if (line.match(/^\s{4,}/) && currentObject) {
      const kv = line.trim().match(/^([a-zA-Z_]+):\s*(.*)$/)
      if (kv) {
        currentObject[kv[1]] = (kv[2] || '').replace(/^["'](.*)["']$/, '$1')
      }
    }
  }

  return { data, body }
}

// --- Extract sections from body by ## H2 headings ---
function splitByH2(body) {
  const sections = []
  const lines = body.split('\n')
  let current = { heading: null, lines: [] }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.heading !== null || current.lines.length > 0) {
        sections.push({ heading: current.heading, content: current.lines.join('\n').trim() })
      }
      current = { heading: line.replace(/^##\s+/, '').trim(), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  if (current.heading !== null || current.lines.length > 0) {
    sections.push({ heading: current.heading, content: current.lines.join('\n').trim() })
  }
  return sections
}

// --- Match section to subchapter from frontmatter ---
function matchSubchapter(heading, subchapters) {
  if (!heading) return null
  // Heading example: "১.১ প্যাটার্ন" or "অনুশীলনী ১" or "নমুনা প্রশ্ন"
  // frontmatter heading example: "## ১.১ প্যাটার্ন"
  const cleanHeading = heading.trim()
  for (const sub of subchapters || []) {
    const subHeading = (sub.heading || '').replace(/^##\s+/, '').trim()
    if (subHeading === cleanHeading) return sub
    // Also try matching by ID prefix at start of heading
    if (cleanHeading.startsWith(sub.id)) return sub
    // Match by title
    if (sub.title && cleanHeading.includes(sub.title)) return sub
  }
  return null
}

// --- Extract questions from content ---
// Looks for **N।** patterns and classifies them
function extractQuestions(content, sourceSection) {
  const questions = []

  // First, split content into problem blocks. Markdown uses 3 patterns:
  //   (a) **N।** ... (bold Bengali numbered, has daari ।)
  //   (b) N. ...     (plain markdown numbered list, Arabic digits)
  //   (c) N। ...     (plain Bengali numbered, no bold)
  // The marker must be at start of a line.
  const markerRegex = /(?:^|\n)(?:\*\*([০-৯0-9]+)।\*\*|([০-৯0-9]+)\.\s|([০-৯0-9]+)।\s)/g
  const markers = []
  let m
  while ((m = markerRegex.exec(content)) !== null) {
    const num = m[1] || m[2] || m[3]
    // Calculate where the problem text starts (skip the marker)
    const matchEnd = m.index + m[0].length
    // The start position is the start of the marker (after the optional newline)
    const start = m.index + (m[0].startsWith('\n') ? 1 : 0)
    markers.push({ num, start, contentStart: matchEnd })
  }

  if (markers.length === 0) return []

  // Build problem blocks: text between this marker and next marker (or section break)
  const blocks = []
  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i]
    const end = i + 1 < markers.length ? markers[i + 1].start : content.length
    let problemText = content.slice(cur.contentStart, end).trim()
    // Cut off if we hit a horizontal rule or new H2/H3 heading
    const cutOffs = [
      problemText.indexOf('\n---\n'),
      problemText.indexOf('\n## '),
      problemText.indexOf('\n### '),
    ].filter((idx) => idx > 0)
    if (cutOffs.length > 0) {
      problemText = problemText.slice(0, Math.min(...cutOffs)).trim()
    }
    blocks.push({ num: cur.num, text: problemText })
  }

  let order = 0
  for (const { num, text: problemText } of blocks) {

    // Classify by patterns
    let type = null
    let questionData = null

    // MCQ: has lines like "- ক)", "- ক.", "- ক "
    // Match BOTH parenthesis and period styles
    const mcqOptionRegex = /^\s*-\s*ক[\)\.।]\s*(.+?)(?:\n|$)/m
    const hasMcqOptions = mcqOptionRegex.test(problemText)

    // CQ (সৃজনশীল): has lines like "- ক)" and "- খ)" (no parens around)
    const cqPartRegex = /^\s*-\s*(ক|খ|গ|ঘ|ঙ|চ|ছ)[\)\.।]\s*(.+)/gm

    // SAQ: has lines like "- (ক)", "- (খ)"
    const saqPartRegex = /^\s*-\s*\((ক|খ|গ|ঘ|ঙ|চ|ছ)\)\s*(.+)/gm

    if (hasMcqOptions) {
      // MCQ — extract question and 4 options
      const lines = problemText.split('\n')
      const qLines = []
      const options = {}
      let inOptions = false

      for (const line of lines) {
        const optMatch = line.match(/^\s*-\s*(ক|খ|গ|ঘ|i|ii|iii)[\)\.।]\s*(.+)$/)
        if (optMatch) {
          inOptions = true
          options[optMatch[1]] = optMatch[2].trim()
        } else if (!inOptions) {
          qLines.push(line)
        }
      }

      type = 'mcq'
      questionData = {
        question: qLines.join('\n').trim(),
        options,
      }
    } else if (saqPartRegex.test(problemText)) {
      // SAQ — extract parts
      saqPartRegex.lastIndex = 0
      const lines = problemText.split('\n')
      const parts = {}
      const headerLines = []
      let mm

      while ((mm = saqPartRegex.exec(problemText)) !== null) {
        parts[mm[1]] = mm[2].trim()
      }

      // Get any header text before parts
      for (const line of lines) {
        if (line.match(/^\s*-\s*\(/)) break
        headerLines.push(line)
      }

      type = 'saq'
      questionData = {
        question: headerLines.join('\n').trim(),
        parts,
      }
    } else if (cqPartRegex.test(problemText)) {
      // CQ — has scenario + parts ক, খ, গ
      cqPartRegex.lastIndex = 0
      const lines = problemText.split('\n')
      const parts = {}
      const scenarioLines = []
      let mm

      while ((mm = cqPartRegex.exec(problemText)) !== null) {
        parts[mm[1]] = mm[2].trim()
      }

      for (const line of lines) {
        if (line.match(/^\s*-\s*(ক|খ|গ|ঘ|ঙ)[\)\.।]/)) break
        scenarioLines.push(line)
      }

      type = 'cq'
      questionData = {
        scenario: scenarioLines.join('\n').trim(),
        parts,
      }
    } else {
      // Plain question (no options/parts) — treat as SAQ
      type = 'saq'
      questionData = {
        question: problemText,
        parts: {},
      }
    }

    questions.push({
      number: num,
      type,
      data: questionData,
      source: sourceSection,
      ordering: order++,
    })
  }

  return questions
}

// --- Process one markdown file ---
async function processChapter(filePath, chapterNo) {
  console.log(`\n[${chapterNo}] Processing: ${path.basename(filePath)}`)

  const content = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, body } = parseFrontmatter(content)

  if (!fm.chapter_no) {
    console.warn(`  ⚠️  No chapter_no in frontmatter, skipping`)
    return
  }

  const chapterId = `ch-${fm.chapter_no}`
  const sections = splitByH2(body)
  console.log(`  📑 Found ${sections.length} H2 sections`)

  // --- 1. Save full chapter row ---
  const fullChapterPayload = {
    type: 'chapter',
    full_text: body,
    metadata: {
      chapterNumber: parseInt(fm.chapter_no),
      titleBn: fm.chapter_title_bn,
      titleEn: fm.chapter_title_en,
      pages: fm.book_pages,
      source: fm.source,
    },
    question_points: (fm.subchapters || []).map((s) => `${s.id} ${s.title}`),
    ai_summary: '',
  }

  const { error: chErr } = await supabaseAdmin.from('book_chapters').upsert(
    {
      class_num: CLASS_NUM,
      subject: SUBJECT,
      chapter_id: chapterId,
      title: `${fm.chapter_no}. ${fm.chapter_title_bn}`,
      payload: fullChapterPayload,
      parent_chapter_id: null,
      subchapter_id: null,
      is_subchapter: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'class_num,subject,chapter_id' },
  )
  if (chErr) {
    console.error(`  ❌ Full chapter upsert error:`, chErr.message)
    return
  }
  console.log(`  ✅ Full chapter saved: ${chapterId}`)

  // --- 2. Save each subchapter ---
  let savedSubs = 0
  let savedQuestions = 0

  for (const sec of sections) {
    if (!sec.heading) continue
    const sub = matchSubchapter(sec.heading, fm.subchapters)
    if (!sub) {
      // Skip unmatched (e.g., "ভূমিকা", "অধ্যায় শেষে শিক্ষার্থীরা" — handled as part of first concept)
      continue
    }

    // Infer type from ID pattern if not explicitly set in frontmatter
    let subType = sub.type
    if (!subType) {
      if (/\.ex\d*$/.test(sub.id) || sub.id.toLowerCase().includes('.ex')) subType = 'exercise'
      else if (sub.id.toLowerCase().includes('sample')) subType = 'sample'
      else subType = 'concept'
    }

    const subRowId = `${chapterId}.${sub.id}`
    const subPayload = {
      type: subType,
      full_text: sec.content,
      metadata: {
        chapterNumber: parseInt(fm.chapter_no),
        subchapterId: sub.id,
        title: sub.title,
      },
      question_points: [sub.title],
      ai_summary: '',
    }

    const { error: subErr } = await supabaseAdmin.from('book_chapters').upsert(
      {
        class_num: CLASS_NUM,
        subject: SUBJECT,
        chapter_id: subRowId,
        title: sub.title,
        payload: subPayload,
        parent_chapter_id: chapterId,
        subchapter_id: sub.id,
        is_subchapter: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'class_num,subject,chapter_id' },
    )
    if (subErr) {
      console.error(`  ❌ Subchapter ${sub.id} error:`, subErr.message)
      continue
    }
    savedSubs++

    // --- 3. Extract questions if this is an exercise or sample section ---
    if (subType === 'exercise' || subType === 'sample') {
      const questions = extractQuestions(sec.content, sec.heading)
      if (questions.length > 0) {
        // First, delete any existing rows for this subchapter (clean upsert)
        await supabaseAdmin
          .from('book_questions')
          .delete()
          .eq('class_num', CLASS_NUM)
          .eq('subject', SUBJECT)
          .eq('chapter_id', chapterId)
          .eq('subchapter_id', sub.id)

        const rows = questions.map((q) => ({
          class_num: CLASS_NUM,
          subject: SUBJECT,
          chapter_id: chapterId,
          subchapter_id: sub.id,
          question_type: q.type,
          question_data: q.data,
          source_section: q.source,
          ordering: q.ordering,
        }))

        const { error: qErr } = await supabaseAdmin.from('book_questions').insert(rows)
        if (qErr) {
          console.error(`  ❌ Questions insert error for ${sub.id}:`, qErr.message)
        } else {
          savedQuestions += rows.length
        }
      }
    }
  }

  console.log(`  ✅ Saved ${savedSubs} subchapters, ${savedQuestions} questions`)
}

// --- Main ---
async function main() {
  console.log(`\n📚 Class 7 Math — Seeding from markdown files`)
  console.log(`📂 Books dir: ${BOOKS_DIR}\n`)

  const files = fs
    .readdirSync(BOOKS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()

  console.log(`Found ${files.length} markdown files`)

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(BOOKS_DIR, files[i])
    try {
      await processChapter(filePath, i + 1)
    } catch (err) {
      console.error(`❌ Error processing ${files[i]}:`, err.message)
    }
  }

  // Final stats
  const { count: chapterCount } = await supabaseAdmin
    .from('book_chapters')
    .select('*', { count: 'exact', head: true })
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)

  const { count: questionCount } = await supabaseAdmin
    .from('book_questions')
    .select('*', { count: 'exact', head: true })
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)

  console.log(`\n✅ DONE`)
  console.log(`📊 Total rows in book_chapters: ${chapterCount}`)
  console.log(`📊 Total rows in book_questions: ${questionCount}\n`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
