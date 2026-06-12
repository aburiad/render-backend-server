import { useRef, useState } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import { hasMath, MathText, MathPreview } from '@/utils/mathRender'

/**
 * Standard Text Editor with Dynamic Spacing
 * For: Short Q, Fill in blanks, Juktakkhor, Wh-Questions, Rearrange, Punctuation, Form fill-up
 * Features: Space level (none/short/medium/long), Line style (plain/dotted/ruled/four-line)
 */
export default function StandardTextEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const lastFocused = useRef(null)
  const lastFocusedSetter = useRef(null)

  const questionText = question.question || ''
  const instruction = question.instruction || ''
  const spaceLevel = question.space_level || 'none'
  const lineStyle = question.line_style || 'none'
  const marks = question.marks || 1

  // Tracing-specific fields
  const isTracing = questionText === 'tracing'
  const tracingType = question.tracing_type || 'letter'
  const tracingChars = question.tracing_chars || []

  // Number-line-specific fields
  const isNumberLine = questionText === 'number_line'
  const nlStart = question.nl_start ?? 0
  const nlEnd = question.nl_end ?? 10
  const nlJumps = question.nl_jumps || []
  const nlQuestion = question.nl_question || ''

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

  const handleQuestionChange = (value) => {
    updateQuestion(question.id, { question: value })
  }

  const handleInstructionChange = (value) => {
    updateQuestion(question.id, { instruction: value })
  }

  const handleSpaceLevelChange = (value) => {
    updateQuestion(question.id, { space_level: value })
  }

  const handleLineStyleChange = (value) => {
    updateQuestion(question.id, { line_style: value })
  }

  const spaceOptions = [
    { value: 'none', label: 'কোন স্পেস নেই', labelEn: 'None' },
    { value: 'short', label: 'ছোট স্পেস', labelEn: 'Short' },
    { value: 'medium', label: 'মাঝারি স্পেস', labelEn: 'Medium' },
    { value: 'long', label: 'বড় স্পেস', labelEn: 'Long' },
  ]

  const lineStyleOptions = [
    { value: 'none', label: 'সাধারণ', labelEn: 'Plain' },
    { value: 'dotted', label: 'ডটেড লাইন', labelEn: 'Dotted' },
    { value: 'ruled', label: 'রুলড লাইন', labelEn: 'Ruled' },
    { value: 'fourline', label: 'ফোর-লাইন', labelEn: 'Four-Line' },
  ]

  return (
    <div className="space-y-4">
      {/* Instruction / Header */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          নির্দেশনা / হেডিং (ঐচ্ছিক)
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <AutoTextarea
            value={instruction}
            onChange={(e) => handleInstructionChange(e.target.value)}
            onFocus={(e) => onCellFocus(e.target, handleInstructionChange)}
            placeholder="যেমন: নিচের শূন্যস্থানগুলো পূরণ করো"
            rows={1}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        {hasMath(instruction) && <MathPreview text={instruction} />}
      </div>

      {/* Main Question Text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          প্রশ্ন / বাক্য
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <AutoTextarea
            value={questionText}
            onChange={(e) => handleQuestionChange(e.target.value)}
            onFocus={(e) => onCellFocus(e.target, handleQuestionChange)}
            placeholder="প্রশ্ন লিখুন... শূন্যস্থানের জন্য _____ ব্যবহার করুন"
            rows={2}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        {hasMath(questionText) && <MathPreview text={questionText} />}
      </div>

      {/* Spacing Options */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            উত্তরের জায়গা
          </label>
          <select
            value={spaceLevel}
            onChange={(e) => handleSpaceLevelChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {spaceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            লাইন স্টাইল
          </label>
          <select
            value={lineStyle}
            onChange={(e) => handleLineStyleChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {lineStyleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Line Style Preview */}
      {lineStyle !== 'none' && (
        <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-400 mb-1">প্রিভিউ:</p>
          <div className={`line-${lineStyle}`} />
        </div>
      )}

      {/* Marks */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={marks}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* ─── Tracing Fields ─── */}
      {isTracing && (
        <>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 space-y-3">
            <p className="text-[10px] font-medium text-red-700">ট্রেসিং সেটিংস</p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                ট্রেসিং টাইপ
              </label>
              <select
                value={tracingType}
                onChange={(e) => updateQuestion(question.id, { tracing_type: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="letter">অক্ষর (Letter)</option>
                <option value="number">সংখ্যা (Number)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                অক্ষর/সংখ্যা (কমা দিয়ে আলাদা করো)
              </label>
              <input
                type="text"
                value={tracingChars.join(', ')}
                onChange={(e) => {
                  const chars = e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  updateQuestion(question.id, { tracing_chars: chars })
                }}
                placeholder="যেমন: অ, আ, ই, ঈ"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </>
      )}

      {/* ─── Number Line Fields ─── */}
      {isNumberLine && (
        <>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100 space-y-3">
            <p className="text-[10px] font-medium text-green-700">সংখ্যা রেখা সেটিংস</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  শুরু (Start)
                </label>
                <input
                  type="number"
                  value={nlStart}
                  onChange={(e) => updateQuestion(question.id, { nl_start: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  শেষ (End)
                </label>
                <input
                  type="number"
                  value={nlEnd}
                  onChange={(e) => updateQuestion(question.id, { nl_end: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                জাম্প / খালি ঘর (কমা দিয়ে আলাদা করো)
              </label>
              <input
                type="text"
                value={nlJumps.join(', ')}
                onChange={(e) => {
                  const jumps = e.target.value.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n))
                  updateQuestion(question.id, { nl_jumps: jumps })
                }}
                placeholder="যেমন: 3, 5, 7"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                প্রশ্ন
              </label>
              <input
                type="text"
                value={nlQuestion}
                onChange={(e) => updateQuestion(question.id, { nl_question: e.target.value })}
                placeholder="যেমন: খালি ঘরে সঠিক সংখ্যা বসাও"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </>
      )}

      {/* Quick Format Tips */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-[10px] font-medium text-blue-700 mb-1">টিপস:</p>
        <ul className="text-[10px] text-blue-600 space-y-0.5">
          <li>• শূন্যস্থানের জন্য _____ ব্যবহার করুন</li>
          <li>• যুক্তাক্ষর ভাঙার জন্য [  ] + [  ] ব্যবহার করুন</li>
          <li>• আন্ডারলাইন করতে টেক্সট সিলেক্ট করে u ব্যবহার করুন</li>
        </ul>
      </div>
    </div>
  )
}
