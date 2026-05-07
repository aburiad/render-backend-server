import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import { MathPreview } from '@/utils/mathRender'
import {
  NUMBERING_OPTIONS,
  LAYOUT_OPTIONS,
  getSubLabel,
} from '@/utils/subNumbering'

export default function McqEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const questionRef = useRef(null)
  const optionRefs = { a: useRef(null), b: useRef(null), c: useRef(null), d: useRef(null) }

  const numbering = question.sub_numbering || 'bn-letter'
  const layout = question.sub_layout || 2

  const handleChange = (field, value) => {
    updateQuestion(question.id, { [field]: value })
  }

  const InputStyle = {
    width: '100%', padding: '12px 14px', background: '#f8fafc',
    borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 13,
    color: '#1e293b', outline: 'none', transition: 'all 0.2s',
    fontWeight: 500
  }

  const optionKeys = ['a', 'b', 'c', 'd']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Question text */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <textarea
            ref={questionRef}
            value={question.question || ''}
            onChange={(e) => handleChange('question', e.target.value)}
            placeholder="প্রশ্ন লিখুন..."
            rows={3}
            style={{ ...InputStyle, minHeight: 80, resize: 'none', flex: 1 }}
          />
          <MathLiveEditor inputRef={questionRef} onInsert={(v) => handleChange('question', v)} />
        </div>
        <MathPreview text={question.question} />
      </div>

      {/* Numbering + layout controls */}
      <div className="flex flex-wrap items-center gap-3 px-2 py-2 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-blue-700">নম্বরিং:</span>
          <select
            value={numbering}
            onChange={(e) => handleChange('sub_numbering', e.target.value)}
            className="text-xs px-2 py-1 bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {NUMBERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-blue-700">কলাম:</span>
          <div className="flex bg-white border border-blue-200 rounded-md p-0.5">
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('sub_layout', opt.value)}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  layout === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options grid — uses chosen layout */}
      <div
        style={
          layout === 1
            ? { display: 'grid', gridTemplateColumns: '1fr', gap: 10 }
            : {
                display: 'grid',
                gridTemplateColumns: `repeat(${layout}, minmax(0, 1fr))`,
                gap: 10,
              }
        }
      >
        {optionKeys.map((opt, i) => {
          const isCorrect = question.correct_answer === opt
          const displayLabel = getSubLabel(numbering, i, opt.toUpperCase())
          return (
            <div key={opt} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleChange('correct_answer', opt)}
                  className="btn-press"
                  style={{
                    minWidth: 32, height: 32, padding: '0 6px', borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, transition: 'all 0.2s',
                    background: isCorrect ? '#22c55e' : '#fff',
                    border: `2px solid ${isCorrect ? '#22c55e' : '#e2e8f0'}`,
                    color: isCorrect ? '#fff' : '#94a3b8',
                    boxShadow: isCorrect ? '0 4px 10px rgba(34,197,94,0.3)' : 'none'
                  }}
                  title={isCorrect ? 'সঠিক উত্তর' : 'এটিকে সঠিক করুন'}
                >
                  {displayLabel}
                </button>
                <input
                  ref={optionRefs[opt]}
                  type="text"
                  value={question[`option_${opt}`] || ''}
                  onChange={(e) => handleChange(`option_${opt}`, e.target.value)}
                  placeholder={`অপশন ${displayLabel}`}
                  style={{ ...InputStyle, padding: '10px 12px', flex: 1, minWidth: 0 }}
                />
                {layout === 1 && (
                  <MathLiveEditor inputRef={optionRefs[opt]} onInsert={(v) => handleChange(`option_${opt}`, v)} />
                )}
              </div>
              {layout === 1 && <MathPreview text={question[`option_${opt}`]} label="" />}
            </div>
          )
        })}
      </div>

      {/* Marks Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
           <span style={{ fontSize: 10, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>নম্বর:</span>
           <input
             type="number"
             value={question.marks || 1}
             onChange={(e) => handleChange('marks', Number(e.target.value))}
             min={0}
             style={{
               width: 30, background: 'none', border: 'none', fontSize: 12,
               fontWeight: 900, color: '#10b981', textAlign: 'center', outline: 'none'
             }}
           />
        </div>
      </div>
    </div>
  )
}
