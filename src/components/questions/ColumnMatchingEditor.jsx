import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathLiveEditor from './MathLiveEditor'
import AutoTextarea from '@/components/shared/AutoTextarea'
import { hasMath, MathText, MathPreview } from '@/utils/mathRender'

/**
 * Column Matching Editor (2-Column Matrix)
 * For: Bangla, English Grammar, BGS, Science matching questions
 * Features: Pair-based editor, auto-shuffle on print
 * Schema: { instruction, pairs: [{column_a, column_b}] }
 */
export default function ColumnMatchingEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const lastFocused = useRef(null)
  const lastFocusedSetter = useRef(null)

  // Support both old format (column_a/column_b arrays) and new format (pairs array)
  const pairs = question.pairs || []
  const columnA = question.column_a || []
  const columnB = question.column_b || []

  // Convert old format to new if needed
  let workingPairs = pairs
  if (pairs.length === 0 && columnA.length > 0 && columnB.length > 0) {
    workingPairs = columnA.map((a, i) => ({
      column_a: a,
      column_b: columnB[i] || '',
    }))
  }

  const handlePairChange = (index, field, value) => {
    const newPairs = [...workingPairs]
    newPairs[index][field] = value
    updateQuestion(question.id, { pairs: newPairs })
  }

  const hasColC = workingPairs.some((p) => p.column_c)
  const addPair = () => {
    const newPair = hasColC
      ? { column_a: '', column_b: '', column_c: '' }
      : { column_a: '', column_b: '' }
    const newPairs = [...workingPairs, newPair]
    updateQuestion(question.id, { pairs: newPairs })
  }

  const removePair = (index) => {
    if (workingPairs.length <= 2) return
    const newPairs = workingPairs.filter((_, i) => i !== index)
    updateQuestion(question.id, { pairs: newPairs })
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

  const sharedInputRef = { get current() { return lastFocused.current } }

  const instruction = question.instruction || ''
  const marks = question.marks || 10

  return (
    <div className="space-y-4">
      {/* Instruction */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          নির্দেশনা / প্রশ্ন
        </label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          <AutoTextarea
            value={instruction}
            onChange={(e) => updateQuestion(question.id, { instruction: e.target.value })}
            onFocus={(e) => onCellFocus(e.target, (v) => updateQuestion(question.id, { instruction: v }))}
            placeholder="যেমন: বামপাশের সাথে ডানপাশ মেলাও"
            rows={1}
            className="w-full sm:flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
          </div>
        </div>
        {hasMath(instruction) && <MathPreview text={instruction} />}
      </div>

      {/* Pair Editor */}
      <div className="space-y-2">
        {/* Header */}
        <div className={`hidden sm:grid sm:gap-2 ${hasColC ? 'sm:grid-cols-[1fr_1fr_1fr_32px]' : 'sm:grid-cols-[1fr_1fr_32px]'}`}>
          <span className="text-[10px] font-semibold text-gray-400 uppercase">বাম পাশ</span>
          {hasColC && <span className="text-[10px] font-semibold text-gray-400 uppercase">মাঝের পাশ</span>}
          <span className="text-[10px] font-semibold text-gray-400 uppercase">ডান পাশ</span>
          <span />
        </div>

        {workingPairs.map((pair, index) => (
          <div key={index} className="p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-150 sm:border-0">
            {/* Mobile layout: stacked */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">জোড়া {index + 1}</span>
                <button
                  onClick={() => removePair(index)}
                  disabled={workingPairs.length <= 2}
                  className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs font-bold rounded-lg transition-colors disabled:opacity-30"
                >
                  ডিলিট
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">বাম পাশ</label>
                <AutoTextarea
                  value={pair.column_a}
                  onChange={(e) => handlePairChange(index, 'column_a', e.target.value)}
                  onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_a', v))}
                  placeholder="বামপাশের তথ্য..."
                  rows={1}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {hasColC && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">মাঝের পাশ</label>
                  <AutoTextarea
                    value={pair.column_c || ''}
                    onChange={(e) => handlePairChange(index, 'column_c', e.target.value)}
                    onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_c', v))}
                    placeholder="মাঝের তথ্য..."
                    rows={1}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">ডান পাশ ({String.fromCharCode(2453 + index)})</label>
                <AutoTextarea
                  value={pair.column_b}
                  onChange={(e) => handlePairChange(index, 'column_b', e.target.value)}
                  onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_b', v))}
                  placeholder="ডানপাশের তথ্য..."
                  rows={1}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Desktop layout: grid */}
            <div className={`hidden sm:gap-2 sm:items-center ${hasColC ? 'sm:grid sm:grid-cols-[1fr_1fr_1fr_32px]' : 'sm:grid sm:grid-cols-[1fr_1fr_32px]'}`}>
              <AutoTextarea
                value={pair.column_a}
                onChange={(e) => handlePairChange(index, 'column_a', e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_a', v))}
                placeholder={`${index + 1}.`}
                rows={1}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {hasColC && (
                <AutoTextarea
                  value={pair.column_c || ''}
                  onChange={(e) => handlePairChange(index, 'column_c', e.target.value)}
                  onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_c', v))}
                  placeholder="মাঝের তথ্য..."
                  rows={1}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              )}
              <AutoTextarea
                value={pair.column_b}
                onChange={(e) => handlePairChange(index, 'column_b', e.target.value)}
                onFocus={(e) => onCellFocus(e.target, (v) => handlePairChange(index, 'column_b', v))}
                placeholder={`${String.fromCharCode(2453 + index)}.`}
                rows={1}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={() => removePair(index)}
                disabled={workingPairs.length <= 2}
                className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Math preview */}
            {(hasMath(pair.column_a) || hasMath(pair.column_b)) && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_32px] gap-2 mt-1">
                <div className="text-xs text-pink-600">
                  {hasMath(pair.column_a) && <MathText text={pair.column_a} />}
                </div>
                <div className="text-xs text-pink-600">
                  {hasMath(pair.column_b) && <MathText text={pair.column_b} />}
                </div>
                <span className="hidden sm:inline" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Pair Button */}
      <div className="flex items-center">
        <button
          onClick={addPair}
          className="text-xs text-pink-600 font-medium hover:text-pink-700"
        >
          + আরেকটি জোড়া যোগ করুন
        </button>
      </div>

      {/* Marks */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={marks}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Note about shuffle */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
        <p className="text-[10px] font-medium text-green-700 mb-1">নোট:</p>
        <p className="text-[10px] text-green-600">
          প্রিন্টের সময় ডান পাশের অপশনগুলো অটো-শ্যাফল হবে (ক, খ, গ, ঘ এলোমেলো হবে)
        </p>
      </div>
    </div>
  )
}
