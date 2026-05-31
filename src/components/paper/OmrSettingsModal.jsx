import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_RULES = `১। বৃত্তাকার ঘরগুলো এমনভাবে ভরাট করতে হবে যাতে ভেতরের অক্ষরটি দেখা না যায়।
২। বৃত্তাকার ঘরগুলো অবশ্যই বল-পয়েন্ট কলম দিয়ে ভরাট করতে হবে।
৩। উত্তরপত্রে কোন অবাঞ্ছিত দাগ দেওয়া যাবে না।
৪। উত্তরপত্রটিকে কোন অবস্থাতে ভাঁজ করা যাবে না।
৫। সেট কোড না লিখলে/ভুল ভরাট করলে উত্তরপত্র বাতিল হবে।
৬। পরিষ্কার পরিচ্ছন্ন ও ভাঁজহীন উত্তরপত্র মেশিনে মূল্যায়নের জন্য অপরিহার্য।`

const EXAM_TYPES = ['অর্ধ-বার্ষিক', 'বার্ষিক', 'প্রাক-নির্বাচনী', 'নির্বাচনী পরীক্ষা']
const CUSTOM_KEY = '__custom__'

export default function OmrSettingsModal({ isOpen, onClose, onConfirm, initialData }) {
  // Figure out if the initial examType is a preset or custom
  const isPresetType = (val) => EXAM_TYPES.includes(val)
  const initialExamType = initialData?.examType || 'বার্ষিক'

  const [formData, setFormData] = useState({
    schoolName: initialData?.schoolName || 'বরুড়া হাজী নোয়াব আলী পাইলট উচ্চ বিদ্যালয়',
    examType: initialExamType,
    year: initialData?.year || new Date().getFullYear().toString(),
    totalQuestions: initialData?.totalQuestions || 30,
    rules: initialData?.rules || DEFAULT_RULES,
  })

  // Track select value separately — if custom, show input
  const [selectValue, setSelectValue] = useState(
    isPresetType(initialExamType) ? initialExamType : CUSTOM_KEY
  )
  const [customExam, setCustomExam] = useState(
    isPresetType(initialExamType) ? '' : initialExamType
  )

  if (!isOpen) return null

  const handleSelectChange = (val) => {
    setSelectValue(val)
    if (val === CUSTOM_KEY) {
      // Keep current custom text or empty
      setFormData({ ...formData, examType: customExam || '' })
    } else {
      setCustomExam('')
      setFormData({ ...formData, examType: val })
    }
  }

  const handleCustomChange = (val) => {
    setCustomExam(val)
    setFormData({ ...formData, examType: val })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(formData)
    onClose()
  }

  const inputClasses = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-700"

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="relative p-4 sm:p-5">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900 mb-1">OMR সেটিংস</h2>
              <p className="text-gray-400 text-xs">প্রিন্ট করার আগে প্রয়োজনীয় তথ্যগুলো যাচাই করে নিন।</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className={inputClasses}
                  placeholder="স্কুলের নাম লিখুন..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">পরীক্ষার ধরন</label>
                  <select
                    value={selectValue}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                    <option value={CUSTOM_KEY}>কাস্টম...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">সাল (Year)</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={inputClasses}
                    maxLength={4}
                  />
                </div>
              </div>

              {/* Custom exam name input — visible only when "কাস্টম..." is selected */}
              {selectValue === CUSTOM_KEY && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">কাস্টম পরীক্ষার নাম</label>
                  <input
                    type="text"
                    value={customExam}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className={inputClasses}
                    placeholder="যেমন: মডেল টেস্ট, সাপ্তাহিক পরীক্ষা..."
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">মোট প্রশ্ন সংখ্যা</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="w-10 text-center text-xs font-bold text-blue-600 bg-blue-50 py-1 rounded-lg border border-blue-100">
                    {formData.totalQuestions}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">নিয়মাবলি (Rules)</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-700 resize-none"
                  placeholder="OMR শিটে দেখানোর জন্য নিয়মাবলি লিখুন..."
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}