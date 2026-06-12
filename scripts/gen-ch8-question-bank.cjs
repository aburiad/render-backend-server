/**
 * One-time generator: expands ch8 CQ/SAQ to exam-style full sentences.
 * Run: node scripts/gen-ch8-question-bank.cjs
 */
const fs = require('fs')
const path = require('path')

const srcPath = path.join(__dirname, 'build-ch8-seed.cjs')
const src = fs.readFileSync(srcPath, 'utf8')
const code = src.slice(src.indexOf('const mcq = ['), src.indexOf('const footer = `'))
const { mcq, cqTemplates, saq } = new Function(`${code}\nreturn { mcq, cqTemplates, saq };`)()

function expandStimulus(s) {
  const base = s.endsWith('।') ? s : `${s}।`
  if (base.length >= 100) return base
  return `নিচের জ্যামিতিক সমস্যাটি Class 9 গণিত অধ্যায় ৮ (বৃত্ত) থেকে নেওয়া। প্রয়োজনীয় চিত্র অঙ্কন করে প্রমাণ বা সমাধান করো। ${base}`
}

function expandPart(p) {
  let t = p.trim()
  if (!t.endsWith('?') && !t.endsWith('।')) t += '।'

  const exact = {
    'অঙ্কন চিত্র আঁকো।': 'দেওয়া তথ্য অনুযায়ী প্রয়োজনীয় বৃত্তচিত্র (কেন্দ্র O, জ্যা, ব্যাসার্ধ ও সংশ্লিষ্ট বিন্দু চিহ্নিত করে) সঠিকভাবে অঙ্কন করো।',
    'চিত্র আঁকো।': 'সমস্যায় উল্লিখিত সকল বিন্দু, জ্যা, ব্যাসার্ধ ও রেখাংশসহ সঠিক বৃত্তচিত্র অঙ্কন করো।',
    'চিত্র আঁকো ও যাচাই করো।': 'সমস্যার জন্য প্রয়োজনীয় বৃত্তচিত্র অঙ্কন করো এবং গাণিতিক হিসাব দিয়ে ফলাফল যাচাই করো।',
  }
  if (exact[t]) return exact[t]
  if (t.length >= 60) return t

  if (t.includes('প্রমাণ')) {
    return `প্রয়োজনীয় চিত্র অঙ্কন করে ধাপে ধাপে যুক্তি দেখিয়ে ${t.charAt(0).toLowerCase()}${t.slice(1)}`
  }
  if (t.includes('নির্ণয়') || t.includes('লেখ')) {
    return `গাণিতিক সূত্র প্রয়োগ করে ${t.charAt(0).toLowerCase()}${t.slice(1)}`
  }
  if (t.includes('যাচাই')) {
    return `হিসাব-নিকাশ দেখিয়ে ${t.charAt(0).toLowerCase()}${t.slice(1)}`
  }
  if (t.includes('ব্যাখ্যা') || t.includes('ধারণা') || t.includes('পার্থক্য') || t.includes('সম্পর্ক') || t.includes('সংজ্ঞা') || t.includes('পদ্ধতি')) {
    return `সংক্ষিপ্তভাবে ${t.charAt(0).toLowerCase()}${t.slice(1)}`
  }
  if (t.includes('?')) return t
  return `নিচের অনুচ্ছেদ অনুযায়ী ${t.charAt(0).toLowerCase()}${t.slice(1)}`
}

function expandSAQ(q) {
  const t = q.question.trim()
  if (t.length >= 45) return q
  if (t.includes('উপপাদ্য')) {
    return { ...q, question: `${t.replace(/\?$/, '')} — বিবৃতি ও সংক্ষিপ্ত ব্যাখ্যা লেখ।` }
  }
  if (t.includes('?')) return q
  return { ...q, question: `${t.replace(/\.$/, '')} — সংক্ষিপ্তভাবে ব্যাখ্যা কর।` }
}

const expandedCQ = cqTemplates.map((t) => ({
  stimulus: expandStimulus(t.stimulus),
  parts: {
    'ক': expandPart(t.parts['ক']),
    'খ': expandPart(t.parts['খ']),
    'গ': expandPart(t.parts['গ']),
  },
}))

const expandedSAQ = saq.map(expandSAQ)

const out = `/** Chapter 8 question bank — full meaningful MCQ/CQ/SAQ (Class 9 বৃত্ত) */
module.exports = {
  mcq: ${JSON.stringify(mcq, null, 2).replace(/"([^"]+)":/g, "'$1':").replace(/'/g, "'")},

  cqTemplates: ${JSON.stringify(expandedCQ, null, 2).replace(/"([^"]+)":/g, (m, k) => (k === 'ক' || k === 'খ' || k === 'গ' ? `'${k}'` : `'${k}'`))},

  saq: ${JSON.stringify(expandedSAQ, null, 2)},
}
`

// Fix JSON to use proper JS quoting for Bengali keys
function toModule(obj) {
  if (Array.isArray(obj)) {
    return '[\n' + obj.map((x) => '    ' + toModule(x).replace(/\n/g, '\n    ')).join(',\n') + ',\n  ]'
  }
  if (obj && typeof obj === 'object') {
    const lines = Object.entries(obj).map(([k, v]) => {
      const key = `'${k}'`
      return `${key}: ${toModule(v)}`
    })
    return '{\n    ' + lines.join(',\n    ') + ',\n  }'
  }
  return JSON.stringify(obj)
}

const final = `/** Chapter 8 question bank — full meaningful MCQ/CQ/SAQ (Class 9 বৃত্ত) */
module.exports = {
  mcq: ${toModule(mcq)},
  cqTemplates: ${toModule(expandedCQ)},
  saq: ${toModule(expandedSAQ)},
}
`

fs.writeFileSync(path.join(__dirname, 'ch8-question-bank.cjs'), final, 'utf8')
console.log('Wrote ch8-question-bank.cjs')
console.log('Counts:', mcq.length, expandedCQ.length, expandedSAQ.length)
console.log('Sample CQ stimulus length:', expandedCQ[0].stimulus.length)
console.log('Sample part ক length:', expandedCQ[0].parts['ক'].length)
