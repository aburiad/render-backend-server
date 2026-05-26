import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OmrTemplate from '@/components/paper/OmrTemplate'
import OmrSettingsModal from '@/components/paper/OmrSettingsModal'
import api from '@/services/api'
import Loader from '@/components/shared/Loader'
import toast from 'react-hot-toast'
import { stripOklchForPdf } from '@/utils/stripOklchForPdf'

export default function OmrPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const omrRef = useRef(null)
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [omrSettings, setOmrSettings] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchPaper()
  }, [id])

  const fetchPaper = async () => {
    try {
      const { data } = await api.get(`/papers/${id}/omr`)
      setPaper(data.paper)
    } catch (err) {
      toast.error(err.response?.data?.message || 'OMR জেনারেটর শুধুমাত্র Pro ইউজারদের জন্য।')
      navigate(`/papers/${id}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!omrRef.current || downloading) return
    setDownloading(true)
    const restore = stripOklchForPdf()
    try {
      const html2pdf = (await import('html2pdf.js')).default

      if (document.fonts) {
        await document.fonts.ready
      }

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
      restore()
      setDownloading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader message="OMR প্রিভিউ লোড হচ্ছে..." />
      </div>
    )
  }

  if (!paper) return null

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 print:p-0 print:bg-white overflow-y-auto no-scrollbar">
      {/* Control Bar */}
      <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 sm:gap-2 bg-white/85 backdrop-blur-md px-2 sm:px-5 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border border-white print:hidden max-w-[calc(100vw-16px)]">
        <button
          onClick={() => navigate(`/papers/${id}`)}
          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
          title="ফিরে যান"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <div className="h-5 sm:h-6 w-px bg-gray-200" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
          title="সেটিংস পরিবর্তন করুন"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <span className="hidden sm:inline text-sm font-bold text-gray-700">OMR প্রিভিউ</span>

        <button
          onClick={handleDownload}
          disabled={!omrSettings || downloading}
          className={`flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all flex-shrink-0 ${
            !omrSettings || downloading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white shadow-md sm:shadow-lg shadow-blue-500/20 hover:bg-blue-700'
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {downloading ? '...' : 'PDF'}
        </button>

        <button
          onClick={handlePrint}
          disabled={!omrSettings}
          className={`flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm transition-all flex-shrink-0 ${
            !omrSettings
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white shadow-md sm:shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Print
        </button>
      </div>

      <div className="animate-in fade-in zoom-in duration-500 pb-20">
        {omrSettings ? (
          <div
            className="omr-scale-wrap no-scrollbar"
            style={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pan-y',
            }}
          >
            <div ref={omrRef}>
              <OmrTemplate paper={paper} settings={omrSettings} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-400 gap-4">
            <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-lg">ওএমআর সেটিংস সেট করা হয়নি</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              সেটিংস শুরু করুন
            </button>
          </div>
        )}
      </div>

      <OmrSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(settings) => setOmrSettings(settings)}
        initialData={{
          schoolName: paper.institution || '',
          totalQuestions: paper.questions?.filter(q => q.type === 'MCQ').length || 30
        }}
      />
    </div>
  )
}