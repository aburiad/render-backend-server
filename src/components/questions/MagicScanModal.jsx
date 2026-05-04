import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import { toast } from 'react-hot-toast'

export default function MagicScanModal({ onClose }) {
  const [step, setStep] = useState('upload') // upload, processing, review
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savingBankIdx, setSavingBankIdx] = useState(null)
  
  const updateExtractedQuestion = (idx, fields) => {
    const newQuestions = [...extractedQuestions]
    newQuestions[idx] = { ...newQuestions[idx], ...fields }
    setExtractedQuestions(newQuestions)
  }

  const deleteExtractedQuestion = (idx) => {
    setExtractedQuestions(extractedQuestions.filter((_, i) => i !== idx))
  }

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-100'
    if (score >= 0.7) return 'text-amber-600 bg-amber-50 border-amber-100'
    return 'text-red-600 bg-red-50 border-red-100'
  }
  const fileInputRef = useRef(null)
  
  const addQuestion = usePaperStore(s => s.addQuestion)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const postScanOnce = () =>
    api.post('/ai/scan', { image: imagePreview }, { timeout: 240000 })

  const startScan = async () => {
    if (!imagePreview) return

    setStep('processing')
    setLoading(true)

    const isRetryable = (err) => {
      const status = err.response?.status
      if (status === 502 || status === 503 || status === 504 || status === 408) return true
      if (err.code === 'ECONNABORTED') return true
      const msg = err.message || ''
      if (/timeout|network/i.test(msg) || err.code === 'ERR_NETWORK') return true
      return false
    }

    try {
      let data
      try {
        ;({ data } = await postScanOnce())
      } catch (firstErr) {
        if (isRetryable(firstErr)) {
          toast.loading('আবার চেষ্টা করছি…', { id: 'scan-retry' })
          await new Promise((r) => setTimeout(r, 1500))
          ;({ data } = await postScanOnce())
          toast.dismiss('scan-retry')
        } else {
          throw firstErr
        }
      }
      if (data.success) {
        setExtractedQuestions(data.questions)
        setStep('review')
      }
    } catch (err) {
      toast.dismiss('scan-retry')
      toast.error(err.response?.data?.message || 'স্ক্যান করতে ব্যর্থ হয়েছে')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPaper = () => {
    extractedQuestions.forEach(q => addQuestion(q))
    toast.success(`${extractedQuestions.length} টি প্রশ্ন যোগ করা হয়েছে`)
    onClose()
  }

  const handleSaveToBank = async (q, idx) => {
    setSavingBankIdx(idx)
    try {
      await api.post('/questions', {
        type: q.type,
        data: q,
        subject: '',
        chapter: q.section || '',
      })
      toast.success('ব্যাংক-এ সেভ হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'সেভ করতে ব্যর্থ')
    } finally {
      setSavingBankIdx(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.712L18 9.75l-.259-1.038a3.375 3.375 0 00-2.453-2.453L14.25 6l1.038-.259a3.375 3.375 0 002.453-2.453L18 2.25l.259 1.038a3.375 3.375 0 002.453 2.453L21.75 6l-1.038.259a3.375 3.375 0 00-2.453 2.453z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI ম্যাজিক স্ক্যান</h2>
              <p className="text-xs text-gray-500">প্রশ্নপত্র থেকে মুহূর্তেই প্রশ্ন তৈরি করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {step === 'upload' && (
            <div className="max-w-md mx-auto">
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">ছবি আপলোড করুন</p>
                  <p className="text-xs text-gray-400 mt-1">ক্যামেরা বা গ্যালারি থেকে প্রশ্নপত্রের ছবি দিন</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                    <button 
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-gray-900/50 text-white rounded-lg backdrop-blur-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    onClick={startScan}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 btn-press"
                  >
                    স্ক্যান শুরু করুন
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI ম্যাজিক কাজ করছে...</h3>
              <p className="text-sm text-gray-500">আপনার প্রশ্নপত্র থেকে প্রশ্নগুলো আলাদা করা হচ্ছে</p>
              
              <div className="mt-8 space-y-3 w-64">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  টেক্সট পড়া শেষ
                </motion.div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-100 border-t-blue-400 animate-spin" />
                  প্রশ্ন সাজানো হচ্ছে
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
              {/* Left: Image Side */}
              <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden relative group">
                <img src={imagePreview} alt="Original" className="w-full h-full object-contain bg-gray-900" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900/50 text-white text-[10px] rounded-full backdrop-blur-md">
                  মূল ছবি
                </div>
              </div>

              {/* Right: Questions Side */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                  <h4 className="font-bold text-gray-900">এক্সট্রাক্টেড প্রশ্ন ({extractedQuestions.length})</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    AI জেনারেটেড
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                  {extractedQuestions.map((q, i) => (
                    <div key={i} className={`p-4 bg-white rounded-2xl border transition-all ${editingIndex === i ? 'border-blue-400 ring-2 ring-blue-50 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                      {editingIndex === i ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">প্রশ্ন টেক্সট</label>
                            <textarea 
                              className="w-full mt-1 p-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                              value={q.question || q.stimulus || ''}
                              onChange={(e) => updateExtractedQuestion(i, q.type === 'CQ' ? { stimulus: e.target.value } : { question: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1">
                               <label className="text-[10px] font-bold text-gray-400 uppercase">নম্বর</label>
                               <input 
                                 type="number"
                                 className="w-full mt-1 p-2 text-sm border border-gray-200 rounded-xl outline-none"
                                 value={q.marks || 0}
                                 onChange={(e) => updateExtractedQuestion(i, { marks: e.target.value })}
                               />
                             </div>
                             <div className="flex items-end">
                               <button 
                                 onClick={() => setEditingIndex(null)}
                                 className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl btn-press"
                               >
                                 ঠিক আছে
                               </button>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-300">#{i + 1}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceColor(q.confidence || 0.8)}`}>
                                {q.type} • {Math.round((q.confidence || 0.8) * 100)}% Match
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleSaveToBank(q, i)}
                                disabled={savingBankIdx === i}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                                  savingBankIdx === i 
                                    ? 'bg-blue-50 text-blue-400' 
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white shadow-sm'
                                }`}
                                title="ব্যাংক-এ সেভ করুন"
                              >
                                {savingBankIdx === i ? (
                                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    <span className="text-[10px] font-bold">ব্যাংকে সেভ</span>
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => setEditingIndex(i)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="এডিট করুন"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => deleteExtractedQuestion(i)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="ডিলিট করুন"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">
                            {q.question || q.stimulus || (q.sentence?.replace(/___/g, '______')) || 'প্রশ্ন খুঁজে পাওয়া যায়নি'}
                          </p>
                          {q.sub_questions && (
                            <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-100">
                              {q.sub_questions.map((sq, si) => (
                                <p key={si} className="text-[11px] text-gray-500">
                                  <span className="font-bold mr-1">{sq.label}.</span> {sq.text}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                  <button 
                    onClick={handleAddToPaper}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 btn-press"
                  >
                    সবগুলো পেপারে যোগ করুন
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-2">
                    *যোগ করার পর আপনি এডিট করতে পারবেন
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
