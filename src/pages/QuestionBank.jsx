import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { TYPE_LABELS, TYPE_COLORS } from '@/components/questions/QuestionWrapper'

/* ─── Animation variants ─────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

/* ─── Sub-Components ─────────────────────────────────────── */
function QuestionCard({ q, isExpanded, onToggle, onDelete }) {
  const colors = TYPE_COLORS[q.type] || { bg: '#f8fafc', border: '#f1f5f9', text: '#64748b' }

  return (
    <motion.div variants={item}>
      <div className="card" style={{ padding: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 800,
            borderRadius: 8, border: `1px solid ${colors.border}`,
            background: colors.bg,
            color: colors.text,
            padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.02em'
          }}>
            {TYPE_LABELS[q.type]}
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
            {new Date(q.createdAt).toLocaleDateString('bn-BD')}
          </span>
        </div>

        <div onClick={onToggle} style={{ cursor: 'pointer' }}>
           <div style={{ 
             fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.5,
             display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3,
             WebkitBoxOrient: 'vertical', overflow: 'hidden'
           }}>
             {q.data?.question || q.data?.stimulus || q.data?.sentence || "প্রশ্ন উপাত্ত নেই"}
           </div>

           <AnimatePresence>
             {isExpanded && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 style={{ overflow: 'hidden' }}
               >
                 <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {/* MCQ Options */}
                   {q.type === 'MCQ' && (
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                       {(q.data?.options || [q.data?.option_a, q.data?.option_b, q.data?.option_c, q.data?.option_d]).map((opt, oi) => {
                         if (!opt) return null
                         return (
                           <div key={oi} style={{ display: 'flex', gap: 8, background: '#f8fafc', padding: '10px', borderRadius: 10 }}>
                             <span style={{ fontSize: 11, fontWeight: 900, color: '#3b82f6' }}>{['ক', 'খ', 'গ', 'ঘ'][oi]}.</span>
                             <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{opt}</span>
                           </div>
                         )
                       })}
                     </div>
                   )}

                   {/* CQ Sub-questions */}
                   {q.type === 'CQ' && q.data?.sub_questions?.map(sq => (
                     <div key={sq.label} style={{ fontSize: 12, background: '#f5f3ff', padding: '10px', borderRadius: 10, border: '1px solid #ede9fe' }}>
                       <span style={{ fontWeight: 800, color: '#7c3aed', marginRight: 6 }}>{sq.label}.</span>
                       <span style={{ color: '#4b5563' }}>{sq.text}</span>
                       <span style={{ marginLeft: 6, fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>({sq.marks})</span>
                     </div>
                   ))}

                   {/* Answers */}
                   {['short', 'broad', 'translation'].includes(q.type) && q.data?.answer && (
                     <div style={{ fontSize: 12, background: '#f0fdf4', padding: '10px', borderRadius: 10, border: '1px solid #dcfce7' }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', marginBottom: 4, textTransform: 'uppercase' }}>উত্তর সংকেত:</p>
                        <p style={{ color: '#166534', margin: 0 }}>{q.data.answer}</p>
                     </div>
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
           {(q.subject || q.chapter) && (
             <div style={{ display: 'flex', gap: 4 }}>
                {q.subject && <span style={{ fontSize: 9, background: '#f1f5f9', px: 6, py: 2, borderRadius: 6, color: '#64748b', fontWeight: 700, padding: '2px 6px' }}>{q.subject}</span>}
                {q.chapter && <span style={{ fontSize: 9, background: '#f1f5f9', px: 6, py: 2, borderRadius: 6, color: '#64748b', fontWeight: 700, padding: '2px 6px' }}>CH-{q.chapter}</span>}
             </div>
           )}
           <div style={{ flex: 1 }} />
           <button 
             onClick={onToggle}
             className="btn-press"
             style={{
               width: 36, height: 36, borderRadius: 10, background: isExpanded ? '#eff6ff' : '#f8fafc',
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpanded ? '#2563eb' : '#94a3b8'
             }}
           >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
           </button>
           <button 
             onClick={onDelete}
             className="btn-press"
             style={{
               width: 36, height: 36, borderRadius: 10, background: '#fef2f2',
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
             }}
           >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
           </button>
        </div>
      </div>
    </motion.div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn-press"
      style={{
        padding: '8px 16px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#64748b',
        border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: active ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
      }}
    >
      {label}
    </button>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function QuestionBank() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expandedIds, setExpandedIds] = useState(new Set())

  const toggleExpand = (id) => {
    const next = new Set(expandedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedIds(next)
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/questions')
      setQuestions(data.questions || [])
    } catch (err) {
      toast.error('প্রশ্ন ব্যাংক লোড করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি এই প্রশ্নটি ব্যাংক থেকে ডিলিট করতে চান?')) return
    try {
      await api.delete(`/questions/${id}`)
      setQuestions(questions.filter(q => q.id !== id))
      toast.success('প্রশ্নটি ডিলিট করা হয়েছে')
    } catch (err) {
      toast.error('ডিলিট করতে ব্যর্থ')
    }
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !search || 
      (q.data?.question?.toLowerCase().includes(search.toLowerCase())) ||
      (q.data?.stimulus?.toLowerCase().includes(search.toLowerCase()))
    const matchesType = filterType === 'all' || q.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 44, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 36, width: '80%', borderRadius: 100 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 24 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <AnimatePresence mode="wait">
        <motion.div
           variants={container}
           initial="hidden"
           animate="show"
           style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* ── Search Bar ──────────────────────────────────── */}
          <motion.div variants={item}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
               <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>প্রশ্ন ব্যাংক</h1>
               <div style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: 100, border: '1px solid #dbeafe' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb' }}>ব্যবহৃত: {questions.length}/50</span>
               </div>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="প্রশ্ন খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px',
                  background: '#fff', borderRadius: 16,
                  border: '1px solid #f1f5f9', fontSize: 14,
                  boxShadow: 'var(--shadow-sm)', outline: 'none'
                }}
              />
              <svg 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </motion.div>

          {/* ── Filter Chips ────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, margin: '0 -4px', paddingLeft: 4 }}>
              <FilterChip label="সব ধরণের" active={filterType === 'all'} onClick={() => setFilterType('all')} />
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <FilterChip key={val} label={label} active={filterType === val} onClick={() => setFilterType(val)} />
              ))}
            </div>
          </motion.div>

          {/* ── Questions List ──────────────────────────────── */}
          {filteredQuestions.length === 0 ? (
             <motion.div variants={item} style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📖</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>কোনো প্রশ্ন পাওয়া যায়নি</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>পছন্দের প্রশ্নটি ব্যাংকে সেভ করে এখানে খুঁজে পাবেন</p>
             </motion.div>
          ) : (
            filteredQuestions.map(q => (
              <QuestionCard 
                key={q.id}
                q={q}
                isExpanded={expandedIds.has(q.id)}
                onToggle={() => toggleExpand(q.id)}
                onDelete={() => handleDelete(q.id)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
