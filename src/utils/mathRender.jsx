import { useMemo } from 'react'
import * as katex from 'katex'
import 'katex/dist/katex.css'
import './mathRender.css'

const INLINE_RE = /\$\$([^$]+?)\$\$|\$([^$\n]+?)\$/g

/**
 * Some scans / older AI outputs split a chained equation into multiple
 * $...$ blocks separated by plain-text operators, which collapses spacing
 * because operators outside math mode lose KaTeX's spacing rules.
 *
 *   "$\\log\\frac{a}{b}$ + $\\log\\frac{c}{d}$ = 0"  (cramped)
 *
 * Heuristic: when two inline math blocks are separated by ONLY whitespace
 * + a math operator + whitespace, fuse them into a single block. Repeat
 * until stable so chained patterns merge fully.
 */
function fuseAdjacentMath(text) {
  if (!text || typeof text !== 'string') return text
  const op = '[+\\-*/=<>≤≥±]'
  const re = new RegExp(`\\$([^$\\n]+?)\\$(\\s*)(${op})(\\s*)\\$([^$\\n]+?)\\$`, 'g')
  let prev = text
  for (let i = 0; i < 8; i++) {
    const next = prev.replace(re, (_, a, _s1, oper, _s2, b) => `$${a.trim()} ${oper} ${b.trim()}$`)
    if (next === prev) break
    prev = next
  }
  return prev
}

function renderLatex(latex, displayMode) {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      // Tried `htmlAndMathml` + html2canvas foreignObjectRendering for the
      // PDF-download path: Chromium silently produces a blank capture
      // because SVG <foreignObject> doesn't pull in @font-face web fonts
      // reliably. Reverted to plain `html` output and the aggressive
      // style-pin onclone hook in PDFPreview, which keeps the PDF working
      // even if a small set of complex fractions still drift slightly.
      output: 'html',
      strict: 'ignore',
      trust: false,
    })
  } catch {
    return escapeHtml('$' + latex + '$')
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Convert text containing $...$ (inline) or $$...$$ (display) LaTeX into
 * an HTML string with KaTeX-rendered math inline. Plain segments are
 * HTML-escaped. Newlines preserved as <br>.
 */
export function renderMathToHtml(input) {
  if (!input) return ''
  // Some AI providers like to emit literal <br> / <br/> tags inside the
  // extracted text (treating questions as HTML). Normalize them to plain
  // newlines BEFORE escaping, so they become real line breaks instead of
  // showing as escaped "&lt;br&gt;" text on the page.
  const normalized = String(input).replace(/<br\s*\/?>/gi, '\n')
  const text = fuseAdjacentMath(normalized)
  const parts = []
  let lastIndex = 0
  INLINE_RE.lastIndex = 0
  let m
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      // Plain-text segment: escape HTML AND turn newlines into <br/>.
      // We do the newline replacement HERE per-segment instead of once at
      // the end, because KaTeX's `htmlAndMathml` output contains SVG
      // <path d="…"> attributes with literal newlines in their data; a
      // global \n → <br/> replacement on the joined string injects <br/>
      // into the path data and breaks SVG parsing (browser throws
      // "Expected path command"). Plain-text segments are the only place
      // newlines should become <br/> anyway.
      parts.push(escapeHtml(text.slice(lastIndex, m.index)).replace(/\n/g, '<br/>'))
    }
    if (m[1] !== undefined) {
      parts.push(renderLatex(m[1], true))
    } else {
      parts.push(renderLatex(m[2], false))
    }
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)).replace(/\n/g, '<br/>'))
  }
  return parts.join('')
}

/**
 * React component: render text with inline LaTeX math.
 * Use anywhere user-entered question text is shown — editor previews,
 * print preview, scan review list.
 */
export function MathText({ text, as: Tag = 'span', className, style }) {
  const html = useMemo(() => renderMathToHtml(text), [text])
  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** True if the string contains any $...$ math delimiters. */
export function hasMath(s) {
  return typeof s === 'string' && /\$[^$\n]+\$/.test(s)
}

/**
 * Inline math preview shown under editor inputs. Renders nothing if the
 * text has no $...$ math, so non-math questions stay clean.
 */
export function MathPreview({ text, label = 'প্রিভিউ' }) {
  if (!hasMath(text)) return null
  return (
    <div
      style={{
        marginTop: 6,
        padding: '8px 12px',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: 10,
        fontSize: 13,
        lineHeight: 1.7,
        color: '#0f172a',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: 9,
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginRight: 8,
        }}
      >
        {label}:
      </span>
      <MathText text={text} />
    </div>
  )
}
