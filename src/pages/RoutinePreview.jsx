import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { getRenderPdfUrl } from '@/services/api'
import { stripOklchForPdf, oklchOnclone } from '@/utils/stripOklchForPdf'

import RoutineTemplate from '@/components/routine/RoutineTemplate'
import Loader from '@/components/shared/Loader'
import useAuthStore from '@/store/authStore'

export default function RoutinePreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paperRef = useRef(null)

  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadingServer, setDownloadingServer] = useState(false)
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
    const restore = stripOklchForPdf()
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
            onclone: oklchOnclone(),
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
      restore()
      setDownloading(false)
    }
  }

  async function handleServerDownload() {
    if (!paperRef.current || downloadingServer) return
    setDownloadingServer(true)
    const toastId = toast.loading('PDF তৈরি হচ্ছে…')
    try {
      try { await document.fonts.ready } catch { /* swallow */ }

      const isLandscape = (routine?.orientation || 'landscape') === 'landscape'
      const el = paperRef.current
      const styles = [...document.querySelectorAll('link[rel="stylesheet"],style')].map(s => s.outerHTML).join('\n')

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${styles}
<style>
  @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 12mm; }
  body { margin: 0; padding: 0; }
</style></head><body>${el.outerHTML}</body></html>`

      const filename = `${routine?.class_name || 'routine'}_${routine?.year || ''}.pdf`.replace(/[\\/:*?"<>|]/g, '_')

      const renderPdfUrl = getRenderPdfUrl()
      const baseUrl = renderPdfUrl || api.defaults.baseURL || '/api'
      const pdfUrl = baseUrl.startsWith('http')
        ? `${baseUrl}/pdf-server/render`
        : `/api/pdf-server/render`
      const token = useAuthStore.getState().token
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 120_000)

      const fetchRes = await fetch(pdfUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ html, filename }),
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
    } catch (serverErr) {
      console.warn('[RoutinePreview] server PDF failed, falling back to client-side:', serverErr.message)
      toast.error('সার্ভার PDF অফলাইন — ক্লায়েন্ট PDF দিয়ে তৈরি হচ্ছে...', { id: toastId, duration: 3000 })
      try { await handleDownload() } catch { /* handleDownload shows its own error toast */ }
    } finally {
      setDownloadingServer(false)
    }
  }

  function handlePrint() {
    if (!paperRef.current) return
    const isLandscape = (routine?.orientation || 'landscape') === 'landscape'

    const clone = paperRef.current.cloneNode(true)
    const host = document.createElement('div')
    host.className = 'print-host'
    host.appendChild(clone)
    document.body.appendChild(host)
    document.body.classList.add('is-printing')

    const style = document.createElement('style')
    style.media = 'print'
    style.textContent = `@page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 12mm; }`
    document.head.appendChild(style)

    const originalTitle = document.title
    document.title = routine?.class_name || 'routine'

    const cleanup = () => {
      document.body.classList.remove('is-printing')
      host.remove()
      style.remove()
      document.title = originalTitle
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup, { once: true })

    setTimeout(() => window.print(), 80)
  }

  const isLandscape = (routine?.orientation || 'landscape') === 'landscape'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 no-print">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link to={`/routines/${id}`} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-lg font-bold text-gray-900 truncate leading-tight">রুটিন প্রিভিউ</h1>
            <p className="text-[9px] sm:text-[11px] text-gray-400 truncate leading-tight hidden sm:block">
              {loading ? 'লোড হচ্ছে...' : downloading ? 'PDF তৈরি হচ্ছে...' : 'প্রস্তুত'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-1.5 sm:py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none hidden sm:block"
          >
            <option value="Noto Serif Bengali">Noto Serif</option>
            <option value="Hind Siliguri">Hind Siliguri</option>
            <option value="Noto Sans Bengali">Noto Sans</option>
          </select>

          <button
            onClick={handleDownload}
            disabled={!routine || downloading}
            title="দ্রুত PDF"
            className="px-2.5 sm:px-4 h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-blue-600 text-white text-[11px] sm:text-sm font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-blue-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{downloading ? '...' : 'PDF'}</span>
          </button>

          <button
            onClick={handleServerDownload}
            disabled={!routine || downloadingServer}
            title="সার্ভার PDF (উচ্চ গুণমান)"
            className="px-2.5 sm:px-4 h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-violet-600 text-white text-[11px] sm:text-sm font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-violet-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <span>{downloadingServer ? '...' : 'Server'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!routine}
            title="প্রিন্ট → Save as PDF"
            className="px-2.5 sm:px-4 h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-emerald-600 text-white text-[11px] sm:text-sm font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-emerald-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Print</span>
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
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading || !routine ? (
          <Loader message="রুটিন লোড হচ্ছে..." />
        ) : (
          <div
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              minWidth: '100%',
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