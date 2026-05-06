import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import { hasMath, MathText } from '@/utils/mathRender'

export default function MatchingEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const lastFocused = useRef(null)
  const lastFocusedSetter = useRef(null)
  const questionRef = useRef(null)

  const columnA = question.column_a || ['', '', '', '']
  const columnB = question.column_b || ['', '', '', '']

  const handleColumnChange = (col, index, value) => {
    const key = col === 'a' ? 'column_a' : 'column_b'
    const arr = [...(col === 'a' ? columnA : columnB)]
    arr[index] = value
    updateQuestion(question.id, { [key]: arr })
  }

  const addRow = () => {
    updateQuestion(question.id, {
      column_a: [...columnA, ''],
      column_b: [...columnB, ''],
    })
  }

  const removeRow = (index) => {
    if (columnA.length <= 2) return
    updateQuestion(question.id, {
      column_a: columnA.filter((_, i) => i !== index),
      column_b: columnB.filter((_, i) => i !== index),
    })
  }

  const onCellFocus = (el, setter) => {
    lastFocused.current = el
    lastFocusedSetter.current = setter
  }

  const insertIntoActiveCell = (newValue) => {
    if (lastFocusedSetter.current) {
      lastFocusedSetter.current(newValue)
    }
  }

  // For shared picker — proxy the last focused element
  const sharedInputRef = { get current() { return lastFocused.current } }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          প্রশ্ন/নির্দেশনা (ঐচ্ছিক)
        </label>
        <div className="flex items-start gap-1.5">
          <input
            ref={questionRef}
            type="text"
            value={question.question || ''}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            onFocus={(e) => onCellFocus(e.target, (v) => updateQuestion(question.id, { question: v }))}
            placeholder="বাম পাশের সাথে ডান পাশ মেলাও"
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
        </div>
      </div>

      {/* Two column matching */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_32px] gap-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">বাম পাশ</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase">ডান পাশ</span>
          <span />
        </div>
        {columnA.map((_, i) => (
          <div key={i}>
            <div className="grid grid-cols-[1fr_1fr_32px] gap-2">
              <input
                type="text"
                value={columnA[i]}
                onChange={(e) => handleColumnChange('a', i, e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('a', i, v))}
                placeholder={`${i + 1}.`}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <input
                type="text"
                value={columnB[i]}
                onChange={(e) => handleColumnChange('b', i, e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('b', i, v))}
                placeholder={`${String.fromCharCode(2453 + i)}.`}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                onClick={() => removeRow(i)}
                disabled={columnA.length <= 2}
                className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {(hasMath(columnA[i]) || hasMath(columnB[i])) && (
              <div className="grid grid-cols-[1fr_1fr_32px] gap-2 mt-1">
                <div className="text-xs px-2 text-pink-600">
                  {hasMath(columnA[i]) && <MathText text={columnA[i]} />}
                </div>
                <div className="text-xs px-2 text-pink-600">
                  {hasMath(columnB[i]) && <MathText text={columnB[i]} />}
                </div>
                <span />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addRow}
          className="text-xs text-pink-600 font-medium hover:text-pink-700"
        >
          + আরেকটি সারি যোগ করুন
        </button>
        <span className="text-[10px] text-gray-400">
          গণিত লিখতে: $\frac{'{a}'}{'{b}'}$ বা $\sqrt{'{x}'}$
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
