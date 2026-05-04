import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function ExamPublishModal({ paperId, onClose }) {
  const [publishing, setPublishing] = useState(false)
  const [exam, setExam] = useState(null)
  const [config, setConfig] = useState({
    duration: 60,
    revealResults: true,
  })

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const { data } = await api.post('/exam', { paperId, config })
      setExam(data.exam)
      toast.success('পরীক্ষা পাবলিশ হয়েছে!')
    } catch (err) {
      toast.error('পাবলিশ করতে ব্যর্থ হয়েছে')
    } finally {
      setPublishing(false)
    }
  }

  const copyLink = () => {
    const link = `${window.location.origin}/exam/${exam.id}`
    navigator.clipboard.writeText(link)
    toast.success('লিঙ্ক কপি করা হয়েছে!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
      >
        {!exam ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">অনলাইন পরীক্ষা পাবলিশ</h2>
              <p className="text-sm text-gray-500 mt-1">আপনার প্রশ্নপত্রটি এখন ইন্টারঅ্যাকটিভ পরীক্ষায় রূপান্তর করুন</p>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">পরীক্ষার সময় (মিনিট)</label>
                <input 
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
                <input 
                  type="checkbox"
                  checked={config.revealResults}
                  onChange={(e) => setConfig({ ...config, revealResults: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-700">জমা দেওয়ার পর রেজাল্ট দেখান</p>
                  <p className="text-[10px] text-gray-400">স্টুডেন্টরা পরীক্ষা শেষে সাথে সাথেই তাদের স্কোর দেখতে পাবে</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                বাতিল
              </button>
              <button 
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/25 btn-press flex items-center justify-center"
              >
                {publishing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'ইন্সট্যান্ট পাবলিশ'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">অভিনন্দন!</h2>
              <p className="text-sm text-gray-500 mt-1">আপনার পরীক্ষাটি এখন লাইভ। লিঙ্কটি স্টুডেন্টদের সাথে শেয়ার করুন।</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="flex-1 truncate text-xs text-purple-600 font-medium">
                {window.location.origin}/exam/{exam.id}
              </div>
              <button 
                onClick={copyLink}
                className="p-2 bg-white text-purple-600 rounded-xl border border-purple-100 shadow-sm hover:bg-purple-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm btn-press"
            >
              ঠিক আছে
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
