import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { KEYBOARD_CONFIG } from './arabicKeyboardConfig'

function getKeyLabel(key) {
  if (key === '\u200c') return 'ZWNJ'
  return key
}

/**
 * Simplified Arabic/Persian keyboard — modal pattern (like MathLiveEditor).
 * - Click trigger → modal opens with its own textarea
 * - Arabic keys type into the modal's textarea
 * - "Insert" button puts the text into the original input
 * - No input locking, no native keyboard fights
 */
export default function ArabicKeyboardPair({ inputRef, onInsert, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const [layout, setLayout] = useState('ar')
  const [activeTab, setActiveTab] = useState('letters')
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const config = KEYBOARD_CONFIG[layout] || KEYBOARD_CONFIG.ar

  const openModal = (nextLayout) => {
    // Pre-fill with current input value
    const el = inputRef?.current
    const current = el?.value || ''
    setText(current)
    setLayout(nextLayout)
    setActiveTab('letters')
    setOpen(true)
    onOpenChange?.(true)
  }

  const closeModal = () => {
    setOpen(false)
    onOpenChange?.(false)
  }

  const handleInsert = () => {
    const trimmed = (text || '').trim()
    if (trimmed) {
      onInsert(trimmed)
    }
    closeModal()
  }

  // Focus textarea when modal opens
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  // Esc closes
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const insertText = (char) => {
    const ta = textareaRef.current
    if (!ta) {
      setText((prev) => prev + char)
      return
    }
    const start = ta.selectionStart ?? ta.value.length
    const end = ta.selectionEnd ?? start
    const next = text.slice(0, start) + char + text.slice(end)
    setText(next)
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      try {
        ta.focus()
        const pos = start + char.length
        ta.setSelectionRange(pos, pos)
      } catch { /* noop */ }
    })
  }

  const backspace = () => {
    const ta = textareaRef.current
    if (!ta) {
      setText((prev) => prev.slice(0, -1))
      return
    }
    const start = ta.selectionStart ?? ta.value.length
    const end = ta.selectionEnd ?? start
    if (start === 0 && end === 0) return
    const removeStart = start === end ? Math.max(0, start - 1) : start
    const next = text.slice(0, removeStart) + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      try {
        ta.focus()
        ta.setSelectionRange(removeStart, removeStart)
      } catch { /* noop */ }
    })
  }

  const rows = config.rows[activeTab] || config.rows.letters

  const modal = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={closeModal}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560, background: '#fff',
            borderRadius: 24, boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            touchAction: 'manipulation',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '18px 22px 12px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {layout === 'fa' ? 'ফার্সি কীবোর্ড' : 'আরবি কীবোর্ড'}
              </h3>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0' }}>
                টাইপ করুন, তারপর "যোগ করুন" চাপুন
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
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

          {/* Textarea */}
          <div style={{ padding: '14px 22px 8px' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="rtl"
              rows={3}
              placeholder="এখানে টাইপ করুন..."
              style={{
                width: '100%', padding: '12px 14px', fontSize: 16,
                fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
                lineHeight: 1.8, background: '#f8fafc',
                border: '1.5px solid #e2e8f0', borderRadius: 14,
                resize: 'vertical', outline: 'none', color: '#0f172a',
                textAlign: 'right',
              }}
            />
          </div>

          {/* Tabs */}
          <div style={{
            padding: '6px 22px 0', display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {config.tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  height: 32, padding: '0 12px', borderRadius: 10,
                  border: activeTab === id ? `1px solid ${config.activeBorder}` : '1px solid #e2e8f0',
                  background: activeTab === id ? config.activeBg : '#ffffff',
                  color: activeTab === id ? config.activeText : '#64748b',
                  fontSize: 12, fontWeight: 800,
                  fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
                  cursor: 'pointer', touchAction: 'manipulation',
                }}
              >
                {label}
              </button>
            ))}
            {/* Switch layout button */}
            <button
              type="button"
              onClick={() => {
                const next = layout === 'ar' ? 'fa' : 'ar'
                setLayout(next)
                setActiveTab('letters')
              }}
              style={{
                height: 32, padding: '0 10px', borderRadius: 10,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                color: '#64748b', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', touchAction: 'manipulation',
              }}
            >
              {layout === 'ar' ? 'فارسی' : 'العربية'}
            </button>
          </div>

          {/* Keyboard keys */}
          <div dir="rtl" style={{ padding: '10px 14px 8px' }}>
            {rows.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  gap: 6, marginBottom: 6,
                }}
              >
                {row.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => insertText(key)}
                    style={{
                      height: 40, borderRadius: 10,
                      border: '1px solid #dbeafe', background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: key.length > 1 ? 18 : 21,
                      fontWeight: 700,
                      fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
                      cursor: 'pointer', lineHeight: 1,
                      touchAction: 'manipulation',
                    }}
                  >
                    {getKeyLabel(key)}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Action row */}
          <div style={{
            padding: '0 14px 8px',
            display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 7,
          }}>
            <button type="button" onClick={backspace} style={actionStyle} title="Backspace">⌫</button>
            <button type="button" onClick={() => insertText(' ')} style={{ ...actionStyle, fontSize: 13, fontWeight: 800 }}>Space</button>
            <button type="button" onClick={() => insertText('\n')} style={actionStyle} title="New line">↵</button>
          </div>

          {/* Insert button */}
          <div style={{
            padding: '10px 22px 18px', borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: '10px 18px', borderRadius: 12,
                background: '#f1f5f9', color: '#475569',
                border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleInsert}
              style={{
                padding: '10px 22px', borderRadius: 12,
                background: text.trim() ? (layout === 'ar' ? '#2563eb' : '#7c3aed') : '#94a3b8',
                color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 800,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                boxShadow: text.trim() ? `0 8px 18px ${layout === 'ar' ? 'rgba(37,99,235,0.3)' : 'rgba(124,58,237,0.3)'}` : 'none',
              }}
            >
              যোগ করুন
            </button>
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
            onClick={() => openModal(lay)}
            title={cfg.title}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', background: cfg.gradient, color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
              boxShadow: `0 2px 6px ${cfg.shadow}`,
              fontFamily: '"Noto Naskh Arabic", "Amiri", serif',
              fontSize: 18, fontWeight: 800, lineHeight: 1,
              touchAction: 'manipulation',
            }}
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

const actionStyle = {
  height: 36,
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#334155',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 700,
  touchAction: 'manipulation',
}