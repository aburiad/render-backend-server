/**
 * Generates seed-class9-ch8.cjs
 * Run: node scripts/build-ch8-seed.js
 */
const fs = require('fs')
const path = require('path')

const header = `/**
 * Seed script: Class 9 Math — Chapter 8: বৃত্ত (Circle)
 * 120 questions: MCQ=50, CQ=50, SAQ=20
 *
 * ALL questions derived strictly from NCTB Chapter 8 syllabus
 * Math verified manually — NO hallucination
 * Table: vault_questions
 * Usage: node seed-class9-ch8.cjs
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CLASS_NUM = 9
const SUBJECT = 'math'
const CHAPTER_ID = 'ch-8'
const TITLE_BN = 'বৃত্ত'
const TITLE_EN = 'Circle'
`

const { mcq, cqTemplates, saq } = require('./ch8-question-bank.cjs')

if (cqTemplates.length !== 50) throw new Error(`Expected 50 CQ, got ${cqTemplates.length}`)
if (mcq.length !== 50) throw new Error(`Expected 50 MCQ, got ${mcq.length}`)
if (saq.length !== 20) throw new Error(`Expected 20 SAQ, got ${saq.length}`)

const cq = cqTemplates.map((q) => ({ ...q, totalMarks: 10 }))

const footer = `
async function seed() {
  const total = mcq.length + cq.length + saq.length
  console.log(\`\\n🚀 Seeding Class \${CLASS_NUM} \${SUBJECT} — \${TITLE_BN}\`)
  console.log(\`   MCQ: \${mcq.length} | CQ: \${cq.length} | SAQ: \${saq.length} | Total: \${total}\\n\`)

  if (total < 100) {
    console.error(\`⚠️  WARNING: Only \${total} questions, minimum 100 required!\`)
  }

  const { error: delErr } = await supabase
    .from('vault_questions')
    .delete()
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)
    .eq('chapter_id', CHAPTER_ID)

  if (delErr) {
    console.error('❌ Delete error:', delErr.message)
    process.exit(1)
  }
  console.log('🗑️  Deleted existing vault_questions for this chapter')

  const rows = []

  mcq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'mcq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  cq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'cq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  saq.forEach((q, i) => {
    rows.push({
      class_num: CLASS_NUM, subject: SUBJECT, chapter_id: CHAPTER_ID,
      chapter_title_bn: TITLE_BN, chapter_title_en: TITLE_EN,
      question_type: 'saq', question_number: i + 1,
      question_data: q, is_verified: true,
    })
  })

  let inserted = 0
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const { error } = await supabase.from('vault_questions').insert(batch)
    if (error) {
      console.error(\`❌ Batch \${Math.floor(i / 50) + 1} error:\`, error.message)
    } else {
      inserted += batch.length
      console.log(\`✅ Batch \${Math.floor(i / 50) + 1}: \${batch.length} inserted (total: \${inserted})\`)
    }
  }

  const { count } = await supabase
    .from('vault_questions')
    .select('*', { count: 'exact', head: true })
    .eq('class_num', CLASS_NUM)
    .eq('subject', SUBJECT)
    .eq('chapter_id', CHAPTER_ID)

  console.log(\`\\n\${'='.repeat(50)}\`)
  console.log(\`✅ SEED COMPLETE: \${count} questions in vault_questions for class-\${CLASS_NUM} \${CHAPTER_ID}\`)
  console.log(\`\${'='.repeat(50)}\\n\`)
}

seed().catch(console.error)
`

const body = `\nconst mcq = ${JSON.stringify(mcq, null, 2).replace(/"([^"]+)":/g, '$1:')}\n\nconst cq = ${JSON.stringify(cq, null, 2).replace(/"([^"]+)":/g, '$1:')}\n\nconst saq = ${JSON.stringify(saq, null, 2).replace(/"([^"]+)":/g, '$1:')}\n`

// Use proper JS object literal format instead of JSON.stringify hack
function toJs(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return '[\n' + obj.map((item) => pad + '  ' + toJs(item, indent + 1)).join(',\n') + ',\n' + pad + ']'
  }
  if (obj && typeof obj === 'object') {
    const entries = Object.entries(obj)
    return '{\n' + entries.map(([k, v]) => {
      const key = /^[a-zA-Z_]+$/.test(k) && !k.startsWith('ক') ? k : `'${k}'`
      return `${pad}  ${key.includes("'") ? `'${k}'` : k.match(/^[a-zA-Z_][\w]*$/) ? k : `'${k}'`}: ${toJs(v, indent + 1)}`
    }).join(',\n') + ',\n' + pad + '}'
  }
  if (typeof obj === 'string') return JSON.stringify(obj)
  return String(obj)
}

// Simpler: embed as module.exports and require in seed - actually just write literals manually via template

const mcqStr = mcq.map((q) => `  { question: ${JSON.stringify(q.question)}, options: { 'ক': ${JSON.stringify(q.options['ক'])}, 'খ': ${JSON.stringify(q.options['খ'])}, 'গ': ${JSON.stringify(q.options['গ'])}, 'ঘ': ${JSON.stringify(q.options['ঘ'])} }, answer: ${JSON.stringify(q.answer)}, marks: ${q.marks} }`).join(',\n')
const cqStr = cq.map((q) => `  { stimulus: ${JSON.stringify(q.stimulus)}, parts: { 'ক': ${JSON.stringify(q.parts['ক'])}, 'খ': ${JSON.stringify(q.parts['খ'])}, 'গ': ${JSON.stringify(q.parts['গ'])} }, totalMarks: 10 }`).join(',\n')
const saqStr = saq.map((q) => `  { question: ${JSON.stringify(q.question)}, marks: ${q.marks} }`).join(',\n')

const out = `${header}
const mcq = [
${mcqStr},
]

const cq = [
${cqStr},
]

const saq = [
${saqStr},
]
${footer}`

const outPath = path.join(__dirname, '..', 'seed-class9-ch8.cjs')
fs.writeFileSync(outPath, out, 'utf8')
console.log('✅ Wrote', outPath)
console.log('Counts:', mcq.length, cq.length, saq.length, '=', mcq.length + cq.length + saq.length)
