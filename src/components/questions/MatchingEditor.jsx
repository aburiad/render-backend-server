import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import { hasMath, MathText, MathPreview } from '@/utils/mathRender'

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
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5">
          <AutoTextarea
            ref={questionRef}
            value={question.question || ''}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            onFocus={(e) => onCellFocus(e.target, (v) => updateQuestion(question.id, { question: v }))}
            placeholder="বাম পাশের সাথে ডান পাশ মেলাও"
            rows={1}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        <MathPreview text={question.question} />
      </div>

      {/* Two column matching */}
      <div className="space-y-3 sm:space-y-2">
        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_32px] sm:gap-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">বাম পাশ</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase">ডান পাশ</span>
          <span />
        </div>
        {columnA.map((_, i) => (
          <div key={i} className="p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-150 sm:border-0">
            {/* Mobile layout: stacked columns */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">সারি {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={columnA.length <= 2}
                  className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs font-bold rounded-lg transition-colors disabled:opacity-30"
                >
                  ডিলিট
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">বাম পাশ ({i + 1})</label>
                <AutoTextarea
                  value={columnA[i]}
                  onChange={(e) => handleColumnChange('a', i, e.target.value)}
                  onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('a', i, v))}
                  placeholder="বাম পাশের তথ্য..."
                  rows={1}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">ডান পাশ ({String.fromCharCode(2453 + i)})</label>
                <AutoTextarea
                  value={columnB[i]}
                  onChange={(e) => handleColumnChange('b', i, e.target.value)}
                  onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('b', i, v))}
                  placeholder="ডান পাশের তথ্য..."
                  rows={1}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop layout: grid-cols table */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_32px] sm:gap-2 sm:items-center">
              <AutoTextarea
                value={columnA[i]}
                onChange={(e) => handleColumnChange('a', i, e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('a', i, v))}
                placeholder={`${i + 1}.`}
                rows={1}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <AutoTextarea
                value={columnB[i]}
                onChange={(e) => handleColumnChange('b', i, e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handleColumnChange('b', i, v))}
                placeholder={`${String.fromCharCode(2453 + i)}.`}
                rows={1}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={columnA.length <= 2}
                className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300 flex justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Math preview */}
            {(hasMath(columnA[i]) || hasMath(columnB[i])) && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_32px] gap-2 mt-1 px-1 sm:px-0">
                <div className="text-xs text-pink-600">
                  {hasMath(columnA[i]) && <MathText text={columnA[i]} />}
                </div>
                <div className="text-xs text-pink-600">
                  {hasMath(columnB[i]) && <MathText text={columnB[i]} />}
                </div>
                <span className="hidden sm:inline" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={addRow}
          className="text-xs text-pink-600 font-medium hover:text-pink-700"
        >
          + আরেকটি সারি যোগ করুন
        </button>
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
