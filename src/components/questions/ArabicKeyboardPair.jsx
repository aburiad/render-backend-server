import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  clearDeferredValue,
  commitDeferredValue,
  lockInputEl,
  reapplyInputLock,
  setDeferredValue,
  unlockInputEl,
} from './arabicKeyboardInputLock'
import { KEYBOARD_CONFIG } from './arabicKeyboardConfig'

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

function isMobileTouch() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(pointer: coarse)').matches === true ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  )
}

function swallowPointer(e) {
  e.preventDefault()
  e.stopPropagation()
}

/** One modal, two triggers (ar / fa) — one lock session per input. */
export default function ArabicKeyboardPair({ inputRef, onInsert, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const [layout, setLayout] = useState('ar')
  const [activeTab, setActiveTab] = useState('letters')
  const [preview, setPreview] = useState('')
  const lastCursor = useRef({ start: 0, end: 0 })
  const onInsertRef = useRef(onInsert)
  onInsertRef.current = onInsert

  const config = KEYBOARD_CONFIG[layout] || KEYBOARD_CONFIG.ar

  const setKeyboardOpen = useCallback((next) => {
    setOpen(next)
    onOpenChange?.(next)
  }, [onOpenChange])

  const closeKeyboard = useCallback(() => {
    setKeyboardOpen(false)
  }, [setKeyboardOpen])

  const openWithLayout = useCallback((nextLayout) => {
    const el = inputRef?.current
    if (el) {
      const { start, end } = getSelection(el)
      lastCursor.current = { start, end }
      setPreview(el.value || '')
      if (isMobileTouch()) {
        el.blur()
        clearDeferredValue(el)
      }
    }
    setLayout(nextLayout)
    setActiveTab('letters')
    setKeyboardOpen(true)
  }, [inputRef, setKeyboardOpen])

  useEffect(() => {
    if (!open) return
    const el = inputRef?.current
    if (!el) return

    const { start, end } = getSelection(el)
    lastCursor.current = { start, end }
    const initial = el.value || ''
    setPreview(initial)
    setDeferredValue(el, initial)

    if (!isMobileTouch()) {
      return () => {
        commitDeferredValue(el, (v) => onInsertRef.current(v))
      }
    }

    lockInputEl(el, {
      onLastUnlock: () => {
        commitDeferredValue(el, (v) => onInsertRef.current(v))
      },
    })

    return () => {
      unlockInputEl(el)
    }
  }, [open, inputRef])

  useLayoutEffect(() => {
    if (!open || !isMobileTouch()) return
    reapplyInputLock(inputRef?.current)
  }, [open, inputRef])

  useEffect(() => {
    if (!open || !isMobileTouch()) return
    const el = inputRef?.current
    if (!el) return

    const onFocusIn = (e) => {
      if (e.target === el) {
        e.preventDefault()
        e.stopPropagation()
        reapplyInputLock(el)
      }
    }
    document.addEventListener('focusin', onFocusIn, true)
    return () => document.removeEventListener('focusin', onFocusIn, true)
  }, [open, inputRef])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') closeKeyboard()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeKeyboard])

  const updateValue = (nextValue, nextCursor) => {
    const el = inputRef?.current
    setPreview(nextValue)
    lastCursor.current = { start: nextCursor, end: nextCursor }
    if (el) setDeferredValue(el, nextValue)
    if (isMobileTouch()) reapplyInputLock(el)
  }

  const insertText = (text) => {
    const { start, end } = lastCursor.current
    const nextValue = preview.slice(0, start) + text + preview.slice(end)
    updateValue(nextValue, start + text.length)
  }

  const backspace = () => {
    const { start, end } = lastCursor.current
    if (start === 0 && end === 0) return
    const removeStart = start === end ? Math.max(0, start - 1) : start
    updateValue(preview.slice(0, removeStart) + preview.slice(end), removeStart)
  }

  const handleKeyPointer = (action) => (e) => {
    swallowPointer(e)
    action()
  }

  const rows = config.rows[activeTab] || config.rows.letters

  const modal = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
        onClick={closeKeyboard}
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
          onPointerDown={swallowPointer}
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
              {config.tabs.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onPointerDown={handleKeyPointer(() => setActiveTab(id))}
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
              onPointerDown={handleKeyPointer(closeKeyboard)}
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

          <div
            style={{
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
            }}
            dir="rtl"
          >
            {preview ? preview : <span style={{ color: '#94a3b8', fontSize: 13 }}>...</span>}
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
                    onPointerDown={handleKeyPointer(() => insertText(key))}
                    className="btn-press"
                    style={keyBtnStyle(key)}
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
            <button type="button" onPointerDown={handleKeyPointer(backspace)} className="btn-press" style={actionStyle} title="Backspace">⌫</button>
            <button type="button" onPointerDown={handleKeyPointer(() => insertText(' '))} className="btn-press" style={{ ...actionStyle, fontSize: 13, fontWeight: 800 }}>Space</button>
            <button type="button" onPointerDown={handleKeyPointer(() => insertText('\n'))} className="btn-press" style={actionStyle} title="New line">↵</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )

  return (
    <>
      {(['ar', 'fa']).map((lay) => {
        const cfg = KEYBOARD_CONFIG[lay]
        return (
          <button
            key={lay}
            type="button"
            onPointerDown={(e) => {
              swallowPointer(e)
              openWithLayout(lay)
            }}
            title={cfg.title}
            className="btn-press"
            style={triggerStyle(cfg)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = `0 4px 10px ${cfg.shadowHover}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = `0 2px 6px ${cfg.shadow}`
            }}
          >
            {cfg.trigger}
          </button>
        )
      })}
      {modal}
    </>
  )
}

function keyBtnStyle(key) {
  return {
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
    touchAction: 'manipulation',
  }
}

function triggerStyle(cfg) {
  return {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: 'none',
    background: cfg.gradient,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
    boxShadow: `0 2px 6px ${cfg.shadow}`,
    fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1,
    touchAction: 'manipulation',
  }
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
  touchAction: 'manipulation',
}
