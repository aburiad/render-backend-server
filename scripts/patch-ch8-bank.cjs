/**
 * Patch ch8-question-bank.cjs: fix auto-expansion bugs, fuller CQ text.
 * Run: node scripts/patch-ch8-bank.cjs
 */
const fs = require('fs')
const path = require('path')

const bankPath = path.join(__dirname, 'ch8-question-bank.cjs')
const bank = require(bankPath)

const PREFIXES = [
  /^Class 9 গণিত অধ্যায় ৮ \(বৃত্ত\) থেকে নিম্নলিখিত সমস্যাটি সমাধান করো।\s*/,
  /^নিচের জ্যামিতিক সমস্যাটি Class 9[\s\S]*?সমাধান করো।\s*/,
]

function stripPrefix(s) {
  let out = s.trim()
  for (const re of PREFIXES) out = out.replace(re, '')
  return out.replace(/\s*প্রয়োজনীয় চিত্র অঙ্কন করে ক, খ, গ-এর উত্তর দাও।$/, '').trim()
}

function fullStimulus(_short) {
  const core = stripPrefix(_short)
  return `Class 9 গণিত অধ্যায় ৮ (বৃত্ত) থেকে নিম্নলিখিত সমস্যাটি সমাধান করো। ${core} প্রয়োজনীয় চিত্র অঙ্কন করে ক, খ, গ-এর উত্তর দাও।`
}

const partExact = {
  'অঙ্কন চিত্র আঁকো।': 'দেওয়া তথ্য অনুযায়ী প্রয়োজনীয় বৃত্তচিত্র (কেন্দ্র, জ্যা, ব্যাসার্ধ ও সংশ্লিষ্ট বিন্দু চিহ্নিত করে) সঠিকভাবে অঙ্কন করো।',
  'চিত্র আঁকো।': 'সমস্যায় উল্লিখিত সকল বিন্দু, জ্যা, ব্যাসার্ধ ও রেখাংশসহ সঠিক বৃত্তচিত্র অঙ্কন করো।',
  'চিত্র আঁকো ও যাচাই করো।': 'প্রয়োজনীয় বৃত্তচিত্র অঙ্কন করো এবং গাণিতিক হিসাব দিয়ে ফলাফল যাচাই করো।',
}

function fixPart(p) {
  let t = (partExact[p.trim()] || p).trim()
  t = t
    .replace(/\boM\b/g, 'OM')
    .replace(/\bpS\b/g, 'PS')
    .replace(/\baD\b/g, 'AD')
    .replace(/\bpO\b/g, 'PO')
    .replace(/নিচের অনুচ্ছেদ অনুযায়ী মধ্যবিন্দু/g, 'প্রয়োজনীয় চিত্রে মধ্যবিন্দু')
    .replace(/নিচের অনুচ্ছেদ অনুযায়ী উপপাদ্য/g, 'উপপাদ্য')
    .replace(/নিচের অনুচ্ছেদ অনুযায়ী ∠/g, '∠')
  if (t.includes('প্রমাণ') && !t.includes('চিত্র') && t.length < 70) {
    t = `প্রয়োজনীয় চিত্র অঙ্কন করে ধাপে ধাপে যুক্তি দেখিয়ে ${t.charAt(0) === 'o' || t.charAt(0) === 'p' || t.charAt(0) === 'a' ? t : t}`
  }
  if (/^([A-Z]{2,}|[∠][A-Z])/.test(t) && t.includes('প্রমাণ') && !t.startsWith('প্রয়োজনীয়')) {
    t = `প্রয়োজনীয় চিত্র অঙ্কন করে ধাপে ধাপে যুক্তি দেখিয়ে ${t}`
  }
  if (t.endsWith('?') && t.length < 50) {
    t = `${t.slice(0, -1)}— সংক্ষিপ্তভাবে ব্যাখ্যা করো।`
  }
  return t
}

bank.cqTemplates = bank.cqTemplates.map((t) => ({
  stimulus: fullStimulus(t.stimulus),
  parts: {
    'ক': fixPart(t.parts['ক']),
    'খ': fixPart(t.parts['খ']),
    'গ': fixPart(t.parts['গ']),
  },
}))

function toModule(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  if (Array.isArray(obj)) {
    return '[\n' + obj.map((x) => pad + '  ' + toModule(x, indent + 1)).join(',\n') + ',\n' + pad + ']'
  }
  if (obj && typeof obj === 'object') {
    const lines = Object.entries(obj).map(([k, v]) => `${pad}  '${k}': ${toModule(v, indent + 1)}`)
    return '{\n' + lines.join(',\n') + ',\n' + pad + '}'
  }
  return JSON.stringify(obj)
}

const out = `/** Chapter 8 question bank — full meaningful MCQ/CQ/SAQ (Class 9 বৃত্ত) */
module.exports = {
  mcq: ${toModule(bank.mcq)},
  cqTemplates: ${toModule(bank.cqTemplates)},
  saq: ${toModule(bank.saq)},
}
`

fs.writeFileSync(bankPath, out, 'utf8')
console.log('Patched ch8-question-bank.cjs')
console.log('CQ1 stimulus chars:', bank.cqTemplates[0].stimulus.length)
console.log('CQ1 part ক:', bank.cqTemplates[0].parts['ক'].slice(0, 60) + '...')
