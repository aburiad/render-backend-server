/**
 * Verification script:
 *   1. Each chapter's YAML frontmatter parses cleanly (subchapters list intact)
 *   2. No `&nbsp;` or `&amp;` HTML entities lingering
 *   3. MCQ option lines use the `- ক)` / `- খ)` / `- গ)` / `- ঘ)` bullet format
 *      (the seed script's regex expects this)
 */

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '../data/books/class-9/math')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null
  return { yaml: match[1], body: match[2] }
}

function countSubchapters(yaml) {
  return (yaml.match(/^  - id: /gm) || []).length
}

function hasValidSubchapterIndent(yaml) {
  // Each `- id:` should be followed within a few lines by 4-space indented title/heading/type
  const items = yaml.split(/(?=^  - id:)/m)
  for (const item of items.slice(1)) {
    if (!/^\s+title:/m.test(item)) return false
    if (!/^\s+type:/m.test(item)) return false
    // Reject single-space indentation (the bug we just fixed)
    if (/^ title:/m.test(item) || /^ type:/m.test(item) || /^ heading:/m.test(item)) {
      return false
    }
  }
  return true
}

function findMcqInlineOption(body) {
  // Look for a single line that has multiple **standalone** Bengali option
  // markers (ক, খ, গ, ঘ) — option markers always have whitespace or line-start
  // before them. This avoids false positives from Bengali words ending in those
  // letters (e.g. "লগ)" — log — should not trigger).
  const markerRe = /(?:^|\s)[কখগঘ][\)\.]/g
  const lines = body.split('\n')
  const hits = []
  let inFigure = false
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    // Track multi-line [Figure: ...] blocks (close on `]`)
    if (ln.includes('[Figure:')) inFigure = true
    if (inFigure) {
      if (ln.includes(']')) inFigure = false
      continue
    }
    if (ln.trim().startsWith('|')) continue // markdown table row
    const markers = ln.match(markerRe) || []
    if (markers.length >= 3) {
      hits.push(`L${i + 1}: ${ln.slice(0, 140)}`)
    }
  }
  return hits
}

let allOk = true
console.log('Chapter verification:')
console.log('─────────────────────')

for (const file of files) {
  const filePath = path.join(dir, file)
  const content = fs.readFileSync(filePath, 'utf8')
  const fm = parseFrontmatter(content)

  if (!fm) {
    console.log(`  ✗ ${file}  — frontmatter parse FAILED`)
    allOk = false
    continue
  }

  const subCount = countSubchapters(fm.yaml)
  const indentOk = hasValidSubchapterIndent(fm.yaml)
  const inlineMcq = findMcqInlineOption(fm.body)
  const hasNbsp = /&nbsp;/.test(content)
  const hasAmp = /&amp;/.test(content)

  let status = '✓'
  const notes = []
  if (!indentOk) {
    status = '✗'
    notes.push('YAML indent broken')
    allOk = false
  }
  if (inlineMcq.length > 0) {
    status = '✗'
    notes.push(`${inlineMcq.length} inline MCQ line(s) remain`)
    allOk = false
  }
  if (hasNbsp) {
    status = '✗'
    notes.push('&nbsp; present')
    allOk = false
  }
  if (hasAmp) {
    status = '✗'
    notes.push('&amp; present')
    allOk = false
  }

  console.log(
    `  ${status} ${file.padEnd(48)} ${String(subCount).padStart(2)} subchapters${
      notes.length ? '  — ' + notes.join(', ') : ''
    }`,
  )
  if (inlineMcq.length > 0 && inlineMcq.length <= 3) {
    inlineMcq.forEach((l) => console.log(`      ${l}`))
  }
}

console.log('─────────────────────')
console.log(allOk ? '✅ All chapters pass.' : '❌ Issues found — see above.')
process.exit(allOk ? 0 : 1)
