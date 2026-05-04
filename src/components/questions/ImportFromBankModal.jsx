import { useState, useEffect } from 'react'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { TYPE_LABELS, TYPE_COLORS } from '@/components/questions/QuestionWrapper'

export default function ImportFromBankModal({ onClose, onImport }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get('/questions')
      setQuestions(data.questions)
    } catch (err) {
      toast.error('ব্যাংক লোড করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleImport = () => {
    const selected = questions.filter(q => selectedIds.has(q.id))
    onImport(selected.map(q => q.data)) // Extract the data object which contains the question fields
    onClose()
  }

  const filtered = questions.filter(q => 
    !search || 
    (q.data?.question?.toLowerCase().includes(search.toLowerCase())) ||
    (q.data?.stimulus?.toLowerCase().includes(search.toLowerCase()))
  )

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
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">প্রশ্ন ব্যাংক থেকে ইমপোর্ট</h2>
            <p className="text-xs text-gray-500">{questions.length} টি প্রশ্নের মধ্যে {selectedIds.size} টি সিলেক্ট করা হয়েছে</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="প্রশ্ন খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">কোনো প্রশ্ন পাওয়া যায়নি</p>
            </div>
          ) : (
            filtered.map((q) => (
              <div 
                key={q.id}
                onClick={() => toggleSelect(q.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedIds.has(q.id) 
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors mt-0.5 ${
                    selectedIds.has(q.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-200 group-hover:border-blue-300'
                  }`}>
                    {selectedIds.has(q.id) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${TYPE_COLORS[q.type]}`}>
                        {TYPE_LABELS[q.type]}
                      </span>
                      {q.subject && <span className="text-[9px] text-gray-400"># {q.subject}</span>}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {q.data?.question || q.data?.stimulus || q.data?.sentence || "প্রশ্ন উপাত্ত নেই"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            বাতিল
          </button>
          <button 
            onClick={handleImport}
            disabled={selectedIds.size === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 disabled:opacity-50 btn-press"
          >
            {selectedIds.size} টি প্রশ্ন যোগ করুন
          </button>
        </div>
      </motion.div>
    </div>
  )
}
