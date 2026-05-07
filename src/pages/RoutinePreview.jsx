import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import RoutineTemplate from '@/components/routine/RoutineTemplate'

export default function RoutinePreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paperRef = useRef(null)

  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [font, setFont] = useState('Noto Serif Bengali')

  useEffect(() => {
    if (!id) {
      navigate('/routines')
      return
    }
    let cancelled = false
    setLoading(true)
    api
      .get(`/routines/${id}`)
      .then(({ data }) => { if (!cancelled) setRoutine(data.routine) })
      .catch(() => {
        if (!cancelled) {
          toast.error('রুটিন লোড করতে ব্যর্থ')
          navigate('/routines')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, navigate])

  async function handleDownload() {
    if (!paperRef.current || downloading) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default

      if (document.fonts) {
        await Promise.all([
          document.fonts.load(`400 16px "${font}"`),
          document.fonts.load(`700 16px "${font}"`),
          document.fonts.load(`400 16px "Hind Siliguri"`),
        ])
        await document.fonts.ready
      }

      const filename = `${routine?.class_name || 'routine'}_${routine?.year || ''}.pdf`.replace(
        /[\\/:*?"<>|]/g,
        '_',
      )

      const isLandscape = (routine?.orientation || 'landscape') === 'landscape'

      await html2pdf()
        .set({
          margin: [12, 0, 12, 0],
          filename,
          image: { type: 'png' },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: paperRef.current.offsetWidth,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: isLandscape ? 'landscape' : 'portrait',
          },
          pagebreak: { mode: ['css'] },
        })
        .from(paperRef.current)
        .save()
    } catch (err) {
      console.error('[RoutinePreview] download failed:', err)
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে')
    } finally {
      setDownloading(false)
    }
  }

  function handlePrint() {
    // Browsers don't reliably honor named @page rules tied to a specific
    // class — Safari ignores them entirely, mobile Chrome treats them as
    // hints. Inject a print-only <style> with the correct @page size right
    // before window.print(), then remove it after the dialog closes.
    const isLandscape = (routine?.orientation || 'landscape') === 'landscape'
    const styleId = 'routine-print-orientation'
    document.getElementById(styleId)?.remove()

    const style = document.createElement('style')
    style.id = styleId
    style.media = 'print'
    // Symmetric 12mm margin so inner area matches the template width:
    //   landscape: 297mm − 24mm = 273mm  (matches template width 273mm)
    //   portrait:  210mm − 24mm = 186mm  (matches template width 186mm)
    style.textContent = `@page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 12mm; }`
    document.head.appendChild(style)

    const original = document.title
    document.title = routine?.class_name || 'routine'

    // Small delay so the injected @page rule is parsed before printing.
    setTimeout(() => {
      window.print()
      document.title = original
      // Strip the injected rule a bit later — print dialog may still be
      // active; immediate removal sometimes resets orientation mid-print.
      setTimeout(() => style.remove(), 2000)
    }, 80)
  }

  const isLandscape = (routine?.orientation || 'landscape') === 'landscape'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-3">
          <Link to={`/routines/${id}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">রুটিন প্রিভিউ</h1>
            <p className="text-[11px] text-gray-400">
              {loading ? 'লোড হচ্ছে...' : downloading ? 'PDF তৈরি হচ্ছে...' : 'প্রস্তুত'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="text-xs px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="Noto Serif Bengali">Noto Serif Bengali</option>
            <option value="Hind Siliguri">Hind Siliguri</option>
            <option value="Noto Sans Bengali">Noto Sans Bengali</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={!routine || downloading}
            className="px-4 h-9 flex items-center gap-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 btn-press shadow-lg shadow-blue-600/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? '...' : 'PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={!routine}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200"
            title="প্রিন্ট"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.061 48.061 0 0110.5 0m-10.5 0V4.875c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125v3.034" />
            </svg>
          </button>
        </div>
      </div>

      {isLandscape && (
        <div className="lg:hidden flex items-center justify-center gap-1.5 text-[11px] text-gray-500 -mb-1 no-print">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m0 0l-6-6m6 6l-6 6" />
          </svg>
          ডানে স্ক্রল করুন
        </div>
      )}
      <div
        className="rounded-2xl no-print-bg routine-preview-scroll"
        style={{
          background: '#e5e7eb',
          padding: 16,
          minHeight: '60vh',
          overflowX: 'auto',
          overflowY: 'auto',
          // Make scrollbar visible on mobile webkit browsers (default = auto-hide)
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading || !routine ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              minWidth: '100%',
              // inline-flex + min-width 100% means: when content is wider than
              // container, the wrapper grows to content width (causing scroll);
              // when narrower, it stays at 100% so content stays centered.
            }}
          >
            <div className="paper-sheet-shadow" style={{ flexShrink: 0, padding: '12mm 0', margin: '0 auto' }}>
              <div
                ref={paperRef}
                style={{
                  width: isLandscape ? '297mm' : '210mm',
                  padding: '0 12mm',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                <RoutineTemplate routine={routine} font={font} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
