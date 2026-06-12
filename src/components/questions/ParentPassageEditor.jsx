import { useRef, useState } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import { hasMath, MathText, MathPreview } from '@/utils/mathRender'

/**
 * Parent Passage Editor
 * For: English Seen/Unseen, Bangla Poems, Science Broad Scenarios
 * Features: Passage body with sub-questions (MCQ, True/False, Short)
 * Schema: { instruction, passage_body, sub_questions: [{type, text, answer, marks}] }
 */
export default function ParentPassageEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const lastFocused = useRef(null)
  const lastFocusedSetter = useRef(null)

  const instruction = question.instruction || ''
  const passageBody = question.passage_body || ''
  const subQuestions = question.sub_questions || []

  const onCellFocus = (el, setter) => {
    lastFocused.current = el
    lastFocusedSetter.current = setter
  }

  const insertIntoActiveCell = (newValue) => {
    if (lastFocusedSetter.current) {
      lastFocusedSetter.current(newValue)
    }
  }

  const sharedInputRef = { get current() { return lastFocused.current } }

  const handlePassageChange = (value) => {
    updateQuestion(question.id, { passage_body: value })
  }

  const handleInstructionChange = (value) => {
    updateQuestion(question.id, { instruction: value })
  }

  const addSubQuestion = (type = 'short') => {
    const newSub = {
      id: `sub_${Date.now()}`,
      type,
      text: '',
      answer: '',
      marks: type === 'true_false' ? 1 : 2,
    }
    updateQuestion(question.id, {
      sub_questions: [...subQuestions, newSub],
    })
  }

  const updateSubQuestion = (index, field, value) => {
    const newSubs = [...subQuestions]
    newSubs[index][field] = value
    updateQuestion(question.id, { sub_questions: newSubs })
  }

  const removeSubQuestion = (index) => {
    const newSubs = subQuestions.filter((_, i) => i !== index)
    updateQuestion(question.id, { sub_questions: newSubs })
  }

  const subTypes = [
    { value: 'short', label: 'সংক্ষিপ্ত উত্তর' },
    { value: 'true_false', label: 'সত্য/মিথ্যা' },
    { value: 'mcq', label: 'এমসিকিউ' },
  ]

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          নির্দেশনা
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <AutoTextarea
            value={instruction}
            onChange={(e) => handleInstructionChange(e.target.value)}
            onFocus={(e) => onCellFocus(e.target, handleInstructionChange)}
            placeholder="যেমন: নিচের প্যাসেজটি পড়ে প্রশ্নগুলোর উত্তর দাও"
            rows={1}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        {hasMath(instruction) && <MathPreview text={instruction} />}
      </div>

      {/* Passage Body */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          প্যাসেজ / কবিতা / অনুচ্ছেদ
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <AutoTextarea
            value={passageBody}
            onChange={(e) => handlePassageChange(e.target.value)}
            onFocus={(e) => onCellFocus(e.target, handlePassageChange)}
            placeholder="এখানে প্যাসেজ বা কবিতার লাইনগুলো লিখুন..."
            rows={4}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        {hasMath(passageBody) && <MathPreview text={passageBody} />}
      </div>

      {/* Sub-Questions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-500">
            প্রশ্ন ({subQuestions.length})
          </label>
          <div className="flex gap-1">
            {subTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => addSubQuestion(type.value)}
                className="px-2 py-1 text-[10px] font-medium rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              >
                + {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {subQuestions.map((sub, index) => (
            <div
              key={sub.id || index}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">{index + 1}.</span>
                <div className="flex-1">
                  {/* Type Selector */}
                  <select
                    value={sub.type}
                    onChange={(e) => updateSubQuestion(index, 'type', e.target.value)}
                    className="px-2 py-1 text-[10px] font-medium rounded bg-white border border-slate-200 mb-2"
                  >
                    {subTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Question Text */}
                  <AutoTextarea
                    value={sub.text}
                    onChange={(e) => updateSubQuestion(index, 'text', e.target.value)}
                    placeholder="প্রশ্ন লিখুন..."
                    rows={1}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2"
                  />

                  {/* Answer Input */}
                  {sub.type === 'true_false' ? (
                    <select
                      value={sub.answer || ''}
                      onChange={(e) => updateSubQuestion(index, 'answer', e.target.value)}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">সিলেক্ট করুন</option>
                      <option value="true">সত্য (True)</option>
                      <option value="false">মিথ্যা (False)</option>
                    </select>
                  ) : sub.type === 'mcq' ? (
                    <input
                      type="text"
                      value={sub.answer || ''}
                      onChange={(e) => updateSubQuestion(index, 'answer', e.target.value)}
                      placeholder="সঠিক উত্তর (ক/খ/গ/ঘ)"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={sub.answer || ''}
                      onChange={(e) => updateSubQuestion(index, 'answer', e.target.value)}
                      placeholder="সঠিক উত্তর"
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                    />
                  )}

                  {/* Marks */}
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-[10px] text-slate-400">নম্বর:</label>
                    <input
                      type="number"
                      value={sub.marks || 1}
                      onChange={(e) => updateSubQuestion(index, 'marks', Number(e.target.value))}
                      min={0}
                      className="w-12 px-1 py-1 bg-white border border-slate-200 rounded text-xs text-center"
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeSubQuestion(index)}
                  className="p-1 text-gray-300 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {subQuestions.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-4">
            উপরের + বাটনে ক্লিক করে প্রশ্ন যোগ করুন
          </p>
        )}
      </div>

      {/* Total Marks Display */}
      {subQuestions.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            মোট নম্বর: {subQuestions.reduce((sum, s) => sum + (s.marks || 0), 0)}
          </p>
        </div>
      )}
    </div>
  )
}
