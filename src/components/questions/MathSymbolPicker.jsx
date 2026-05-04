import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as katex from 'katex'
import 'katex/dist/katex.css'

const SYMBOL_GROUPS = [
  {
    label: 'মৌলিক',
    icon: '+-',
    symbols: [
      { latex: '+', insert: '+' },
      { latex: '-', insert: '-' },
      { latex: '\\times', insert: '×' },
      { latex: '\\div', insert: '÷' },
      { latex: '=', insert: '=' },
      { latex: '\\neq', insert: '≠' },
      { latex: '\\pm', insert: '±' },
      { latex: '\\leq', insert: '≤' },
      { latex: '\\geq', insert: '≥' },
      { latex: '<', insert: '<' },
      { latex: '>', insert: '>' },
      { latex: '\\approx', insert: '≈' },
      { latex: '\\infty', insert: '∞' },
      { latex: '\\%', insert: '%' },
    ],
  },
  {
    label: 'ভগ্নাংশ / সূচক',
    icon: 'x²',
    symbols: [
      { latex: '\\frac{a}{b}', insert: '⁄' },
      { latex: 'x^{2}', insert: '²' },
      { latex: 'x^{3}', insert: '³' },
      { latex: 'x^{n}', insert: 'ⁿ' },
      { latex: 'x_{0}', insert: '₀' },
      { latex: 'x_{1}', insert: '₁' },
      { latex: 'x_{2}', insert: '₂' },
      { latex: 'x_{i}', insert: 'ᵢ' },
      { latex: '\\sqrt{x}', insert: '√' },
      { latex: '\\sqrt[3]{x}', insert: '∛' },
      { latex: '\\sqrt[4]{x}', insert: '∜' },
    ],
  },
  {
    label: 'সুপারস্ক্রিপ্ট',
    icon: 'aⁿ',
    symbols: [
      { latex: '^0', insert: '⁰' },
      { latex: '^1', insert: '¹' },
      { latex: '^2', insert: '²' },
      { latex: '^3', insert: '³' },
      { latex: '^4', insert: '⁴' },
      { latex: '^5', insert: '⁵' },
      { latex: '^6', insert: '⁶' },
      { latex: '^7', insert: '⁷' },
      { latex: '^8', insert: '⁸' },
      { latex: '^9', insert: '⁹' },
      { latex: '^+', insert: '⁺' },
      { latex: '^-', insert: '⁻' },
      { latex: '^n', insert: 'ⁿ' },
      { latex: '^i', insert: 'ⁱ' },
    ],
  },
  {
    label: 'সাবস্ক্রিপ্ট',
    icon: 'xₙ',
    symbols: [
      { latex: '_0', insert: '₀' },
      { latex: '_1', insert: '₁' },
      { latex: '_2', insert: '₂' },
      { latex: '_3', insert: '₃' },
      { latex: '_4', insert: '₄' },
      { latex: '_5', insert: '₅' },
      { latex: '_6', insert: '₆' },
      { latex: '_7', insert: '₇' },
      { latex: '_8', insert: '₈' },
      { latex: '_9', insert: '₉' },
      { latex: '_+', insert: '₊' },
      { latex: '_-', insert: '₋' },
      { latex: '_n', insert: 'ₙ' },
      { latex: '_i', insert: 'ᵢ' },
    ],
  },
  {
    label: 'গ্রিক',
    icon: 'αβ',
    symbols: [
      { latex: '\\alpha', insert: 'α' },
      { latex: '\\beta', insert: 'β' },
      { latex: '\\gamma', insert: 'γ' },
      { latex: '\\delta', insert: 'δ' },
      { latex: '\\epsilon', insert: 'ε' },
      { latex: '\\theta', insert: 'θ' },
      { latex: '\\lambda', insert: 'λ' },
      { latex: '\\mu', insert: 'μ' },
      { latex: '\\pi', insert: 'π' },
      { latex: '\\sigma', insert: 'σ' },
      { latex: '\\omega', insert: 'ω' },
      { latex: '\\phi', insert: 'φ' },
      { latex: '\\Delta', insert: 'Δ' },
      { latex: '\\Sigma', insert: 'Σ' },
      { latex: '\\Omega', insert: 'Ω' },
      { latex: '\\Theta', insert: 'Θ' },
    ],
  },
  {
    label: 'জ্যামিতি',
    icon: '△',
    symbols: [
      { latex: '\\angle', insert: '∠' },
      { latex: '\\triangle', insert: '△' },
      { latex: '\\parallel', insert: '∥' },
      { latex: '\\perp', insert: '⊥' },
      { latex: '\\circ', insert: '°' },
      { latex: '\\sim', insert: '∼' },
      { latex: '\\cong', insert: '≅' },
      { latex: '\\rightarrow', insert: '→' },
      { latex: '\\Rightarrow', insert: '⇒' },
      { latex: '\\leftrightarrow', insert: '↔' },
      { latex: '\\overline{AB}', insert: '̄' },
    ],
  },
  {
    label: 'ক্যালকুলাস',
    icon: '∫',
    symbols: [
      { latex: '\\int', insert: '∫' },
      { latex: '\\sum', insert: '∑' },
      { latex: '\\prod', insert: '∏' },
      { latex: '\\partial', insert: '∂' },
      { latex: '\\nabla', insert: '∇' },
      { latex: '\\lim', insert: 'lim' },
      { latex: '\\log', insert: 'log' },
      { latex: '\\ln', insert: 'ln' },
      { latex: '\\sin', insert: 'sin' },
      { latex: '\\cos', insert: 'cos' },
      { latex: '\\tan', insert: 'tan' },
    ],
  },
  {
    label: 'সেট / যুক্তি',
    icon: '∪',
    symbols: [
      { latex: '\\in', insert: '∈' },
      { latex: '\\notin', insert: '∉' },
      { latex: '\\subset', insert: '⊂' },
      { latex: '\\subseteq', insert: '⊆' },
      { latex: '\\cup', insert: '∪' },
      { latex: '\\cap', insert: '∩' },
      { latex: '\\emptyset', insert: '∅' },
      { latex: '\\forall', insert: '∀' },
      { latex: '\\exists', insert: '∃' },
      { latex: '\\therefore', insert: '∴' },
      { latex: '\\because', insert: '∵' },
    ],
  },
  {
    label: 'বন্ধনী',
    icon: '{ }',
    symbols: [
      { latex: '(', insert: '(' },
      { latex: ')', insert: ')' },
      { latex: '\\{', insert: '{' },
      { latex: '\\}', insert: '}' },
      { latex: '[', insert: '[' },
      { latex: ']', insert: ']' },
      { latex: '|', insert: '|' },
    ],
  },
]

function KatexRender({ latex }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, { throwOnError: false, displayMode: false })
      } catch {
        ref.current.textContent = latex
      }
    }
  }, [latex])
  return <span ref={ref} />
}

export default function MathSymbolPicker({ inputRef, onInsert }) {
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState(0)
  const [recentlyUsed, setRecentlyUsed] = useState([])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const insertSymbol = (symbol) => {
    const textToInsert = symbol.insert
    const el = inputRef?.current

    // Track recently used (max 10)
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((s) => s.latex !== symbol.latex)
      return [symbol, ...filtered].slice(0, 10)
    })

    if (el) {
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? start
      const before = el.value.slice(0, start)
      const after = el.value.slice(end)
      const newValue = before + textToInsert + after
      onInsert(newValue)

      requestAnimationFrame(() => {
        const cursorPos = start + textToInsert.length
        el.focus()
        el.setSelectionRange(cursorPos, cursorPos)
      })
    } else {
      onInsert(textToInsert)
    }
  }

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
            maxWidth: 480,
            maxHeight: '80vh',
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
                চিহ্নে ক্লিক করলে ইনপুটে বসে যাবে
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 300,
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
                      padding: '6px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #e0e7ff',
                      background: '#eef2ff',
                      cursor: 'pointer',
                      fontSize: 15,
                      transition: 'all 0.1s',
                    }}
                  >
                    <KatexRender latex={symbol.latex} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              padding: '12px 24px',
              flexShrink: 0,
            }}
          >
            {SYMBOL_GROUPS.map((group, i) => (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveGroup(i)}
                className="btn-press"
                style={{
                  padding: '8px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  borderRadius: 100,
                  border: activeGroup === i ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  background: activeGroup === i ? '#2563eb' : '#fff',
                  color: activeGroup === i ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 13, fontFamily: 'serif', opacity: activeGroup === i ? 1 : 0.6 }}>{group.icon}</span>
                {group.label}
              </button>
            ))}
          </div>

          {/* Symbols grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              padding: '8px 24px 24px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {SYMBOL_GROUPS[activeGroup].symbols.map((symbol) => (
              <button
                key={symbol.latex}
                type="button"
                onClick={() => insertSymbol(symbol)}
                title={symbol.latex}
                className="btn-press"
                style={{
                  padding: '12px 6px',
                  borderRadius: 14,
                  border: '1.5px solid #f1f5f9',
                  background: '#fafbfc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  minHeight: 52,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff'
                  e.currentTarget.style.borderColor = '#bfdbfe'
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafbfc'
                  e.currentTarget.style.borderColor = '#f1f5f9'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <KatexRender latex={symbol.latex} />
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
          width: 30,
          height: 30,
          borderRadius: 10,
          border: '1.5px solid #e2e8f0',
          background: '#fff',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 800,
          fontStyle: 'italic',
          fontFamily: 'serif',
          flexShrink: 0,
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
