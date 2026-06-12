import PaperTemplate from '@/components/paper/PaperTemplate'
import Loader from '@/components/shared/Loader'
import RefreshButton from '@/components/shared/RefreshButton'
import api, { getRenderPdfUrl } from '@/services/api'
import { buildPaperHtmlForServerPdf } from '@/utils/paperToPdfHtml'

import useAuthStore from '@/store/authStore'
import usePaperListStore from '@/store/paperListStore'
import { oklchOnclone, stripOklchForPdf } from '@/utils/stripOklchForPdf'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

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
  const [manualZoom, setManualZoom] = useState(false)
  const [initialPinchDistance, setInitialPinchDistance] = useState(null)
  const [initialPinchScale, setInitialPinchScale] = useState(1)

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
  const [pageFormat, setPageFormat] = useState('A4')
  const [pageMargin, setPageMargin] = useState('normal')
  const [showHeader, setShowHeader] = useState(false)
  const [showPageNumbers, setShowPageNumbers] = useState(false)
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
    if (s.pageFormat) setPageFormat(s.pageFormat)
    if (s.pageMargin) setPageMargin(s.pageMargin)
    if (typeof s.showHeader === 'boolean') setShowHeader(s.showHeader)
    if (typeof s.showPageNumbers === 'boolean') setShowPageNumbers(s.showPageNumbers)
  }, [paper?.id])

  async function saveSettingsAndClose() {
    if (!paper?.id) {
      setShowSettings(false)
      return
    }
    setSavingSettings(true)
    try {
      const { data } = await api.put(`/papers/${paper.id}`, {
        print_settings: { ...(paper.print_settings || {}), font, size, spacing, orientation, columnGap, pageFormat, pageMargin, showHeader, showPageNumbers },
      })
      if (data?.paper) {
        setPaper(data.paper)
        usePaperListStore.getState().upsertPaper(data.paper)
      }
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
    setError(null)

    const listStore = usePaperListStore.getState()
    const cached = listStore.byId[id]
    const fetchedAt = listStore.byIdFetchedAt[id]
    const stale = !fetchedAt || Date.now() - fetchedAt > 5 * 60 * 1000

    // Cache-first: render cached paper immediately. Refresh in background
    // when stale; the silent fetch updates the store and we mirror to local
    // state so the preview stays in sync.
    if (cached) {
      setPaper(cached)
      setLoading(false)
      if (stale) {
        listStore.revalidateById(id).then(() => {
          if (cancelled) return
          const fresh = usePaperListStore.getState().byId[id]
          if (fresh) setPaper(fresh)
        })
      }
    } else {
      setLoading(true)
      listStore
        .loadById(id)
        .then((paper) => {
          if (!cancelled) setPaper(paper)
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
    }
    return () => { cancelled = true }
  }, [id, navigate])

  async function handleRefresh() {
    if (!id) return
    const fresh = await usePaperListStore.getState().loadById(id, { force: true, silent: true })
    if (fresh) setPaper(fresh)
  }

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
    // Skip auto-scale if user is manually zooming
    if (manualZoom) return

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
  }, [isLandscape, paper?.id, renderedQuestions.length, font, size, spacing, columnGap, variant, loading, manualZoom])

  // Update preview box when scale changes manually or via pinch
  useEffect(() => {
    if (manualZoom && paperSheetRef.current) {
      const sheet = paperSheetRef.current
      const sheetW = Math.max(
        sheet.offsetWidth,
        sheet.scrollWidth,
        paperRef.current?.scrollWidth || 0,
      )
      const sheetH = Math.max(sheet.offsetHeight, sheet.scrollHeight)
      setPreviewBox({
        width: Math.ceil(sheetW * previewScale),
        height: Math.ceil(sheetH * previewScale) + 8,
      })
    }
  }, [previewScale, manualZoom])

  // Pinch-to-zoom handling for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setInitialPinchDistance(getDistance(e.touches))
      setInitialPinchScale(previewScale)
      setManualZoom(true)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault()
      const currentDistance = getDistance(e.touches)
      const scale = initialPinchScale * (currentDistance / initialPinchDistance)
      const clampedScale = Math.max(0.3, Math.min(2, scale))
      setPreviewScale(clampedScale)
    }
  }

  const handleTouchEnd = () => {
    setInitialPinchDistance(null)
  }

  const getDistance = (touches) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    )
  }

  async function handleDownload() {
    if (!paperRef.current || downloading) return
    setDownloading(true)
    const restore = stripOklchForPdf()
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
              // First: fix oklch/oklab in cloned document
              oklchOnclone()(clonedDoc)

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

              // oklch/oklab already stripped by stripOklchForPdf() above
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
      restore()
      setDownloading(false)
    }
  }

  // Server-side PDF via Puppeteer microservice.
  // Tries once; on failure shows a message asking user to retry later
  // or use the client-side "PDF" button instead.
  async function handleServerDownload() {
    if (!paperRef.current || downloadingServer) return
    setDownloadingServer(true)
    const toastId = toast.loading('PDF তৈরি হচ্ছে…')

    try {
      try { await document.fonts.ready } catch { /* swallow */ }

      const marginMap = {
        none: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        narrow: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
        normal: { top: '14mm', right: '0mm', bottom: '14mm', left: '0mm' },
        wide: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      }
      const { html, filename } = buildPaperHtmlForServerPdf({
        paperNode: paperRef.current,
        paper,
        settings: {
          font, size, spacing, orientation, columnGap,
          pageFormat,
          pageMargin: marginMap[pageMargin] || marginMap.normal,
          showHeader, showPageNumbers,
        },
      })

      // ── Attempt 1: server-side PDF via Render (longer timeout) ────
      // PDF rendering via Puppeteer needs 30-60s. Always route through
      // Render backend which has 90s timeout. Vercel's 60s function
      // limit is too tight and causes 503 errors.
      try {
        const renderPdfUrl = getRenderPdfUrl()
        const baseUrl = renderPdfUrl || api.defaults.baseURL || '/api'
        const pdfUrl = baseUrl.startsWith('http')
          ? `${baseUrl}/pdf-server/papers/${paper.id}`
          : `/api/pdf-server/papers/${paper.id}`
        const token = useAuthStore.getState().token
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        // 120s timeout — generous enough for Render cold start + render
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 120_000)

        const fetchRes = await fetch(pdfUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            html,
            filename: `${paper?.exam_title || 'paper'}${variant ? `_Set-${variant}` : ''}`,
          }),
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (!fetchRes.ok) {
          const errText = await fetchRes.text().catch(() => '')
          throw new Error(`PDF server failed (${fetchRes.status}): ${errText.slice(0, 200)}`)
        }

        const blob = await fetchRes.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        toast.success('সার্ভার PDF ডাউনলোড সম্পন্ন', { id: toastId })
        return // success
      } catch (serverErr) {
        // Server PDF failed — tell user to use client PDF button or retry.
        console.warn('[PDFPreview] server PDF failed:', serverErr.message)
        toast.error('সার্ভার PDF তৈরি হচ্ছে — কিছুক্ষণ পর আবার চেষ্টা করুন অথবা "PDF" বাটনে ক্লিক করুন', { id: toastId, duration: 6000 })
      }
    } catch (err) {
      console.error('[PDFPreview] server download failed:', err)
      let msg = 'PDF ডাউনলোড করা যায়নি'
      if (String(err?.message || '').includes('503')) {
        msg = 'PDF সার্ভার স্টার্ট হচ্ছে — কয়েক মিনিট পর আবার চেষ্টা করুন'
      } else if (String(err?.message || '').includes('504') || String(err?.message || '').includes('timed out')) {
        msg = 'সার্ভার সাড়া দিচ্ছে না — কয়েক মিনিট পর আবার চেষ্টা করুন'
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
    <div className="max-w-4xl mx-auto">
      {/* Top bar — hidden on print */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4 no-print">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Set Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { val: null, label: 'A' },
              { val: 'B', label: 'B' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setVariant(opt.val)}
                className={`px-2 sm:px-3 py-1 rounded-md font-bold transition-colors text-xs ${
                  variant === opt.val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh — pull fresh paper data from server */}
          <RefreshButton
            onRefresh={handleRefresh}
            title="প্রিভিউ রিফ্রেশ"
            size={28}
            style={{ background: '#f3f4f6', border: 'none' }}
            className="sm:!w-9 sm:!h-9"
          />

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press flex-shrink-0"
            title="সেটিংস"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0 relative">

          <button
            onClick={handleDownload}
            disabled={!paper || downloading}
            title="দ্রুত PDF"
            className="px-2 sm:px-3 h-8 sm:h-9 flex items-center gap-0.5 sm:gap-1.5 rounded-lg bg-blue-600 text-white text-[10px] sm:text-xs font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-blue-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{downloading ? '...' : 'PDF'}</span>
          </button>

          <button
            onClick={handleServerDownload}
            disabled={!paper || downloadingServer}
            title="সার্ভার PDF (উচ্চ গুণমান)"
            className="px-2 sm:px-3 h-8 sm:h-9 flex items-center gap-0.5 sm:gap-1.5 rounded-lg bg-violet-600 text-white text-[10px] sm:text-xs font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-violet-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <span>{downloadingServer ? '...' : 'Server'}</span>
          </button>

          <button
            onClick={handleNativePdf}
            disabled={!paper}
            title='Print → Save as PDF'
            className="px-2 sm:px-3 h-8 sm:h-9 flex items-center gap-0.5 sm:gap-1.5 rounded-lg bg-emerald-600 text-white text-[10px] sm:text-xs font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-emerald-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Print</span>
          </button>

          {/* Zoom Controls - Desktop Only */}
          <div className="hidden sm:flex items-center gap-0 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => {
                setManualZoom(true)
                setPreviewScale(Math.max(0.3, previewScale - 0.1))
              }}
              disabled={!paper || previewScale <= 0.3}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-200 btn-press disabled:opacity-40"
              title="Zoom Out"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <span className="px-0.5 sm:px-1 text-[9px] sm:text-[10px] font-bold text-gray-600 min-w-[2rem] sm:min-w-[2.5rem] text-center">
              {Math.round(previewScale * 100)}%
            </span>
            <button
              onClick={() => {
                setManualZoom(true)
                setPreviewScale(Math.min(2, previewScale + 0.1))
              }}
              disabled={!paper || previewScale >= 2}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-200 btn-press disabled:opacity-40"
              title="Zoom In"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            {manualZoom && (
              <div
                onClick={() => {
                  setManualZoom(false)
                  setPreviewScale(1)
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 btn-press cursor-pointer"
                title="Reset to Fit"
              >
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Preview area — neutral desk-like backdrop, equal gap on all 4 sides */}
      <div
        ref={previewWrapRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="rounded-2xl no-print-bg p-0 lg:px-3 lg:py-8"
        style={{
          background: '#e5e7eb',
          minHeight: '60vh',
          overflow: 'auto',
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
              minHeight: '60vh',
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
            pageFormat={pageFormat} setPageFormat={setPageFormat}
            pageMargin={pageMargin} setPageMargin={setPageMargin}
            showHeader={showHeader} setShowHeader={setShowHeader}
            showPageNumbers={showPageNumbers} setShowPageNumbers={setShowPageNumbers}
            paperLayout={paper?.layout || '1-column'}
            examTitle={paper?.exam_title || ''}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PDFSettingsModal({
  onClose, onApply, saving = false,
  font, setFont, size, setSize, spacing, setSpacing,
  orientation, setOrientation, columnGap, setColumnGap,
  pageFormat, setPageFormat, pageMargin, setPageMargin,
  showHeader, setShowHeader, showPageNumbers, setShowPageNumbers,
  paperLayout = '1-column', examTitle = '',
}) {
  const isMultiColumn = paperLayout === '2-column' || paperLayout === '3-column'
  const defaultGapLabel = paperLayout === '3-column' ? '৪ মিমি (ডিফল্ট)' : '৫ মিমি (ডিফল্ট)'

  // Dimensions for each page format (mm) — used for the mini preview icon
  const formatDims = {
    A3: { w: 297, h: 420 }, A4: { w: 210, h: 297 }, A5: { w: 148, h: 210 },
    Legal: { w: 216, h: 356 }, Letter: { w: 216, h: 279 },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 w-full max-w-md shadow-2xl relative my-2"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>

        <h3 className="text-base sm:text-lg font-black mb-3 sm:mb-5 flex items-center gap-2 text-gray-900">
          ⚙️ প্রিন্ট সেটিংস
        </h3>

        <div className="space-y-3 sm:space-y-5 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">

          {/* ─── Page Format ─── */}
          <div>
            <SectionLabel>পেজ সাইজ</SectionLabel>
            <div className="grid grid-cols-5 gap-1">
              {['A3', 'A4', 'A5', 'Legal', 'Letter'].map((fmt) => {
                const active = pageFormat === fmt
                const dims = formatDims[fmt] || formatDims.A4
                const scaleIcon = 32 / Math.max(dims.w, dims.h)
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setPageFormat(fmt)}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg border-2 transition-all btn-press ${
                      active 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    <span
                      className={`block border-2 rounded-[2px] transition-all ${active ? 'border-blue-600' : 'border-gray-300'}`}
                      style={{ width: Math.round(dims.w * scaleIcon * 0.45), height: Math.round(dims.h * scaleIcon * 0.45) }}
                    />
                    <span className="text-[9px] sm:text-[10px] font-bold leading-none">{fmt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── Orientation ─── */}
          <div>
            <SectionLabel>পেজ লেআউট</SectionLabel>
            <div className="grid grid-cols-2 gap-1.5">
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
                    className={`flex flex-col items-center gap-1 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all btn-press ${
                      active 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    <span
                      className={`block border-2 rounded-sm transition-all ${active ? 'border-blue-600' : 'border-gray-400'}`}
                      style={{ width: isPortrait ? 16 : 22, height: isPortrait ? 22 : 16 }}
                    />
                    <span className="text-[10px] sm:text-[12px] font-bold leading-none">{opt.label}</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider opacity-60 leading-none">{opt.sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── Page Margin ─── */}
          <div>
            <SectionLabel>পেজ মার্জিন</SectionLabel>
            <div className="grid grid-cols-4 gap-1">
              {[
                { val: 'none', label: 'কোনো না' },
                { val: 'narrow', label: 'সরু' },
                { val: 'normal', label: 'স্বাভাবিক' },
                { val: 'wide', label: 'প্রশস্ত' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPageMargin(opt.val)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border-2 transition-all btn-press ${
                    pageMargin === opt.val 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'
                  }`}
                >
                  <span className="text-[8px] sm:text-[10px] font-bold leading-none">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 sm:mt-1">পেজের চারধারের ফাঁকা জায়গা নিয়ন্ত্রণ করে</p>
          </div>

          {/* ─── Font Family ─── */}
          <div>
            <SectionLabel>ফন্ট পরিবার</SectionLabel>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-xs sm:text-sm outline-none transition-all"
            >
              <option value="Noto Serif Bengali">Noto Serif Bengali (Classic)</option>
              <option value="Hind Siliguri">Hind Siliguri (Modern)</option>
              <option value="Noto Sans Bengali">Noto Sans Bengali</option>
              <option value="Tiro Bangla">Tiro Bangla (Formal)</option>
            </select>
          </div>

          {/* ─── Font Size ─── */}
          <div>
            <SectionLabel>ফন্ট সাইজ</SectionLabel>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-xs sm:text-sm outline-none transition-all"
            >
              <option value="10pt">ছোট (10pt)</option>
              <option value="11pt">স্বাভাবিক (11pt)</option>
              <option value="12pt">মিডিয়াম (12pt)</option>
              <option value="13pt">বড় (13pt)</option>
              <option value="14pt">অতিরিক্ত বড় (14pt)</option>
            </select>
          </div>

          {/* ─── Line Spacing ─── */}
          <div>
            <SectionLabel>লাইন স্পেসিং</SectionLabel>
            <select
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-xs sm:text-sm outline-none transition-all"
            >
              <option value="1.2">কমপ্যাক্ট (1.2)</option>
              <option value="1.6">স্বাভাবিক (1.6)</option>
              <option value="2.0">আরামদায়ক (2.0)</option>
            </select>
          </div>

          {/* ─── Column Gap (multi-column only) ─── */}
          {isMultiColumn && (
            <div>
              <SectionLabel>কলাম গ্যাপ</SectionLabel>
              <select
                value={columnGap || ''}
                onChange={(e) => setColumnGap(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-xs sm:text-sm outline-none transition-all"
              >
                <option value="">{defaultGapLabel}</option>
                <option value="3mm">টাইট (৩ মিমি)</option>
                <option value="5mm">নরমাল (৫ মিমি)</option>
                <option value="8mm">প্রশস্ত (৮ মিমি)</option>
                <option value="12mm">আরও প্রশস্ত (১২ মিমি)</option>
                <option value="16mm">সর্বোচ্চ (১৬ মিমি)</option>
              </select>
              <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 sm:mt-1">দুই কলামের মাঝখানের ফাঁকা জায়গা</p>
            </div>
          )}

          {/* ─── Header & Footer ─── */}
          <div>
            <SectionLabel>হেডার ও ফুটার</SectionLabel>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-2 sm:px-3 bg-gray-50 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showHeader}
                  onChange={(e) => setShowHeader(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">হেডার দেখান</span>
                  <p className="text-[8px] sm:text-[9px] text-gray-500 truncate max-w-[180px] sm:max-w-[200px]">প্রতি পেজের উপরে: {examTitle || 'পরীক্ষার শিরোনাম'}</p>
                </div>
              </label>
              <label className="flex items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-2 sm:px-3 bg-gray-50 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showPageNumbers}
                  onChange={(e) => setShowPageNumbers(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">পেজ নম্বর</span>
                  <p className="text-[8px] sm:text-[9px] text-gray-500">প্রতি পেজের নিচে ১, ২, ৩… দেখাবে</p>
                </div>
              </label>
            </div>
          </div>

          {/* ─── Apply Button ─── */}
          <div className="pt-1.5 sm:pt-2 pb-1">
            <button
              onClick={onApply || onClose}
              disabled={saving}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 transition-all btn-press text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'সেভ হচ্ছে...' : '✅ প্রয়োগ ও সেভ করুন'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <label className="block text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-1.5">
      {children}
    </label>
  )
}
