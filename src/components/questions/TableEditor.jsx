import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import MathSymbolPicker from './MathSymbolPicker'
import { MathPreview } from '@/utils/mathRender'

export default function TableEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const lastFocused = useRef(null)
  const lastFocusedSetter = useRef(null)
  const questionRef = useRef(null)

  const headers = question.headers || ['', '', '']
  const rows = question.rows || [['', '', ''], ['', '', '']]

  const handleHeaderChange = (index, value) => {
    const updated = [...headers]
    updated[index] = value
    updateQuestion(question.id, { headers: updated })
  }

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updated = rows.map((r) => [...r])
    updated[rowIndex][colIndex] = value
    updateQuestion(question.id, { rows: updated })
  }

  const addRow = () => {
    updateQuestion(question.id, {
      rows: [...rows, new Array(headers.length).fill('')],
    })
  }

  const removeRow = (index) => {
    if (rows.length <= 1) return
    updateQuestion(question.id, {
      rows: rows.filter((_, i) => i !== index),
    })
  }

  const addColumn = () => {
    updateQuestion(question.id, {
      headers: [...headers, ''],
      rows: rows.map((r) => [...r, '']),
    })
  }

  const removeColumn = (index) => {
    if (headers.length <= 2) return
    updateQuestion(question.id, {
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((r) => r.filter((_, i) => i !== index)),
    })
  }

  const onCellFocus = (el, setter) => {
    lastFocused.current = el
    lastFocusedSetter.current = setter
  }

  const insertIntoActiveCell = (newValue) => {
    if (lastFocusedSetter.current) lastFocusedSetter.current(newValue)
  }

  const sharedInputRef = { get current() { return lastFocused.current } }

  return (
    <div className="space-y-3">
      {/* Question text */}
      <div>
        <div className="flex items-start gap-1.5">
          <textarea
            ref={questionRef}
            value={question.question || ''}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            onFocus={(e) => onCellFocus(e.target, (v) => updateQuestion(question.id, { question: v }))}
            placeholder="প্রশ্ন/নির্দেশনা লিখুন... (গণিত: $\frac{a}{b}$)"
            rows={2}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <MathSymbolPicker inputRef={sharedInputRef} onInsert={insertIntoActiveCell} />
        </div>
        <MathPreview text={question.question} />
      </div>

      {/* Accounting type toggle */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">হিসাববিজ্ঞান টেবিল:</label>
        <button
          type="button"
          onClick={() => updateQuestion(question.id, { accounting_type: !question.accounting_type })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            question.accounting_type ? 'bg-red-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              question.accounting_type ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="bg-gray-50 border border-gray-200 p-0">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                      onFocus={(e) => onCellFocus(e.target, (v) => handleHeaderChange(i, v))}
                      placeholder={`কলাম ${i + 1}`}
                      className="flex-1 px-2 py-2 bg-transparent text-xs font-semibold text-center focus:outline-none focus:bg-blue-50"
                    />
                    {headers.length > 2 && (
                      <button
                        onClick={() => removeColumn(i)}
                        className="px-1 text-gray-300 hover:text-red-500"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="bg-gray-50 border border-gray-200 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-gray-200 p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                      onFocus={(e) => onCellFocus(e.target, (v) => handleCellChange(ri, ci, v))}
                      className="w-full px-2 py-2 text-xs text-center focus:outline-none focus:bg-blue-50"
                    />
                  </td>
                ))}
                <td className="border border-gray-200 p-0">
                  <button
                    onClick={() => removeRow(ri)}
                    disabled={rows.length <= 1}
                    className="w-full p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <button onClick={addRow} className="text-xs text-red-600 font-medium hover:text-red-700">
            + সারি যোগ করুন
          </button>
          <button onClick={addColumn} className="text-xs text-red-600 font-medium hover:text-red-700">
            + কলাম যোগ করুন
          </button>
        </div>
        <span className="text-[10px] text-gray-400">
          ঘরে ক্লিক করে fx বাটন থেকে সূত্র যোগ করুন
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">নম্বর:</label>
        <input
          type="number"
          value={question.marks || ''}
          onChange={(e) => updateQuestion(question.id, { marks: Number(e.target.value) })}
          min={0}
          className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
