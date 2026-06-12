/**
 * GeometryQuickSheet — Custom SVG shape picker (no class filtering)
 * All shapes open via SVGShapePreviewModal (onOpenSVG prop).
 * GeoGebra free-draw is kept as a secondary option.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  {
    id: 'angles', label: 'কোণ', icon: '∠', color: '#3b82f6',
    shapes: [
      { id: 'right-angle',              label: 'সমকোণ (90°)' },
      { id: 'acute-angle',              label: 'সূক্ষ্মকোণ' },
      { id: 'obtuse-angle',             label: 'স্থূলকোণ' },
      { id: 'straight-angle',           label: 'সরলকোণ (180°)' },
      { id: 'reflex-angle',             label: 'প্রবৃদ্ধ কোণ' },
      { id: 'complete-angle',           label: 'পূর্ণকোণ (360°)' },
      { id: 'adjacent-complementary',   label: 'পূরক কোণ' },
      { id: 'adjacent-supplementary',   label: 'সম্পূরক কোণ' },
      { id: 'vertically-opposite',      label: 'বিপ্রতীপ কোণ' },
      { id: 'angle-bisector-construct', label: 'কোণ দ্বিখণ্ডক' },
    ],
  },
  {
    id: 'lines', label: 'রেখা', icon: '→', color: '#8b5cf6',
    shapes: [
      { id: 'line-segment',        label: 'রেখাংশ' },
      { id: 'ray',                 label: 'রশ্মি' },
      { id: 'straight-line',       label: 'সরল রেখা' },
      { id: 'perpendicular-lines', label: 'লম্ব রেখা' },
      { id: 'parallel-lines-basic',label: 'সমান্তরাল রেখা' },
    ],
  },
  {
    id: 'triangles', label: 'ত্রিভুজ', icon: '△', color: '#10b981',
    shapes: [
      { id: 'right-triangle',   label: 'সমকোণী' },
      { id: 'equilateral',      label: 'সমবাহু' },
      { id: 'isosceles',        label: 'সমদ্বিবাহু' },
      { id: 'scalene',          label: 'বিষমবাহু' },
      { id: 'acute-triangle',   label: 'সূক্ষ্মকোণী' },
      { id: 'obtuse-triangle',  label: 'স্থূলকোণী' },
    ],
  },
  {
    id: 'quads', label: 'চতুর্ভুজ', icon: '□', color: '#f59e0b',
    shapes: [
      { id: 'rectangle',    label: 'আয়তক্ষেত্র' },
      { id: 'square',       label: 'বর্গক্ষেত্র' },
      { id: 'parallelogram',label: 'সমান্তরিক' },
      { id: 'rhombus',      label: 'রম্বস' },
      { id: 'trapezium',    label: 'ট্রাপিজিয়াম' },
      { id: 'kite',         label: 'ঘুড়ি (Kite)' },
    ],
  },
  {
    id: 'circles', label: 'বৃত্ত', icon: '○', color: '#ef4444',
    shapes: [
      { id: 'circle',       label: 'বৃত্ত' },
      { id: 'circle-parts', label: 'বৃত্তের অংশ' },
    ],
  },
  {
    id: 'misc', label: 'অন্যান্য', icon: '+', color: '#6366f1',
    shapes: [
      { id: 'number-line',           label: 'সংখ্যা রেখা' },
      { id: 'coordinate-graph-basic',label: 'স্থানাঙ্ক অক্ষ' },
      { id: 'cube',                  label: 'ঘনক' },
      { id: 'cuboid',                label: 'আবদ্ধ ঘনবস্তু' },
      { id: 'cylinder',              label: 'বেলন' },
      { id: 'cone',                  label: 'কোণক' },
      { id: 'net-cube',              label: 'ঘনকের নেট' },
      { id: 'net-cylinder',          label: 'বেলনের নেট' },
    ],
  },
]

export default function GeometryQuickSheet({ isOpen, onClose, onSave, onOpenGeoGebra, onOpenSVG }) {
  const [selected, setSelected] = useState(null)

  const handleClose = () => { setSelected(null); onClose() }

  if (!isOpen) return null

  const cat = selected ? CATEGORIES.find(c => c.id === selected) : null

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(8,12,28,0.62)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          key="sheet"
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 520,
            background: 'var(--bg-card)',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '86vh', overflow: 'hidden',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-light)' }} />
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 10px' }}>
            {cat ? (
              <button onClick={() => setSelected(null)} className="btn-press" style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--bg-input)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'var(--primary-light)', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>📐</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {cat ? cat.label : 'জ্যামিতি চিত্র'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>
                {cat ? `${cat.shapes.length} টি চিত্র` : 'ধরন বেছে নিন'}
              </div>
            </div>
            <button onClick={handleClose} className="btn-press" style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--bg-input)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--border-light)', flexShrink: 0 }} />

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }} className="no-scrollbar">

            {/* Category grid */}
            {!cat && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <motion.button
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, padding: '14px 8px',
                        borderRadius: 14, border: 'none',
                        background: c.color + '12',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: c.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 900,
                        boxShadow: `0 4px 10px ${c.color}40`,
                      }}>
                        {c.icon}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {c.label}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>
                        {c.shapes.length} চিত্র
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* GeoGebra free draw */}
                <motion.button
                  onClick={() => { onOpenGeoGebra(null); handleClose() }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', marginTop: 10,
                    padding: '11px 14px', borderRadius: 14,
                    border: '1.5px dashed var(--border-light)',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>🎨</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>নিজে আঁকুন</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>GeoGebra দিয়ে</div>
                  </div>
                </motion.button>
              </>
            )}

            {/* Shape list */}
            {cat && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cat.shapes.map(shape => (
                  <motion.button
                    key={shape.id}
                    onClick={() => { onOpenSVG?.(shape.id); handleClose() }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 12,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: cat.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 900, color: cat.color,
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {shape.label}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 'env(safe-area-inset-bottom, 8px)', flexShrink: 0 }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
