import { useState } from 'react'
import GeoGebraModal from './GeoGebraModal'
import SVGShapePreviewModal from './SVGShapePreviewModal'
import { getChaptersWithGeometry } from '@/utils/chapterGeometryData'
import { hasSVGComponent } from '@/utils/svgShapeComponents'

const CLASSES = [
  { id: 'class-6', label: 'শ্রেণি ৬' },
  { id: 'class-7', label: 'শ্রেণি ৭' },
  { id: 'class-8', label: 'শ্রেণি ৮' },
  { id: 'class-9', label: 'শ্রেণি ৯-১০' }, // same book
]

export default function BookGeometryModal({ open, onClose, onSave }) {
  const [selectedClass, setSelectedClass] = useState('class-6')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [geoGebraOpen, setGeoGebraOpen] = useState(false)
  const [svgPreviewOpen, setSvgPreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedFigure, setSelectedFigure] = useState(null)
  // All shapes now use custom SVG — mode toggle removed

  const chapters = getChaptersWithGeometry(selectedClass)
  const chapterEntries = Object.entries(chapters)
  const totalFigures = Object.values(chapters).reduce((s, ch) => s + ch.figures.length, 0)

  const handleFigureClick = (figure) => {
    setSelectedFigure(figure)
    if (hasSVGComponent(figure.template)) {
      setSvgPreviewOpen(true)
    } else {
      // Fallback to GeoGebra for any shape not yet in SVG registry
      setSelectedTemplate(figure.template)
      setGeoGebraOpen(true)
    }
  }

  const handleSVGSave = (dataUrl) => {
    onSave(dataUrl)
    setSvgPreviewOpen(false)
    setSelectedFigure(null)
    onClose()
  }

  const handleGeoGebraSave = (dataUrl) => {
    onSave(dataUrl)
    setGeoGebraOpen(false)
    setSelectedTemplate(null)
    onClose()
  }

  const handleClose = () => {
    setSelectedChapter(null)
    setSelectedTemplate(null)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(8, 12, 28, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        {/* Sheet */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 540,
            background: 'var(--bg-card)',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '88vh', overflow: 'hidden',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-light)' }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 16px 10px',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#ecfdf5', border: '1px solid #a7f3d030',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, flexShrink: 0,
            }}>📚</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                বই অনুযায়ী জ্যামিতি
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 }}>
                {chapterEntries.length} অধ্যায় · {totalFigures} চিত্র
              </div>
            </div>
            <button
              onClick={handleClose}
              className="btn-press"
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'var(--bg-input)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Class tabs */}
          <div
            style={{
              display: 'flex', gap: 6,
              padding: '0 16px 10px',
              overflowX: 'auto', flexShrink: 0,
            }}
            className="no-scrollbar"
          >
            {CLASSES.map((cls) => {
              const active = selectedClass === cls.id
              return (
                <button
                  key={cls.id}
                  className="btn-press"
                  onClick={() => { setSelectedClass(cls.id); setSelectedChapter(null) }}
                  style={{
                    padding: '6px 13px', borderRadius: 20,
                    border: active ? 'none' : '1px solid var(--border-light)',
                    background: active ? '#10b981' : 'transparent',
                    color: active ? '#fff' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  {cls.label}
                </button>
              )
            })}
          </div>

          {/* SVG badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 16px',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
            flexShrink: 0,
            background: 'var(--bg-muted)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed' }}>🎨 Interactive SVG</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>— রিয়েল-টাইম প্রিভিউ ও পরিবর্তন করুন</span>
          </div>

          {/* Chapter list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }} className="no-scrollbar">
            {chapterEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                এই শ্রেণির জন্য কোনো জ্যামিতিক চিত্র নেই
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chapterEntries.map(([chId, chapter]) => {
                  const open = selectedChapter === chId
                  return (
                    <div key={chId} style={{
                      borderRadius: 14,
                      border: `1.5px solid ${open ? '#10b981' : 'var(--border-light)'}`,
                      background: open ? '#f0fdf4' : 'var(--bg-card)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s',
                    }}>
                      {/* Chapter row */}
                      <button
                        type="button"
                        onClick={() => setSelectedChapter(open ? null : chId)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 14px', background: 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          background: open ? '#10b981' : 'var(--bg-input)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                          transition: 'background 0.15s',
                        }}>
                          📐
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {chapter.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                            {chapter.figures.length}টি চিত্র
                          </div>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={open ? '#10b981' : 'var(--text-muted)'} strokeWidth={2.5}
                          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Figures */}
                      {open && (
                        <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {chapter.figures.map((figure) => (
                            <button
                              key={figure.id}
                              type="button"
                              onClick={() => handleFigureClick(figure)}
                              className="btn-press"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 12px',
                                borderRadius: 10,
                                border: '1px solid #d1fae5',
                                background: '#fff',
                                cursor: 'pointer', textAlign: 'left',
                              }}
                            >
                              <div style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: '#ecfdf5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                              }}>
                                △
                              </div>
                              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {figure.name}
                              </span>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom safe area */}
          <div style={{ height: 'env(safe-area-inset-bottom, 8px)', flexShrink: 0 }} />
        </div>
      </div>

      <GeoGebraModal
        open={geoGebraOpen}
        onClose={() => { setGeoGebraOpen(false); setSelectedTemplate(null) }}
        onSave={handleGeoGebraSave}
        initialShape={selectedTemplate}
      />

      <SVGShapePreviewModal
        open={svgPreviewOpen}
        onClose={() => { setSvgPreviewOpen(false); setSelectedFigure(null) }}
        onSave={handleSVGSave}
        shapeId={selectedFigure?.template}
      />
    </>
  )
}
