import PaperTemplate from '@/components/paper/PaperTemplate'
import api from '@/services/api'
import Loader from '@/components/shared/Loader'
import { buildPaperHtmlForServerPdf } from '@/utils/paperToPdfHtml'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function PDFPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paperRef = useRef(null)
  const previewWrapRef = useRef(null)
  const paperSheetRef = useRef(null)

  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)
  // Independent flag for the server-side (Puppeteer) PDF path so the
  // two download buttons can show their own loading states.
  const [downloadingServer, setDownloadingServer] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0 })

  const [variant, setVariant] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  // Defaults match the values used by paper rows that pre-date the
  // print_settings column. Once the paper loads, the useEffect below
  // overwrites these with whatever is in paper.print_settings.
  const [font, setFont] = useState('Noto Serif Bengali')
  const [size, setSize] = useState('12pt')
  const [spacing, setSpacing] = useState('1.6')
  const [orientation, setOrientation] = useState('portrait')
  // empty string => let PaperTemplate fall back to its per-layout default
  // (5mm for 2-col, 4mm for 3-col). Otherwise this value (e.g. '8mm') is used.
  const [columnGap, setColumnGap] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  const isLandscape = orientation === 'landscape'

  // Hydrate UI state from the paper's persisted print_settings (if any)
  // exactly once per paper id. Keyed on paper?.id (not the whole paper
  // object) so editing-and-saving the paper elsewhere doesn't snap the
  // local UI back mid-session.
  useEffect(() => {
    const s = paper?.print_settings
    if (!s) return
    if (s.font) setFont(s.font)
    if (s.size) setSize(s.size)
    if (s.spacing) setSpacing(s.spacing)
    if (s.orientation) setOrientation(s.orientation)
    if (typeof s.columnGap === 'string') setColumnGap(s.columnGap)
  }, [paper?.id])

  async function saveSettingsAndClose() {
    if (!paper?.id) {
      setShowSettings(false)
      return
    }
    setSavingSettings(true)
    try {
      const { data } = await api.put(`/papers/${paper.id}`, {
        print_settings: { ...(paper.print_settings || {}), font, size, spacing, orientation, columnGap },
      })
      if (data?.paper) setPaper(data.paper)
      toast.success('সেটিংস সেভ হয়েছে')
      setShowSettings(false)
    } catch (err) {
      console.error('[PDFPreview] save settings failed:', err)
      toast.error('সেটিংস সেভ করা যায়নি')
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .get(`/papers/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        setPaper(data.paper)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err.response?.data?.message || 'পেপার লোড করা যায়নি'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, navigate])

  // Set B = shuffled order. Stable per (paper, variant).
  const renderedQuestions = useMemo(() => {
    const qs = paper?.questions || []
    if (variant !== 'B') return qs
    const arr = [...qs]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [paper?.questions, variant])

  // Auto-scale the A4 sheet down so it fits the preview container's width.
  // Uses transform: scale() which does NOT affect the captured element's
  // layout dimensions, so PDF generation (which reads paperRef.offsetWidth)
  // stays at full A4 size. ResizeObserver re-fires on window resize,
  // orientation change, and font/spacing/content changes.
  // useLayoutEffect so the scale is applied BEFORE first paint (no flash
  // of overflowing unscaled paper).
  useLayoutEffect(() => {
    const wrap = previewWrapRef.current
    const sheet = paperSheetRef.current
    if (!wrap || !sheet) return
    let raf = 0
    const compute = () => {
      const availW = wrap.clientWidth
      const paperEl = paperRef.current
      // Use the maximum of every "could-overflow" width — the outer sheet,
      // the inner paperRef's content extent, and any children pushing past
      // the column (long Bengali words, wide images, KaTeX math). Without
      // this the page mostly fits but a stray overflow still bleeds past
      // the viewport on mobile.
      const sheetW = Math.max(
        sheet.offsetWidth,
        sheet.scrollWidth,
        paperEl?.scrollWidth || 0,
      )
      const sheetH = Math.max(sheet.offsetHeight, sheet.scrollHeight)
      if (!sheetW || !availW) {
        raf = requestAnimationFrame(compute)
        return
      }
      // 8px buffer prevents sub-pixel overshoot at narrow widths.
      const s = Math.min(1, (availW - 8) / sheetW)
      setPreviewScale(s)
      // Math.ceil so sub-pixel rounding never clips the bottom row of
      // rendered content. Width must stay <= availW so we use floor with
      // a tiny pad.
      setPreviewBox({
        width: Math.min(availW, Math.ceil(sheetW * s)),
        height: Math.ceil(sheetH * s) + 8,
      })
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(wrap)
    ro.observe(sheet)
    const onResize = () => compute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [isLandscape, paper?.id, renderedQuestions.length, font, size, spacing, columnGap, variant, loading])

  async function handleDownload() {
    if (!paperRef.current || downloading) return
    setDownloading(true)
    try {
      // Lazy-load: html2pdf.js pulls in html2canvas + jsPDF (~300KB combined)
      const html2pdf = (await import('html2pdf.js')).default

      // Force-load the Bengali AND KaTeX fonts before capture. Without this,
      // html2canvas sometimes captures with the system fallback font (Bengali
      // looks wrong) or with a wrong-metric KaTeX font (fraction bar appears
      // through the numerator).
      if (document.fonts) {
        await Promise.all([
          document.fonts.load(`400 16px "${font}"`),
            document.fonts.load(`700 16px "${font}"`),
            document.fonts.load(`400 16px "Hind Siliguri"`),
            document.fonts.load(`400 16px "Noto Naskh Arabic"`),
            document.fonts.load(`700 16px "Noto Naskh Arabic"`),
            document.fonts.load(`400 16px KaTeX_Main`),
          document.fonts.load(`700 16px KaTeX_Main`),
          document.fonts.load(`italic 400 16px KaTeX_Math`),
          document.fonts.load(`400 16px KaTeX_Size1`),
          document.fonts.load(`400 16px KaTeX_Size2`),
          document.fonts.load(`400 16px KaTeX_AMS`),
        ])
        await document.fonts.ready
      }

      const filename = `${paper?.exam_title || 'paper'}${variant ? `_Set-${variant}` : ''}.pdf`

      // pagebreak: only honor inline CSS break rules. No "avoid" array — it
      // creates large empty gaps when a question doesn't fit at the page bottom.
      await html2pdf()
        .set({
          margin: [14, 0, 14, 0],
          filename,
          // PNG preserves subtle backgrounds (e.g. the light-gray instructions
          // box at #f5f5f5) which JPEG compression flattens to white.
          image: { type: 'png' },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: paperRef.current.offsetWidth,
            // NOTE: foreignObjectRendering would let the browser natively
            // render KaTeX inside an SVG <foreignObject> (which fixes the
            // fraction-bar drift), but in Chromium the SVG path ignores
            // @font-face web fonts and the resulting PDF comes out blank
            // / slow. Stick with the standard canvas pipeline and pin
            // computed styles below as the next best thing.
            //
            // ─── KaTeX geometry pin (onclone) ──────────────────────────
            // KaTeX builds fractions / radicals / sub-sup by stacking
            // spans inside a `.vlist` with inline `top: -X.XXem`. The em
            // is relative to the element's own font-size. html2canvas
            // clones the DOM into an iframe and re-resolves all sizes,
            // which can quantize em values differently and shift the
            // fraction bar onto the numerator (strikethrough look).
            //
            // We walk every .katex / .katex-display subtree and copy
            // layout-affecting computed styles onto the clone, so
            // html2canvas doesn't have to re-resolve any em. Most
            // fractions render correctly; a small set of complex ones
            // may still drift — for pixel-perfect exports, the Print
            // button → Save as PDF dialog is the reliable fallback.
            onclone: (clonedDoc) => {
              const orig = paperRef.current
              if (!orig) return

              const LAYOUT_PROPS = [
                'fontSize', 'lineHeight', 'fontFamily', 'fontStyle', 'fontWeight',
                'position', 'top', 'bottom', 'left', 'right',
                'width', 'height', 'minHeight',
                'display', 'verticalAlign',
                'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
                'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                'borderTopWidth', 'borderBottomWidth',
                'borderTopStyle', 'borderBottomStyle',
                'borderTopColor', 'borderBottomColor',
                'transform', 'transformOrigin',
                'textAlign',
              ]
              const pinStyles = (o, c) => {
                if (!o || !c) return
                const cs = window.getComputedStyle(o)
                for (const prop of LAYOUT_PROPS) {
                  const val = cs[prop]
                  if (val && val !== 'auto' && val !== 'normal') {
                    c.style[prop] = val
                  }
                }
              }

              const KATEX_ROOTS = '.katex, .katex-display'
              const origRoots = orig.querySelectorAll(KATEX_ROOTS)
              const cloneRoots = clonedDoc.querySelectorAll(KATEX_ROOTS)
              for (let k = 0; k < cloneRoots.length; k++) {
                const oRoot = origRoots[k]
                const cRoot = cloneRoots[k]
                if (!oRoot || !cRoot) continue
                pinStyles(oRoot, cRoot)
                const oDesc = oRoot.querySelectorAll('*')
                const cDesc = cRoot.querySelectorAll('*')
                for (let i = 0; i < cDesc.length; i++) {
                  pinStyles(oDesc[i], cDesc[i])
                }
              }
            },
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation },
          pagebreak: { mode: ['css'] },
        })
        .from(paperRef.current)
        .save()
    } catch (err) {
      console.error('[PDFPreview] download failed:', err)
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে')
    } finally {
      setDownloading(false)
    }
  }

  // Server-side PDF render via the Puppeteer microservice. Higher
  // fidelity than html2pdf for complex math + Bengali typography, but
  // requires the PDF server to be deployed and PDF_SERVER_URL +
  // PDF_SERVER_API_KEY to be set on the main app. On Render's free
  // tier the first request may take 30–60s while the dyno wakes up.
  async function handleServerDownload() {
    if (!paperRef.current || downloadingServer) return
    setDownloadingServer(true)
    const toastId = toast.loading('সার্ভারে PDF তৈরি হচ্ছে (প্রথমবার ৩০-৬০ সেকেন্ড লাগতে পারে)…')
    try {
      try { await document.fonts.ready } catch { /* swallow */ }

      const { html, filename } = buildPaperHtmlForServerPdf({
        paperNode: paperRef.current,
        paper,
        settings: { font, size, spacing, orientation, columnGap },
      })

      const res = await api.post(
        `/pdf-server/papers/${paper.id}`,
        { html, filename: `${paper?.exam_title || 'paper'}${variant ? `_Set-${variant}` : ''}` },
        { responseType: 'blob', timeout: 120000 },
      )

      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('সার্ভার PDF ডাউনলোড সম্পন্ন', { id: toastId })
    } catch (err) {
      console.error('[PDFPreview] server download failed:', err)
      // axios + blob responseType still gives us err.response.data as a Blob;
      // try to extract the JSON error message for the toast.
      let msg = 'সার্ভার PDF তৈরি করা যায়নি'
      const blob = err?.response?.data
      if (blob instanceof Blob && blob.type.includes('json')) {
        try {
          const text = await blob.text()
          const json = JSON.parse(text)
          if (json?.error || json?.message) msg = json.error || json.message
        } catch { /* swallow */ }
      } else if (err?.response?.status === 503) {
        msg = 'PDF সার্ভার এখনও কনফিগার হয়নি'
      } else if (err?.code === 'ECONNABORTED') {
        msg = 'সার্ভার সাড়া দিচ্ছে না — পরে আবার চেষ্টা করুন'
      }
      toast.error(msg, { id: toastId })
    } finally {
      setDownloadingServer(false)
    }
  }

  // Core print routine. Clone the paper into a body-root .print-host
  // wrapper so the print CSS in index.css cleanly hides the rest of the
  // app; inject an @page rule for the current orientation; call
  // window.print(); restore everything in `afterprint`. Used by both
  // the "Print" path and the "Native PDF" path — they only differ in
  // the user-facing toast hint and the document title used as the
  // filename when the user picks "Save as PDF".
  function triggerNativePrint({ titleSuffix = '' } = {}) {
    if (!paperRef.current) return false
    const clone = paperRef.current.cloneNode(true)
    const host = document.createElement('div')
    host.className = 'print-host'
    host.appendChild(clone)
    document.body.appendChild(host)
    document.body.classList.add('is-printing')

    const style = document.createElement('style')
    style.media = 'print'
    style.textContent = `@page { size: A4 ${orientation}; margin: 14mm 12mm; }`
    document.head.appendChild(style)

    const originalTitle = document.title
    // The browser uses document.title as the default filename when the
    // user picks "Save as PDF" in the print dialog. Make it descriptive.
    document.title = `${paper?.exam_title || 'paper'}${variant ? `_Set-${variant}` : ''}${titleSuffix}`

    const cleanup = () => {
      document.body.classList.remove('is-printing')
      host.remove()
      style.remove()
      document.title = originalTitle
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup, { once: true })

    setTimeout(() => window.print(), 50)
    return true
  }

  // "Native PDF Download": the browser's own print engine generates a
  // pixel-perfect PDF (fractions, radicals, sub-sup all correct — no
  // html2canvas drift). The trade-off is the standard browser print
  // dialog appears; the user must pick "Save as PDF" as the destination
  // and click Save. Chrome remembers the destination across clicks, so
  // after the first time it is effectively one-click.
  //
  // We can't suppress the dialog from a web page (browser security), so
  // a toast tells the user what to pick. Once they do, the standard file
  // save modal asks only for filename + location.
  function handleNativePdf() {
    if (!paper) return
    const ok = triggerNativePrint()
    if (ok) {
      toast('Destination থেকে "Save as PDF" সিলেক্ট করে Save চাপুন', {
        duration: 6000,
        icon: '📄',
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Top bar — hidden on print */}
      <div className="flex items-center justify-between gap-2 mb-4 no-print">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to={`/papers/${id}`}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">PDF প্রিভিউ</h1>
            <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
              {loading ? 'লোড হচ্ছে...' : error ? 'ত্রুটি' : downloading ? 'PDF তৈরি হচ্ছে...' : 'প্রস্তুত'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-0.5">
            {[
              { val: null, label: 'A' },
              { val: 'B', label: 'B' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setVariant(opt.val)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-colors text-[10px] sm:text-xs ${
                  variant === opt.val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="sm:hidden">{opt.label}</span>
                <span className="hidden sm:inline">সেট {opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press flex-shrink-0"
            title="সেটিংস"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={handleDownload}
            disabled={!paper || downloading}
            title="দ্রুত PDF (কিছু গণিত সমস্যা থাকতে পারে)"
            className="px-2.5 sm:px-4 h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-blue-600 text-white text-[11px] sm:text-sm font-semibold disabled:opacity-40 btn-press shadow-md sm:shadow-lg shadow-blue-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? '...' : 'PDF'}
          </button>

          {/* Server-side PDF — routes through the external Puppeteer
              microservice. Highest fidelity (real Chromium print engine
              on the server, no client RAM pressure). First request on
              Render free tier can take 30-60s while the dyno wakes up. */}
          <button
            onClick={handleServerDownload}
            disabled={!paper || downloadingServer}
            title="সার্ভার সাইড PDF (উচ্চ গুণমান, প্রথমবার একটু সময় নিতে পারে)"
            className="px-2.5 sm:px-4 h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-violet-600 text-white text-[11px] sm:text-sm font-semibold disabled:opacity-40 btn-press shadow-md sm:shadow-lg shadow-violet-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            {downloadingServer ? '...' : (
              <>
                <span className="sm:hidden">Server</span>
                <span className="hidden sm:inline">Server PDF</span>
              </>
            )}
          </button>

          {/* Native PDF Download — uses the browser's own print engine,
              which renders fractions / radicals pixel-perfect (the quick
              PDF on the left can drift on complex math). The browser
              shows its print dialog; user picks "Save as PDF" once and
              Chrome remembers it for subsequent clicks. */}
          <button
            onClick={handleNativePdf}
            disabled={!paper}
            title='Print/Save — Destination থেকে "Save as PDF" সিলেক্ট করুন'
            className="px-2.5 sm:px-4 h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-emerald-600 text-white text-[11px] sm:text-sm font-semibold disabled:opacity-40 btn-press shadow-md sm:shadow-lg shadow-emerald-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="sm:hidden">Print</span>
            <span className="hidden sm:inline">Print/Save</span>
          </button>
        </div>
      </div>

      {/* Preview area — neutral desk-like backdrop, equal gap on all 4 sides */}
      <div
        className="rounded-2xl no-print-bg p-0 lg:px-3 lg:py-8"
        style={{
          background: '#e5e7eb',
          minHeight: '60vh',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Loader message="PDF প্রিভিউ লোড হচ্ছে..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : paper ? (
          /*
           * Auto-scale wrapper:
           *   - previewWrapRef measures the available width
           *   - paperSheetRef is the unscaled A4 sheet (offsetWidth = 210mm/297mm)
           *   - We apply transform:scale(s) so the sheet visually shrinks to fit
           *   - The outer "scale-box" div is sized to the SCALED dimensions so
           *     the surrounding layout doesn't reserve full A4 space
           *   - PDF capture reads paperRef.offsetWidth which is unaffected by
           *     CSS transforms, so the generated PDF is still full A4
           */
          <div
            ref={previewWrapRef}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: previewBox.width ? `${previewBox.width}px` : '100%',
                height: previewBox.height ? `${previewBox.height}px` : 'auto',
                maxWidth: '100%',
                overflow: 'visible',
              }}
            >
              {/*
                paperRef captures a full-A4-wide wrapper that BAKES IN the 12mm
                horizontal padding. So when html2pdf places the captured image
                into A4 with jsPDF horizontal margin = 0, the visible page
                margin comes from inside the image itself — no chance for
                html2pdf's image scaling to shrink the horizontal margin.
                Vertical margin still comes from jsPDF (so every page after a
                break has consistent top/bottom whitespace).
                Width switches with orientation: portrait = 210mm, landscape = 297mm.
              */}
              <div
                ref={paperSheetRef}
                className="paper-sheet-shadow"
                style={{
                  flexShrink: 0,
                  padding: previewScale < 1 ? '0 0 14mm 0' : '14mm 0',
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  ref={paperRef}
                  style={{
                    width: isLandscape ? '297mm' : '210mm',
                    padding: '12px 12mm',
                    boxSizing: 'border-box',
                    background: '#fff',
                  }}
                >
                  <PaperTemplate
                    paper={{ ...paper, set_variant: variant || paper.set_variant }}
                    questions={renderedQuestions}
                    font={font}
                    size={size}
                    spacing={spacing}
                    orientation={orientation}
                    columnGap={columnGap || undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {showSettings && (
          <PDFSettingsModal
            onClose={() => setShowSettings(false)}
            onApply={saveSettingsAndClose}
            saving={savingSettings}
            font={font} setFont={setFont}
            size={size} setSize={setSize}
            spacing={spacing} setSpacing={setSpacing}
            orientation={orientation} setOrientation={setOrientation}
            columnGap={columnGap} setColumnGap={setColumnGap}
            paperLayout={paper?.layout || '1-column'}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PDFSettingsModal({ onClose, onApply, saving = false, font, setFont, size, setSize, spacing, setSpacing, orientation, setOrientation, columnGap, setColumnGap, paperLayout = '1-column' }) {
  const isMultiColumn = paperLayout === '2-column' || paperLayout === '3-column'
  const defaultGapLabel = paperLayout === '3-column' ? '৪ মিমি (ডিফল্ট)' : '৫ মিমি (ডিফল্ট)'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>

        <h3 className="text-xl font-black mb-6">প্রিন্ট সেটিংস</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">পেজ লেআউট</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'portrait', label: 'পোর্ট্রেট', sub: 'Portrait' },
                { val: 'landscape', label: 'ল্যান্ডস্কেপ', sub: 'Landscape' },
              ].map((opt) => {
                const active = orientation === opt.val
                const isPortrait = opt.val === 'portrait'
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setOrientation(opt.val)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all btn-press ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <span
                      className={`block border-2 rounded-sm ${active ? 'border-blue-600' : 'border-gray-400'}`}
                      style={{
                        width: isPortrait ? 18 : 26,
                        height: isPortrait ? 26 : 18,
                      }}
                    />
                    <span className="text-[12px] font-bold leading-none">{opt.label}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60 leading-none">{opt.sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ফন্ট পরিবার</label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
            >
              <option value="Noto Serif Bengali">Noto Serif Bengali (Classic)</option>
              <option value="Hind Siliguri">Hind Siliguri (Modern)</option>
              <option value="Noto Sans Bengali">Noto Sans Bengali</option>
              <option value="Tiro Bangla">Tiro Bangla (Formal)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ফন্ট সাইজ</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
            >
              <option value="10pt">Small (10pt)</option>
              <option value="11pt">Normal (11pt)</option>
              <option value="12pt">Medium (12pt)</option>
              <option value="13pt">Large (13pt)</option>
              <option value="14pt">Extra Large (14pt)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">লাইন স্পেসিং</label>
            <select
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
            >
              <option value="1.2">Compact (1.2)</option>
              <option value="1.6">Normal (1.6)</option>
              <option value="2.0">Relaxed (2.0)</option>
            </select>
          </div>

          {isMultiColumn && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                কলাম গ্যাপ
              </label>
              <select
                value={columnGap || ''}
                onChange={(e) => setColumnGap(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-sm outline-none"
              >
                <option value="">{defaultGapLabel}</option>
                <option value="3mm">টাইট (৩ মিমি)</option>
                <option value="5mm">নরমাল (৫ মিমি)</option>
                <option value="8mm">প্রশস্ত (৮ মিমি)</option>
                <option value="12mm">আরও প্রশস্ত (১২ মিমি)</option>
                <option value="16mm">সর্বোচ্চ (১৬ মিমি)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
                দুই কলামের মাঝখানের ফাঁকা জায়গা। বড় গ্যাপে অপশন overlap কমে।
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onApply || onClose}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 btn-press text-sm disabled:opacity-50"
            >
              {saving ? 'সেভ হচ্ছে...' : 'প্রয়োগ ও সেভ করুন'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
