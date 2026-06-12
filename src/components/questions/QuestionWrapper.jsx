import usePaperStore from '@/store/paperStore'

const TYPE_LABELS = {
  MCQ: 'MCQ',
  CQ: 'সৃজনশীল (CQ)',
  short: 'সংক্ষিপ্ত প্রশ্ন',
  broad: 'রচনামূলক',
  fill_blank: 'শূন্যস্থান পূরণ',
  matching: 'মিলকরণ',
  rearranging: 'পুনর্বিন্যাস',
  translation: 'অনুবাদ',
  table: 'টেবিল',
  accounting: 'হিসাববিজ্ঞান CQ',
  short_question: 'সংক্ষিপ্ত প্রশ্ন (Scan)',
  one_word: 'এক কথায় উত্তর',
  essay: 'প্রবন্ধ/রচনা',
  paragraph: 'অনুচ্ছেদ লিখন',
  letter: 'চিঠি/দরখাস্ত',
  dialogue: 'কথোপকথন (Dialogue)',
  grammar: 'ব্যাকরণ (Grammar)',
  math: 'গণিত সমাধান',
  finance: 'ফিন্যান্স সমস্যা',
  diagram_question: 'চিত্রভিত্তিক প্রশ্ন',
  arabic: 'আরবি অনুবাদ',
  hifz: 'হিফজুল কুরআন',
  hadith: 'আল-হাদীস',
  ebtedayi: 'এবতেদায়ী মাসআলা',
  poem: 'কবিতা/মূলভাব',
  passage: 'প্যাসেজভিত্তিক প্রশ্ন',
  true_false: 'সত্য/মিথ্যা',
  // New Primary Education Types
  parent_passage: 'প্যাসেজভিত্তিক',
  column_matching: 'মিলকরণ (২ কলাম)',
  visual_grid: 'ছবি তুলনা',
  standard_text: 'শূন্যস্থান/যুক্তাক্ষর',
}

const TYPE_COLORS = {
  MCQ: { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' },
  CQ: { bg: '#f5f3ff', border: '#ede9fe', text: '#7c3aed' },
  short: { bg: '#f0fdf4', border: '#dcfce7', text: '#16a34a' },
  broad: { bg: '#fff7ed', border: '#ffedd5', text: '#ea580c' },
  fill_blank: { bg: '#ecfeff', border: '#cffafe', text: '#0891b2' },
  matching: { bg: '#fdf2f8', border: '#fce7f3', text: '#db2777' },
  rearranging: { bg: '#fefce8', border: '#fef9c3', text: '#854d0e' },
  translation: { bg: '#eef2ff', border: '#e0e7ff', text: '#4f46e5' },
  table: { bg: '#fef2f2', border: '#fee2e2', text: '#dc2626' },
  accounting: { bg: '#ecfdf5', border: '#d1fae5', text: '#059669' },
  short_question: { bg: '#f0fdf4', border: '#dcfce7', text: '#16a34a' },
  one_word: { bg: '#f0fdfa', border: '#ccfbf1', text: '#0d9488' },
  essay: { bg: '#fff7ed', border: '#ffedd5', text: '#ea580c' },
  paragraph: { bg: '#fefaf0', border: '#fef3c7', text: '#d97706' },
  letter: { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' },
  dialogue: { bg: '#eef2ff', border: '#e0e7ff', text: '#4f46e5' },
  grammar: { bg: '#f0f9ff', border: '#e0f2fe', text: '#0284c7' },
  math: { bg: '#fff1f2', border: '#ffe4e6', text: '#e11d48' },
  finance: { bg: '#ecfdf5', border: '#d1fae5', text: '#059669' },
  diagram_question: { bg: '#f5f3ff', border: '#ede9fe', text: '#7c3aed' },
  arabic: { bg: '#f7fee7', border: '#ecfccb', text: '#4d7c0f' },
  hifz: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  hadith: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
  ebtedayi: { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  poem: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  passage: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
  true_false: { bg: '#fef2f2', border: '#fee2e2', text: '#dc2626' },
  // New Primary Education Types
  parent_passage: { bg: '#f0fdf4', border: '#dcfce7', text: '#16a34a' },
  column_matching: { bg: '#fdf2f8', border: '#fce7f3', text: '#db2777' },
  visual_grid: { bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
  standard_text: { bg: '#ecfeff', border: '#cffafe', text: '#0891b2' },
}

export default function QuestionWrapper({ question, index, displayNumber, questionDirection = 'ltr', children, dragHandleProps }) {
  const removeQuestion = usePaperStore((s) => s.removeQuestion)
  const duplicateQuestion = usePaperStore((s) => s.duplicateQuestion)
  const colors = TYPE_COLORS[question.type] || { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b' }

  return (
    <div
      className="rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden relative bg-white"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Card Header & Controls */}
      <div
        className="flex items-center gap-1.5 sm:gap-2.5 px-2 py-2 sm:px-3.5 sm:py-3 border-b border-slate-100"
        style={{
          background: '#fcfcfd',
          flexDirection: questionDirection === 'rtl' ? 'row-reverse' : 'row',
        }}
      >
        {/* Drag Handle */}
        <button
          {...dragHandleProps}
          className="btn-press p-1 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400"
          style={{ cursor: 'grab' }}
        >
          <svg className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M8 12h8" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 5V4M12 20v-1M8 12H7M17 12h-1" />
          </svg>
        </button>

        <span
          dir="ltr"
          className="text-[11px] sm:text-[13px] font-black text-slate-400 min-w-[18px] sm:min-w-[20px]"
          style={{ unicodeBidi: 'isolate' }}
        >
          {(displayNumber != null ? displayNumber : index + 1)}.
        </span>

        <span
          className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg uppercase truncate"
          style={{
            border: `1px solid ${colors.border}`,
            background: colors.bg,
            color: colors.text,
            letterSpacing: '0.02em',
          }}
        >
          {TYPE_LABELS[question.type] || question.type}
        </span>

        <div className="flex-1" />

        {/* Action Group */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => duplicateQuestion(question.id)}
            className="btn-press p-1 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-center bg-white border border-slate-200 text-amber-500"
            title="ডুপ্লিকেট"
          >
             <svg className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
             </svg>
          </button>
          <button
            onClick={() => removeQuestion(question.id)}
            className="btn-press p-1 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-center bg-red-100 border border-red-200 text-red-500"
            title="ডিলিট"
          >
             <svg className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.244 2.244 0 01-2.244 2.077H8.084a2.244 2.244 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
             </svg>
          </button>
        </div>
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-5">
        {children}
      </div>
    </div>
  )
}

export { TYPE_LABELS, TYPE_COLORS }
