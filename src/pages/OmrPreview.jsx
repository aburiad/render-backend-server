import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OmrTemplate from '@/components/paper/OmrTemplate'
import OmrSettingsModal from '@/components/paper/OmrSettingsModal'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function OmrPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(true)
  const [omrSettings, setOmrSettings] = useState(null)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!paper) return null

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 print:p-0 print:bg-white overflow-y-auto no-scrollbar">
      {/* Control Bar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white print:hidden">
        <button
          onClick={() => navigate(`/papers/${id}`)}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          title="ফিরে যান"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          title="সেটিংস পরিবর্তন করুন"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <span className="text-sm font-bold text-gray-700">OMR প্রিভিউ</span>
        <button
          onClick={() => window.print()}
          disabled={!omrSettings}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            !omrSettings 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          প্রিন্ট করুন
        </button>
      </div>

      <div className="animate-in fade-in zoom-in duration-500 pb-20">
        {omrSettings ? (
          <OmrTemplate paper={paper} settings={omrSettings} />
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
