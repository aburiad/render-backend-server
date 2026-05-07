import usePaperStore from '@/store/paperStore'

// Section divider lives in the questions array as { type: 'section' }.
// It is NOT a question — no marks, no preview, no save-to-bank. The
// renderer (PaperTemplate) treats it as a header + optional instruction
// and resets question numbering at each occurrence (when section mode
// is on).
export default function SectionDivider({ question, dragHandleProps }) {
  const updateQuestion = usePaperStore((s) => s.updateQuestion)
  const removeQuestion = usePaperStore((s) => s.removeQuestion)

  const set = (fields) => updateQuestion(question.id, fields)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        borderRadius: 18,
        padding: '12px 14px',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
        border: '1px solid #334155',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button
          {...dragHandleProps}
          className="btn-press"
          style={{
            padding: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>

        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.12)',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid rgba(251, 191, 36, 0.25)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          বিভাগ ডিভাইডার
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => removeQuestion(question.id)}
          className="btn-press"
          style={{
            padding: 6,
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 8,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="বিভাগ মুছুন"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        type="text"
        value={question.title || ''}
        onChange={(e) => set({ title: e.target.value })}
        placeholder="বিভাগের শিরোনাম (যেমন: ক বিভাগ)"
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 16,
          fontWeight: 800,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          color: '#fff',
          outline: 'none',
          marginBottom: 8,
        }}
      />

      <textarea
        value={question.instruction || ''}
        onChange={(e) => set({ instruction: e.target.value })}
        placeholder="নির্দেশনা (ঐচ্ছিক): যেমন — যেকোনো ৫টির উত্তর দাও"
        rows={2}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 10,
          color: '#e2e8f0',
          outline: 'none',
          resize: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
