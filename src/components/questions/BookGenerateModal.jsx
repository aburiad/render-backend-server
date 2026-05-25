import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import { toast } from 'react-hot-toast'
import { MathText } from '@/utils/mathRender'
import Spinner from '@/components/shared/Spinner'

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
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [chapters, setChapters] = useState([])
  const [chaptersLoading, setChaptersLoading] = useState(false)

  // Selections: { chapterId: { subchapterIds: Set, count: number } }
  // Use 'all' marker in subchapterIds Set to mean "whole chapter"
  const [selections, setSelections] = useState({})
  const [subchapterCache, setSubchapterCache] = useState({})
  const [expanded, setExpanded] = useState({})

  const [mode, setMode] = useState('existing') // 'existing' | 'ai'
  const [questionTypes, setQuestionTypes] = useState(['MCQ'])
  const [loading, setLoading] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [sourceChapters, setSourceChapters] = useState([])
  const [resultMeta, setResultMeta] = useState(null)

  // Smart prompt state
  const [smartPrompt, setSmartPrompt] = useState('')
  const [smartLoading, setSmartLoading] = useState(false)

  const addQuestion = usePaperStore((s) => s.addQuestion)

  // Fetch subjects when class changes
  useEffect(() => {
    if (!classNum) return
    setSubjects([])
    setSelectedSubject(null)
    setChapters([])
    setSelections({})
    setSubchapterCache({})
    setExpanded({})
    setSubjectsLoading(true)

    api
      .get(`/book/subjects/${classNum}`)
      .then(({ data }) => {
        setSubjects(data.subjects || [])
      })
      .catch(() => toast.error('বিষয় লোড করতে ব্যর্থ'))
      .finally(() => setSubjectsLoading(false))
  }, [classNum])

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!classNum || !selectedSubject) return
    setChapters([])
    setSelections({})
    setSubchapterCache({})
    setExpanded({})
    setChaptersLoading(true)

    api
      .get(`/book/chapters/${classNum}/${selectedSubject}`)
      .then(({ data }) => {
        setChapters(data.chapters || [])
      })
      .catch(() => toast.error('চ্যাপ্টার লোড করতে ব্যর্থ'))
      .finally(() => setChaptersLoading(false))
  }, [classNum, selectedSubject])

  // --- Selection helpers ---
  const isChapterSelected = (id) => Boolean(selections[id])
  const isAllSelected = (id) => selections[id]?.subchapterIds.has('all')
  const isSubchapterSelected = (chapterId, subId) => {
    const sel = selections[chapterId]
    if (!sel) return false
    return sel.subchapterIds.has('all') || sel.subchapterIds.has(subId)
  }

  const toggleChapterAll = (chapterId) => {
    setSelections((prev) => {
      const next = { ...prev }
      if (next[chapterId] && next[chapterId].subchapterIds.has('all')) {
        delete next[chapterId]
      } else {
        next[chapterId] = { subchapterIds: new Set(['all']), count: 5 }
      }
      return next
    })
  }

  const toggleSubchapter = (chapterId, subId) => {
    setSelections((prev) => {
      const next = { ...prev }
      let cur = next[chapterId]
      if (!cur) {
        cur = { subchapterIds: new Set([subId]), count: 5 }
      } else if (cur.subchapterIds.has('all')) {
        // "all" mode → expand to explicit list, then uncheck the clicked one
        const allSubs = subchapterCache[chapterId] || []
        const explicit = new Set(allSubs.map((s) => s.id))
        explicit.delete(subId)
        cur = { ...cur, subchapterIds: explicit }
      } else {
        cur = { ...cur, subchapterIds: new Set(cur.subchapterIds) }
        if (cur.subchapterIds.has(subId)) cur.subchapterIds.delete(subId)
        else cur.subchapterIds.add(subId)
      }
      if (cur.subchapterIds.size === 0) delete next[chapterId]
      else next[chapterId] = cur
      return next
    })
  }

  const setChapterCount = (chapterId, count) => {
    setSelections((prev) => {
      const cur = prev[chapterId]
      if (!cur) return prev
      return { ...prev, [chapterId]: { ...cur, count: Math.max(1, Math.min(20, count)) } }
    })
  }

  const toggleExpand = async (chapterId) => {
    setExpanded((p) => ({ ...p, [chapterId]: !p[chapterId] }))
    if (!subchapterCache[chapterId]) {
      try {
        const { data } = await api.get(
          `/book/subchapters/${classNum}/${selectedSubject}/${chapterId}`,
        )
        setSubchapterCache((p) => ({ ...p, [chapterId]: data.subchapters || [] }))
      } catch {
        toast.error('সাবচ্যাপ্টার লোড করতে ব্যর্থ')
      }
    }
  }

  const toggleType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  // --- Build API selections ---
  const apiSelections = Object.entries(selections).map(([chapterId, sel]) => ({
    chapterId,
    subchapterIds: [...sel.subchapterIds],
    count: sel.count,
  }))
  const totalSelected = apiSelections.length
  const totalCount = apiSelections.reduce((s, x) => s + x.count, 0)

  const handleGenerate = async () => {
    if (mode === 'ai' && questionTypes.length === 0) {
      toast.error('কমপক্ষে ১টি প্রশ্নের ধরন সিলেক্ট করুন')
      return
    }

    setStep('review')
    setLoading(true)
    setGeneratedQuestions([])
    setResultMeta(null)

    try {
      if (mode === 'existing') {
        const { data } = await api.post('/book/existing-questions', {
          classNum,
          subject: selectedSubject,
          selections: apiSelections.map(({ chapterId, subchapterIds, count }) => ({
            chapterId,
            subchapterIds,
            count,
          })),
          filters: { types: questionTypes.map((t) => t.toLowerCase()) },
        })
        // Refresh credit balance widgets across the app.
        window.dispatchEvent(new CustomEvent('credits-changed'))
        // Normalize existing question shape to match generated shape
        const normalized = (data.questions || []).map((q) => {
          const d = q.data || {}
          if (q.type === 'mcq') {
            return {
              type: 'MCQ',
              question: d.question,
              option_a: d.options?.['ক'] || d.options?.['i'],
              option_b: d.options?.['খ'] || d.options?.['ii'],
              option_c: d.options?.['গ'] || d.options?.['iii'],
              option_d: d.options?.['ঘ'],
              _source: q.source,
              _id: q.id,
            }
          }
          if (q.type === 'cq') {
            return {
              type: 'CQ',
              stimulus: d.scenario,
              question: d.scenario,
              sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({
                label: k,
                text: v,
              })),
              _source: q.source,
              _id: q.id,
            }
          }
          // SAQ
          return {
            type: 'short',
            question: d.question,
            sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({
              label: k,
              text: v,
            })),
            _source: q.source,
            _id: q.id,
          }
        })
        setGeneratedQuestions(normalized)
        setSourceChapters(
          chapters.filter((c) => selections[c.id]).map((c) => c.title),
        )
        setResultMeta({ source: 'book', count: data.count })
        if (normalized.length === 0) {
          toast('সিলেক্ট করা অংশে কোনো প্রশ্ন পাওয়া যায়নি — credit ফেরত', {
            icon: 'ℹ️',
          })
        } else if (data.requestedCount && data.count < data.requestedCount) {
          toast(
            `${data.requestedCount}টির মধ্যে ${data.count}টি প্রশ্ন পাওয়া গেছে`,
            { icon: 'ℹ️', duration: 3500 },
          )
        }
      } else {
        // AI mode
        const { data } = await api.post('/book/generate', {
          classNum,
          subject: selectedSubject,
          selections: apiSelections.map(({ chapterId, subchapterIds }) => ({
            chapterId,
            subchapterIds,
          })),
          questionTypes,
          count: Math.min(totalCount, 15),
        })
        if (data.success) {
          setGeneratedQuestions(data.questions)
          setSourceChapters(data.sourceChapters || [])
          setResultMeta({
            source: 'ai',
            provider: data.provider,
            keySource: data.keySource,
          })
          window.dispatchEvent(new CustomEvent('credits-changed'))
        }
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

  // --- Smart prompt handler ---
  const handleSmartPrompt = async () => {
    if (!smartPrompt.trim()) return
    setSmartLoading(true)
    setStep('review')
    setLoading(true)
    setGeneratedQuestions([])
    setResultMeta(null)

    try {
      const { data } = await api.post('/book/smart-prompt', {
        prompt: smartPrompt.trim(),
      })
      window.dispatchEvent(new CustomEvent('credits-changed'))
      const normalized = (data.questions || []).map((q) => {
        const d = q.data || {}
        if (q.type === 'mcq') {
          return {
            type: 'MCQ',
            question: d.question,
            option_a: d.options?.['ক'] || d.options?.['i'],
            option_b: d.options?.['খ'] || d.options?.['ii'],
            option_c: d.options?.['গ'] || d.options?.['iii'],
            option_d: d.options?.['ঘ'],
            _source: q.source,
            _id: q.id,
          }
        }
        if (q.type === 'cq') {
          return {
            type: 'CQ',
            stimulus: d.scenario,
            question: d.scenario,
            sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({
              label: k,
              text: v,
            })),
            _source: q.source,
            _id: q.id,
          }
        }
        return {
          type: 'short',
          question: d.question,
          sub_questions: Object.entries(d.parts || {}).map(([k, v]) => ({
            label: k,
            text: v,
          })),
          _source: q.source,
          _id: q.id,
        }
      })
      setGeneratedQuestions(normalized)
      setSourceChapters(data.sourceChapters || [])
      setResultMeta({ source: 'smart', count: data.count })
      if (normalized.length === 0) {
        toast('কোনো প্রশ্ন পাওয়া যায়নি', { icon: 'ℹ️' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'স্মার্ট প্রশ্ন তৈরি করতে ব্যর্থ')
      setStep('select')
    } finally {
      setLoading(false)
      setSmartLoading(false)
    }
  }

  const canProceed = classNum && selectedSubject && totalSelected > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8">
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
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0">
              📚
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 truncate">বই থেকে প্রশ্ন</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                {step === 'select'
                  ? 'ক্লাস, বিষয় ও অধ্যায় বেছে নিন'
                  : step === 'configure'
                    ? 'উৎস ও ধরন ঠিক করুন'
                    : 'প্রশ্ন রিভিউ করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
          <AnimatePresence mode="wait">
            {/* Step 1: Select */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3 sm:space-y-5"
              >
                {/* Class */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    ক্লাস
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLASSES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setClassNum(c.value)}
                        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
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

                {/* ✨ Smart Prompt */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    ✨ স্মার্ট প্রশ্ন
                    <span className="normal-case tracking-normal font-medium text-gray-300 ml-1.5">
                      — অথবা নিচে থেকে সিলেক্ট করুন
                    </span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={smartPrompt}
                      onChange={(e) => setSmartPrompt(e.target.value)}
                      placeholder="যেমন: class 8 er 2 no chapter theke 10 ta creative question daw"
                      rows={2}
                      className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder:text-gray-300"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400">
                        💡 বাংলা বা ইংরেজিতে লিখুন — AI বুঝে নেবে
                      </p>
                      <button
                        onClick={handleSmartPrompt}
                        disabled={!smartPrompt.trim() || smartLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-lg shadow-purple-600/25 btn-press disabled:opacity-40 disabled:shadow-none transition-all text-xs flex items-center gap-1.5"
                      >
                        {smartLoading ? (
                          <>
                            <Spinner size={12} color="#fff" />
                            আনছি...
                          </>
                        ) : (
                          <>🤖 প্রশ্ন আনো</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase">অথবা</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Subject */}
                {classNum && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      বিষয়
                    </label>
                    {subjectsLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4 bg-white rounded-xl border border-dashed border-gray-200">
                        <Spinner size={16} color="#10b981" />
                        <p className="text-xs text-gray-500 font-medium">বিষয় লোড হচ্ছে...</p>
                      </div>
                    ) : subjects.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        এই ক্লাসে এখনো কোনো বিষয় যোগ করা হয়নি
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subjects.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSubject(s.id)}
                            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
                        অধ্যায় সমূহ{' '}
                        <span className="text-emerald-600">
                          ({totalSelected} সিলেক্টেড)
                        </span>
                      </label>
                    </div>
                    {chaptersLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4 bg-white rounded-xl border border-dashed border-gray-200">
                        <Spinner size={16} color="#10b981" />
                        <p className="text-xs text-gray-500 font-medium">অধ্যায় লোড হচ্ছে...</p>
                      </div>
                    ) : chapters.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        এই বিষয়ে এখনো কোনো চ্যাপ্টার যোগ করা হয়নি
                      </p>
                    ) : (
                      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {chapters.map((ch) => {
                          const isSel = isChapterSelected(ch.id)
                          const isAll = isAllSelected(ch.id)
                          const isExp = expanded[ch.id]
                          // `undefined` means we haven't fetched yet (loading).
                          // `[]` means fetched-and-empty (no subchapters exist).
                          const subsFetched = Object.prototype.hasOwnProperty.call(
                            subchapterCache,
                            ch.id,
                          )
                          const subs = subchapterCache[ch.id] || []
                          const selSubCount = isSel
                            ? [...selections[ch.id].subchapterIds].filter(
                                (x) => x !== 'all',
                              ).length
                            : 0
                          return (
                            <div
                              key={ch.id}
                              className={`rounded-xl transition-all ${
                                isSel
                                  ? 'bg-emerald-50 border-2 border-emerald-400 shadow-sm'
                                  : 'bg-white border border-gray-200 hover:border-emerald-200'
                              }`}
                            >
                              {/* Chapter row */}
                              <button
                                onClick={() => toggleChapterAll(ch.id)}
                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left w-full"
                              >
                                <div
                                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    isAll
                                      ? 'bg-emerald-600 border-emerald-600'
                                      : isSel
                                        ? 'bg-emerald-200 border-emerald-400'
                                        : 'border-gray-300'
                                  }`}
                                >
                                  {isAll && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                  {isSel && !isAll && (
                                    <div className="w-2 h-0.5 bg-emerald-700 rounded" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                    {ch.title}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">
                                    {isSel && !isAll
                                      ? `${selSubCount}টি সাবচ্যাপ্টার সিলেক্টেড`
                                      : isAll
                                        ? 'পুরো অধ্যায়'
                                        : ch.type || 'chapter'}
                                  </p>
                                </div>
                                {isSel && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs flex-shrink-0"
                                  >
                                    <span className="text-gray-500 hidden sm:inline">কয়টি:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="20"
                                      value={selections[ch.id].count}
                                      onChange={(e) =>
                                        setChapterCount(
                                          ch.id,
                                          parseInt(e.target.value) || 1,
                                        )
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      className="w-10 sm:w-12 rounded-md sm:rounded-lg border border-emerald-300 px-1 py-0.5 sm:px-1.5 sm:py-1 text-center text-xs sm:text-sm font-bold text-emerald-700 bg-white"
                                    />
                                  </div>
                                )}
                              </button>

                              {/* Subchapter expand link (when selected) */}
                              {isSel && (
                                <div className="border-t border-emerald-200 px-3 py-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      toggleExpand(ch.id)
                                    }}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                                  >
                                    <span>{isExp ? '▼' : '▶'}</span>
                                    <span>
                                      {isExp
                                        ? 'সাবচ্যাপ্টার লুকান'
                                        : 'নির্দিষ্ট সাবচ্যাপ্টার সিলেক্ট করো'}
                                    </span>
                                  </button>

                                  <AnimatePresence>
                                    {isExp && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 ml-4 border-l-2 border-emerald-300 pl-3 space-y-0.5">
                                          {!subsFetched ? (
                                            <div className="flex items-center gap-2 py-2">
                                              <Spinner size={12} color="#10b981" />
                                              <p className="text-[11px] text-gray-500">
                                                সাবচ্যাপ্টার লোড হচ্ছে...
                                              </p>
                                            </div>
                                          ) : subs.length === 0 ? (
                                            <p className="py-2 text-[11px] text-gray-400 italic">
                                              এই অধ্যায়ে কোনো সাবচ্যাপ্টার নেই
                                            </p>
                                          ) : (
                                            subs.map((sub) => {
                                              const subSel = isSubchapterSelected(
                                                ch.id,
                                                sub.id,
                                              )
                                              return (
                                                <label
                                                  key={sub.id}
                                                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer transition ${
                                                    subSel
                                                      ? 'bg-emerald-100 text-emerald-900'
                                                      : 'hover:bg-white'
                                                  }`}
                                                >
                                                  <div
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                      subSel
                                                        ? 'bg-emerald-600 border-emerald-600'
                                                        : 'border-gray-300 bg-white'
                                                    }`}
                                                  >
                                                    {subSel && (
                                                      <svg
                                                        className="w-2.5 h-2.5 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={3}
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="M5 13l4 4L19 7"
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                  <input
                                                    type="checkbox"
                                                    checked={subSel}
                                                    onChange={() =>
                                                      toggleSubchapter(ch.id, sub.id)
                                                    }
                                                    className="sr-only"
                                                  />
                                                  <span className="font-mono text-[10px] text-gray-500 min-w-[2rem]">
                                                    {sub.id}
                                                  </span>
                                                  <span className="flex-1 truncate">
                                                    {sub.title}
                                                  </span>
                                                  {sub.type !== 'concept' && (
                                                    <span
                                                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold flex-shrink-0 ${
                                                        sub.type === 'exercise'
                                                          ? 'bg-green-200 text-green-800'
                                                          : 'bg-purple-200 text-purple-800'
                                                      }`}
                                                    >
                                                      {sub.type === 'exercise'
                                                        ? 'অনুশীলনী'
                                                        : 'নমুনা'}
                                                    </span>
                                                  )}
                                                  {sub.questionCounts?.total > 0 && (
                                                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold text-gray-700 flex-shrink-0">
                                                      {sub.questionCounts.total}
                                                    </span>
                                                  )}
                                                </label>
                                              )
                                            })
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          )
                        })}
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
                className="space-y-3 sm:space-y-5"
              >
                {/* Mode Toggle */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    প্রশ্নের উৎস
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode('existing')}
                      className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all ${
                        mode === 'existing'
                          ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">📚</div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">শুধু বই থেকে</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1 leading-tight">
                        অনুশীলনী + নমুনা প্রশ্ন
                      </p>
                    </button>
                    <button
                      onClick={() => setMode('ai')}
                      className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all ${
                        mode === 'ai'
                          ? 'bg-purple-50 border-2 border-purple-500 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🤖</div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">AI বানাবে</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1 leading-tight">
                        বইয়ের content থেকে নতুন প্রশ্ন
                      </p>
                    </button>
                  </div>
                </div>

                {/* Question types */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    প্রশ্নের ধরন (একাধিক বেছে নিন)
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => toggleType(opt.type)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
                          questionTypes.includes(opt.type)
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs opacity-70">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                    mode === 'existing'
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-purple-50 border-purple-100'
                  }`}
                >
                  <p
                    className={`text-[11px] sm:text-xs font-medium leading-snug ${
                      mode === 'existing' ? 'text-emerald-800' : 'text-purple-800'
                    }`}
                  >
                    {mode === 'existing' ? '📖' : '🤖'} {totalSelected} টি অধ্যায় থেকে{' '}
                    {mode === 'existing'
                      ? `সর্বোচ্চ ${Math.min(totalCount, 50)} টি প্রশ্ন`
                      : `${Math.min(totalCount, 15)} টি নতুন প্রশ্ন`}
                  </p>
                  <p
                    className={`text-[10px] font-bold mt-1 sm:mt-1.5 leading-snug ${
                      mode === 'existing' ? 'text-emerald-700' : 'text-purple-700'
                    }`}
                  >
                    ⚡ ১ credit লাগবে · ব্যর্থ হলে ফেরত
                  </p>
                  {mode === 'existing' && (
                    <p className="text-[10px] text-emerald-700 mt-0.5 sm:mt-1 leading-snug">
                      💡 শুধু অনুশীলনী + নমুনা প্রশ্ন থেকে আসবে।
                    </p>
                  )}
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
                  <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 text-center">
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-4 sm:mb-6">
                      <div className="absolute inset-0 border-[3px] sm:border-4 border-emerald-100 rounded-full" />
                      <motion.div
                        className="absolute inset-0 border-[3px] sm:border-4 border-emerald-600 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {mode === 'existing' ? 'বই থেকে আনছি...' : 'AI বই পড়ছে...'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {mode === 'existing'
                        ? 'সিলেক্ট করা অংশ থেকে প্রশ্ন বের করা হচ্ছে'
                        : 'চ্যাপ্টারের তথ্য থেকে প্রশ্ন তৈরি হচ্ছে'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {sourceChapters.length > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-100 inline-block mb-1 sm:mb-2">
                        📖 সোর্স: {sourceChapters.join(', ')}
                        {resultMeta?.source === 'ai' && resultMeta?.provider && (
                          <span className="ml-2 text-purple-600">
                            · 🤖 {resultMeta.provider} ({resultMeta.keySource})
                          </span>
                        )}
                      </p>
                    )}
                    {generatedQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-gray-300">
                              #{i + 1}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                              {q.type}
                            </span>
                            {q._source && (
                              <span className="text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {q._source}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddSingle(q, i)}
                            className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md sm:rounded-lg hover:bg-emerald-600 hover:text-white transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                          >
                            + যোগ
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed break-words">
                          <MathText
                            text={
                              q.question ||
                              q.stimulus ||
                              q.sentence?.replace(/___/g, '______') ||
                              'প্রশ্ন'
                            }
                          />
                        </div>
                        {q.sub_questions && q.sub_questions.length > 0 && (
                          <div className="mt-1.5 sm:mt-2 space-y-1 pl-3 sm:pl-4 border-l-2 border-gray-100">
                            {q.sub_questions.map((sq, si) => (
                              <div key={si} className="text-[10px] sm:text-[11px] text-gray-500">
                                <span className="font-bold mr-1">{sq.label}.</span>{' '}
                                <MathText text={sq.text} />
                              </div>
                            ))}
                          </div>
                        )}
                        {q.option_a && (
                          <div className="grid grid-cols-2 gap-1 mt-1.5 sm:mt-2 pl-3 sm:pl-4 text-[10px] sm:text-[11px] text-gray-500">
                            <span>
                              ক) <MathText text={String(q.option_a)} />
                            </span>
                            <span>
                              খ) <MathText text={String(q.option_b || '')} />
                            </span>
                            <span>
                              গ) <MathText text={String(q.option_c || '')} />
                            </span>
                            <span>
                              ঘ) <MathText text={String(q.option_d || '')} />
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {generatedQuestions.length === 0 && !loading && (
                      <div className="text-center py-10 text-gray-400">
                        <p className="text-sm font-medium">কোনো প্রশ্ন পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
          {step === 'select' && (
            <>
              <div />
              <button
                onClick={() => setStep('configure')}
                disabled={!canProceed}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-emerald-600/25 btn-press disabled:opacity-40 disabled:shadow-none transition-all text-xs sm:text-sm"
              >
                পরবর্তী →
              </button>
            </>
          )}

          {step === 'configure' && (
            <>
              <button
                onClick={() => setStep('select')}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-gray-600 bg-gray-100 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              >
                ← পেছনে
              </button>
              <button
                onClick={handleGenerate}
                disabled={mode === 'ai' && questionTypes.length === 0}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-white rounded-lg sm:rounded-xl font-bold shadow-lg btn-press disabled:opacity-40 text-xs sm:text-sm ${
                  mode === 'existing'
                    ? 'bg-emerald-600 shadow-emerald-600/25'
                    : 'bg-purple-600 shadow-purple-600/25'
                }`}
              >
                {mode === 'existing' ? '📚 প্রশ্ন আনো' : '🤖 প্রশ্ন তৈরি'}
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={() => {
                  setStep('configure')
                  setGeneratedQuestions([])
                }}
                disabled={loading}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-gray-600 bg-gray-100 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs sm:text-sm disabled:opacity-40"
              >
                ← আবার
              </button>
              <button
                onClick={handleAddAllToPaper}
                disabled={loading || generatedQuestions.length === 0}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-blue-600/25 btn-press disabled:opacity-40 text-xs sm:text-sm"
              >
                সব যোগ করুন
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
