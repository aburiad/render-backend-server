import PaperTemplate from '@/components/paper/PaperTemplate'
import api from '@/services/api'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function PDFPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paperRef = useRef(null)

  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const [variant, setVariant] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [font, setFont] = useState('Noto Serif Bengali')
  const [size, setSize] = useState('12pt')
  const [spacing, setSpacing] = useState('1.6')

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
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: paperRef.current.offsetWidth,
            // KaTeX renders fractions / radicals using absolutely-positioned
            // child spans whose `top` values are em-relative to KaTeX's own
            // line-height (1.2). When the parent paper line-height differs,
            // html2canvas can compute the line box height differently and
            // shift the fraction bar onto the numerator (looks like a
            // strikethrough). The onclone hook below normalizes each .katex
            // node's font-size and line-height to fixed pixel values right
            // before capture, so html2canvas measures KaTeX in the same
            // metric the browser used originally.
            onclone: (clonedDoc) => {
              const orig = paperRef.current
              if (!orig) return
              const origNodes = orig.querySelectorAll('.katex')
              const cloneNodes = clonedDoc.querySelectorAll('.katex')
              for (let i = 0; i < cloneNodes.length; i++) {
                const o = origNodes[i]
                const c = cloneNodes[i]
                if (!o || !c) continue
                const cs = window.getComputedStyle(o)
                c.style.fontSize = cs.fontSize
                c.style.lineHeight = cs.lineHeight
                c.style.display = 'inline-block'
                c.style.verticalAlign = 'middle'
              }
            },
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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

  function handlePrint() {
    // Set the document title so browser uses it as default file name
    const original = document.title
    document.title = `${paper?.exam_title || 'paper'}${variant ? `_Set-${variant}` : ''}`
    setTimeout(() => {
      window.print()
      document.title = original
    }, 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Top bar — hidden on print */}
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            to={`/papers/${id}`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PDF প্রিভিউ</h1>
            <p className="text-[11px] text-gray-400">
              {loading ? 'লোড হচ্ছে...' : error ? 'ত্রুটি' : downloading ? 'PDF তৈরি হচ্ছে...' : 'প্রস্তুত'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-0.5 text-xs">
            {[
              { val: null, label: 'সেট A' },
              { val: 'B', label: 'সেট B' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setVariant(opt.val)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  variant === opt.val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press"
            title="সেটিংস"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={handleDownload}
            disabled={!paper || downloading}
            className="px-4 h-9 flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 btn-press shadow-lg shadow-blue-600/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? '...' : 'PDF'}
          </button>

          <button
            onClick={handlePrint}
            disabled={!paper}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 btn-press"
            title="প্রিন্ট"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.061 48.061 0 0110.5 0m-10.5 0V4.875c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125v3.034" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview area — neutral desk-like backdrop, equal gap on all 4 sides */}
      <div
        className="rounded-2xl no-print-bg"
        style={{
          background: '#e5e7eb',
          padding: '24px',
          minHeight: '60vh',
          overflow: 'auto',
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : paper ? (
          /*
           * Centering trick for content that may be wider than its parent:
           *   - inner uses display:flex + justifyContent:center
           *   - inner has min-width: max-content so it grows to fit the paper
           *   - parent has overflow:auto so it scrolls when needed
           * Result: paper is always centered when there's room, scrollable when not.
           */
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {/*
              Wrapper padding is screen-only. html2pdf captures the inner
              paperRef element which has no top/bottom padding — page-level
              vertical margin is added by jsPDF for every page.
            */}
            <div
              className="paper-sheet-shadow"
              style={{ flexShrink: 0, padding: '14mm 0' }}
            >
              <PaperTemplate
                ref={paperRef}
                paper={{ ...paper, set_variant: variant || paper.set_variant }}
                questions={renderedQuestions}
                font={font}
                size={size}
                spacing={spacing}
              />
            </div>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {showSettings && (
          <PDFSettingsModal
            onClose={() => setShowSettings(false)}
            font={font} setFont={setFont}
            size={size} setSize={setSize}
            spacing={spacing} setSpacing={setSpacing}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PDFSettingsModal({ onClose, font, setFont, size, setSize, spacing, setSpacing }) {
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

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 btn-press text-sm"
            >
              প্রয়োগ করুন
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
