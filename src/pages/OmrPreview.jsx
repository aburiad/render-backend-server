import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import OmrTemplate from '@/components/paper/OmrTemplate'
import OmrSettingsModal from '@/components/paper/OmrSettingsModal'
import api, { getRenderPdfUrl } from '@/services/api'
import Loader from '@/components/shared/Loader'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { oklchOnclone } from '@/utils/stripOklchForPdf'

export default function OmrPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const omrRef = useRef(null)
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [omrSettings, setOmrSettings] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadingServer, setDownloadingServer] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/dashboard')
      return
    }
    let cancelled = false
    setLoading(true)
    api
      .get(`/papers/${id}/omr`)
      .then(({ data }) => {
        if (!cancelled) setPaper(data.paper)
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.response?.data?.message || 'OMR জেনারেটর শুধুমাত্র Pro ইউজারদের জন্য।')
          navigate(`/papers/${id}`)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, navigate])

  async function handleDownload() {
    if (!omrRef.current || downloading) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      if (document.fonts) await document.fonts.ready

      const filename = `OMR_${paper?.exam_title || 'sheet'}_${paper?.institution || ''}.pdf`.replace(/[\\/:*?"<>|]/g, '_')

      await html2pdf()
        .set({
          margin: [8, 0, 8, 0],
          filename,
          image: { type: 'png' },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: omrRef.current.offsetWidth,
            onclone: oklchOnclone(),
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css'] },
        })
        .from(omrRef.current)
        .save()
    } catch (err) {
      console.error('[OmrPreview] download failed:', err)
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে')
    } finally {
      setDownloading(false)
    }
  }

  async function handleServerDownload() {
    if (!omrRef.current || downloadingServer) return
    setDownloadingServer(true)
    const toastId = toast.loading('PDF তৈরি হচ্ছে…')
    try {
      try { await document.fonts.ready } catch { /* */ }

      const el = omrRef.current
      const styles = [...document.querySelectorAll('link[rel="stylesheet"],style')].map(s => s.outerHTML).join('\n')

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${styles}
<style>
  @page { size: A4 portrait; margin: 8mm 0; }
  body { margin: 0; padding: 0; }
</style></head><body>${el.outerHTML}</body></html>`

      const filename = `OMR_${paper?.exam_title || 'sheet'}_${paper?.institution || ''}.pdf`.replace(/[\\/:*?"<>|]/g, '_')

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
      console.warn('[OmrPreview] server PDF failed, falling back to client-side:', serverErr.message)
      toast.error('সার্ভার PDF অফলাইন — ক্লায়েন্ট PDF দিয়ে তৈরি হচ্ছে...', { id: toastId, duration: 3000 })
      try { await handleDownload() } catch { /* */ }
    } finally {
      setDownloadingServer(false)
    }
  }

  function handlePrint() {
    if (!omrRef.current) return
    const clone = omrRef.current.cloneNode(true)
    const host = document.createElement('div')
    host.className = 'print-host'
    host.appendChild(clone)
    document.body.appendChild(host)
    document.body.classList.add('is-printing')

    const originalTitle = document.title
    document.title = `OMR_${paper?.exam_title || 'sheet'}`

    const cleanup = () => {
      document.body.classList.remove('is-printing')
      host.remove()
      document.title = originalTitle
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup, { once: true })
    setTimeout(() => window.print(), 50)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      {/* Header bar — same layout as PDFPreview / NoticePreview / RoutinePreview */}
      <div className="flex items-center justify-between gap-2 mb-4 no-print">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link
            to={`/papers/${id}`}
            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-lg font-bold text-gray-900 truncate leading-tight">OMR প্রিভিউ</h1>
            <p className="text-[9px] sm:text-[11px] text-gray-400 truncate leading-tight hidden sm:block">
              {loading ? 'লোড হচ্ছে...' : downloading ? 'PDF তৈরি হচ্ছে...' : 'প্রস্তুত'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
          {/* Settings gear */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 btn-press flex-shrink-0"
            title="OMR সেটিংস"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* PDF button */}
          <button
            onClick={handleDownload}
            disabled={!omrSettings || downloading}
            title="দ্রুত PDF"
            className="px-2.5 sm:px-4 h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-blue-600 text-white text-[11px] sm:text-sm font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-blue-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{downloading ? '...' : 'PDF'}</span>
          </button>

          {/* Server PDF button */}
          <button
            onClick={handleServerDownload}
            disabled={!omrSettings || downloadingServer}
            title="সার্ভার PDF (উচ্চ গুণমান)"
            className="px-2.5 sm:px-4 h-9 flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-violet-600 text-white text-[11px] sm:text-sm font-bold disabled:opacity-40 btn-press shadow-sm sm:shadow-lg shadow-violet-600/25 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            <span>{downloadingServer ? '...' : 'Server'}</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            disabled={!omrSettings}
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

      {/* Preview area — same as NoticePreview / RoutinePreview */}
      <div
        className="rounded-2xl no-print-bg"
        style={{
          background: '#e5e7eb',
          padding: 24,
          minHeight: '60vh',
          overflow: 'auto',
        }}
      >
        {loading || !paper ? (
          <Loader message="OMR প্রিভিউ লোড হচ্ছে..." />
        ) : omrSettings ? (
          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'max-content' }}>
            <div className="paper-sheet-shadow" style={{ flexShrink: 0, padding: '8mm 0' }}>
              <div
                ref={omrRef}
                style={{
                  width: '210mm',
                  padding: '0 8mm',
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                <OmrTemplate paper={paper} settings={omrSettings} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
            <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-lg">ওএমআর সেটিংস সেট করা হয়নি</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              সেটিংস শুরু করুন
            </button>
          </div>
        )}
      </div>

      {/* Settings modal */}
      {paper && (
        <OmrSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(settings) => setOmrSettings(settings)}
          initialData={{
            schoolName: paper.institution || '',
            totalQuestions: paper.questions?.filter(q => q.type === 'MCQ').length || 30
          }}
        />
      )}
    </motion.div>
  )
}