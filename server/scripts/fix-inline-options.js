/**
 * Round-2 fix:
 *   The `fix-nbsp.js` script only handled MCQ option lines that already
 *   started with `- ` (a bullet). Some inline-option lines in the source
 *   used different prefixes (blockquote `> ...`, exercise prompts
 *   `**N।** ... ক) ... খ) ...`, or plain prose). Those are still inline
 *   after step 1.
 *
 *   This script splits them too:
 *     - `> ক) X খ) Y গ) Z` → `> - ক) X` / `> - খ) Y` / `> - গ) Z`
 *     - `**N।** stem। ক) X খ) Y গ) Z` → stem on own line, options below
 *     - skips any line inside a `[Figure: ...]` placeholder
 *
 *   Lines already in bullet form (`- ক)`) are left alone.
 */

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '../data/books/class-9/math')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

// Bengali option marker e.g. "ক)" or "ক." possibly preceded by whitespace
// We want to match a line that has 3+ option markers (ক, খ, গ, [ঘ]) inline
const INLINE_OPT_RE = /^(?<prefix>(?:>\s*)?)(?<stem>.*?)(?<opts>(?:\s|^)(?:ক)[\)\.][^\n]*?\s+(?:খ)[\)\.][^\n]*?\s+(?:গ)[\)\.][^\n]*?(?:\s+(?:ঘ)[\)\.][^\n]+)?)$/

function splitOptions(opts) {
  // opts looks like " ক) X  খ) Y  গ) Z [ ঘ) W]"
  // Split on "ক)|খ)|গ)|ঘ)" boundaries while preserving the marker
  const parts = []
  const re = /(ক[\)\.][^কখগঘ]*?)(?=\s*[কখগঘ][\)\.]|$)/g
  let m
  while ((m = re.exec(opts)) !== null) {
    parts.push(m[1].trim())
  }
  // Second sweep for খ, গ, ঘ
  const re2 = /([খগঘ][\)\.][^কখগঘ]*?)(?=\s*[কখগঘ][\)\.]|$)/g
  while ((m = re2.exec(opts)) !== null) {
    parts.push(m[1].trim())
  }
  // Sort by which marker appears (ক < খ < গ < ঘ)
  const order = { ক: 0, খ: 1, গ: 2, ঘ: 3 }
  parts.sort((a, b) => order[a[0]] - order[b[0]])
  return parts
}

function isInsideFigure(lines, idx) {
  // Walk back to find an unclosed `[Figure:` — if we see one before a closing
  // `]` or a blank line, we're inside.
  for (let i = idx; i >= Math.max(0, idx - 20); i--) {
    if (lines[i].includes(']')) return false
    if (lines[i].includes('[Figure:')) return true
    if (lines[i].trim() === '') return false
  }
  return false
}

let totalSplits = 0

for (const file of files) {
  const filePath = path.join(dir, file)
  const original = fs.readFileSync(filePath, 'utf8')
  const lines = original.split(/\r?\n/)
  let modified = false

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    // Skip lines that contain `[Figure:` (figure description)
    if (ln.includes('[Figure:')) continue
    if (isInsideFigure(lines, i)) continue
    // Skip markdown table rows
    if (/^\s*\|/.test(ln)) continue
    // Skip already-bulleted MCQ lines
    if (/^- [কখগঘ][\)\.]/.test(ln)) continue
    // Skip lines that look like prose case-numbering ("ক) some long prose...")
    // — heuristic: only fix lines with 3+ option markers AND short content per option
    const optMatches = (ln.match(/[কখগঘ][\)\.]/g) || []).length
    if (optMatches < 3) continue
    // Heuristic guard: skip if line has more than ~250 chars (likely prose, not MCQ)
    if (ln.length > 250) continue

    const m = ln.match(INLINE_OPT_RE)
    if (!m) continue

    const prefix = m.groups.prefix || ''
    const stem = (m.groups.stem || '').trim()
    const optsText = m.groups.opts || ''

    const opts = splitOptions(optsText)
    if (opts.length < 3) continue

    // Build replacement
    const out = []
    if (stem) out.push(prefix + stem)
    for (const o of opts) {
      // For blockquote prefix, keep `> ` on each line; otherwise use `- ` bullet
      if (prefix.startsWith('>')) {
        out.push(prefix + '- ' + o)
      } else {
        out.push('- ' + o)
      }
    }
    lines[i] = out.join('\n')
    modified = true
    totalSplits += 1
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
    console.log(`  ✓ ${path.basename(file)}`)
  }
}

console.log(`\n${totalSplits} inline-option line(s) split.`)
