import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function ExamPortal() {
  const { examId } = useParams()
  const [step, setStep] = useState('loading') // loading, entry, exam, finished
  const [exam, setExam] = useState(null)
  const [studentInfo, setStudentInfo] = useState({ name: '', roll: '' })
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const timerRef = useRef(null)
  const submittingRef = useRef(false)
  const startedAtRef = useRef(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    api.get(`/exam/${examId}`).then(({ data }) => {
      if (cancelled) return
      setExam(data.exam)
      setTimeLeft(data.exam.duration * 60)
      setStep('entry')
    }).catch((e) => {
      if (cancelled) return
      toast.error(e.response?.data?.message || 'পরীক্ষা পাওয়া যায়নি')
      setStep('error')
    })
    return () => { cancelled = true }
  }, [examId])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    try {
      const { data } = await api.post(`/exam/${examId}/submit`, {
        studentName: studentInfo.name,
        studentRoll: studentInfo.roll,
        answers,
        startedAt: startedAtRef.current,
      })
      setResult(data.result)
      setStep('finished')
      toast.success('পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে!')
    } catch {
      toast.error('জমা দিতে ব্যর্থ হয়েছে')
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [examId, studentInfo, answers])

  const startExam = () => {
    if (!studentInfo.name.trim()) return toast.error('আপনার নাম লিখুন')
    startedAtRef.current = new Date().toISOString()
    setStep('exam')
    startTimer()
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          setTimeout(() => handleSubmit(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (step === 'loading') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-4 scroll-area">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">পরীক্ষা পাওয়া যায়নি</h1>
          <p className="text-gray-500 text-sm">লিঙ্কটি সঠিক কিনা যাচাই করুন অথবা শিক্ষকের সাথে যোগাযোগ করুন।</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50/50 overflow-y-auto scroll-area">
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto pt-20 px-4"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-gray-900">{exam.title}</h1>
                <p className="text-sm text-gray-500 mt-2">{exam.institution}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  সময়: {exam.duration} মিনিট
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">আপনার নাম</label>
                  <input
                    type="text"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                    placeholder="পুরো নাম লিখুন"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">রোল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={studentInfo.roll}
                    onChange={(e) => setStudentInfo({ ...studentInfo, roll: e.target.value })}
                    placeholder="রোল নম্বর"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <button
                  onClick={startExam}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 btn-press mt-4"
                >
                  পরীক্ষা শুরু করুন
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'exam' && (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32"
          >
            {/* Header / Timer */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{exam.title}</h2>
                  <p className="text-[10px] text-gray-500">{studentInfo.name}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-900 text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
              {exam.questions.map((q, i) => (
                <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium leading-relaxed">
                        {q.question || q.stimulus || q.sentence}
                      </p>
                      {q.sub_questions && (
                         <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-50">
                            {q.sub_questions.map((sq) => (
                              <div key={sq.label} className="space-y-2">
                                <p className="text-sm text-gray-700"><span className="font-bold mr-1">{sq.label}.</span> {sq.text}</p>
                                <textarea
                                  placeholder="উত্তর লিখুন..."
                                  value={answers[`${q.id}_${sq.label}`] || ''}
                                  onChange={(e) => handleAnswerChange(`${q.id}_${sq.label}`, e.target.value)}
                                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all min-h-[60px] outline-none"
                                />
                              </div>
                            ))}
                         </div>
                      )}
                    </div>
                  </div>

                  {q.type === 'MCQ' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {['a', 'b', 'c', 'd'].map((opt, oi) => {
                        const optVal = q[`option_${opt}`]
                        if (!optVal) return null
                        const isSelected = answers[q.id] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => handleAnswerChange(q.id, opt)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-gray-50 border-gray-50 text-gray-700 hover:border-gray-200'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border ${
                              isSelected ? 'bg-white/20 border-white/40' : 'bg-white border-gray-200'
                            }`}>
                              {['ক', 'খ', 'গ', 'ঘ'][oi]}
                            </span>
                            <span className="text-sm font-medium">{optVal}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {(q.type === 'short' || q.type === 'broad' || q.type === 'translation') && (
                    <textarea
                      placeholder="এখানে উত্তর লিখুন..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40">
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 btn-press flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      পরীক্ষা জমা দিন
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto pt-20 px-4 text-center"
          >
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">সাফল্যের সাথে সম্পন্ন!</h1>
                <p className="text-gray-500 text-sm mb-8">আপনার উত্তরপত্রটি শিক্ষকের কাছে জমা দেওয়া হয়েছে।</p>

                {exam.revealResults && (
                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8">
                     <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">আপনার স্কোর (MCQ)</p>
                     <div className="text-5xl font-black text-blue-600">
                        {result.score} <span className="text-xl text-blue-300 font-bold">/ {result.totalPossible}</span>
                     </div>
                     <p className="text-xs text-blue-500 mt-2">অন্যান্য প্রশ্নের নম্বর শিক্ষক পরে যোগ করবেন।</p>
                  </div>
                )}

                <p className="text-xs text-gray-400">আপনি এখন এই ট্যাবটি বন্ধ করতে পারেন।</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
