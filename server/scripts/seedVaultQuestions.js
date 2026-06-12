/**
 * Seed Vault Questions from Markdown Files
 *
 * Reads ch*-questions.md files from pdf-extract-app-python/vault-questions/class-N/
 * and loads them into the `vault_questions` table in Supabase.
 *
 * Each markdown file contains MCQ, CQ, and Short questions parsed from
 * the verified vault (textbook-based, human-reviewed).
 *
 * Usage:
 *   node server/scripts/seedVaultQuestions.js            # Seed Class 6
 *   node server/scripts/seedVaultQuestions.js --class=7  # Seed Class 7
 *   node server/scripts/seedVaultQuestions.js --all      # Seed all classes
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const fs = require('fs')
const path = require('path')
const { supabaseAdmin } = require('../config/supabase')

// Vault questions are in the pdf-extract-app-python workspace
const VAULT_BASE = 'D:\\prosno-shala\\PDF_TO_TEXT_APP\\pdf-extract-app-python\\vault-questions'

// Parse CLI args
const args = process.argv.slice(2)
const classArg = args.find(a => a.startsWith('--class='))
const seedAll = args.includes('--all')
let targetClasses = []

if (seedAll) {
  targetClasses = [6, 7, 8, 9, 10]
} else if (classArg) {
  targetClasses = [parseInt(classArg.split('=')[1])]
} else {
  targetClasses = [6] // Default: Class 6
}

// --- Parse frontmatter from vault markdown ---
function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, body: content }

  const yamlBlock = match[1]
  const body = match[2]
  const data = {}

  for (const line of yamlBlock.split('\n')) {
    if (!line.trim()) continue
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (kv) {
      let val = kv[2].trim().replace(/^["'](.*)["']$/, '$1')
      // Try parse numbers
      if (/^\d+$/.test(val)) val = parseInt(val)
      data[kv[1]] = val
    }
  }

  return { data, body }
}

// --- Bengali digit helper ---
const BN_DIGITS = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 }
function parseBnNum(s) {
  if (typeof s !== 'string') return parseInt(s) || 0
  let out = ''
  for (const ch of s.trim()) {
    out += BN_DIGITS[ch] !== undefined ? BN_DIGITS[ch] : ch
  }
  return parseInt(out) || 0
}

// --- Extract MCQ questions ---
function extractMCQs(body) {
  const mcqs = []
  const regex = /### MCQ-(\d+)\s*\n\s*\*\*প্রশ্ন:\*\*\s*([\s\S]*?)(?=\n\s*-\s*ক)/g
  let m

  while ((m = regex.exec(body)) !== null) {
    const num = parseBnNum(m[1])
    const questionText = m[2].trim()
    const restStart = m.index + m[0].length

    // Find the block until next ### or --- or ##
    let blockEnd = body.indexOf('\n### ', restStart)
    if (blockEnd === -1) blockEnd = body.indexOf('\n---\n', restStart)
    if (blockEnd === -1) blockEnd = body.indexOf('\n## ', restStart)
    if (blockEnd === -1) blockEnd = body.length

    const block = body.slice(restStart, blockEnd).trim()

    // Parse options (ক), খ), গ), ঘ) format)
    const options = {}
    const optRegex = /-\s*(ক|খ|গ|ঘ)\)\s*(.+)/g
    let opt
    while ((opt = optRegex.exec(block)) !== null) {
      options[opt[1]] = opt[2].trim()
    }

    // Parse answer
    const ansMatch = block.match(/\*\*উত্তর:\*\*\s*(ক|খ|গ|ঘ)/)
    const answer = ansMatch ? ansMatch[1] : null

    // Parse marks (supports Bengali digits)
    const marksMatch = block.match(/\*\*মান:\*\*\s*(.+)/)
    const marks = marksMatch ? parseBnNum(marksMatch[1]) : 1

    if (questionText && Object.keys(options).length >= 2) {
      mcqs.push({
        number: num,
        type: 'mcq',
        data: {
          question: questionText,
          options,
          answer,
          marks,
        },
      })
    }
  }

  return mcqs
}

// --- Extract CQ questions ---
function extractCQs(body) {
  const cqs = []
  // Find CQ section
  const cqSectionMatch = body.match(/## সৃজনশীল \/ CQ[^#]*([\s\S]*?)(?=## সংক্ষিপ্ত|## সারাংশ|$)/)
  if (!cqSectionMatch) return cqs

  const cqSection = cqSectionMatch[1]
  const cqRegex = /### CQ-(\d+)\s*\n([\s\S]*?)(?=### CQ-\d+|$)/g
  let m

  while ((m = cqRegex.exec(cqSection)) !== null) {
    const num = parseInt(m[1])
    const block = m[2].trim()

    // Parse stimulus (উদ্দীপক)
    const stimulusMatch = block.match(/\*\*উদ্দীপক:\*\*\s*([\s\S]*?)(?=\*\*ক\)\*|$)/)
    const stimulus = stimulusMatch ? stimulusMatch[1].trim() : ''

    // Parse parts (ক, খ, গ)
    const parts = {}
    const partRegex = /\*\*(ক|খ|গ|ঘ|ঙ)\)\*\*\s*(.+?)(?=\s*\*\*(?:খ|গ|ঘ|ঙ)\)|\s*\*\*মোট মান|$)/gs
    let p
    while ((p = partRegex.exec(block)) !== null) {
      parts[p[1]] = p[2].trim()
    }

    // Parse total marks (supports Bengali digits)
    const marksMatch = block.match(/\*\*মোট মান:\*\*\s*(.+)/)
    const totalMarks = marksMatch ? parseBnNum(marksMatch[1]) : 10

    if (stimulus || Object.keys(parts).length > 0) {
      cqs.push({
        number: num,
        type: 'cq',
        data: {
          stimulus,
          parts,
          totalMarks,
        },
      })
    }
  }

  return cqs
}

// --- Extract Short questions ---
function extractShorts(body) {
  const shorts = []
  const shortSectionMatch = body.match(/## সংক্ষিপ্ত[^#]*([\s\S]*?)(?=## সারাংশ|$)/)
  if (!shortSectionMatch) return shorts

  const shortSection = shortSectionMatch[1]
  const shortRegex = /### SHORT-(\d+)\s*\n\s*\*\*প্রশ্ন:\*\*\s*(.+?)(?=\n\s*\*\*মান|$)/gs
  let m

  while ((m = shortRegex.exec(shortSection)) !== null) {
    const num = parseInt(m[1])
    const questionText = m[2].trim()

    // Parse marks
    const blockEnd = shortSection.indexOf('### SHORT-', m.index + 1)
    const block = blockEnd === -1
      ? shortSection.slice(m.index + m[0].length)
      : shortSection.slice(m.index + m[0].length, blockEnd)

    const marksMatch = block.match(/\*\*মান:\*\*\s*(.+)/)
    const marks = marksMatch ? parseBnNum(marksMatch[1]) : 2

    if (questionText) {
      shorts.push({
        number: num,
        type: 'saq',
        data: {
          question: questionText,
          marks,
        },
      })
    }
  }

  return shorts
}

// --- Process one vault file ---
async function processVaultFile(filePath, classNum) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`)

  const content = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, body } = parseFrontmatter(content)

  const chapterNo = fm.chapter_no || parseInt(path.basename(filePath).match(/ch(\d+)/)?.[1])
  if (!chapterNo) {
    console.warn(`  ⚠️ No chapter number found, skipping`)
    return { mcq: 0, cq: 0, short: 0 }
  }

  const chapterId = `ch-${chapterNo}`
  const subject = fm.subject || 'math'
  const titleBn = fm.chapter_title_bn || `অধ্যায় ${chapterNo}`
  const titleEn = fm.chapter_title_en || `Chapter ${chapterNo}`

  // Extract questions
  const mcqs = extractMCQs(body)
  const cqs = extractCQs(body)
  const shorts = extractShorts(body)

  console.log(`  📊 Extracted: ${mcqs.length} MCQ, ${cqs.length} CQ, ${shorts.length} Short`)

  if (mcqs.length + cqs.length + shorts.length === 0) {
    console.warn(`  ⚠️ No questions extracted, skipping`)
    return { mcq: mcqs.length, cq: cqs.length, short: shorts.length }
  }

  // Delete existing vault questions for this chapter
  await supabaseAdmin
    .from('vault_questions')
    .delete()
    .eq('class_num', classNum)
    .eq('subject', subject)
    .eq('chapter_id', chapterId)

  // Build rows
  const rows = [
    ...mcqs.map(q => ({
      class_num: classNum,
      subject,
      chapter_id: chapterId,
      chapter_title_bn: titleBn,
      chapter_title_en: titleEn,
      question_type: 'mcq',
      question_number: q.number,
      question_data: q.data,
      source: 'vault',
      is_verified: true,
    })),
    ...cqs.map(q => ({
      class_num: classNum,
      subject,
      chapter_id: chapterId,
      chapter_title_bn: titleBn,
      chapter_title_en: titleEn,
      question_type: 'cq',
      question_number: q.number,
      question_data: q.data,
      source: 'vault',
      is_verified: true,
    })),
    ...shorts.map(q => ({
      class_num: classNum,
      subject,
      chapter_id: chapterId,
      chapter_title_bn: titleBn,
      chapter_title_en: titleEn,
      question_type: 'saq',
      question_number: q.number,
      question_data: q.data,
      source: 'vault',
      is_verified: true,
    })),
  ]

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const { error } = await supabaseAdmin.from('vault_questions').insert(batch)
    if (error) {
      console.error(`  ❌ Insert error (batch ${i}):`, error.message)
    }
  }

  console.log(`  ✅ Saved ${rows.length} vault questions for ${chapterId}`)
  return { mcq: mcqs.length, cq: cqs.length, short: shorts.length }
}

// --- Main ---
async function main() {
  console.log(`\n🏦 Vault Questions Seeding`)
  console.log(`📂 Vault base: ${VAULT_BASE}`)
  console.log(`🎯 Target classes: ${targetClasses.join(', ')}\n`)

  // Check if vault_questions table exists
  const { error: tableCheck } = await supabaseAdmin
    .from('vault_questions')
    .select('id', { count: 'exact', head: true })
    .limit(1)

  if (tableCheck && tableCheck.code === '42P01') {
    console.error(`❌ Table 'vault_questions' does not exist!`)
    console.log(`\nRun this SQL first in Supabase SQL Editor:\n`)
    console.log(`
CREATE TABLE IF NOT EXISTS vault_questions (
  id BIGSERIAL PRIMARY KEY,
  class_num INTEGER NOT NULL,
  subject TEXT NOT NULL DEFAULT 'math',
  chapter_id TEXT NOT NULL,
  chapter_title_bn TEXT,
  chapter_title_en TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'cq', 'saq')),
  question_number INTEGER,
  question_data JSONB NOT NULL DEFAULT '{}',
  source TEXT DEFAULT 'vault',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_num, subject, chapter_id, question_type, question_number)
);

-- RLS
ALTER TABLE vault_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read vault_questions"
  ON vault_questions FOR SELECT
  TO authenticated
  USING (true);

-- Index for fast lookups
CREATE INDEX idx_vault_class_subject ON vault_questions(class_num, subject);
CREATE INDEX idx_vault_chapter ON vault_questions(class_num, subject, chapter_id);
CREATE INDEX idx_vault_type ON vault_questions(question_type);
    `)
    process.exit(1)
  }

  const totals = { mcq: 0, cq: 0, short: 0, chapters: 0 }

  for (const classNum of targetClasses) {
    const classDir = path.join(VAULT_BASE, `class-${classNum}`)
    if (!fs.existsSync(classDir)) {
      console.warn(`⚠️ No vault directory for class ${classNum}: ${classDir}`)
      continue
    }

    const files = fs
      .readdirSync(classDir)
      .filter(f => f.startsWith('ch') && f.endsWith('-questions.md'))
      .sort()

    console.log(`\n📚 Class ${classNum}: Found ${files.length} chapter files`)

    for (const file of files) {
      const filePath = path.join(classDir, file)
      try {
        const result = await processVaultFile(filePath, classNum)
        totals.mcq += result.mcq
        totals.cq += result.cq
        totals.short += result.short
        if (result.mcq + result.cq + result.short > 0) totals.chapters++
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err.message)
      }
    }
  }

  // Summary
  const { count: totalCount } = await supabaseAdmin
    .from('vault_questions')
    .select('*', { count: 'exact', head: true })

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✅ SEEDING COMPLETE`)
  console.log(`📊 Chapters processed: ${totals.chapters}`)
  console.log(`📊 MCQ: ${totals.mcq} | CQ: ${totals.cq} | Short: ${totals.short}`)
  console.log(`📊 Total seeded this run: ${totals.mcq + totals.cq + totals.short}`)
  console.log(`📊 Total in vault_questions table: ${totalCount || 0}`)
  console.log(`${'='.repeat(50)}\n`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})