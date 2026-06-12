/**
 * One-shot script to remove `&nbsp;` HTML entities from class-9 math chapters.
 *
 * The original markdown used `&nbsp;&nbsp;&nbsp;&nbsp;` to visually space out
 * MCQ options on one line. Markdown renderers convert `&nbsp;` to a space, but
 * when the text is fed directly to an AI (for question generation) the literal
 * `&nbsp;` shows up in the output.
 *
 * Fix:
 *   1. Convert one-line MCQ options into a multi-line bullet list per the
 *      skill's convention (`- ক) opt` / `- খ) opt` / ...).
 *   2. Replace any remaining `&nbsp;` with a single space.
 *
 * Usage:  node server/scripts/fix-nbsp.js
 */

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '../data/books/class-9/math')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

let totalFiles = 0
let totalReplacements = 0

for (const file of files) {
  const filePath = path.join(dir, file)
  const original = fs.readFileSync(filePath, 'utf8')
  let content = original
  let nbspCount = (content.match(/&nbsp;/g) || []).length

  // 4-option MCQ lines: "- ক) X &nbsp;... খ) Y &nbsp;... গ) Z &nbsp;... ঘ) W"
  content = content.replace(
    /^- (ক[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(খ[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(গ[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(ঘ[\)\.][^\n]+)$/gm,
    '- $1\n- $2\n- $3\n- $4',
  )

  // 3-option lines (rare, কাজ boxes etc.)
  content = content.replace(
    /^- (ক[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(খ[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(গ[\)\.][^\n]+)$/gm,
    '- $1\n- $2\n- $3',
  )

  // 2-option lines
  content = content.replace(
    /^- (ক[\)\.][^\n]*?)(?:\s*&nbsp;\s*)+(খ[\)\.][^\n]+)$/gm,
    '- $1\n- $2',
  )

  // Anything left over → single space
  content = content.replace(/&nbsp;/g, ' ')

  // Collapse runs of 3+ spaces to a single space (avoids weird gaps)
  content = content.replace(/ {3,}/g, ' ')

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8')
    totalFiles += 1
    totalReplacements += nbspCount
    console.log(`  ✓ ${file}  (${nbspCount} replaced)`)
  }
}

console.log(`\nDone. ${totalReplacements} \`&nbsp;\` removed across ${totalFiles} files.`)
