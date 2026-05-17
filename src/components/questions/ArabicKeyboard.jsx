import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const LETTER_ROWS = [
  // Common Arabic 101 keyboard order, matching the QWERTY letter rows.
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
]

const FARSI_LETTER_ROWS = [
  // Persian standard ISIRI-style order, matching QWERTY letter rows.
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'ژ'],
]

const HARAKAT_ROWS = [
  ['َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ', 'ٰ'],
]

const SYMBOL_ROWS = [
  ['ذ', 'أ', 'إ', 'آ', 'ﷲ', 'ﷺ', '،', '؛', '؟'],
]

const FARSI_SYMBOL_ROWS = [
  ['ء', 'أ', 'إ', 'آ', 'ۀ', 'ؤ', 'ئ', '،', '؛', '؟'],
  ['‌', '«', '»', '٪', '٫', '٬', 'ﷲ'],
]

const KEYBOARD_CONFIG = {
  ar: {
    trigger: 'ع',
    title: 'আরবি কীবোর্ড খুলুন',
    tabs: [
      ['letters', 'حروف'],
      ['harakat', 'حركات'],
      ['symbols', 'رموز'],
    ],
    rows: {
      letters: LETTER_ROWS,
      harakat: HARAKAT_ROWS,
      symbols: SYMBOL_ROWS,
    },
    gradient: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)',
    shadow: 'rgba(5, 150, 105, 0.32)',
    shadowHover: 'rgba(5, 150, 105, 0.42)',
    activeBorder: '#059669',
    activeBg: '#ecfdf5',
    activeText: '#047857',
  },
  fa: {
    trigger: 'پ',
    title: 'ফারসি কীবোর্ড খুলুন',
    tabs: [
      ['letters', 'حروف'],
      ['harakat', 'اعراب'],
      ['symbols', 'نمادها'],
    ],
    rows: {
      letters: FARSI_LETTER_ROWS,
      harakat: HARAKAT_ROWS,
      symbols: FARSI_SYMBOL_ROWS,
    },
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    shadow: 'rgba(124, 58, 237, 0.32)',
    shadowHover: 'rgba(124, 58, 237, 0.42)',
    activeBorder: '#7c3aed',
    activeBg: '#f5f3ff',
    activeText: '#6d28d9',
  },
}

function getSelection(el) {
  const value = el?.value || ''
  const start = el?.selectionStart ?? value.length
  const end = el?.selectionEnd ?? start
  return { value, start, end }
}

function getKeyLabel(key) {
  if (key === '\u200c') return 'ZWNJ'
  return key
}

export default function ArabicKeyboard({ inputRef, onInsert, layout = 'ar' }) {
  const config = KEYBOARD_CONFIG[layout] || KEYBOARD_CONFIG.ar
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('letters')
  const [preview, setPreview] = useState('')
  const lastCursor = useRef({ start: 0, end: 0 })

  useEffect(() => {
    if (!open) return
    const el = inputRef?.current
    if (!el) return
    const { start, end } = getSelection(el)
    lastCursor.current = { start, end }
    setPreview(el.value || '')
  }, [open, inputRef])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const updateValue = (nextValue, nextCursor) => {
    const el = inputRef?.current
    setPreview(nextValue)
    onInsert(nextValue)
    requestAnimationFrame(() => {
      if (!el) return
      try {
        el.focus()
        el.setSelectionRange(nextCursor, nextCursor)
        lastCursor.current = { start: nextCursor, end: nextCursor }
      } catch { /* noop */ }
    })
  }

  const insertText = (text) => {
    const el = inputRef?.current
    if (!el) {
      onInsert(text)
      return
    }
    const live = getSelection(el)
    const selection = document.activeElement === el
      ? live
      : { ...live, start: lastCursor.current.start, end: lastCursor.current.end }
    const nextValue = selection.value.slice(0, selection.start) + text + selection.value.slice(selection.end)
    updateValue(nextValue, selection.start + text.length)
  }

  const backspace = () => {
    const el = inputRef?.current
    if (!el) return
    const live = getSelection(el)
    const selection = document.activeElement === el
      ? live
      : { ...live, start: lastCursor.current.start, end: lastCursor.current.end }
    if (selection.start === 0 && selection.end === 0) return
    const removeStart = selection.start === selection.end ? Math.max(0, selection.start - 1) : selection.start
    const nextValue = selection.value.slice(0, removeStart) + selection.value.slice(selection.end)
    updateValue(nextValue, removeStart)
  }

  const rows = config.rows[activeTab] || config.rows.letters

  const modal = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.34)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 14,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 620,
            background: '#ffffff',
            borderRadius: 22,
            boxShadow: '0 24px 60px -18px rgba(15, 23, 42, 0.36)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                ...config.tabs,
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className="btn-press"
                  style={{
                    height: 32,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: activeTab === id ? `1px solid ${config.activeBorder}` : '1px solid #e2e8f0',
                    background: activeTab === id ? config.activeBg : '#ffffff',
                    color: activeTab === id ? config.activeText : '#64748b',
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-press"
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{
            margin: '12px 14px 0',
            padding: '9px 12px',
            minHeight: 42,
            maxHeight: 88,
            overflowY: 'auto',
            borderRadius: 12,
            border: '1px dashed #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            fontSize: 15,
            lineHeight: 1.8,
            fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            textAlign: 'right',
          }} dir="rtl">
            {preview ? (
              preview
            ) : (
              <span style={{ color: '#94a3b8', fontSize: 13 }}>...</span>
            )}
          </div>

          <div dir="rtl" style={{ padding: '14px 14px 10px' }}>
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  gap: 7,
                  marginBottom: 7,
                }}
              >
                {row.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => insertText(key)}
                    className="btn-press"
                    style={{
                      height: 42,
                      borderRadius: 12,
                      border: '1px solid #dbeafe',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: key.length > 1 ? 19 : 22,
                      fontWeight: 700,
                      fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    {getKeyLabel(key)}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            padding: '0 14px 14px',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: 8,
          }}>
            <button
              type="button"
              onClick={backspace}
              className="btn-press"
              style={actionStyle}
              title="Backspace"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => insertText(' ')}
              className="btn-press"
              style={{ ...actionStyle, fontSize: 13, fontWeight: 800 }}
            >
              Space
            </button>
            <button
              type="button"
              onClick={() => insertText('\n')}
              className="btn-press"
              style={actionStyle}
              title="New line"
            >
              ↵
            </button>
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
        title={config.title}
        className="btn-press"
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: 'none',
          background: config.gradient,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s',
          boxShadow: `0 2px 6px ${config.shadow}`,
          fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
          fontSize: 18,
          fontWeight: 800,
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = `0 4px 10px ${config.shadowHover}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = `0 2px 6px ${config.shadow}`
        }}
      >
        {config.trigger}
      </button>
      {modal}
    </>
  )
}

const actionStyle = {
  height: 38,
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#334155',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 700,
}
