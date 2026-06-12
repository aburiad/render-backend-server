/**
 * One-shot script to restore 4-space YAML indentation in chapter frontmatter.
 *
 * The previous `fix-nbsp.js` script accidentally collapsed all 3+ spaces to
 * single spaces, which broke the nested YAML keys in `subchapters:` (the
 * leading 4-space indentation on `title:`, `heading:`, `type:` lines).
 *
 * This restores only the frontmatter block (between the first two `---`
 * lines), leaving the body content untouched.
 */

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '../data/books/class-9/math')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

let fixed = 0

for (const file of files) {
  const filePath = path.join(dir, file)
  const original = fs.readFileSync(filePath, 'utf8')

  const match = original.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/)
  if (!match) continue

  let frontmatter = match[1]
  // Lines that start with a single space followed by title:/heading:/type: → restore 4-space indent
  frontmatter = frontmatter.replace(
    /^ (title|heading|type):/gm,
    '    $1:',
  )

  if (frontmatter !== match[1]) {
    const newContent = frontmatter + original.slice(match[1].length)
    fs.writeFileSync(filePath, newContent, 'utf8')
    console.log(`  ✓ ${file}`)
    fixed += 1
  }
}

console.log(`\nRestored YAML indentation in ${fixed} files.`)
