import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathSymbolPicker from './MathSymbolPicker'

export default function McqEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const questionRef = useRef(null)
  const optionRefs = { a: useRef(null), b: useRef(null), c: useRef(null), d: useRef(null) }

  const handleChange = (field, value) => {
    updateQuestion(question.id, { [field]: value })
  }

  const InputStyle = {
    width: '100%', padding: '12px 14px', background: '#f8fafc',
    borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 13,
    color: '#1e293b', outline: 'none', transition: 'all 0.2s',
    fontWeight: 500
  }

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
          <MathSymbolPicker inputRef={questionRef} onInsert={(v) => handleChange('question', v)} />
        </div>
      </div>

      {/* Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {['a', 'b', 'c', 'd'].map((opt) => {
          const isCorrect = question.correct_answer === opt
          return (
            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleChange('correct_answer', opt)}
                className="btn-press"
                style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, transition: 'all 0.2s',
                  background: isCorrect ? '#22c55e' : '#fff',
                  border: `2px solid ${isCorrect ? '#22c55e' : '#e2e8f0'}`,
                  color: isCorrect ? '#fff' : '#94a3b8',
                  boxShadow: isCorrect ? '0 4px 10px rgba(34,197,94,0.3)' : 'none'
                }}
              >
                {opt.toUpperCase()}
              </button>
              <input
                ref={optionRefs[opt]}
                type="text"
                value={question[`option_${opt}`] || ''}
                onChange={(e) => handleChange(`option_${opt}`, e.target.value)}
                placeholder={`অপশন ${opt.toUpperCase()}`}
                style={{ ...InputStyle, padding: '10px 12px', flex: 1 }}
              />
              <MathSymbolPicker inputRef={optionRefs[opt]} onInsert={(v) => handleChange(`option_${opt}`, v)} />
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
