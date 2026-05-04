import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import { toast } from 'react-hot-toast'

const CLASSES = [
  { value: 6, label: 'ক্লাস ৬' },
  { value: 7, label: 'ক্লাস ৭' },
  { value: 8, label: 'ক্লাস ৮' },
  { value: 9, label: 'ক্লাস ৯' },
  { value: 10, label: 'ক্লাস ১০' },
]

const QUESTION_TYPE_OPTIONS = [
  { type: 'MCQ', label: 'MCQ', icon: '○' },
  { type: 'CQ', label: 'সৃজনশীল', icon: '✎' },
  { type: 'short', label: 'সংক্ষিপ্ত', icon: '—' },
  { type: 'broad', label: 'রচনামূলক', icon: '¶' },
  { type: 'fill_blank', label: 'শূন্যস্থান', icon: '___' },
]

export default function BookGenerateModal({ onClose }) {
  const [step, setStep] = useState('select') // select, configure, review
  const [classNum, setClassNum] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapters, setSelectedChapters] = useState([])
  const [questionTypes, setQuestionTypes] = useState(['MCQ'])
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [sourceChapters, setSourceChapters] = useState([])

  const addQuestion = usePaperStore((s) => s.addQuestion)

  // Fetch subjects when class changes
  useEffect(() => {
    if (!classNum) return
    setSubjects([])
    setSelectedSubject(null)
    setChapters([])
    setSelectedChapters([])

    api.get(`/book/subjects/${classNum}`).then(({ data }) => {
      setSubjects(data.subjects || [])
    }).catch(() => toast.error('বিষয় লোড করতে ব্যর্থ'))
  }, [classNum])

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!classNum || !selectedSubject) return
    setChapters([])
    setSelectedChapters([])

    api.get(`/book/chapters/${classNum}/${selectedSubject}`).then(({ data }) => {
      setChapters(data.chapters || [])
    }).catch(() => toast.error('চ্যাপ্টার লোড করতে ব্যর্থ'))
  }, [classNum, selectedSubject])

  const toggleChapter = (id) => {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleGenerate = async () => {
    if (questionTypes.length === 0) {
      toast.error('কমপক্ষে ১টি প্রশ্নের ধরন সিলেক্ট করুন')
      return
    }

    setStep('review')
    setLoading(true)

    try {
      const { data } = await api.post('/book/generate', {
        classNum,
        subject: selectedSubject,
        chapters: selectedChapters,
        questionTypes,
        count,
      })

      if (data.success) {
        setGeneratedQuestions(data.questions)
        setSourceChapters(data.source || [])
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'প্রশ্ন তৈরি করতে ব্যর্থ')
      setStep('configure')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAllToPaper = () => {
    generatedQuestions.forEach((q) => addQuestion(q))
    toast.success(`${generatedQuestions.length} টি প্রশ্ন পেপারে যোগ হয়েছে`)
    onClose()
  }

  const handleAddSingle = (q, idx) => {
    addQuestion(q)
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx))
    toast.success('প্রশ্নটি পেপারে যোগ হয়েছে')
  }

  const canProceed = classNum && selectedSubject && selectedChapters.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
              📚
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">বই থেকে প্রশ্ন</h2>
              <p className="text-xs text-gray-500">
                {step === 'select' ? 'ক্লাস, বিষয় ও চ্যাপ্টার বেছে নিন' :
                 step === 'configure' ? 'প্রশ্নের ধরন ও সংখ্যা ঠিক করুন' :
                 'জেনারেটেড প্রশ্ন রিভিউ করুন'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <AnimatePresence mode="wait">
            {/* Step 1: Select */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Class */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ক্লাস</label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setClassNum(c.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          classNum === c.value
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                {classNum && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">বিষয়</label>
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        এই ক্লাসে এখনো কোনো বিষয় যোগ করা হয়নি
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subjects.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSubject(s.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              selectedSubject === s.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Chapters */}
                {selectedSubject && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        অধ্যায় সমূহ <span className="text-emerald-600">({selectedChapters.length} সিলেক্টেড)</span>
                      </label>
                      {chapters.length > 0 && (
                        <div className="flex gap-2">
                          {selectedChapters.length === chapters.length ? (
                            <button 
                              onClick={() => setSelectedChapters([])}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 px-2 py-1 bg-red-50 rounded-lg border border-red-100"
                            >
                              সব অপশন বাদ দিন
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedChapters(chapters.map(c => c.id))}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100"
                            >
                              সবগুলো সিলেক্ট করুন
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {chapters.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        এই বিষয়ে এখনো কোনো চ্যাপ্টার যোগ করা হয়নি
                      </p>
                    ) : (
                      <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1">
                        {chapters.map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => toggleChapter(ch.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                              selectedChapters.includes(ch.id)
                                ? 'bg-emerald-50 border-2 border-emerald-400 shadow-sm'
                                : 'bg-white border border-gray-200 hover:border-emerald-200'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              selectedChapters.includes(ch.id)
                                ? 'bg-emerald-600 border-emerald-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedChapters.includes(ch.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{ch.title}</p>
                              {ch.type && <p className="text-[10px] text-gray-400 mt-0.5">{ch.type}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Configure */}
            {step === 'configure' && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">প্রশ্নের ধরন (একাধিক বেছে নিন)</label>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => toggleType(opt.type)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          questionTypes.includes(opt.type)
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-xs opacity-70">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    প্রশ্ন সংখ্যা: <span className="text-blue-600 text-sm">{count}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>১</span>
                    <span>১৫</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-medium">
                    📖 {selectedChapters.length} টি চ্যাপ্টার থেকে {count} টি {questionTypes.join(' + ')} প্রশ্ন তৈরি হবে
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
                      <motion.div
                        className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI বই পড়ছে...</h3>
                    <p className="text-sm text-gray-500">চ্যাপ্টারের তথ্য থেকে প্রশ্ন তৈরি হচ্ছে</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sourceChapters.length > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 inline-block mb-2">
                        📖 সোর্স: {sourceChapters.join(', ')}
                      </p>
                    )}
                    {generatedQuestions.map((q, i) => (
                      <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-300">#{i + 1}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                              {q.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddSingle(q, i)}
                            className="px-3 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            + পেপারে যোগ
                          </button>
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {q.question || q.stimulus || q.sentence?.replace(/___/g, '______') || 'প্রশ্ন'}
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
                        {q.option_a && (
                          <div className="grid grid-cols-2 gap-1 mt-2 pl-4 text-[11px] text-gray-500">
                            <span>ক) {q.option_a}</span>
                            <span>খ) {q.option_b}</span>
                            <span>গ) {q.option_c}</span>
                            <span>ঘ) {q.option_d}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {generatedQuestions.length === 0 && !loading && (
                      <div className="text-center py-10 text-gray-400">
                        <p className="text-sm font-medium">কোনো প্রশ্ন তৈরি হয়নি</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          {step === 'select' && (
            <>
              <div />
              <button
                onClick={() => setStep('configure')}
                disabled={!canProceed}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/25 btn-press disabled:opacity-40 disabled:shadow-none transition-all text-sm"
              >
                পরবর্তী →
              </button>
            </>
          )}

          {step === 'configure' && (
            <>
              <button
                onClick={() => setStep('select')}
                className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
              >
                ← পেছনে
              </button>
              <button
                onClick={handleGenerate}
                disabled={questionTypes.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/25 btn-press disabled:opacity-40 text-sm"
              >
                🤖 প্রশ্ন তৈরি করুন
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={() => { setStep('configure'); setGeneratedQuestions([]) }}
                disabled={loading}
                className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm disabled:opacity-40"
              >
                ← আবার চেষ্টা
              </button>
              <button
                onClick={handleAddAllToPaper}
                disabled={loading || generatedQuestions.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 btn-press disabled:opacity-40 text-sm"
              >
                সবগুলো পেপারে যোগ করুন
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
