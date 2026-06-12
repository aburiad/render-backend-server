import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as katex from 'katex'
import 'katex/dist/katex.css'
import { MathText } from '@/utils/mathRender'

const CURSOR_MARK = '​'

// type: 'tpl'  → insert wrapped in $...$, supports cursor mark via § (single-spot) or §§ (two-spot for fraction)
// type: 'uni'  → insert plain unicode (kept for symbols that read fine in plain text)
// type: 'raw'  → insert literal LaTeX without $$ wrapping (used inside an existing math block by power users; here we still wrap in $...$ for safety)
const SYMBOL_GROUPS = [
  {
    label: 'মৌলিক',
    icon: '+−',
    symbols: [
      { latex: '+', type: 'uni', insert: '+' },
      { latex: '-', type: 'uni', insert: '-' },
      { latex: '\\times', type: 'uni', insert: '×' },
      { latex: '\\div', type: 'uni', insert: '÷' },
      { latex: '=', type: 'uni', insert: '=' },
      { latex: '\\neq', type: 'uni', insert: '≠' },
      { latex: '\\pm', type: 'uni', insert: '±' },
      { latex: '\\leq', type: 'uni', insert: '≤' },
      { latex: '\\geq', type: 'uni', insert: '≥' },
      { latex: '<', type: 'uni', insert: '<' },
      { latex: '>', type: 'uni', insert: '>' },
      { latex: '\\approx', type: 'uni', insert: '≈' },
      { latex: '\\infty', type: 'uni', insert: '∞' },
      { latex: '\\%', type: 'uni', insert: '%' },
    ],
  },
  {
    label: 'ভগ্নাংশ / মূল',
    icon: '√x̄',
    symbols: [
      { latex: '\\frac{a}{b}', type: 'tpl', insert: '\\frac{a}{b}' },
      { latex: '\\sqrt{x}', type: 'tpl', insert: '\\sqrt{x}' },
      { latex: '\\sqrt[3]{x}', type: 'tpl', insert: '\\sqrt[3]{x}' },
      { latex: '\\sqrt[n]{x}', type: 'tpl', insert: '\\sqrt[n]{x}' },
      { latex: '\\frac{a+b}{c}', type: 'tpl', insert: '\\frac{a+b}{c}' },
      { latex: 'x^{2}', type: 'tpl', insert: 'x^{2}' },
      { latex: 'x^{3}', type: 'tpl', insert: 'x^{3}' },
      { latex: 'x^{n}', type: 'tpl', insert: 'x^{n}' },
      { latex: 'x_{n}', type: 'tpl', insert: 'x_{n}' },
      { latex: 'x_{i}^{2}', type: 'tpl', insert: 'x_{i}^{2}' },
      { latex: '\\binom{n}{k}', type: 'tpl', insert: '\\binom{n}{k}' },
    ],
  },
  {
    label: 'গ্রিক',
    icon: 'αβ',
    symbols: [
      { latex: '\\alpha', type: 'uni', insert: 'α' },
      { latex: '\\beta', type: 'uni', insert: 'β' },
      { latex: '\\gamma', type: 'uni', insert: 'γ' },
      { latex: '\\delta', type: 'uni', insert: 'δ' },
      { latex: '\\epsilon', type: 'uni', insert: 'ε' },
      { latex: '\\theta', type: 'uni', insert: 'θ' },
      { latex: '\\lambda', type: 'uni', insert: 'λ' },
      { latex: '\\mu', type: 'uni', insert: 'μ' },
      { latex: '\\pi', type: 'uni', insert: 'π' },
      { latex: '\\sigma', type: 'uni', insert: 'σ' },
      { latex: '\\phi', type: 'uni', insert: 'φ' },
      { latex: '\\omega', type: 'uni', insert: 'ω' },
      { latex: '\\Delta', type: 'uni', insert: 'Δ' },
      { latex: '\\Sigma', type: 'uni', insert: 'Σ' },
      { latex: '\\Omega', type: 'uni', insert: 'Ω' },
      { latex: '\\Theta', type: 'uni', insert: 'Θ' },
    ],
  },
  {
    label: 'জ্যামিতি',
    icon: '△',
    symbols: [
      { latex: '\\angle', type: 'uni', insert: '∠' },
      { latex: '\\triangle', type: 'uni', insert: '△' },
      { latex: '\\parallel', type: 'uni', insert: '∥' },
      { latex: '\\perp', type: 'uni', insert: '⊥' },
      { latex: '\\circ', type: 'uni', insert: '°' },
      { latex: '\\sim', type: 'uni', insert: '∼' },
      { latex: '\\cong', type: 'uni', insert: '≅' },
      { latex: '\\rightarrow', type: 'uni', insert: '→' },
      { latex: '\\Rightarrow', type: 'uni', insert: '⇒' },
      { latex: '\\leftrightarrow', type: 'uni', insert: '↔' },
      { latex: '\\overline{AB}', type: 'tpl', insert: '\\overline{AB}' },
      { latex: '\\overrightarrow{AB}', type: 'tpl', insert: '\\overrightarrow{AB}' },
      { latex: '\\widehat{ABC}', type: 'tpl', insert: '\\widehat{ABC}' },
    ],
  },
  {
    label: 'ক্যালকুলাস',
    icon: '∫',
    symbols: [
      { latex: '\\int', type: 'tpl', insert: '\\int' },
      { latex: '\\int_{a}^{b}', type: 'tpl', insert: '\\int_{a}^{b}' },
      { latex: '\\sum', type: 'tpl', insert: '\\sum' },
      { latex: '\\sum_{i=1}^{n}', type: 'tpl', insert: '\\sum_{i=1}^{n}' },
      { latex: '\\prod', type: 'uni', insert: '∏' },
      { latex: '\\partial', type: 'uni', insert: '∂' },
      { latex: '\\nabla', type: 'uni', insert: '∇' },
      { latex: '\\lim_{x\\to a}', type: 'tpl', insert: '\\lim_{x \\to a}' },
      { latex: '\\log', type: 'tpl', insert: '\\log' },
      { latex: '\\ln', type: 'tpl', insert: '\\ln' },
      { latex: '\\sin', type: 'tpl', insert: '\\sin' },
      { latex: '\\cos', type: 'tpl', insert: '\\cos' },
      { latex: '\\tan', type: 'tpl', insert: '\\tan' },
      { latex: 'f(x)', type: 'tpl', insert: 'f(x)' },
      { latex: 'f^{-1}(x)', type: 'tpl', insert: 'f^{-1}(x)' },
    ],
  },
  {
    label: 'সেট / যুক্তি',
    icon: '∪',
    symbols: [
      { latex: '\\in', type: 'uni', insert: '∈' },
      { latex: '\\notin', type: 'uni', insert: '∉' },
      { latex: '\\subset', type: 'uni', insert: '⊂' },
      { latex: '\\subseteq', type: 'uni', insert: '⊆' },
      { latex: '\\cup', type: 'uni', insert: '∪' },
      { latex: '\\cap', type: 'uni', insert: '∩' },
      { latex: '\\emptyset', type: 'uni', insert: '∅' },
      { latex: '\\forall', type: 'uni', insert: '∀' },
      { latex: '\\exists', type: 'uni', insert: '∃' },
      { latex: '\\therefore', type: 'uni', insert: '∴' },
      { latex: '\\because', type: 'uni', insert: '∵' },
    ],
  },
  {
    label: 'বন্ধনী',
    icon: '{ }',
    symbols: [
      { latex: '(\\,)', type: 'tpl', insert: '\\left( x \\right)' },
      { latex: '[\\,]', type: 'tpl', insert: '\\left[ x \\right]' },
      { latex: '\\{\\,\\}', type: 'tpl', insert: '\\left\\{ x \\right\\}' },
      { latex: '|x|', type: 'tpl', insert: '\\left| x \\right|' },
      { latex: '\\langle\\,\\rangle', type: 'tpl', insert: '\\langle x \\rangle' },
      { latex: '(', type: 'uni', insert: '(' },
      { latex: ')', type: 'uni', insert: ')' },
      { latex: '[', type: 'uni', insert: '[' },
      { latex: ']', type: 'uni', insert: ']' },
      { latex: '\\{', type: 'uni', insert: '{' },
      { latex: '\\}', type: 'uni', insert: '}' },
    ],
  },
  // Quick formulas — one-tap common math teacher formulas
  {
    label: 'সূত্র',
    icon: 'a²+b²',
    symbols: [
      { latex: 'a^2 + b^2 = c^2', type: 'tpl', insert: 'a^2 + b^2 = c^2', label: 'পিথাগোরাস' },
      { latex: 'ax^2 + bx + c = 0', type: 'tpl', insert: 'ax^2 + bx + c = 0', label: 'দ্বিঘাত সমীকরণ' },
      { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', type: 'tpl', insert: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', label: 'নির্ণায়ক সূত্র' },
      { latex: '(a+b)^2 = a^2 + 2ab + b^2', type: 'tpl', insert: '(a+b)^2 = a^2 + 2ab + b^2', label: 'বর্গের সূত্র' },
      { latex: '(a-b)^2 = a^2 - 2ab + b^2', type: 'tpl', insert: '(a-b)^2 = a^2 - 2ab + b^2' },
      { latex: 'a^2 - b^2 = (a+b)(a-b)', type: 'tpl', insert: 'a^2 - b^2 = (a+b)(a-b)' },
      { latex: '\\pi r^2', type: 'tpl', insert: '\\pi r^2', label: 'বৃত্তের ক্ষেত্রফল' },
      { latex: '2 \\pi r', type: 'tpl', insert: '2 \\pi r', label: 'বৃত্তের পরিধি' },
      { latex: '\\frac{1}{2} \\times b \\times h', type: 'tpl', insert: '\\frac{1}{2} \\times b \\times h', label: 'ত্রিভুজ ক্ষেত্রফল' },
      { latex: '\\sin^2 \\theta + \\cos^2 \\theta = 1', type: 'tpl', insert: '\\sin^2 \\theta + \\cos^2 \\theta = 1' },
      { latex: '\\bar{x} = \\frac{\\sum x_i}{n}', type: 'tpl', insert: '\\bar{x} = \\frac{\\sum x_i}{n}', label: 'গাণিতিক গড়' },
      { latex: 'P(A) = \\frac{n(A)}{n(S)}', type: 'tpl', insert: 'P(A) = \\frac{n(A)}{n(S)}', label: 'সম্ভাবনা' },
    ],
  },
]

function KatexRender({ latex }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          throwOnError: false,
          displayMode: false,
          strict: 'ignore',
        })
      } catch {
        ref.current.textContent = latex
      }
    }
  }, [latex])
  return <span ref={ref} />
}

/**
 * Insert symbol logic.
 * - `uni`: drop the unicode char at cursor (no math wrapping needed).
 * - `tpl`: insert the LaTeX template with placeholder letters already in
 *   place (e.g. \frac{a}{b}, \sqrt{x}). User changes the letters to
 *   their actual values. If cursor is already inside an existing $...$
 *   block, insert raw without re-wrapping.
 *
 * Cursor lands at the END of the inserted text — user can either keep
 * typing or click to change a placeholder letter.
 */
function buildInsertion(symbol, currentValue, selStart) {
  if (symbol.type === 'uni') {
    return { text: symbol.insert, cursorOffset: symbol.insert.length }
  }
  // Detect math mode: count $ before cursor — odd means we're inside $...$
  const dollarsBefore = (currentValue.slice(0, selStart).match(/\$/g) || []).length
  const insideMath = dollarsBefore % 2 === 1

  if (insideMath) {
    return { text: symbol.insert, cursorOffset: symbol.insert.length }
  }
  const wrapped = '$' + symbol.insert + '$'
  return { text: wrapped, cursorOffset: wrapped.length }
}

export default function MathSymbolPicker({ inputRef, onInsert }) {
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState(0)
  const [recentlyUsed, setRecentlyUsed] = useState([])
  const [previewValue, setPreviewValue] = useState('')

  // Sync preview to current input value when modal opens
  useEffect(() => {
    if (open && inputRef?.current) {
      setPreviewValue(inputRef.current.value || '')
    }
  }, [open, inputRef])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const insertSymbol = (symbol) => {
    const el = inputRef?.current

    setRecentlyUsed((prev) => {
      const filtered = prev.filter((s) => s.latex !== symbol.latex)
      return [symbol, ...filtered].slice(0, 10)
    })

    if (el) {
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? start
      const before = el.value.slice(0, start)
      const after = el.value.slice(end)
      const { text, cursorOffset } = buildInsertion(symbol, el.value, start)
      const newValue = before + text + after
      onInsert(newValue)
      setPreviewValue(newValue)

      requestAnimationFrame(() => {
        const cursorPos = start + cursorOffset
        el.focus()
        el.setSelectionRange(cursorPos, cursorPos)
      })
    } else {
      const { text } = buildInsertion(symbol, '', 0)
      onInsert(text)
      setPreviewValue((v) => v + text)
    }
  }

  const showPreview = useMemo(
    () => previewValue && /\$/.test(previewValue),
    [previewValue],
  )

  const modal = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 560,
            maxHeight: '85vh',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                গণিত চিহ্ন
              </h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                চিহ্ন/সূত্র ক্লিক করলে কার্সরে বসে যাবে
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                width: 36, height: 36, borderRadius: 12, border: 'none',
                background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Live preview of current input */}
          {showPreview && (
            <div style={{
              padding: '10px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                লাইভ প্রিভিউ
              </p>
              <div style={{
                fontSize: 14, color: '#0f172a', lineHeight: 1.6,
                maxHeight: 80, overflow: 'auto',
              }}>
                <MathText text={previewValue} />
              </div>
            </div>
          )}

          {/* Recently used */}
          {recentlyUsed.length > 0 && (
            <div style={{ padding: '12px 24px 8px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                সম্প্রতি ব্যবহৃত
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {recentlyUsed.map((symbol) => (
                  <button
                    key={'recent-' + symbol.latex}
                    type="button"
                    onClick={() => insertSymbol(symbol)}
                    className="btn-press"
                    style={{
                      padding: '6px 12px', borderRadius: 10,
                      border: '1.5px solid #e0e7ff', background: '#eef2ff',
                      cursor: 'pointer', fontSize: 15,
                    }}
                  >
                    <KatexRender latex={symbol.latex} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            padding: '12px 24px', flexShrink: 0,
          }}>
            {SYMBOL_GROUPS.map((group, i) => (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveGroup(i)}
                className="btn-press"
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  borderRadius: 100,
                  border: activeGroup === i ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  background: activeGroup === i ? '#2563eb' : '#fff',
                  color: activeGroup === i ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 13, fontFamily: 'serif', opacity: activeGroup === i ? 1 : 0.6 }}>{group.icon}</span>
                {group.label}
              </button>
            ))}
          </div>

          {/* Symbols grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: SYMBOL_GROUPS[activeGroup].label === 'সূত্র' ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
            gap: 8, padding: '8px 24px 24px', overflowY: 'auto', flex: 1,
          }}>
            {SYMBOL_GROUPS[activeGroup].symbols.map((symbol) => (
              <button
                key={symbol.latex}
                type="button"
                onClick={() => insertSymbol(symbol)}
                title={symbol.label || symbol.latex}
                className="btn-press"
                style={{
                  padding: '12px 6px', borderRadius: 14,
                  border: '1.5px solid #f1f5f9', background: '#fafbfc',
                  cursor: 'pointer', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, minHeight: 56, gap: 4,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff'
                  e.currentTarget.style.borderColor = '#bfdbfe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafbfc'
                  e.currentTarget.style.borderColor = '#f1f5f9'
                }}
              >
                <KatexRender latex={symbol.latex} />
                {symbol.label && (
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>
                    {symbol.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="গণিত চিহ্ন ঢোকান"
        className="btn-press"
        style={{
          width: 30, height: 30, borderRadius: 10,
          border: '1.5px solid #e2e8f0', background: '#fff', color: '#94a3b8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 13, fontWeight: 800,
          fontStyle: 'italic', fontFamily: 'serif', flexShrink: 0,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' }}
      >
        fx
      </button>
      {modal}
    </>
  )
}
