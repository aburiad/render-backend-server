import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import { MathPreview } from '@/utils/mathRender'
import {
  NUMBERING_OPTIONS,
  LAYOUT_OPTIONS,
  getSubLabel,
} from '@/utils/subNumbering'

export default function RearrangingEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const sentenceRefs = useRef([])

  const sentences = question.sentences || ['', '', '', '']
  const numbering = question.sub_numbering || 'arabic-en'
  const layout = question.sub_layout || 1

  const handleSentenceChange = (index, value) => {
    const updated = [...sentences]
    updated[index] = value
    updateQuestion(question.id, { sentences: updated })
  }

  const addSentence = () => {
    updateQuestion(question.id, { sentences: [...sentences, ''] })
  }

  const removeSentence = (index) => {
    if (sentences.length <= 2) return
    updateQuestion(question.id, {
      sentences: sentences.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          প্রশ্ন/নির্দেশনা (ঐচ্ছিক)
        </label>
        <input
          type="text"
          value={question.question || ''}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          placeholder="নিচের বাক্যগুলো সঠিক ক্রমে সাজাও"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Numbering + layout controls */}
      <div className="flex flex-wrap items-center gap-3 px-2 py-2 bg-yellow-50 border border-yellow-100 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-yellow-800">নম্বরিং:</span>
          <select
            value={numbering}
            onChange={(e) => updateQuestion(question.id, { sub_numbering: e.target.value })}
            className="text-xs px-2 py-1 bg-white border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {NUMBERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-yellow-800">কলাম:</span>
          <div className="flex bg-white border border-yellow-200 rounded-md p-0.5">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateQuestion(question.id, { sub_layout: opt.value })}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  layout === opt.value
                    ? 'bg-yellow-600 text-white'
                    : 'text-yellow-700 hover:bg-yellow-50'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={
          layout === 1
            ? { display: 'flex', flexDirection: 'column', gap: 8 }
            : {
                display: 'grid',
                gridTemplateColumns: `repeat(${layout}, minmax(0, 1fr))`,
                gap: 8,
              }
        }
      >
        <span className="text-[10px] font-semibold text-gray-400" style={{ gridColumn: '1 / -1' }}>
          বাক্যগুলো (এলোমেলো ক্রমে)
        </span>
        {sentences.map((s, i) => {
          const displayLabel = getSubLabel(numbering, i, String(i + 1))
          return (
            <div key={i}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                  {displayLabel}.
                </span>
                <input
                  ref={(el) => { sentenceRefs.current[i] = el }}
                  type="text"
                  value={s}
                  onChange={(e) => handleSentenceChange(i, e.target.value)}
                  placeholder={`বাক্য ${displayLabel}`}
                  className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                {layout === 1 && (
                  <MathLiveEditor
                    inputRef={{ get current() { return sentenceRefs.current[i] } }}
                    onInsert={(v) => handleSentenceChange(i, v)}
                  />
                )}
                <button
                  onClick={() => removeSentence(i)}
                  disabled={sentences.length <= 2}
                  className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {layout === 1 && (
                <div className="pl-7">
                  <MathPreview text={s} label="" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={addSentence}
        className="text-xs text-yellow-600 font-medium hover:text-yellow-700"
      >
        + আরেকটি বাক্য যোগ করুন
      </button>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          সঠিক ক্রম (কমা দিয়ে আলাদা করুন, যেমন: 3,1,4,2)
        </label>
        <input
          type="text"
          value={(question.correct_order || []).join(',')}
          onChange={(e) =>
            updateQuestion(question.id, {
              correct_order: e.target.value
                .split(',')
                .map((n) => Number(n.trim()))
                .filter(Boolean),
            })
          }
          placeholder="3,1,4,2"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
