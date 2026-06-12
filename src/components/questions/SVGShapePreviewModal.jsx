import { useRef, useState } from 'react'
import { getSVGComponent } from '@/utils/svgShapeComponents'

export default function SVGShapePreviewModal({ open, onClose, onSave, shapeId }) {
  const svgRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)

  const shapeData = getSVGComponent(shapeId)
  const { Component, props: defaultProps } = shapeData || {}

  const handleSave = async () => {
    if (!svgRef.current) return
    setIsSaving(true)
    try {
      const svgElement = svgRef.current.querySelector('svg')
      if (!svgElement) { setIsSaving(false); return }

      const computedStyle = window.getComputedStyle(svgElement)
      const width  = parseInt(computedStyle.width)  || 600
      const height = parseInt(computedStyle.height) || 500

      const clone = svgElement.cloneNode(true)
      clone.setAttribute('width',  width.toString())
      clone.setAttribute('height', height.toString())

      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(clone)
      const svgWithNS = svgString.includes('xmlns')
        ? svgString
        : svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')

      const url = URL.createObjectURL(new Blob([svgWithNS], { type: 'image/svg+xml;charset=utf-8' }))
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = 2
        canvas.width  = width  * scale
        canvas.height = height * scale
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        onSave(canvas.toDataURL('image/png'))
        setIsSaving(false)
        onClose()
      }
      img.onerror = () => setIsSaving(false)
      img.src = url
    } catch {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(8, 12, 28, 0.62)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh', overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-light)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 12px' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>
            🎨
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              জ্যামিতি সম্পাদনা
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>
              প্যারামিটার পরিবর্তন করে নিজের মতো সাজিয়ে নিন
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-press"
            style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'var(--bg-input)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ height: 1, background: 'var(--border-light)', flexShrink: 0 }} />

        {/* SVG Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }} className="no-scrollbar">
          {!shapeData || !Component ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Shape পাওয়া যায়নি
            </div>
          ) : (
            <div
              ref={svgRef}
              className="svg-shape-editor"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 14,
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                padding: 8,
              }}
            >
              <Component {...defaultProps} editable={true} />
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border-light)', flexShrink: 0 }} />

        {/* Footer actions */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 8, padding: '12px 16px',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-press"
            style={{
              padding: '9px 18px',
              borderRadius: 10, border: '1px solid var(--border-light)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            }}
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !shapeData}
            className="btn-press"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 22px',
              borderRadius: 10, border: 'none',
              background: 'var(--accent)',
              color: '#fff', cursor: isSaving ? 'wait' : 'pointer',
              fontSize: 13, fontWeight: 700,
              opacity: (!shapeData) ? 0.5 : 1,
              boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
            }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                }} />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                সংরক্ষণ করুন
              </>
            )}
          </button>
        </div>

        <div style={{ height: 'env(safe-area-inset-bottom, 8px)', flexShrink: 0 }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
/* Control panel compact sizing */
.svg-shape-editor .mt-4 { margin-top: 8px; }
.svg-shape-editor .mt-3 { margin-top: 6px; }
.svg-shape-editor .px-4 { padding-left: 8px; padding-right: 8px; }
.svg-shape-editor .space-y-3 > * + * { margin-top: 8px; }
.svg-shape-editor .space-y-2 > * + * { margin-top: 4px; }
.svg-shape-editor .space-y-4 > * + * { margin-top: 8px; }
.svg-shape-editor label { font-size: 11px !important; margin-bottom: 2px !important; }
.svg-shape-editor .text-sm { font-size: 11px !important; }
.svg-shape-editor .text-xs { font-size: 10px !important; }
.svg-shape-editor button { padding: 4px 8px !important; font-size: 10px !important; border-radius: 6px !important; }
.svg-shape-editor .grid-cols-3 { grid-template-columns: repeat(3, 1fr); gap: 4px; }
.svg-shape-editor .p-3 { padding: 6px !important; }
.svg-shape-editor .p-4 { padding: 8px !important; }
.svg-shape-editor input[type="range"] { height: 6px; }
.svg-shape-editor .mt-1 { margin-top: 2px; }
.svg-shape-editor .mt-2 { margin-top: 4px; }
.svg-shape-editor .mb-2 { margin-bottom: 2px !important; }
/* SVG text labels - smaller font, better spacing */
.svg-shape-editor svg text[font-size="18"] { font-size: 12px; }
.svg-shape-editor svg text[font-size="16"] { font-size: 11px; }
.svg-shape-editor svg text[font-size="14"] { font-size: 10px; }
.svg-shape-editor svg text[font-size="13"] { font-size: 10px; }
.svg-shape-editor svg text[font-size="12"] { font-size: 10px; }
.svg-shape-editor svg text[font-size="11"] { font-size: 9px; }
.svg-shape-editor svg text[font-size="10"] { font-size: 9px; }
`}</style>
    </div>
  )
}
