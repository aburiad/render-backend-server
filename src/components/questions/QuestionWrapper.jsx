import { useState } from 'react'
import usePaperStore from '@/store/paperStore'
import api from '@/services/api'
import toast from 'react-hot-toast'

const TYPE_LABELS = {
  MCQ: 'MCQ',
  CQ: 'সৃজনশীল (CQ)',
  short: 'সংক্ষিপ্ত প্রশ্ন',
  broad: 'রচনামূলক',
  fill_blank: 'শূন্যস্থান পূরণ',
  matching: 'মিলকরণ',
  rearranging: 'পুনর্বিন্যাস',
  translation: 'অনুবাদ',
  table: 'টেবিল/হিসাববিজ্ঞান',
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
}

export default function QuestionWrapper({ question, index, children, dragHandleProps }) {
  const removeQuestion = usePaperStore((s) => s.removeQuestion)
  const duplicateQuestion = usePaperStore((s) => s.duplicateQuestion)
  const currentPaper = usePaperStore((s) => s.currentPaper)
  const [saving, setSaving] = useState(false)

  const colors = TYPE_COLORS[question.type] || { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b' }

  const handleSaveToBank = async () => {
    setSaving(true)
    try {
      await api.post('/questions', {
        type: question.type,
        data: question,
        subject: currentPaper?.subject || '',
        chapter: question.section || '',
      })
      toast.success('প্রশ্নটি ব্যাংক-এ সেভ হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'ব্যাংক-এ সেভ করতে ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
      boxShadow: 'var(--shadow-card)', overflow: 'hidden', position: 'relative'
    }}>
      {/* Card Header & Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px 10px', background: '#fcfcfd',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Drag Handle */}
        <button
          {...dragHandleProps}
          className="btn-press"
          style={{
            padding: 8, background: '#fff', borderRadius: 10,
            border: '1px solid #e2e8f0', color: '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M8 12h8" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 5V4M12 20v-1M8 12H7M17 12h-1" />
          </svg>
        </button>

        <span style={{ fontSize: 13, fontWeight: 900, color: '#94a3b8', minWidth: 20 }}>{index + 1}.</span>

        <span style={{
          fontSize: 10, fontWeight: 800, padding: '4px 10px',
          borderRadius: 8, border: `1px solid ${colors.border}`,
          background: colors.bg, color: colors.text,
          textTransform: 'uppercase', letterSpacing: '0.02em'
        }}>
          {TYPE_LABELS[question.type] || question.type}
        </span>

        <div style={{ flex: 1 }} />

        {/* Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleSaveToBank}
            disabled={saving}
            className="btn-press"
            style={{
              padding: 8, background: '#fff', borderRadius: 10,
              border: '1px solid #e2e8f0', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="ব্যাংকে সেভ"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
             </svg>
          </button>
          <button
            onClick={() => duplicateQuestion(question.id)}
            className="btn-press"
            style={{
              padding: 8, background: '#fff', borderRadius: 10,
              border: '1px solid #e2e8f0', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="ডুপ্লিকেট"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
             </svg>
          </button>
          <button
            onClick={() => removeQuestion(question.id)}
            className="btn-press"
            style={{
              padding: 8, background: '#fee2e2', borderRadius: 10,
              border: '1px solid #fecaca', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="ডিলিট"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.244 2.244 0 01-2.244 2.077H8.084a2.244 2.244 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
             </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {children}
      </div>
    </div>
  )
}

export { TYPE_LABELS, TYPE_COLORS }
