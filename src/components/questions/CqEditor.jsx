import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathSymbolPicker from './MathSymbolPicker'

const SUB_LABELS = ['ক', 'খ', 'গ', 'ঘ']

export default function CqEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const stimulusRef = useRef(null)
  const subRefs = useRef([])

  const subQuestions = question.sub_questions || SUB_LABELS.map((label) => ({
    label,
    text: '',
    marks: 0,
  }))

  const handleStimulusChange = (value) => {
    updateQuestion(question.id, { stimulus: value })
  }

  const handleSubChange = (index, field, value) => {
    const updated = [...subQuestions]
    updated[index] = { ...updated[index], [field]: value }
    updateQuestion(question.id, { sub_questions: updated })
  }

  return (
    <div className="space-y-3">
      {/* Stimulus / Uddipok */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">উদ্দীপক</label>
        <div className="flex items-start gap-1.5">
          <textarea
            ref={stimulusRef}
            value={question.stimulus || ''}
            onChange={(e) => handleStimulusChange(e.target.value)}
            placeholder="উদ্দীপক লিখুন..."
            rows={3}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <MathSymbolPicker inputRef={stimulusRef} onInsert={(v) => handleStimulusChange(v)} />
        </div>
      </div>

      {/* Sub-questions */}
      <div className="space-y-2">
        {subQuestions.map((sub, i) => (
          <div key={sub.label} className="flex items-start gap-2">
            <span className="w-6 h-8 flex items-center justify-center text-sm font-bold text-purple-500 flex-shrink-0">
              {sub.label})
            </span>
            <textarea
              ref={(el) => { subRefs.current[i] = el }}
              value={sub.text}
              onChange={(e) => handleSubChange(i, 'text', e.target.value)}
              placeholder={`${sub.label} নং প্রশ্ন...`}
              rows={1}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <MathSymbolPicker
              inputRef={{ get current() { return subRefs.current[i] } }}
              onInsert={(v) => handleSubChange(i, 'text', v)}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                value={sub.marks || ''}
                onChange={(e) => handleSubChange(i, 'marks', Number(e.target.value))}
                min={0}
                className="w-14 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="নম্বর"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total marks display */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>মোট নম্বর:</span>
        <span className="font-semibold text-purple-600">
          {subQuestions.reduce((sum, sq) => sum + (Number(sq.marks) || 0), 0)}
        </span>
      </div>
    </div>
  )
}
