import { useRef } from 'react'
import usePaperStore from '@/store/paperStore'
import { MathPreview } from '@/utils/mathRender'
import StimulusImage from '@/components/shared/StimulusImage'
import AutoTextarea from '@/components/shared/AutoTextarea'
import MathLiveEditor from './MathLiveEditor'
import {
  NUMBERING_OPTIONS,
  LAYOUT_OPTIONS,
  getSubLabel,
} from '@/utils/subNumbering'

const ALIGN_OPTIONS = [
  { value: 'left', label: '◀', title: 'বাম' },
  { value: 'center', label: '▬', title: 'মাঝে' },
  { value: 'right', label: '▶', title: 'ডান' },
]

export default function AccountingEditor({ question }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const descriptionRef = useRef(null)
  const notesRef = useRef(null)
  const subRefs = useRef([])

  const description = question.description || ''
  const titleLines = question.title_lines || ['', '', '']
  const headers = question.headers || ['হিসাবের নাম', 'ডেবিট (টাকা)', 'ক্রেডিট (টাকা)']
  const alignments = question.alignments || headers.map((_, i) => (i === 0 ? 'left' : 'right'))
  const rows = question.rows || [new Array(headers.length).fill(''), new Array(headers.length).fill('')]
  const showTotal = question.show_total !== false
  const totalRow = question.total_row || ['মোট', ...new Array(headers.length - 1).fill('')]
  const notes = question.notes || ''
  const notesLabel = question.notes_label ?? 'সমন্বয়সমূহ'
  const subQuestions = question.sub_questions || [
    { label: 'ক', text: '', marks: 2 },
    { label: 'খ', text: '', marks: 4 },
    { label: 'গ', text: '', marks: 4 },
  ]
  const numbering = question.sub_numbering || 'bn-letter'
  const layout = question.sub_layout || 1

  const set = (fields) => updateQuestion(question.id, fields)

  const updateHeader = (i, v) => {
    const next = [...headers]
    next[i] = v
    set({ headers: next })
  }

  const updateAlignment = (i, v) => {
    const next = [...alignments]
    next[i] = v
    set({ alignments: next })
  }

  const updateCell = (ri, ci, v) => {
    const next = rows.map((r) => [...r])
    while (next[ri].length < headers.length) next[ri].push('')
    next[ri][ci] = v
    set({ rows: next })
  }

  const updateTotal = (ci, v) => {
    const next = [...totalRow]
    while (next.length < headers.length) next.push('')
    next[ci] = v
    set({ total_row: next })
  }

  const addRow = () => set({ rows: [...rows, new Array(headers.length).fill('')] })
  const removeRow = (i) => {
    if (rows.length <= 1) return
    set({ rows: rows.filter((_, idx) => idx !== i) })
  }

  const addColumn = () => {
    set({
      headers: [...headers, ''],
      alignments: [...alignments, 'right'],
      rows: rows.map((r) => [...r, '']),
      total_row: [...totalRow, ''],
    })
  }

  const removeColumn = (i) => {
    if (headers.length <= 2) return
    set({
      headers: headers.filter((_, idx) => idx !== i),
      alignments: alignments.filter((_, idx) => idx !== i),
      rows: rows.map((r) => r.filter((_, idx) => idx !== i)),
      total_row: totalRow.filter((_, idx) => idx !== i),
    })
  }

  const updateTitleLine = (i, v) => {
    const next = [...titleLines]
    next[i] = v
    set({ title_lines: next })
  }

  const addTitleLine = () => set({ title_lines: [...titleLines, ''] })
  const removeTitleLine = (i) => {
    if (titleLines.length <= 1) return
    set({ title_lines: titleLines.filter((_, idx) => idx !== i) })
  }

  const updateSub = (i, field, v) => {
    const next = [...subQuestions]
    next[i] = { ...next[i], [field]: v }
    set({ sub_questions: next })
  }

  const addSub = () => {
    set({ sub_questions: [...subQuestions, { label: '', text: '', marks: 0 }] })
  }
  const removeSub = (i) => {
    if (subQuestions.length <= 1) return
    set({ sub_questions: subQuestions.filter((_, idx) => idx !== i) })
  }

  const totalMarks = subQuestions.reduce((s, sq) => s + (Number(sq.marks) || 0), 0)

  return (
    <div className="space-y-4">
      {/* 1. বিবরণ — top intro line */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">বিবরণ (উপরের পরিচিতি)</label>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5">
          <AutoTextarea
            ref={descriptionRef}
            value={description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="উদা: শাপলু এন্ড কোং-এর ২০১৬ সালের ৩০ জুন তারিখের রেওয়ামিলটি নিম্নরূপ:"
            rows={2}
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={descriptionRef} onInsert={(v) => set({ description: v })} />
          </div>
        </div>
        <MathPreview text={description} />
        <StimulusImage
          value={question.description_image}
          onChange={(v) => set({ description_image: v })}
          accentColor="#059669"
          label="+ ছবি যোগ করুন (বিবরণে)"
        />
      </div>

      {/* 2. টেবিলের কেন্দ্রিক শিরোনাম (e.g. কোম্পানির নাম / টেবিলের নাম / তারিখ) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">টেবিলের শিরোনাম (কেন্দ্রিক)</label>
        <div className="space-y-1.5">
          {titleLines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={line}
                onChange={(e) => updateTitleLine(i, e.target.value)}
                placeholder={i === 0 ? 'প্রতিষ্ঠানের নাম' : i === 1 ? 'টেবিলের ধরন (যেমন: রেওয়ামিল)' : 'তারিখ'}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {titleLines.length > 1 && (
                <button
                  onClick={() => removeTitleLine(i)}
                  className="text-gray-300 hover:text-red-500 px-1"
                  title="মুছুন"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addTitleLine}
          className="mt-2 text-xs text-emerald-700 font-medium hover:text-emerald-800"
        >
          + লাইন যোগ করুন
        </button>
      </div>

      {/* 3. টেবিল */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">টেবিল</label>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="bg-gray-50 border border-gray-200 p-0 align-top">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => updateHeader(i, e.target.value)}
                        placeholder={`কলাম ${i + 1}`}
                        className="flex-1 px-2 py-2 bg-transparent text-xs font-bold text-center focus:outline-none focus:bg-blue-50"
                      />
                      {headers.length > 2 && (
                        <button
                          onClick={() => removeColumn(i)}
                          className="px-1 text-gray-300 hover:text-red-500"
                          title="কলাম মুছুন"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex justify-center gap-0.5 pb-1.5">
                      {ALIGN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateAlignment(i, opt.value)}
                          title={opt.title}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            alignments[i] === opt.value
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-400 hover:text-emerald-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </th>
                ))}
                <th className="bg-gray-50 border border-gray-200 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {headers.map((_, ci) => (
                    <td key={ci} className="border border-gray-200 p-0">
                      <input
                        type="text"
                        value={row[ci] ?? ''}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        style={{ textAlign: alignments[ci] || 'left' }}
                        className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-blue-50"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-200 p-0">
                    <button
                      onClick={() => removeRow(ri)}
                      disabled={rows.length <= 1}
                      className="w-full p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-30"
                      title="সারি মুছুন"
                    >
                      <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}

              {/* মোট row — toggleable */}
              {showTotal && (
                <tr style={{ background: '#f0fdf4' }}>
                  {headers.map((_, ci) => (
                    <td key={ci} className="border-2 border-emerald-300 p-0">
                      <input
                        type="text"
                        value={totalRow[ci] ?? ''}
                        onChange={(e) => updateTotal(ci, e.target.value)}
                        placeholder={ci === 0 ? 'মোট' : ''}
                        style={{ textAlign: alignments[ci] || 'left', fontWeight: 700 }}
                        className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-blue-50"
                      />
                    </td>
                  ))}
                  <td className="border-2 border-emerald-300" />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between mt-2">
          <div className="flex flex-wrap gap-3">
            <button onClick={addRow} className="text-xs text-emerald-700 font-medium hover:text-emerald-800">
              + সারি যোগ করুন
            </button>
            <button onClick={addColumn} className="text-xs text-emerald-700 font-medium hover:text-emerald-800">
              + কলাম যোগ করুন
            </button>
            <button
              onClick={() => set({ show_total: !showTotal })}
              className={`text-xs font-medium ${showTotal ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-700 hover:text-emerald-800'}`}
            >
              {showTotal ? '− মোট সারি সরান' : '+ মোট সারি'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. সমন্বয়/Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">সমন্বয় / টীকা (টেবিলের নিচে)</label>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] text-gray-400">শিরোনাম:</span>
          <input
            type="text"
            value={notesLabel}
            onChange={(e) => set({ notes_label: e.target.value })}
            placeholder="সমন্বয়সমূহ"
            className="w-40 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5">
          <AutoTextarea
            ref={notesRef}
            value={notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="উদা: ১. সমাপনী মজুদ পণ্য ৩৫,০০০ টাকা। ২. দেনাদারের ২,৫০০ টাকা আদায়যোগ্য নয়। ..."
            rows={3}
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <div className="flex justify-end sm:block">
            <MathLiveEditor inputRef={notesRef} onInsert={(v) => set({ notes: v })} />
          </div>
        </div>
        <MathPreview text={notes} />
      </div>

      {/* 5. Sub-questions */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">প্রশ্নসমূহ</label>

        {/* Numbering + layout controls */}
        <div className="flex flex-wrap items-center gap-3 px-2 py-2 mb-2 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-emerald-700">নম্বরিং:</span>
            <select
              value={numbering}
              onChange={(e) => set({ sub_numbering: e.target.value })}
              className="text-xs px-2 py-1 bg-white border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {NUMBERING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-emerald-700">কলাম:</span>
            <div className="flex bg-white border border-emerald-200 rounded-md p-0.5">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set({ sub_layout: opt.value })}
                  className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    layout === opt.value
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
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
          {subQuestions.map((sub, i) => {
            const displayLabel = getSubLabel(numbering, i, sub.label)
            return (
              <div key={i}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="w-7 h-8 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                      {displayLabel}.
                    </span>
                    <AutoTextarea
                      ref={(el) => { subRefs.current[i] = el }}
                      value={sub.text}
                      onChange={(e) => updateSub(i, 'text', e.target.value)}
                      placeholder={`${displayLabel} নং প্রশ্ন...`}
                      rows={2}
                      className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pl-9 sm:pl-0">
                    {layout === 1 && (
                      <MathLiveEditor
                        inputRef={{ get current() { return subRefs.current[i] } }}
                        onInsert={(v) => updateSub(i, 'text', v)}
                      />
                    )}
                    <input
                      type="number"
                      value={sub.marks || ''}
                      onChange={(e) => updateSub(i, 'marks', Number(e.target.value))}
                      min={0}
                      placeholder="মার্ক"
                      className="w-12 px-1.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-shrink-0"
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

        <button
          onClick={addSub}
          className="mt-2 text-xs text-emerald-700 font-medium hover:text-emerald-800"
        >
          + প্রশ্ন যোগ করুন
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>মোট নম্বর:</span>
        <span className="font-bold text-emerald-700">{totalMarks}</span>
      </div>
    </div>
  )
}
