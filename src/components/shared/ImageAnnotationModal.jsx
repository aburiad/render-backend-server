/**
 * ImageAnnotationModal — Draw/write on top of uploaded images
 *
 * Uses Fabric.js v5 (CDN) for canvas manipulation.
 * Features: Freehand drawing, text overlay, image overlay, undo/redo, export PNG.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

// Load Fabric.js from CDN
const FABRIC_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'

function loadFabric() {
  return new Promise((resolve, reject) => {
    if (window.fabric) { resolve(window.fabric); return }
    const existing = document.querySelector(`script[src="${FABRIC_CDN}"]`)
    if (existing) {
      // Wait a bit if script exists but hasn't loaded yet
      const check = setInterval(() => {
        if (window.fabric) { clearInterval(check); resolve(window.fabric) }
      }, 100)
      setTimeout(() => { clearInterval(check); reject(new Error('Fabric.js load timeout')) }, 10000)
      return
    }
    const s = document.createElement('script')
    s.src = FABRIC_CDN
    s.async = true
    s.onload = () => {
      console.log('[annotation] Fabric.js loaded from CDN')
      resolve(window.fabric)
    }
    s.onerror = () => reject(new Error('Fabric.js CDN load failed'))
    document.head.appendChild(s)
  })
}

const COLORS = [
  { label: 'কালো', value: '#000000' },
  { label: 'লাল', value: '#ef4444' },
  { label: 'নীল', value: '#3b82f6' },
  { label: 'সবুজ', value: '#22c55e' },
  { label: 'কমলা', value: '#f97316' },
  { label: 'বেগুনি', value: '#8b5cf6' },
]

const BRUSH_SIZES = [2, 4, 6, 8]

export default function ImageAnnotationModal({ imageUrl, onSave, onClose }) {
  console.log('[annotation] Render — imageUrl:', imageUrl ? `${imageUrl.substring(0, 50)}...` : 'null')
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fabricModuleRef = useRef(null)
  const [tool, setTool] = useState('draw')
  const [color, setColor] = useState('#ef4444')
  const [brushSize, setBrushSize] = useState(4)
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const imageInputRef = useRef(null)

  // Save history state
  const saveHistory = useCallback(() => {
    const f = fabricRef.current
    if (!f) return
    const json = f.toJSON()
    setHistory(prev => {
      const newHist = prev.slice(0, historyIdx + 1)
      newHist.push(json)
      if (newHist.length > 30) newHist.shift()
      return newHist
    })
    setHistoryIdx(prev => Math.min(prev + 1, 29))
  }, [historyIdx])

  // Initialize Fabric canvas
  useEffect(() => {
    if (!imageUrl) return
    let disposed = false
    setLoading(true)
    setError(null)

    console.log('[annotation] === Starting initialization ===')
    console.log('[annotation] canvasRef.current:', !!canvasRef.current)
    console.log('[annotation] imageUrl type:', imageUrl.startsWith('data:') ? 'data URL' : 'external URL')
    console.log('[annotation] window.fabric exists:', !!window.fabric)

    loadFabric()
      .then((fabric) => {
        if (disposed) return
        console.log('[annotation] ✅ Fabric loaded successfully, version:', fabric.version || 'unknown')
        console.log('[annotation] fabric.Canvas:', !!fabric.Canvas)
        console.log('[annotation] fabric.Image:', !!fabric.Image)
        fabricModuleRef.current = fabric

        const img = new Image()
        // data URLs don't need crossOrigin
        if (!imageUrl.startsWith('data:')) {
          img.crossOrigin = 'anonymous'
        }

        console.log('[annotation] Loading image...')
        img.onload = () => {
          if (disposed) return
          console.log('[annotation] ✅ Image loaded:', img.width, 'x', img.height)
          console.log('[annotation] canvasRef.current before new Canvas:', !!canvasRef.current)

          const maxW = Math.min(img.width, 800)
          const maxH = Math.min(img.height, 800)
          const scale = Math.min(maxW / img.width, maxH / img.height, 1)
          const w = Math.round(img.width * scale)
          const h = Math.round(img.height * scale)

          console.log('[annotation] Canvas size:', w, 'x', h, '(scale:', scale, ')')

          console.log('[annotation] Creating fabric.Canvas...')
          const f = new fabric.Canvas(canvasRef.current, {
            width: w,
            height: h,
            backgroundColor: '#ffffff',
            isDrawingMode: true,
            selection: true,
          })

          console.log('[annotation] ✅ fabric.Canvas created, setting background...')
          fabricRef.current = f

          // Set background image
          const fImg = new fabric.Image(img, {
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
          })
          f.setBackgroundImage(fImg, () => {
            f.renderAll()
            const json = f.toJSON()
            setHistory([json])
            setHistoryIdx(0)
            setLoading(false)
            console.log('[annotation] ✅ Canvas fully ready! Image shown.')
            console.log('[annotation] Canvas width:', f.width, 'height:', f.height)
            console.log('[annotation] Background set:', !!f.backgroundImage)
          })

          // Default brush
          f.freeDrawingBrush.color = color
          f.freeDrawingBrush.width = brushSize

          f.on('path:created', () => { setTimeout(() => saveHistory(), 50) })
          f.on('object:modified', () => { setTimeout(() => saveHistory(), 50) })
        }

        img.onerror = (e) => {
          console.error('[annotation] ❌ Image load failed!', e)
          setError('ছবি লোড করা যায়নি')
          setLoading(false)
        }

        img.src = imageUrl
        console.log('[annotation] Image src set, waiting for load...')
      })
      .catch((err) => {
        console.error('[annotation] ❌ Fabric load error:', err)
        setError('Annotation tool লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।')
        setLoading(false)
      })

    return () => {
      disposed = true
      if (fabricRef.current) {
        try { fabricRef.current.dispose() } catch (e) { console.warn(e) }
        fabricRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  // Update brush when color/size changes
  useEffect(() => {
    const f = fabricRef.current
    if (!f) return
    f.freeDrawingBrush.color = color
    f.freeDrawingBrush.width = brushSize
  }, [color, brushSize])

  // Tool switching
  useEffect(() => {
    const f = fabricRef.current
    if (!f) return
    if (tool === 'draw') {
      f.isDrawingMode = true
      f.selection = false
      f.defaultCursor = 'crosshair'
    } else if (tool === 'text') {
      f.isDrawingMode = false
      f.selection = false
      f.defaultCursor = 'text'
    } else if (tool === 'select') {
      f.isDrawingMode = false
      f.selection = true
      f.defaultCursor = 'move'
    }
  }, [tool])

  // Handle canvas click for text placement
  useEffect(() => {
    const f = fabricRef.current
    const fabricMod = fabricModuleRef.current
    if (!f || !fabricMod || tool !== 'text') return

    const handleMouseDown = (opt) => {
      if (opt.target) return
      const pointer = f.getPointer(opt.e)
      const text = new fabricMod.IText('লিখুন', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 18,
        fill: color,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        editable: true,
        borderColor: '#3b82f6',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false,
      })
      f.add(text)
      f.setActiveObject(text)
      text.enterEditing()
      text.selectAll()
      f.renderAll()
      saveHistory()
      setTool('select')
    }

    f.on('mouse:down', handleMouseDown)
    return () => f.off('mouse:down', handleMouseDown)
  }, [tool, color, saveHistory])

  const handleUndo = () => {
    if (historyIdx <= 0) return
    const newIdx = historyIdx - 1
    fabricRef.current?.loadFromJSON(history[newIdx], () => {
      fabricRef.current?.renderAll()
      setHistoryIdx(newIdx)
    })
  }

  const handleRedo = () => {
    if (historyIdx >= history.length - 1) return
    const newIdx = historyIdx + 1
    fabricRef.current?.loadFromJSON(history[newIdx], () => {
      fabricRef.current?.renderAll()
      setHistoryIdx(newIdx)
    })
  }

  const handleDelete = () => {
    const f = fabricRef.current
    if (!f) return
    const active = f.getActiveObject()
    if (active) {
      f.remove(active)
      f.renderAll()
      saveHistory()
    }
  }

  const handleSave = () => {
    const f = fabricRef.current
    if (!f) return
    setSaving(true)
    try {
      f.discardActiveObject()
      f.renderAll()
      const dataUrl = f.toDataURL({ format: 'png', quality: 1, multiplier: 1 })
      onSave(dataUrl)
      toast.success('অ্যানোটেশন সংরক্ষিত!')
    } catch (err) {
      console.error('[annotation] save error:', err)
      toast.error('সংরক্ষণ করা যায়নি')
    } finally {
      setSaving(false)
    }
  }

  // Handle image overlay upload
  const handleAddImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fabricMod = fabricModuleRef.current
    const f = fabricRef.current
    if (!fabricMod || !f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      fabricMod.Image.fromURL(ev.target.result, (imgObj) => {
        const maxDim = Math.min(f.width, f.height) * 0.4
        const imgScale = Math.min(maxDim / imgObj.width, maxDim / imgObj.height, 1)
        imgObj.scale(imgScale)
        imgObj.set({
          left: f.width / 2 - (imgObj.width * imgScale) / 2,
          top: f.height / 2 - (imgObj.height * imgScale) / 2,
          cornerColor: '#7c3aed',
          cornerSize: 8,
          transparentCorners: false,
        })
        f.add(imgObj)
        f.setActiveObject(imgObj)
        f.renderAll()
        saveHistory()
        setTool('select')
        toast.success('ছবি যোগ হয়েছে!', { duration: 1000 })
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (!imageUrl) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10002,
        background: 'rgba(10,14,30,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 16px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, background: '#fff',
          borderRadius: 20, boxShadow: '0 32px 80px -12px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '95dvh', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          color: '#fff', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✏️</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>ছবিতে লিখুন / আঁকুন</span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            cursor: 'pointer', fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Canvas area */}
        <div style={{
          flex: 1, overflow: 'auto', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#f1f5f9', padding: 8, minHeight: 200,
          position: 'relative',
        }}>
          {/* Loading state */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#f1f5f9', zIndex: 2, gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, border: '4px solid #e2e8f0',
                borderTopColor: '#7c3aed', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                লোড হচ্ছে...
              </span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#f1f5f9', zIndex: 2, gap: 12, padding: 20, textAlign: 'center',
            }}>
              <span style={{ fontSize: 32 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{error}</span>
              <button onClick={onClose} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>বন্ধ করুন</button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '8px 12px', borderTop: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
        }}>
          {/* Tool buttons */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setTool('draw')} style={{
              padding: '6px 10px', borderRadius: 8, border: 'none',
              background: tool === 'draw' ? '#7c3aed' : '#f1f5f9',
              color: tool === 'draw' ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><span>🖊️</span><span>আঁকুন</span></button>

            <button onClick={() => setTool('text')} style={{
              padding: '6px 10px', borderRadius: 8, border: 'none',
              background: tool === 'text' ? '#7c3aed' : '#f1f5f9',
              color: tool === 'text' ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><span>📝</span><span>টেক্সট</span></button>

            <button onClick={() => setTool('select')} style={{
              padding: '6px 10px', borderRadius: 8, border: 'none',
              background: tool === 'select' ? '#7c3aed' : '#f1f5f9',
              color: tool === 'select' ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><span>👆</span><span>সিলেক্ট</span></button>

            <button onClick={() => imageInputRef.current?.click()} style={{
              padding: '6px 10px', borderRadius: 8, border: 'none',
              background: '#f1f5f9', color: '#7c3aed',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><span>🖼️</span><span>ছবি যোগ</span></button>

            <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleAddImage} />

            <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />

            <button onClick={handleUndo} disabled={historyIdx <= 0} style={{
              padding: '6px 8px', borderRadius: 6, border: 'none',
              background: historyIdx > 0 ? '#f1f5f9' : '#f8fafc',
              color: historyIdx > 0 ? '#475569' : '#cbd5e1',
              fontWeight: 700, fontSize: 14, cursor: historyIdx > 0 ? 'pointer' : 'not-allowed',
            }} title="আনডু">↩️</button>

            <button onClick={handleRedo} disabled={historyIdx >= history.length - 1} style={{
              padding: '6px 8px', borderRadius: 6, border: 'none',
              background: historyIdx < history.length - 1 ? '#f1f5f9' : '#f8fafc',
              color: historyIdx < history.length - 1 ? '#475569' : '#cbd5e1',
              fontWeight: 700, fontSize: 14, cursor: historyIdx < history.length - 1 ? 'pointer' : 'not-allowed',
            }} title="রিডু">↪️</button>

            <button onClick={handleDelete} style={{
              padding: '6px 8px', borderRadius: 6, border: 'none',
              background: '#fef2f2', color: '#ef4444',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }} title="মুছুন">🗑️</button>
          </div>

          {/* Color + Brush size */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c.value} onClick={() => setColor(c.value)} title={c.label} style={{
                width: 26, height: 26, borderRadius: '50%',
                border: color === c.value ? '3px solid #1e293b' : '2px solid #e2e8f0',
                background: c.value, cursor: 'pointer', padding: 0,
                transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s',
              }} />
            ))}
            <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 2px' }} />
            {BRUSH_SIZES.map(s => (
              <button key={s} onClick={() => setBrushSize(s)} style={{
                width: 28, height: 28, borderRadius: 6, border: 'none',
                background: brushSize === s ? '#7c3aed' : '#f1f5f9',
                color: brushSize === s ? '#fff' : '#64748b',
                fontWeight: 700, fontSize: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  width: Math.max(4, s * 1.5), height: Math.max(4, s * 1.5),
                  borderRadius: '50%', background: brushSize === s ? '#fff' : '#64748b',
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 6, padding: '8px 12px',
          borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', borderRadius: 10,
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>বাতিল</button>
          <button onClick={handleSave} disabled={saving || loading} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: saving ? '#94a3b8' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            color: '#fff', fontWeight: 800, fontSize: 13,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 12px rgba(124,58,237,0.35)',
          }}>
            {saving ? '⟳ সেভ...' : '✅ সংরক্ষণ করুন'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body,
  )
}