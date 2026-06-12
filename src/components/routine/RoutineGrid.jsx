import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useRoutineStore from '@/store/routineStore'

export default function RoutineGrid() {
  const routine = useRoutineStore((s) => s.currentRoutine)
  const setCell = useRoutineStore((s) => s.setCell)
  const updatePeriod = useRoutineStore((s) => s.updatePeriod)
  const removePeriod = useRoutineStore((s) => s.removePeriod)
  const addPeriod = useRoutineStore((s) => s.addPeriod)
  const setDays = useRoutineStore((s) => s.setDays)
  const copyDayColumn = useRoutineStore((s) => s.copyDayColumn)
  const addSubject = useRoutineStore((s) => s.addSubject)

  const [picker, setPicker] = useState(null) // { dayIdx, periodId }
  const [copyMenu, setCopyMenu] = useState(null) // dayIdx

  const days = routine?.days || []
  const periods = routine?.periods || []
  const subjects = routine?.subjects || []

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects],
  )
  const cellMap = useMemo(() => {
    const m = {}
    for (const c of routine?.cells || []) m[`${c.day_index}_${c.period_id}`] = c
    return m
  }, [routine?.cells])

  const handleAddDay = () => {
    const opts = ['শুক্র', 'শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ']
    const next = opts.find((d) => !days.includes(d)) || `দিন ${days.length + 1}`
    setDays([...days, next])
  }

  const handleRemoveDay = (idx) => {
    if (days.length <= 1) return
    setDays(days.filter((_, i) => i !== idx))
  }

  const handleRenameDay = (idx, value) => {
    const next = [...days]
    next[idx] = value
    setDays(next)
  }

  return (
    <div className="space-y-3">
      {/* Days controls */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-bold text-gray-500">দিনসমূহ:</span>
        {days.map((d, i) => (
          <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={d}
              onChange={(e) => handleRenameDay(i, e.target.value)}
              className="w-12 bg-transparent text-xs font-medium focus:outline-none"
            />
            <button
              onClick={() => handleRemoveDay(i)}
              disabled={days.length <= 1}
              className="text-gray-300 hover:text-red-500 disabled:opacity-30"
              title="মুছুন"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          onClick={handleAddDay}
          className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg"
        >
          + দিন
        </button>
      </div>

      {/* Mobile scroll hint */}
      <div className="lg:hidden flex items-center gap-1.5 text-[11px] text-gray-500 px-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m0 0l-6-6m6 6l-6 6" />
        </svg>
        গ্রিড ডানে স্ক্রল করুন
      </div>

      {/* Grid — table grows to content width via minWidth on cells; parent
          enforces horizontal scroll on mobile. `w-full` removed so the
          table doesn't try to shrink cells below their tap-friendly size. */}
      <div className="routine-grid-scroll bg-white border border-gray-200 rounded-xl" style={{ overflowX: 'auto' }}>
        <table className="text-xs" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2 text-[11px] font-bold text-gray-600" style={{ minWidth: 130 }}>
                পিরিয়ড
              </th>
              {days.map((d, i) => (
                <th key={i} className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2 text-[11px] font-bold text-gray-600 relative" style={{ minWidth: 110 }}>
                  <div className="flex items-center justify-center gap-1">
                    {d}
                    <button
                      onClick={() => setCopyMenu(copyMenu === i ? null : i)}
                      className="text-gray-300 hover:text-blue-600"
                      title="কপি/পেস্ট"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25" />
                      </svg>
                    </button>
                  </div>
                  {copyMenu === i && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-1.5">
                      <div className="text-[10px] font-bold text-gray-500 px-2 py-1">কোন দিন থেকে কপি?</div>
                      {days.map((src, srcIdx) => (
                        srcIdx !== i && (
                          <button
                            key={srcIdx}
                            onClick={() => {
                              copyDayColumn(srcIdx, i)
                              setCopyMenu(null)
                            }}
                            className="w-full text-left px-2 py-1 text-[11px] hover:bg-blue-50 rounded"
                          >
                            ← {src} এর routine কপি
                          </button>
                        )
                      ))}
                      <button
                        onClick={() => setCopyMenu(null)}
                        className="w-full text-left px-2 py-1 text-[11px] text-gray-400 hover:bg-gray-50 rounded"
                      >
                        বাতিল
                      </button>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <PeriodRow
                key={p.id}
                period={p}
                days={days}
                subjectMap={subjectMap}
                cellMap={cellMap}
                onCellClick={(dayIdx) => setPicker({ dayIdx, periodId: p.id })}
                onUpdatePeriod={(fields) => updatePeriod(p.id, fields)}
                onRemovePeriod={() => removePeriod(p.id)}
                canRemove={periods.length > 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addPeriod}
        className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100"
      >
        + পিরিয়ড যোগ করুন
      </button>

      {/* Cell picker modal */}
      <AnimatePresence>
        {picker && (
          <CellPickerModal
            dayLabel={days[picker.dayIdx]}
            period={periods.find((p) => p.id === picker.periodId)}
            subjects={subjects}
            currentSubjectId={cellMap[`${picker.dayIdx}_${picker.periodId}`]?.subject_id}
            onPick={(subjectId) => {
              setCell(picker.dayIdx, picker.periodId, subjectId)
              setPicker(null)
            }}
            onAddNewSubject={() => {
              addSubject('', '')
            }}
            onClose={() => setPicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PeriodRow({
  period,
  days,
  subjectMap,
  cellMap,
  onCellClick,
  onUpdatePeriod,
  onRemovePeriod,
  canRemove,
}) {
  return (
    <tr>
      {/* Period label cell */}
      <td className={`border-r border-b border-gray-200 px-1.5 py-1 ${period.is_break ? 'bg-amber-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={period.label}
            onChange={(e) => onUpdatePeriod({ label: e.target.value })}
            className="w-full px-1.5 py-1 text-[11px] font-bold bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={onRemovePeriod}
            disabled={!canRemove}
            className="text-gray-300 hover:text-red-500 p-0.5 disabled:opacity-30"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 mt-1">
          <input
            type="time"
            value={period.start || ''}
            onChange={(e) => onUpdatePeriod({ start: e.target.value })}
            className="w-full px-1 py-0.5 text-[9px] bg-white border border-gray-200 rounded focus:outline-none"
          />
          <input
            type="time"
            value={period.end || ''}
            onChange={(e) => onUpdatePeriod({ end: e.target.value })}
            className="w-full px-1 py-0.5 text-[9px] bg-white border border-gray-200 rounded focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-1 mt-1 text-[10px] text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={period.is_break || false}
            onChange={(e) =>
              onUpdatePeriod({
                is_break: e.target.checked,
                break_label: e.target.checked && !period.break_label ? 'টিফিন ব্রেক' : period.break_label,
              })
            }
          />
          ব্রেক
        </label>
      </td>

      {/* Data cells */}
      {period.is_break ? (
        <td colSpan={days.length} className="border-r border-b border-gray-200 px-2 py-3 bg-amber-50 text-center">
          <input
            type="text"
            value={period.break_label || ''}
            onChange={(e) => onUpdatePeriod({ break_label: e.target.value })}
            placeholder="টিফিন ব্রেক"
            className="w-full max-w-xs mx-auto px-2 py-1 text-xs font-bold text-amber-800 bg-white/80 border border-amber-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
          />
        </td>
      ) : (
        days.map((_, dayIdx) => {
          const cell = cellMap[`${dayIdx}_${period.id}`]
          const subject = cell ? subjectMap[cell.subject_id] : null
          return (
            <td
              key={dayIdx}
              onClick={() => onCellClick(dayIdx)}
              className="border-r border-b border-gray-200 px-1.5 py-1 cursor-pointer hover:bg-blue-50 transition-colors"
              style={{
                borderLeft: subject ? `4px solid ${subject.color || '#475569'}` : undefined,
                minWidth: 100,
              }}
            >
              {subject ? (
                <div className="text-center">
                  <div className="text-[11px] font-bold text-gray-900">{subject.name}</div>
                  {subject.teacher && (
                    <div className="text-[9px] text-gray-500 truncate">{subject.teacher}</div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-300 text-xs py-2">+</div>
              )}
            </td>
          )
        })
      )}
    </tr>
  )
}

function CellPickerModal({ dayLabel, period, subjects, currentSubjectId, onPick, onAddNewSubject, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-gray-400">পিরিয়ড নির্বাচন</div>
            <h3 className="text-base font-bold text-gray-900">
              {dayLabel} • {period?.label}
              {period?.start && period?.end && (
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({period.start}–{period.end})
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {subjects.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">এই রুটিনে কোনো subject যোগ করা হয়নি।</p>
              <button
                onClick={() => {
                  onAddNewSubject()
                  onClose()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
              >
                + উপরের প্যানেলে যান
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPick(null)}
                className={`p-3 rounded-xl text-left border-2 ${
                  !currentSubjectId
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="text-xs font-bold text-gray-500">ফাঁকা</div>
                <div className="text-[10px] text-gray-400">কোনো subject নয়</div>
              </button>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onPick(s.id)}
                  className={`p-3 rounded-xl text-left border-2 transition-all ${
                    currentSubjectId === s.id
                      ? 'border-gray-900 ring-2 ring-blue-200'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  style={{
                    background: currentSubjectId === s.id ? `${s.color}10` : '#fff',
                    borderLeft: `4px solid ${s.color || '#475569'}`,
                  }}
                >
                  <div className="text-sm font-bold text-gray-900">{s.name || '(নামহীন)'}</div>
                  {s.teacher && (
                    <div className="text-[10px] text-gray-500 truncate">{s.teacher}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
