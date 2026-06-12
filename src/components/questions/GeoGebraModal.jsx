/**
 * GeoGebraModal — v2
 *
 * Three ways to draw:
 *  1. Quick Shapes  — one-click Bengali preset buttons (triangle, circle, etc.)
 *  2. AI Prompt     — type Bengali description → AI converts to GeoGebra commands
 *  3. Manual / GeoGebra toolbar — use the built-in GeoGebra drawing tools directly
 *
 * Save → exports canvas as PNG → plugs into existing image pipeline (no PDF changes).
 */

import api from '@/services/api'
import { SHAPE_CATEGORIES, SHAPE_COMMANDS } from '@/utils/geometryTemplates'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

// ─── GeoGebra CDN loader ─────────────────────────────────────────────────────
const GGB_SCRIPT_URL = 'https://www.geogebra.org/apps/deployggb.js'

function loadGgbScript() {
  return new Promise((resolve, reject) => {
    if (window.GGBApplet) { resolve(); return }
    const existing = document.querySelector(`script[src="${GGB_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error('GeoGebra script load failed')))
      return
    }
    const s = document.createElement('script')
    s.src = GGB_SCRIPT_URL
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('GeoGebra script failed to load — check internet'))
    document.head.appendChild(s)
  })
}

/**
 * squarifyPng(dataUrl) → Promise<dataUrl>
 *
 * GeoGebra exports PNG at applet pixel dimensions (e.g. 860×460).
 * This makes circles look like ellipses. We fix it by:
 * 1. Finding the bounding box of actual content (non-white, non-transparent)
 * 2. Cropping to that box with padding
 * 3. Drawing onto a SQUARE canvas (letterboxed, white bg)
 */
// squarifyPng — future use for PNG normalization
// eslint-disable-next-line no-unused-vars
function squarifyPng(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const sw = img.naturalWidth
      const sh = img.naturalHeight

      // Source canvas
      const src = document.createElement('canvas')
      src.width = sw; src.height = sh
      const sctx = src.getContext('2d')
      sctx.fillStyle = '#ffffff'
      sctx.fillRect(0, 0, sw, sh)
      sctx.drawImage(img, 0, 0)

      // Find bounding box of non-white pixels
      let minX = sw, maxX = 0, minY = sh, maxY = 0
      let found = false
      try {
        const d = sctx.getImageData(0, 0, sw, sh).data
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4
            const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3]
            // Count pixel as "content" if it's visible AND not near-white
            const isWhite = r > 235 && g > 235 && b > 235
            const isTransparent = a < 30
            if (!isWhite && !isTransparent) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
              found = true
            }
          }
        }
      } catch (e) {
        console.warn('[squarify] pixel scan failed:', e.message)
      }

      if (!found || maxX <= minX || maxY <= minY) {
        // Fallback: use full image dimensions
        minX = 0; maxX = sw - 1; minY = 0; maxY = sh - 1
      }

      // Add 8% padding
      const padX = Math.max(Math.round((maxX - minX) * 0.08), 20)
      const padY = Math.max(Math.round((maxY - minY) * 0.08), 20)
      const cropX = Math.max(0, minX - padX)
      const cropY = Math.max(0, minY - padY)
      const cropW = Math.min(sw, maxX + padX + 1) - cropX
      const cropH = Math.min(sh, maxY + padY + 1) - cropY

      // Square side = max dimension so nothing is cut
      const side = Math.max(cropW, cropH)

      const out = document.createElement('canvas')
      out.width = side; out.height = side
      const octx = out.getContext('2d')
      octx.fillStyle = '#ffffff'
      octx.fillRect(0, 0, side, side)

      // Centre-draw the crop on the square
      const dx = Math.round((side - cropW) / 2)
      const dy = Math.round((side - cropH) / 2)
      octx.drawImage(src, cropX, cropY, cropW, cropH, dx, dy, cropW, cropH)

      console.log(`[squarify] ${sw}×${sh} → crop(${cropX},${cropY},${cropW}×${cropH}) → ${side}×${side}`)
      resolve(out.toDataURL('image/png'))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ─── Quick Shape Presets ─────────────────────────────────────────────────────
// Each preset has a label, icon, and a function that returns GeoGebra commands.
// Values (v1, v2 …) come from a simple input dialog so user picks sizes.

const SHAPE_PRESETS = [
  {
    group: 'ত্রিভুজ',
    shapes: [
      {
        id: 'right_triangle',
        label: 'সমকোণী ত্রিভুজ',
        icon: '📐',
        inputs: [
          { key: 'base', label: 'ভূমি', default: 3 },
          { key: 'height', label: 'উচ্চতা', default: 4 },
        ],
        build: ({ base, height }) =>
          `A=(0,0);B=(${base},0);C=(0,${height});t=Polygon[A,B,C];RightAngle(B,A,C)`,
      },
      {
        id: 'equilateral',
        label: 'সমবাহু ত্রিভুজ',
        icon: '🔺',
        inputs: [{ key: 'side', label: 'বাহু', default: 4 }],
        build: ({ side }) => {
          const h = (side * Math.sqrt(3) / 2).toFixed(3)
          const mid = (side / 2).toFixed(3)
          return `A=(0,0);B=(${side},0);C=(${mid},${h});t=Polygon[A,B,C]`
        },
      },
      {
        id: 'isosceles',
        label: 'সমদ্বিবাহু ত্রিভুজ',
        icon: '🔷',
        inputs: [
          { key: 'base', label: 'ভূমি', default: 4 },
          { key: 'side', label: 'সমান বাহু', default: 5 },
        ],
        build: ({ base, side }) => {
          const h = Math.sqrt(side * side - (base / 2) * (base / 2)).toFixed(3)
          const mid = (base / 2).toFixed(3)
          return `A=(0,0);B=(${base},0);C=(${mid},${h});t=Polygon[A,B,C]`
        },
      },
    ],
  },
  {
    group: 'চতুর্ভুজ',
    shapes: [
      {
        id: 'rectangle',
        label: 'আয়তক্ষেত্র',
        icon: '▭',
        inputs: [
          { key: 'length', label: 'দৈর্ঘ্য', default: 6 },
          { key: 'width', label: 'প্রস্থ', default: 4 },
        ],
        build: ({ length, width }) =>
          `A=(0,0);B=(${length},0);C=(${length},${width});D=(0,${width});r=Polygon[A,B,C,D];RightAngle(D,A,B)`,
      },
      {
        id: 'square',
        label: 'বর্গক্ষেত্র',
        icon: '⬜',
        inputs: [{ key: 'side', label: 'বাহু', default: 4 }],
        build: ({ side }) =>
          `A=(0,0);B=(${side},0);C=(${side},${side});D=(0,${side});s=Polygon[A,B,C,D];RightAngle(D,A,B)`,
      },
      {
        id: 'parallelogram',
        label: 'সমান্তরিক',
        icon: '▱',
        inputs: [
          { key: 'base', label: 'ভূমি', default: 5 },
          { key: 'height', label: 'উচ্চতা', default: 3 },
          { key: 'slant', label: 'কাত (একক)', default: 2 },
        ],
        build: ({ base, height, slant }) =>
          `A=(0,0);B=(${base},0);C=(${Number(base)+Number(slant)},${height});D=(${slant},${height});p=Polygon[A,B,C,D]`,
      },
    ],
  },
  {
    group: 'বৃত্ত / চাপ',
    shapes: [
      {
        id: 'circle',
        label: 'বৃত্ত',
        icon: '⭕',
        inputs: [{ key: 'radius', label: 'ব্যাসার্ধ', default: 4 }],
        build: ({ radius }) => `O=(0,0);c=Circle[O,${radius}]`,
      },
      {
        id: 'circle_diameter',
        label: 'ব্যাস দিয়ে বৃত্ত',
        icon: '🔵',
        inputs: [{ key: 'diameter', label: 'ব্যাস', default: 6 }],
        build: ({ diameter }) => {
          const r = diameter / 2
          return `O=(0,0);A=(-${r},0);B=(${r},0);c=Circle[O,${r}]`
        },
      },
    ],
  },
  {
    group: 'রেখা',
    shapes: [
      {
        id: 'parallel_lines',
        label: 'সমান্তরাল রেখা',
        icon: '〓',
        inputs: [{ key: 'gap', label: 'ব্যবধান', default: 3 }],
        build: ({ gap }) =>
          `A=(-4,${gap/2});B=(4,${gap/2});C=(-4,-${gap/2});D=(4,-${gap/2});L1=Segment[A,B];L2=Segment[C,D]`,
      },
      {
        id: 'perpendicular',
        label: 'লম্ব রেখা',
        icon: '⊥',
        inputs: [],
        build: () =>
          `A=(-4,0);B=(4,0);C=(0,-4);D=(0,4);L1=Segment[A,B];L2=Segment[C,D];RightAngle(B,(0,0),D)`,
      },
    ],
  },
]

// ─── Small sub-components ────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        fontWeight: 700, fontSize: 12, transition: 'all 0.15s',
        background: active ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)' : '#f1f5f9',
        color: active ? '#fff' : '#64748b',
        boxShadow: active ? '0 3px 10px rgba(29,78,216,0.3)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

/** Inline number input used in the shape value dialog */
function NumInput({ label, value, onChange }) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:3 }}>
      <span style={{ fontSize:11, fontWeight:600, color:'#64748b' }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={0.1} step={0.5}
        style={{
          width: 70, padding:'6px 8px', border:'1.5px solid #e2e8f0',
          borderRadius:8, fontSize:13, fontWeight:700,
          textAlign:'center', outline:'none', color:'#0f172a',
        }}
        onFocus={e => e.target.style.borderColor = '#3b82f6'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </label>
  )
}

// ─── ShapeValuePanel — shown when user clicks a preset shape ─────────────────
function ShapeValuePanel({ shape, onApply, onCancel }) {
  const [vals, setVals] = useState(() => {
    const init = {}
    shape.inputs.forEach(inp => { init[inp.key] = inp.default })
    return init
  })

  return (
    <div style={{
      padding: '8px 12px', background: '#eff6ff',
      border: '1.5px solid #bfdbfe', borderRadius: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
        {shape.icon} {shape.label} — মাপ দিন
      </div>

      {shape.inputs.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {shape.inputs.map(inp => (
            <NumInput
              key={inp.key}
              label={inp.label}
              value={vals[inp.key]}
              onChange={v => setVals(prev => ({ ...prev, [inp.key]: v }))}
            />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#64748b' }}>কোনো মাপ দরকার নেই</div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onApply(shape.build(vals))}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#059669,#047857)',
            color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer',
          }}
        >
          ▶ আঁকো
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '7px 12px', borderRadius: 8,
            border: '1px solid #e2e8f0', background: '#fff',
            color: '#64748b', fontWeight: 700, fontSize: 11, cursor: 'pointer',
          }}
        >
          বাতিল
        </button>
      </div>
    </div>
  )
}

// ─── Main GeoGebraModal component ────────────────────────────────────────────
export default function GeoGebraModal({ open, onClose, onSave, initialShape = null }) {
  const mountRef   = useRef(null)
  const apiRef     = useRef(null)   // GeoGebra JS API object

  const [ggbReady,    setGgbReady]    = useState(false)
  const [ggbError,    setGgbError]    = useState('')
  const [activeTab,   setActiveTab]   = useState('shapes')  // 'shapes' | 'ai' | 'manual'
  const [selectedShape, setSelectedShape] = useState(null)  // preset being configured

  // AI tab state
  const [prompt,      setPrompt]      = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiResult,    setAiResult]    = useState('')

  // Manual tab state
  const [manualCmd,   setManualCmd]   = useState('')

  const [saving,        setSaving]        = useState(false)
  const [selectedTextObj, setSelectedTextObj] = useState(null)  // { name, value } or null
  const [textObjects, setTextObjects] = useState([])
  const [showTextPanel, setShowTextPanel] = useState(false)

  // ── Scan all text objects from GeoGebra ──
  const scanTextObjects = useCallback(() => {
    const ggb = apiRef.current
    if (!ggb) return
    try {
      const allNames = ggb.getAllObjectNames ? ggb.getAllObjectNames() : []
      const texts = []
      allNames.forEach(name => {
        try {
          if (ggb.getObjectType(name) === 'text') {
            const val = ggb.getValueString(name) || ''
            texts.push({ name, value: val })
          }
        } catch { /* noop */ }
      })
      setTextObjects(texts)
      setShowTextPanel(true)
    } catch { /* noop */ }
  }, [])

  // ── Update a text object's value ──
  const handleTextUpdate = useCallback((name, newValue) => {
    const ggb = apiRef.current
    if (!ggb) return
    try {
      // Find anchor point (text1 → T1, text2 → T2, etc.)
      const match = name.match(/text(\d+)/)
      const anchorName = match ? `T${match[1]}` : null

      ggb.deleteObject(name)
      const escaped = newValue.replace(/"/g, '\\"')

      if (anchorName) {
        try {
          ggb.getXcoord(anchorName)
          ggb.evalCommand(`${name} = Text["${escaped}", ${anchorName}]`)
        } catch {
          ggb.evalCommand(`${name} = Text["${escaped}", (1, 1)]`)
        }
      } else {
        ggb.evalCommand(`${name} = Text["${escaped}", (1, 1)]`)
      }
      try { ggb.setVisible(name, true) } catch { /* noop */ }
      try { ggb.setFixed(name, false) } catch { /* noop */ }
      setSelectedTextObj(prev => prev?.name === name ? { ...prev, value: newValue } : prev)
      toast.success('টেক্সট আপডেট হয়েছে!', { duration: 1000 })
    } catch {
      toast.error('টেক্সট আপডেট ব্যর্থ')
    }
  }, [])

  // ── Init / re-init GeoGebra when modal opens ──────────────────────────────
  useEffect(() => {
    if (!open) {
      // Modal closed — reset API ref so GeoGebra reinitializes next time
      // (DOM is destroyed when component returns null, so old API is stale)
      apiRef.current = null
      setGgbReady(false)
      setGgbError('')
      return
    }

    // Already initialised and DOM is valid — just clear the canvas
    if (apiRef.current && mountRef.current) {
      try { apiRef.current.newConstruction() } catch { /* noop */ }
      try { apiRef.current.setMode(0) } catch { /* noop */ }
      return
    }

    // Reset for fresh initialization
    apiRef.current = null
    setGgbReady(false)

    let cancelled = false

    loadGgbScript()
      .then(() => {
        if (cancelled || !mountRef.current) return

        // Wait one frame so the flex container has painted and offsetHeight is real
        requestAnimationFrame(() => {
          if (cancelled || !mountRef.current) return

          // mountRef is now position:absolute — read parent's dimensions instead
          const container = mountRef.current.parentElement
          const w = (container?.offsetWidth  || mountRef.current.offsetWidth)  || 860
          const h = Math.max((container?.offsetHeight || mountRef.current.offsetHeight) || 0, 260)

          const params = {
            appName: 'classic',
            width:   w,
            height:  h,
            showToolBar:      true,
            showAlgebraInput: false,
            showMenuBar:      false,
            showResetIcon:    true,
            enableRightClick: true,
            enableLabelDrags: true,
            showToolBarHelp:  false,
            enableShiftDragZoom: true,
            algebraInputPosition: 'none',
            perspective: 'G',
            language: 'en',
            appletOnLoad(ggbApi) {
              if (cancelled) return
              apiRef.current = ggbApi
              try { ggbApi.setMode(0) } catch { /* noop */ }
              try { ggbApi.setErrorDialogsActive(false) } catch { /* noop */ }
              try { ggbApi.setGridVisible(false) } catch { /* noop */ }
              try { ggbApi.setAxesVisible(false, false) } catch { /* noop */ }
              try { ggbApi.setAxesRatio(1, 1) } catch { /* noop */ }

              // Register client listener — detect text object taps for editing
              // GeoGebra event format: { type, target, argument } or array-like [type, target, argument, ...]
              try {
                ggbApi.registerClientListener((event) => {
                  const evtType = event.type || event[0]
                  const evtTarget = event.target || event[1] || ''

                  if (evtType === 'select' && evtTarget) {
                    try {
                      const objType = ggbApi.getObjectType(evtTarget)
                      if (objType === 'text') {
                        const val = ggbApi.getValueString(evtTarget) || ''
                        setSelectedTextObj({ name: evtTarget, value: val })
                      }
                    } catch { /* not a valid object */ }
                  }
                  if (evtType === 'deselect') {
                    // Delay — GeoGebra fires deselect→select in same click
                    setTimeout(() => {
                      setSelectedTextObj(prev => prev ? prev : null)
                    }, 100)
                  }
                })
              } catch { /* registerClientListener not supported */ }

              setGgbReady(true)
            },
          }

          const applet = new window.GGBApplet(params, true)
          applet.inject(mountRef.current)
        }) // end requestAnimationFrame
      })
      .catch(err => {
        if (!cancelled) setGgbError(err.message)
      })

    return () => { cancelled = true }
  }, [open])

  // Escape key closes
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  // Apply initial shape when provided and GeoGebra is ready
  useEffect(() => {
    if (!open || !ggbReady || !initialShape) return

    if (initialShape === 'ai') {
      setActiveTab('ai')
      return
    }

    // Find the shape in presets first
    const shape = SHAPE_PRESETS
      .flatMap(g => g.shapes)
      .find(s => s.id === initialShape)

    if (shape) {
      if (shape.inputs.length === 0) {
        const cmd = shape.build({})
        runCommands(cmd)
        setManualCmd(cmd)
        toast.success(`${shape.label} আঁকা হয়েছে!`, { duration: 1500 })
      } else {
        setActiveTab('shapes')
        setSelectedShape(shape)
      }
    } else if (SHAPE_COMMANDS[initialShape]) {
      // Fallback: check SHAPE_COMMANDS from geometryTemplates (70+ curriculum shapes)
      const cmd = SHAPE_COMMANDS[initialShape]
      runCommands(cmd)
      setManualCmd(cmd)
      // Find label from SHAPE_CATEGORIES for the toast
      let shapeLabel = initialShape
      for (const cat of SHAPE_CATEGORIES) {
        const found = cat.shapes.find(s => s.id === initialShape)
        if (found) { shapeLabel = found.label; break }
      }
      toast.success(`${shapeLabel} আঁকা হয়েছে!`, { duration: 1500 })
    }
  }, [open, ggbReady, initialShape])

  // ── Run commands on canvas ────────────────────────────────────────────────
  const runCommands = useCallback((cmdString, skipReset = false) => {
    const ggb = apiRef.current
    if (!ggb || !cmdString?.trim()) return
    try {
      if (!skipReset) {
        ggb.newConstruction()
        try { ggb.setMode(0) } catch { /* noop */ }
        // Re-hide grid/axes after newConstruction (it resets visual settings)
        try { ggb.setGridVisible(false) } catch { /* noop */ }
        try { ggb.setAxesVisible(false, false) } catch { /* noop */ }
        // Re-lock 1:1 aspect ratio so circles don't become ellipses
        try { ggb.setAxesRatio(1, 1) } catch { /* noop */ }
      }

      // Normalise: collapse newlines → semicolons, then split
      const normalised = cmdString
        .replace(/\r\n|\r|\n/g, ';')
        .replace(/;+/g, ';')
        .replace(/^;|;$/g, '')
        .trim()

      const allCmds = normalised
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('//'))

      // ── Pre-process: replace Text["label",(x,y)] with free point + text ──
      // Text["label",(x,y)] creates dependent text → NOT draggable/editable.
      // Fix: create free point Tn at original position, anchor text to Tn.
      // Tn is made small + label hidden. Drag Tn → text moves. Double-click text → edits.
      const textRegex = /^Text\["(.*)",\s*\(([^,]+),\s*([^)]+)\)\]$/
      const processedCmds = []
      let textIdx = 0
      allCmds.forEach(cmd => {
        const m = cmd.match(textRegex)
        if (m) {
          textIdx++
          const ptName = `T${textIdx}`
          const x = m[2].trim()
          const y = m[3].trim()
          // Create free point at text position
          processedCmds.push(`${ptName} = (${x}, ${y})`)
          // Anchor text to the free point (not raw coords!) → draggable + editable
          const escaped = m[1].replace(/"/g, '\\"')
          processedCmds.push(`Text["${escaped}", ${ptName}]`)
        } else {
          processedCmds.push(cmd)
        }
      })

      console.log('[ggb] commands to run:', allCmds.length,
        `→ ${processedCmds.length} (expanded ${textIdx} texts)`)

      // Run all processed commands
      let successCount = 0
      processedCmds.forEach(cmd => {
        try {
          let ok = ggb.evalCommand(cmd)
          if (ok === false && cmd.includes('[')) {
            const alt = cmd.replace(/\[/g, '(').replace(/\]/g, ')')
            ok = ggb.evalCommand(alt)
          }
          if (ok !== false) successCount++
        } catch { /* noop */ }
      })
      console.log(`[ggb] ${successCount}/${processedCmds.length} commands succeeded`)

      // Immediate repaint after commands — shapes need to appear right away
      try {
        const el = mountRef.current
        if (el) ggb.setSize(el.offsetWidth, el.offsetHeight)
      } catch { /* noop */ }

      // ── Style objects: show shapes, hide auto-labels ──
      try {
        const allNames = ggb.getAllObjectNames ? ggb.getAllObjectNames() : []
        console.log('[ggb] objects created:', allNames.length, allNames)

        const typeCounts = {}
        allNames.forEach(name => {
          try {
            const objType = ggb.getObjectType(name)
            typeCounts[objType] = (typeCounts[objType] || 0) + 1

            // FORCE visible for EVERY object
            ggb.setVisible(name, true)

            // ── Label handling: hide auto-labels, keep only user text ──
            if (objType === 'text') {
              // User-created text (from Text["label", point]) — keep visible + editable
              ggb.setLabelVisible(name, false) // text itself IS the label, hide the name
              try { ggb.setFixed(name, false) } catch { /* noop */ }
            } else if (objType === 'point') {
              // Hide helper points: T1,T2…(text anchors), RA1,RA2…(right-angle), L1,L2…(line extenders)
              if (/^T\d+$/.test(name) || /^RA\d+$/.test(name) || /^L\d+$/.test(name)) {
                ggb.setLabelVisible(name, false)
                ggb.setVisible(name, false)
              } else {
                ggb.setLabelVisible(name, true)
                ggb.setPointSize(name, 4)
              }
            } else if (objType === 'angle' || objType === 'numeric') {
              // Angles: hide the ">>" arrow symbols and degree values completely
              ggb.setLabelVisible(name, false)
              try { ggb.setVisible(name, false) } catch { /* noop */ }
            } else if (objType === 'segment' || objType === 'line' || objType === 'ray') {
              // Lines/segments: hide auto-names like "f", "g", "AB"
              ggb.setLabelVisible(name, false)
            } else if (objType === 'polygon' || objType === 'conic') {
              // Polygons/circles: hide auto-area values
              ggb.setLabelVisible(name, false)
            } else {
              // Other types: hide label by default
              ggb.setLabelVisible(name, false)
            }
          } catch { /* noop */ }
        })
        console.log('[ggb] object types:', typeCounts)
      } catch (e) { console.warn('[ggb] label visibility error:', e) }

      // ── Deferred: auto-fit view + make objects draggable ──
      setTimeout(() => {
        try {
          const names = ggb.getAllObjectNames ? ggb.getAllObjectNames() : []
          if (names.length > 0) {
            let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
            names.forEach(n => {
              try {
                const x = ggb.getXcoord(n), y = ggb.getYcoord(n)
                if (isFinite(x) && isFinite(y)) {
                  x0 = Math.min(x0, x); x1 = Math.max(x1, x)
                  y0 = Math.min(y0, y); y1 = Math.max(y1, y)
                }
              } catch { /* noop */ }
            })

            if (isFinite(x0)) {
              const pad = 2
              const dataW = Math.max(x1 - x0, 1) + pad * 2
              const dataH = Math.max(y1 - y0, 1) + pad * 2
              const cx = (x0 + x1) / 2
              const cy = (y0 + y1) / 2

              // Get actual canvas pixel dimensions for aspect ratio
              const el = mountRef.current
              const canvasW = el ? (el.offsetWidth  || 860) : 860
              const canvasH = el ? (el.offsetHeight || 460) : 460
              const canvasRatio = canvasW / canvasH  // e.g. 860/460 ≈ 1.87

              // We want 1 GeoGebra unit = same pixel size on both axes.
              // If we show `rangeX` units horizontally and `rangeY` vertically,
              // then pixel_per_unit_x = canvasW / rangeX
              //      pixel_per_unit_y = canvasH / rangeY
              // Equal scale ⟹  rangeX / rangeY = canvasW / canvasH = canvasRatio
              // So rangeX = rangeY * canvasRatio
              //
              // Choose rangeY so the data fits, then derive rangeX:
              let rangeY = dataH
              let rangeX = rangeY * canvasRatio
              // If data is wider than rangeX allows, expand both proportionally
              if (dataW > rangeX) {
                rangeX = dataW
                rangeY = rangeX / canvasRatio
              }

              ggb.setCoordSystem(
                cx - rangeX / 2, cx + rangeX / 2,
                cy - rangeY / 2, cy + rangeY / 2,
              )
            }
          }
        } catch (e) { console.warn('[ggb] setCoordSystem error:', e) }
        // ── Make ALL objects unfixed ──
        try {
          const allObj = ggb.getAllObjectNames ? ggb.getAllObjectNames() : []
          console.log('[ggb] unfreezing objects:', allObj.length)
          allObj.forEach(name => {
            try { ggb.setFixed(name, false) } catch { /* noop */ }
          })

          // ── Style anchor points (T1, T2, ...) — small, label hidden ──
          allObj.forEach(name => {
            try {
              if (ggb.getObjectType(name) === 'point' &&
                  (/^T\d+$/.test(name) || /^RA\d+$/.test(name) || /^L\d+$/.test(name))) {
                try { ggb.setPointSize(name, 1) } catch { /* noop */ }
                try { ggb.setLabelVisible(name, false) } catch { /* noop */ }
                try { ggb.setVisible(name, false) } catch { /* noop */ }
              }
            } catch { /* noop */ }
          })
        } catch { /* noop */ }

        // Switch to MOVE mode
        try { ggb.setMode(0) } catch { /* noop */ }

        // Repaint
        try {
          const el = mountRef.current
          if (el) ggb.setSize(el.offsetWidth, el.offsetHeight)
        } catch { /* noop */ }

        console.log('[ggb] ✅ view fitted, objects unfixed, texts draggable, move mode set')
      }, 500)

    } catch (e) { console.warn('[ggb] runCommands error:', e) }
  }, [])

  // ── Preset shape apply ────────────────────────────────────────────────────
  const handleShapeApply = (cmdString) => {
    if (!ggbReady) { toast.error('GeoGebra এখনও লোড হচ্ছে'); return }
    runCommands(cmdString)
    setManualCmd(cmdString)
    setAiResult('')       // clear AI result when a shape is applied
    setSelectedShape(null)
    toast.success('চিত্র আঁকা হয়েছে!', { duration: 1500 })
  }

  // ── AI generate ──────────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!prompt.trim() || aiLoading) return
    if (!ggbReady) { toast.error('GeoGebra লোড হচ্ছে'); return }
    setAiLoading(true)
    setAiResult('')
    try {
      const { data } = await api.post('/geometry/translate', { prompt: prompt.trim() })
      if (data.success && data.commands) {
        // Normalise: replace newlines with semicolons so runCommands splits correctly
        const normalised = data.commands
          .replace(/\r\n|\r|\n/g, ';')
          .replace(/;+/g, ';')
          .replace(/^;|;$/g, '')
          .trim()
        setManualCmd(normalised)
        setAiResult(data.description || '')
        runCommands(normalised)
        toast.success('চিত্র তৈরি হয়েছে!', { duration: 2000 })
      } else {
        toast.error('AI থেকে commands পাওয়া যায়নি')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI অনুরোধ ব্যর্থ')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Manual apply ─────────────────────────────────────────────────────────
  const handleManualApply = () => {
    if (!manualCmd.trim()) return
    if (!ggbReady) { toast.error('GeoGebra লোড হচ্ছে'); return }
    runCommands(manualCmd)
    toast.success('চিত্র আপডেট হয়েছে!', { duration: 1200 })
  }

  // ── Clear canvas ──────────────────────────────────────────────────────────
  const handleClear = () => {
    try { apiRef.current?.newConstruction() } catch { /* noop */ }
    setManualCmd('')
    setAiResult('')
    setSelectedShape(null)
  }

  // ── Export PNG → onSave ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!ggbReady || !apiRef.current) { toast.error('GeoGebra প্রস্তুত নেই'); return }
    setSaving(true)
    try {
      const ggb = apiRef.current

      // Hide grid/axes, go to Move mode, wait for render
      try { ggb.setGridVisible(false) }        catch { /* noop */ }
      try { ggb.setAxesVisible(false, false) } catch { /* noop */ }
      try { ggb.setMode(0) }                   catch { /* noop */ }

      // ── Only hide anchor points T1, T2... before export ──
      try {
        const allNames = ggb.getAllObjectNames ? ggb.getAllObjectNames() : []
        allNames.forEach(name => {
          try {
            const objType = ggb.getObjectType(name)
            // Hide helper points: T1,T2…(text anchors), RA1,RA2…(right-angle), L1,L2…(line extenders)
            if (objType === 'point' &&
                (/^T\d+$/.test(name) || /^RA\d+$/.test(name) || /^L\d+$/.test(name))) {
              try { ggb.setVisible(name, false) } catch { /* noop */ }
            }
          } catch { /* noop */ }
        })
      } catch (e) { console.warn('[ggb] pre-export cleanup error:', e) }

      await new Promise(r => setTimeout(r, 400))

      let dataUrl = null

      // Method 1: GeoGebra native export — exactly what the canvas shows
      for (const scale of [1, 1.5, 2]) {
        try {
          const base64 = ggb.getPNGBase64(scale, false, 72)
          if (base64 && base64.length > 500 && base64.startsWith('iVBOR')) {
            dataUrl = `data:image/png;base64,${base64}`
            console.log(`[ggb] export scale=${scale} ok`)
            break
          }
        } catch (e) {
          console.warn(`[ggb] getPNGBase64(${scale}) failed:`, e.message)
        }
      }

      // Fallback: grab canvas element
      if (!dataUrl && mountRef.current) {
        const canvas = mountRef.current.querySelector('canvas')
        if (canvas?.width > 0) {
          try { dataUrl = canvas.toDataURL('image/png') } catch { /* noop */ }
        }
        if (!dataUrl) {
          const iframes = mountRef.current.querySelectorAll('iframe')
          for (const iframe of iframes) {
            try {
              const c = (iframe.contentDocument || iframe.contentWindow?.document)?.querySelector('canvas')
              if (c?.width > 0) { dataUrl = c.toDataURL('image/png'); break }
            } catch { /* noop */ }
          }
        }
      }

      if (!dataUrl) {
        toast.error('প্রথমে কিছু আঁকুন, তারপর সংরক্ষণ করুন')
        return
      }

      onSave(dataUrl)
      onClose()
      toast.success('জ্যামিতিক চিত্র সংরক্ষিত!')
    } catch (err) {
      console.error('[ggb] save error:', err)
      toast.error('চিত্র সংরক্ষণ করা যায়নি')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {createPortal(
        <AnimatePresence>
          <Motion.div
        key="ggb-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:10000,
          background:'rgba(10,14,30,0.65)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          // No padding on mobile so modal uses full width/height
          padding:'clamp(0px, 2vw, 8px)',
        }}
      >
        <Motion.div
          key="ggb-modal"
          initial={{ opacity:0, scale:0.95, y:20 }}
          animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:0.95, y:20 }}
          transition={{ type:'spring', stiffness:340, damping:28 }}
          onClick={e => e.stopPropagation()}
          style={{
            width:'100%', maxWidth:900, background:'#fff',
            borderRadius:20, boxShadow:'0 32px 80px -12px rgba(0,0,0,0.35)',
            display:'flex', flexDirection:'column',
            overflow:'hidden',
            // Use 100dvh on mobile so the footer is never pushed below the
            // browser chrome (address bar). dvh accounts for dynamic viewport.
            height: 'min(96dvh, 900px)',
          }}
        >

          {/* ── Header ── */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 20px',
            background:'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)',
            color:'#fff', flexShrink:0,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>📐</span>
              <div>
                <div style={{ fontWeight:800, fontSize:16 }}>জ্যামিতিক চিত্র তৈরি করুন</div>
                <div style={{ fontSize:11, opacity:0.75 }}>GeoGebra Classic • AI-powered</div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width:34, height:34, borderRadius:10, border:'none',
              background:'rgba(255,255,255,0.15)', color:'#fff',
              cursor:'pointer', fontSize:18, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>

          {/* ── Tab bar + Shape chips ── */}
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            padding:'5px 10px',
            borderBottom:'1px solid #f1f5f9', flexShrink:0,
            overflowX:'auto', WebkitOverflowScrolling:'touch',
            scrollbarWidth:'none',
            // Mobile: allow wrapping so all chips visible without scroll
            flexWrap:'wrap', minHeight:36,
          }}>
            {/* When a shape is selected: show ← back + shape name only */}
            {activeTab === 'shapes' && selectedShape ? (
              <>
                <button
                  onClick={() => setSelectedShape(null)}
                  style={{
                    display:'flex', alignItems:'center', gap:4,
                    padding:'5px 10px', borderRadius:8,
                    border:'1.5px solid #e2e8f0', background:'#f8fafc',
                    cursor:'pointer', fontSize:11, fontWeight:700, color:'#475569',
                    whiteSpace:'nowrap', flexShrink:0,
                  }}
                >← ফিরুন</button>
                <div style={{ fontSize:12, fontWeight:700, color:'#1d4ed8', whiteSpace:'nowrap', flexShrink:0 }}>
                  {selectedShape.icon} {selectedShape.label}
                  <span style={{ color:'#94a3b8', fontWeight:400 }}> — মাপ দিন</span>
                </div>
              </>
            ) : (
              <>
                {/* Mode tabs */}
                {[
                  { key:'shapes', icon:'🔷', label:'Shapes' },
                  { key:'ai',     icon:'🤖', label:'AI' },
                  { key:'manual', icon:'⌨️', label:'CMD' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSelectedShape(null) }}
                    style={{
                      display:'flex', alignItems:'center', gap:4,
                      padding:'5px 10px', borderRadius:8, border:'none',
                      cursor:'pointer', fontWeight:700, fontSize:11,
                      whiteSpace:'nowrap', flexShrink:0, transition:'all 0.12s',
                      background: activeTab === tab.key
                        ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)' : '#f1f5f9',
                      color: activeTab === tab.key ? '#fff' : '#64748b',
                    }}
                  >
                    <span>{tab.icon}</span><span>{tab.label}</span>
                  </button>
                ))}

              </>
            )}
          </div>

          {/* ── Panel content — auto-height, no scrollbar needed ── */}
          <div style={{
              padding:'10px 14px 6px',
              flexShrink:0,
              // No maxHeight/overflow — content auto-sizes, canvas gets remaining space
          }}>

            {/* ─ Shape value dialog (when a shape with inputs is selected) ─ */}
            {activeTab === 'shapes' && selectedShape && (
              <ShapeValuePanel
                shape={selectedShape}
                onApply={handleShapeApply}
                onCancel={() => setSelectedShape(null)}
              />
            )}

            {/* ─ AI TAB ─ */}
            {activeTab === 'ai' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:12, color:'#475569', fontWeight:600 }}>
                  বাংলায় বলুন কী আঁকতে চান — AI স্বয়ংক্রিয়ভাবে GeoGebra-তে আঁকবে:
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'stretch' }}>
                  <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') handleAiGenerate() }}
                    placeholder="যেমন: সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪..."
                    disabled={aiLoading}
                    style={{
                      flex:1, minWidth:0, padding:'8px 12px',
                      border:'1.5px solid #e2e8f0', borderRadius:10,
                      fontSize:12, background:'#f8fafc',
                      outline:'none', color:'#0f172a',
                    }}
                    onFocus={e => e.target.style.borderColor='#3b82f6'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'}
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !prompt.trim() || !ggbReady}
                    style={{
                      padding:'8px 12px', borderRadius:10, border:'none',
                      background: (aiLoading || !prompt.trim() || !ggbReady) ? '#94a3b8'
                        : 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
                      color:'#fff', fontWeight:700, fontSize:11,
                      cursor: (aiLoading || !prompt.trim() || !ggbReady) ? 'not-allowed' : 'pointer',
                      whiteSpace:'nowrap', flexShrink:0,
                    }}
                  >
                    {aiLoading
                      ? <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⟳</span>
                          <span>আঁকছে...</span>
                        </span>
                      : '🤖 আঁকো'}
                  </button>
                </div>

                {/* ── Quick Examples ── */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {[
                    { text: 'সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪', prompt: 'সমকোণী ত্রিভুজ ভূমি ৩ উচ্চতা ৪' },
                    { text: 'সমবাহু ত্রিভুজ বাহু ৫', prompt: 'সমবাহু ত্রিভুজ বাহু ৫' },
                    { text: 'বর্গক্ষেত্র বাহু ৪', prompt: 'বর্গক্ষেত্র বাহু ৪' },
                    { text: 'বৃত্ত ব্যাসার্ধ ৩', prompt: 'বৃত্ত ব্যাসার্ধ ৩' },
                    { text: 'সমান্তরাল রেখা দুটি', prompt: 'দুটি সমান্তরাল রেখা' },
                    { text: 'লম্ব রেখা', prompt: 'দুটি লম্ব রেখা' },
                  ].map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(ex.prompt)}
                      disabled={aiLoading}
                      style={{
                        padding:'4px 8px', borderRadius:6,
                        border:'1px solid #e2e8f0', background:'#fff',
                        color:'#64748b', fontSize:10, fontWeight:600,
                        cursor: aiLoading ? 'not-allowed' : 'pointer',
                        whiteSpace:'nowrap',
                      }}
                      onMouseEnter={e => { if(!aiLoading){ e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.borderColor='#cbd5e1' }}}
                      onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e2e8f0' }}
                    >
                      {ex.text}
                    </button>
                  ))}
                </div>

                {/* ── AI Result card — shown after successful generation ── */}
                {aiResult && manualCmd && (
                  <div style={{
                    border:'1.5px solid #bbf7d0', borderRadius:12,
                    overflow:'hidden',
                  }}>
                    {/* Success header — compact, no command preview to save vertical space */}
                    <div style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'7px 12px', background:'#f0fdf4',
                    }}>
                      <span style={{ fontSize:14 }}>✅</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#059669', flex:1,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {aiResult}
                      </span>
                      <button
                        onClick={() => setActiveTab('manual')}
                        style={{
                          fontSize:10, fontWeight:700, color:'#0284c7',
                          background:'none', border:'none', cursor:'pointer',
                          textDecoration:'underline', padding:0, flexShrink:0,
                        }}
                      >
                        CMD →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ MANUAL / COMMAND TAB ─ */}
            {activeTab === 'manual' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:12, color:'#475569', fontWeight:600 }}>
                  GeoGebra কমান্ড সরাসরি লিখুন (semicolon দিয়ে আলাদা করুন):
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
                  <textarea
                    value={manualCmd}
                    onChange={e => setManualCmd(e.target.value)}
                    placeholder={'A=(0,0);B=(3,0);C=(0,4);Polygon[A,B,C]'}
                    rows={2}
                    style={{
                      flex:1, minWidth:0, padding:'8px 10px',
                      border:'1.5px solid #e2e8f0', borderRadius:10,
                      fontSize:11, fontFamily:'monospace',
                      background:'#f8fafc', outline:'none', resize:'none', color:'#0f172a',
                    }}
                    onFocus={e => e.target.style.borderColor='#3b82f6'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'}
                  />
                  <button
                    onClick={handleManualApply}
                    disabled={!manualCmd.trim() || !ggbReady}
                    style={{
                      padding:'8px 10px', borderRadius:10, border:'none',
                      background: (!manualCmd.trim() || !ggbReady) ? '#94a3b8' : '#059669',
                      color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer',
                      whiteSpace:'nowrap', flexShrink:0,
                    }}
                  >
                    ▶ Apply
                  </button>
                </div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>
                  Reference: <code>Polygon[A,B,C]</code> · <code>Circle[O,5]</code> · <code>Segment[A,B]</code> · <code>RightAngle(C,A,B)</code>
                </div>
              </div>
            )}
          </div>

          {/* ── GeoGebra Canvas — fills remaining space ── */}
          {/* overflow:hidden is critical: GeoGebra injects a div that ignores   */}
          {/* flex sizing and expands to its natural height, pushing footer off   */}
          {/* screen. Clipping it here keeps the flex layout intact.             */}
          <div style={{ position:'relative', background:'#f0f4f8', flex:'1 1 0', minHeight:200, overflow:'hidden' }}>
            {!ggbReady && !ggbError && (
              <div style={{
                position:'absolute', inset:0, zIndex:5,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                background:'#f8fafc', gap:12,
              }}>
                <div style={{
                  width:40, height:40, border:'4px solid #e2e8f0',
                  borderTopColor:'#1d4ed8', borderRadius:'50%',
                  animation:'spin 0.9s linear infinite',
                }}/>
                <div style={{ fontSize:13, color:'#64748b', fontWeight:600 }}>GeoGebra লোড হচ্ছে...</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>ইন্টারনেট সংযোগ প্রয়োজন (geogebra.org)</div>
              </div>
            )}
            {ggbError && (
              <div style={{
                position:'absolute', inset:0, zIndex:5,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                background:'#fef2f2', gap:8, padding:20,
              }}>
                <span style={{ fontSize:32 }}>⚠️</span>
                <div style={{ fontSize:14, color:'#dc2626', fontWeight:700 }}>GeoGebra লোড হয়নি</div>
                <div style={{ fontSize:12, color:'#7f1d1d', textAlign:'center' }}>
                  {ggbError}<br/>ইন্টারনেট সংযোগ চেক করুন।
                </div>
              </div>
            )}
            {/* mountRef div fills 100% of this flex container */}
            <div ref={mountRef} style={{ position:'absolute', inset:0 }} />

            {/* ── Text List Panel (overlay inside canvas) ── */}
            {showTextPanel && (
              <div style={{
                position:'absolute', top:8, right:8, width:220,
                maxHeight:'60%', background:'rgba(255,255,255,0.97)',
                borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
                overflow:'hidden', zIndex:10, display:'flex', flexDirection:'column',
              }}>
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 12px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0',
                }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#475569' }}>
                    📝 টেক্সট ({textObjects.length})
                  </span>
                  <button
                    onClick={() => setShowTextPanel(false)}
                    style={{ border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#94a3b8', padding:0, lineHeight:1 }}
                  >✕</button>
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:6 }}>
                  {textObjects.length === 0 ? (
                    <div style={{ fontSize:11, color:'#94a3b8', padding:'12px 8px', textAlign:'center' }}>
                      কোনো টেক্সট নেই
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                      {textObjects.map((t) => (
                        <button
                          key={t.name}
                          onClick={() => {
                            setSelectedTextObj({ name: t.name, value: t.value })
                            setShowTextPanel(false)
                          }}
                          style={{
                            display:'flex', alignItems:'center', gap:6,
                            padding:'7px 8px', borderRadius:6,
                            border:'1px solid #f1f5f9', background:'#fff',
                            cursor:'pointer', textAlign:'left', width:'100%',
                            transition:'all 0.1s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.borderColor='#bfdbfe' }}
                          onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#f1f5f9' }}
                        >
                          <span style={{ fontSize:9, color:'#94a3b8', fontWeight:700, flexShrink:0 }}>
                            {t.name}
                          </span>
                          <span style={{ fontSize:11, color:'#334155', fontWeight:600, flex:1,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {t.value || '(খালি)'}
                          </span>
                          <span style={{ fontSize:10, color:'#3b82f6' }}>✏️</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer — always visible, never hidden below canvas ── */}
          <div style={{
            position:'relative',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 12px',
            background:'#fff', borderTop:'1px solid #f1f5f9',
            gap:6, flexShrink:0,
          }}>
            <button onClick={handleClear} style={{
              padding:'7px 12px', borderRadius:10, border:'1px solid #e2e8f0',
              background:'#fff', color:'#64748b', fontWeight:700, fontSize:12, cursor:'pointer',
              whiteSpace:'nowrap',
            }}>🗑️ মুছুন</button>

            {/* ── Text list toggle button ── */}
            <button
              onClick={() => {
                if (showTextPanel) { setShowTextPanel(false); return }
                scanTextObjects()
              }}
              style={{
                padding:'7px 12px', borderRadius:10,
                border: showTextPanel ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                background: showTextPanel ? '#eff6ff' : '#fff',
                color: showTextPanel ? '#1d4ed8' : '#64748b',
                fontWeight:700, fontSize:12, cursor:'pointer',
                whiteSpace:'nowrap',
              }}
            >✏️ টেক্সট</button>

            <div style={{ flex:1 }} />

            <div style={{ display:'flex', gap:6 }}>
              <button onClick={onClose} style={{
                padding:'8px 14px', borderRadius:10, border:'1px solid #e2e8f0',
                background:'#fff', color:'#64748b', fontWeight:700, fontSize:12,
                cursor:'pointer', whiteSpace:'nowrap',
              }}>বাতিল</button>
              <button
                onClick={handleSave}
                disabled={saving || !ggbReady}
                style={{
                  padding:'8px 16px', borderRadius:10, border:'none',
                  background: (saving || !ggbReady) ? '#94a3b8'
                    : 'linear-gradient(135deg,#059669,#047857)',
                  color:'#fff', fontWeight:800, fontSize:12,
                  cursor: (saving || !ggbReady) ? 'not-allowed' : 'pointer',
                  boxShadow: (saving || !ggbReady) ? 'none' : '0 4px 12px rgba(5,150,105,0.35)',
                  display:'flex', alignItems:'center', gap:5,
                  whiteSpace:'nowrap',
                }}
              >
                {saving ? '⟳ সেভ...' : '✅ ADD'}
              </button>
            </div>
          </div>

        </Motion.div>
      </Motion.div>
    </AnimatePresence>,
    document.body,
  )}

  {/* ── Text Edit Modal (separate portal — always above GeoGebra) ── */}
  {selectedTextObj && createPortal(
    <div
        onClick={() => setSelectedTextObj(null)}
        style={{
          position:'fixed', inset:0, zIndex:10001,
          background:'rgba(10,14,30,0.5)', backdropFilter:'blur(3px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:20,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width:'100%', maxWidth:360, background:'#fff',
            borderRadius:16, boxShadow:'0 24px 48px -12px rgba(0,0,0,0.3)',
            overflow:'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 16px',
            background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>✏️</span>
              <span style={{ fontWeight:700, fontSize:14 }}>টেক্সট সম্পাদনা</span>
            </div>
            <span style={{ fontSize:11, opacity:0.7 }}>{selectedTextObj.name}</span>
          </div>

          {/* Input */}
          <div style={{ padding:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6, display:'block' }}>
              টেক্সট মান:
            </label>
            <input
              type="text"
              defaultValue={selectedTextObj.value}
              autoFocus
              style={{
                width:'100%', padding:'12px 14px',
                border:'2px solid #e2e8f0', borderRadius:10,
                fontSize:16, color:'#0f172a', outline:'none',
                boxSizing:'border-box',
              }}
              onFocus={e => e.target.style.borderColor='#3b82f6'}
              onBlur={e => e.target.style.borderColor='#e2e8f0'}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleTextUpdate(selectedTextObj.name, e.target.value)
                  setSelectedTextObj(null)
                }
              }}
              id="ggb-text-edit-input"
            />

            {/* Buttons */}
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button
                onClick={() => setSelectedTextObj(null)}
                style={{
                  flex:1, padding:'11px 0', borderRadius:10,
                  border:'1.5px solid #e2e8f0', background:'#fff',
                  color:'#64748b', fontWeight:700, fontSize:13,
                  cursor:'pointer',
                }}
              >বাতিল</button>
              <button
                onClick={() => {
                  const input = document.getElementById('ggb-text-edit-input')
                  if (input) {
                    handleTextUpdate(selectedTextObj.name, input.value)
                  }
                  setSelectedTextObj(null)
                }}
                style={{
                  flex:1, padding:'11px 0', borderRadius:10, border:'none',
                  background:'linear-gradient(135deg,#059669,#047857)',
                  color:'#fff', fontWeight:800, fontSize:13, cursor:'pointer',
                  boxShadow:'0 4px 12px rgba(5,150,105,0.3)',
                }}
              >✅ সংরক্ষণ</button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )}

    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    </>
  )
}
