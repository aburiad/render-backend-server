import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import 'mathlive'
import 'mathlive/static.css'
import { MathText } from '@/utils/mathRender'
import ArabicKeyboard from './ArabicKeyboard'

// If the cursor sits inside an existing $...$ block on the same line, return
// its bounds + LaTeX so we can pre-fill the editor and replace on save.
function detectMathAtCursor(value, selStart) {
  if (!value) return null
  let openIdx = -1
  for (let i = selStart - 1; i >= 0; i--) {
    if (value[i] === '\n') break
    if (value[i] === '$') { openIdx = i; break }
  }
  if (openIdx < 0) return null
  let closeIdx = -1
  for (let i = openIdx + 1; i < value.length; i++) {
    if (value[i] === '\n') break
    if (value[i] === '$') { closeIdx = i; break }
  }
  if (closeIdx < 0 || selStart > closeIdx) return null
  let dollarsBefore = 0
  for (let i = 0; i < openIdx; i++) {
    if (value[i] === '$') dollarsBefore++
  }
  if (dollarsBefore % 2 !== 0) return null
  return {
    latex: value.slice(openIdx + 1, closeIdx),
    start: openIdx,
    end: closeIdx + 1,
  }
}

export default function MathLiveEditor({ inputRef, onInsert }) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')
  const [isReplacing, setIsReplacing] = useState(false)
  // When the user enters the modal via the keyboard icon (vs the fx icon),
  // we explicitly toggle MathLive's virtual keyboard ON instead of waiting
  // for focus. Some Chromium builds suppress the focus-triggered keyboard
  // until the user actually taps inside the field — the explicit call
  // avoids that delay.
  const [forceKeyboard, setForceKeyboard] = useState(false)
  const mathRef = useRef(null)
  const cursorState = useRef({ start: 0, end: 0, replaceRange: null })

  // Capture the textarea cursor + any existing math at cursor when modal opens
  useEffect(() => {
    if (!open) return
    const el = inputRef?.current
    if (!el) {
      cursorState.current = { start: 0, end: 0, replaceRange: null }
      setIsReplacing(false)
      setLatex('')
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const existing = detectMathAtCursor(el.value, start)
    cursorState.current = { start, end, replaceRange: existing }
    setIsReplacing(!!existing)
    setLatex(existing ? existing.latex : '')
  }, [open, inputRef])

  // When closing the modal, dismiss MathLive's docked virtual keyboard
  // and reset the forceKeyboard flag so the next "fx" click doesn't
  // accidentally re-pop the keyboard.
  useEffect(() => {
    if (open) return
    setForceKeyboard(false)
    if (typeof window !== 'undefined' && window.mathVirtualKeyboard) {
      try { window.mathVirtualKeyboard.hide() } catch { /* noop */ }
    }
  }, [open])

  // Push state -> math-field, then focus
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      const mf = mathRef.current
      if (!mf) return
      if (mf.value !== latex) mf.value = latex
      try { mf.focus() } catch { /* noop */ }
      // If the modal was opened via the keyboard icon, explicitly show
      // MathLive's docked virtual keyboard. (window.mathVirtualKeyboard
      // is registered by `import 'mathlive'` above.)
      if (forceKeyboard && typeof window !== 'undefined' && window.mathVirtualKeyboard) {
        try { window.mathVirtualKeyboard.show() } catch { /* noop */ }
      }
    })
    return () => cancelAnimationFrame(id)
  }, [open, latex, forceKeyboard])

  // math-field input -> state
  useEffect(() => {
    if (!open) return
    const mf = mathRef.current
    if (!mf) return
    const handler = () => setLatex(mf.value || '')
    mf.addEventListener('input', handler)
    return () => mf.removeEventListener('input', handler)
  }, [open])

  // Esc closes
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleInsert = () => {
    const trimmed = (latex || '').trim()
    if (!trimmed) {
      setOpen(false)
      return
    }
    const wrapped = '$' + trimmed + '$'
    const el = inputRef?.current
    if (el) {
      const { replaceRange, start, end } = cursorState.current
      let before, after
      if (replaceRange) {
        before = el.value.slice(0, replaceRange.start)
        after = el.value.slice(replaceRange.end)
      } else {
        before = el.value.slice(0, start)
        after = el.value.slice(end)
      }
      const newValue = before + wrapped + after
      const newCursor = before.length + wrapped.length
      onInsert(newValue)
      requestAnimationFrame(() => {
        try {
          el.focus()
          el.setSelectionRange(newCursor, newCursor)
        } catch { /* noop */ }
      })
    } else {
      onInsert(wrapped)
    }
    setOpen(false)
  }

  const previewWrapped = latex ? '$' + latex + '$' : ''

  const modal = open && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => setOpen(false)}
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
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px 14px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                গণিত লিখুন
              </h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                ভিজ্যুয়াল কীবোর্ড দিয়ে ভগ্নাংশ, মূল, সূচক ইত্যাদি লিখুন
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

          {/* Math field. virtual-keyboard-mode is set per entry mode:
              - fx button (forceKeyboard=false): "off" → no virtual
                keyboard at all; user just types LaTeX directly with the
                real keyboard. The visual math-field still renders the
                live equation as the user types.
              - Keyboard button (forceKeyboard=true): "manual" + the
                useEffect above calls mathVirtualKeyboard.show(), so the
                docked tap-based math palette appears.
              This is what actually makes the two entry buttons behave
              differently — without it both flows ended up showing the
              same keyboard because the field auto-popped it on focus. */}
          <div style={{ padding: '18px 24px 6px' }}>
            <math-field
              ref={mathRef}
              virtual-keyboard-mode={forceKeyboard ? 'manual' : 'off'}
              smart-mode="on"
              smart-fence="on"
              inline-shortcut-syntax="latex"
              style={{
                display: 'block', width: '100%', minHeight: '4.5rem',
                padding: '14px 16px', fontSize: 22,
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: 14,
              }}
            />
          </div>

          {/* Live preview (KaTeX — same render as final paper/PDF) */}
          <div style={{ padding: '6px 24px 4px' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              margin: '0 0 6px',
            }}>
              প্রিভিউ (PDF-এ এভাবেই আসবে)
            </p>
            <div style={{
              minHeight: 44, padding: '10px 14px', borderRadius: 12,
              background: '#fff', border: '1px dashed #cbd5e1',
              fontSize: 16, lineHeight: 1.7, color: '#0f172a',
            }}>
              {latex
                ? <MathText text={previewWrapped} />
                : <span style={{ color: '#cbd5e1', fontSize: 13 }}>...</span>}
            </div>
          </div>

          {/* LaTeX source (advanced view) */}
          <details style={{ padding: '6px 24px 12px' }}>
            <summary style={{
              fontSize: 11, color: '#64748b', cursor: 'pointer',
              fontWeight: 600, userSelect: 'none',
            }}>
              LaTeX সোর্স দেখুন / এডিট করুন
            </summary>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              rows={2}
              style={{
                width: '100%', marginTop: 8, padding: '10px 12px',
                fontSize: 12, fontFamily: 'monospace',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 10, resize: 'vertical', outline: 'none',
                color: '#0f172a',
              }}
            />
          </details>

          {/* Actions */}
          <div style={{
            padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-press"
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
              className="btn-press"
              disabled={!latex.trim()}
              style={{
                padding: '10px 22px', borderRadius: 12,
                background: latex.trim() ? '#2563eb' : '#94a3b8',
                color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 800,
                cursor: latex.trim() ? 'pointer' : 'not-allowed',
                boxShadow: latex.trim() ? '0 8px 18px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              {isReplacing ? 'আপডেট করুন' : 'যোগ করুন'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )

  const openModal = (withKeyboard) => {
    setForceKeyboard(!!withKeyboard)
    setOpen(true)
  }

  return (
    <>
      <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => openModal(false)}
          title="গণিত লিখুন (LaTeX এডিটর)"
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

        {/* MathLive virtual keyboard — direct access for users who prefer
            a tap-based math palette over typing LaTeX. Opens the same
            modal but immediately shows the docked keyboard.
            Distinct visual: filled blue background with a math-symbol
            grid icon, so it's clearly different from the outlined "fx"
            text button on the left. */}
        <button
          type="button"
          onClick={() => openModal(true)}
          title="গণিত কীবোর্ড খুলুন"
          className="btn-press"
          style={{
            width: 30, height: 30, borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.15s',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.45)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.35)' }}
        >
          {/* 2×2 math-symbol grid icon — π, x², √, Σ — reads as
              "math palette / keyboard" much more obviously than a
              generic computer-keyboard icon. */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <text x="3" y="11" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="700" fill="currentColor">π</text>
            <text x="13" y="11" fontFamily="serif" fontStyle="italic" fontSize="9" fontWeight="700" fill="currentColor">x²</text>
            <text x="3" y="21" fontFamily="serif" fontSize="9" fontWeight="700" fill="currentColor">√</text>
            <text x="13" y="21" fontFamily="serif" fontSize="9" fontWeight="700" fill="currentColor">Σ</text>
          </svg>
        </button>

        <ArabicKeyboard inputRef={inputRef} onInsert={onInsert} />
        <ArabicKeyboard inputRef={inputRef} onInsert={onInsert} layout="fa" />
      </div>
      {modal}
    </>
  )
}
