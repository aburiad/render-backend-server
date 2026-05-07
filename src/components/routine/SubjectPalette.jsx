import useRoutineStore, { SUBJECT_COLOR_PALETTE } from '@/store/routineStore'

export default function SubjectPalette() {
  const subjects = useRoutineStore((s) => s.currentRoutine?.subjects || [])
  const addSubject = useRoutineStore((s) => s.addSubject)
  const updateSubject = useRoutineStore((s) => s.updateSubject)
  const removeSubject = useRoutineStore((s) => s.removeSubject)

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-500">
        নিচে subject + teacher একবার যোগ করুন। পরে গ্রিড-এ tap করলে এই subject-গুলো পপ-আপে আসবে।
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          কোনো subject নেই — নিচের বাটন থেকে যোগ করুন
        </div>
      )}

      <div className="space-y-1.5">
        {subjects.map((sub) => (
          <SubjectRow
            key={sub.id}
            subject={sub}
            onUpdate={(fields) => updateSubject(sub.id, fields)}
            onRemove={() => removeSubject(sub.id)}
          />
        ))}
      </div>

      <button
        onClick={() => addSubject('', '')}
        className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100"
      >
        + নতুন subject যোগ করুন
      </button>
    </div>
  )
}

function SubjectRow({ subject, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
      <ColorPicker value={subject.color} onChange={(c) => onUpdate({ color: c })} />

      <input
        type="text"
        value={subject.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="subject"
        className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={subject.teacher || ''}
        onChange={(e) => onUpdate({ teacher: e.target.value })}
        placeholder="teacher"
        className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={onRemove}
        className="text-gray-300 hover:text-red-500 p-1 flex-shrink-0"
        title="মুছুন"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="relative group flex-shrink-0">
      <button
        type="button"
        title="রং বদলান"
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          background: value || '#94a3b8',
          border: '2px solid #fff',
          boxShadow: '0 0 0 1px #e2e8f0',
        }}
      />
      <div
        className="absolute z-10 left-0 top-7 hidden group-hover:flex flex-wrap gap-1 p-1.5 bg-white border border-gray-200 rounded-lg shadow-lg"
        style={{ width: 160 }}
      >
        {SUBJECT_COLOR_PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: c,
              border: c === value ? '2px solid #000' : '1px solid #e2e8f0',
            }}
          />
        ))}
      </div>
    </div>
  )
}
