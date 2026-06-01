import AutoTextarea from '@/components/shared/AutoTextarea'
import StimulusImage from '@/components/shared/StimulusImage'
import usePaperStore from '@/store/paperStore'
import { MathPreview } from '@/utils/mathRender'
import {
  LAYOUT_OPTIONS,
  NUMBERING_OPTIONS,
  getSubLabel,
} from '@/utils/subNumbering'
import { useRef } from 'react'
import MathLiveEditor from './MathLiveEditor'

const DEFAULT_SUBS = [
  { label: 'ক', text: '', marks: 0 },
  { label: 'খ', text: '', marks: 0 },
  { label: 'গ', text: '', marks: 0 },
  { label: 'ঘ', text: '', marks: 0 },
]

export default function CqEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const stimulusRef = useRef(null)
  const subRefs = useRef([])

  const subQuestions = question.sub_questions || DEFAULT_SUBS
  const numbering = question.sub_numbering || 'bn-letter'
  const layout = question.sub_layout || 1

  const handleStimulusChange = (value) => {
    updateQuestion(question.id, { stimulus: value })
  }

  const handleSubChange = (index, field, value) => {
    const updated = [...subQuestions]
    updated[index] = { ...updated[index], [field]: value }
    updateQuestion(question.id, { sub_questions: updated })
  }

  const addSub = () => {
    updateQuestion(question.id, {
      sub_questions: [...subQuestions, { label: '', text: '', marks: 0 }],
    })
  }

  const removeSub = (index) => {
    if (subQuestions.length <= 1) return
    updateQuestion(question.id, {
      sub_questions: subQuestions.filter((_, i) => i !== index),
    })
  }

  const gridStyle =
    layout === 1
      ? { display: 'flex', flexDirection: 'column', gap: 8 }
      : {
          display: 'grid',
          gridTemplateColumns: `repeat(${layout}, minmax(0, 1fr))`,
          gap: 8,
        }

  return (
    <div className="space-y-3">
      {/* Stimulus / Uddipok */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">উদ্দীপক</label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5">
          <AutoTextarea
            ref={stimulusRef}
            value={question.stimulus || ''}
            onChange={(e) => handleStimulusChange(e.target.value)}
            placeholder="উদ্দীপক লিখুন..."
            rows={3}
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={stimulusRef} onInsert={(v) => handleStimulusChange(v)} />
          </div>
        </div>
        <MathPreview text={question.stimulus} />
        <StimulusImage
          value={question.stimulus_image}
          onChange={(v) => updateQuestion(question.id, { stimulus_image: v })}
          imageHeight={question.stimulus_image_height}
          imageWidth={question.stimulus_image_width}
          onHeightChange={(v) => updateQuestion(question.id, { stimulus_image_height: v })}
          onWidthChange={(v) => updateQuestion(question.id, { stimulus_image_width: v })}
          accentColor="#7c3aed"
        />
      </div>

      {/* Numbering + layout controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-purple-700">নম্বরিং:</span>
          <select
            value={numbering}
            onChange={(e) => updateQuestion(question.id, { sub_numbering: e.target.value })}
            className="text-xs px-2 py-1 bg-white border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {NUMBERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-purple-700">কলাম:</span>
          <div className="flex bg-white border border-purple-200 rounded-md p-0.5">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateQuestion(question.id, { sub_layout: opt.value })}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  layout === opt.value
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-questions — laid out in chosen column count */}
      <div style={gridStyle}>
        {subQuestions.map((sub, i) => {
          const displayLabel = getSubLabel(numbering, i, sub.label)
          return (
            <div key={i}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="w-7 h-8 flex items-center justify-center text-sm font-bold text-purple-500 flex-shrink-0">
                    {displayLabel})
                  </span>
                  <AutoTextarea
                    ref={(el) => { subRefs.current[i] = el }}
                    value={sub.text}
                    onChange={(e) => handleSubChange(i, 'text', e.target.value)}
                    placeholder={`${displayLabel} নং প্রশ্ন...`}
                    rows={2}
                    className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-1 pl-9 sm:gap-1.5 sm:pl-0">
                  {layout === 1 && (
                    <MathLiveEditor
                      inputRef={{ get current() { return subRefs.current[i] } }}
                      onInsert={(v) => handleSubChange(i, 'text', v)}
                    />
                  )}
                  <input
                    type="number"
                    value={sub.marks || ''}
                    onChange={(e) => handleSubChange(i, 'marks', Number(e.target.value))}
                    min={0}
                    className="w-9 sm:w-12 px-1 py-1.5 sm:px-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg text-[10px] sm:text-xs text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-shrink-0"
                    placeholder="মার্ক"
                  />
                  {subQuestions.length > 1 && (
                    <button
                      onClick={() => removeSub(i)}
                      className="px-1 text-gray-300 hover:text-red-500 flex-shrink-0"
                      title="মুছুন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {layout === 1 && (
                <div className="pl-9">
                  <MathPreview text={sub.text} label="" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addSub}
          className="text-xs font-semibold text-purple-700 hover:text-purple-800"
        >
          + প্রশ্ন যোগ করুন
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>মোট নম্বর:</span>
          <span className="font-semibold text-purple-600">
            {subQuestions.reduce((sum, sq) => sum + (Number(sq.marks) || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  )
}
