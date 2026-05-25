import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import usePaperStore from '@/store/paperStore'
import { SkeletonListItem } from '@/components/shared/SkeletonCard'
import { BottomSheetItem } from '@/components/shared/BottomSheet'
import Modal from '@/components/shared/Modal'
import FAB from '@/components/shared/FAB'

/* ─── Helpers ─────────────────────────────────────────────── */
function getQuestionCount(paper) {
  return paper.questions?.length || 0
}

function getMarksTotal(paper) {
  return (paper.questions || []).reduce((sum, q) => {
    if (q.type === 'CQ') {
      return sum + (q.sub_questions || []).reduce((s, sq) => s + (Number(sq.marks) || 0), 0)
    }
    return sum + (Number(q.marks) || 0)
  }, 0)
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp._seconds
    ? new Date(timestamp._seconds * 1000)
    : new Date(timestamp)
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Paper Item row ─────────────────────────────────────── */
function PaperItem({ paper, onLongPress, onDelete, onDuplicate, deleting, duplicating, omrPickerMode = false }) {
  const qCount = getQuestionCount(paper)
  const marks = getMarksTotal(paper)
  const initial = (paper.exam_title || paper.institution_name || 'প')?.charAt(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = useNavigate()
  // When the list was opened via "OMR শিট" quick action, the primary tap
  // target jumps straight to the OMR sheet for that paper instead of the
  // editor — that's what the user just selected the paper for.
  const primaryHref = omrPickerMode ? `/papers/${paper.id}/omr` : `/papers/${paper.id}`

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {/* Left clickable area (avatar + text) — navigates to paper */}
          <div
            onClick={() => navigate(primaryHref)}
            className="btn-press"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              flex: 1, minWidth: 0, cursor: 'pointer',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--radius-md)', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)', fontWeight: 800, fontSize: 16,
            }}>
              {initial}
            </div>

            {/* Text block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {paper.exam_title || 'শিরোনামবিহীন'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                  {qCount} প্রশ্ন
                </span>
                {marks > 0 && (
                  <>
                    <span style={{ color: 'var(--border)', fontSize: 8 }}>·</span>
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                      {marks} নম্বর
                    </span>
                  </>
                )}
                {paper.updatedAt && (
                  <>
                    <span style={{ color: 'var(--border)', fontSize: 8 }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(paper.updatedAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right — menu button only */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            title="আরো অপশন"
            style={{
              width: 34, height: 34, borderRadius: 'var(--radius-full)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
            className="btn-press"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Per-paper action menu — centered Modal so it appears in screen
          center regardless of which row was clicked (BottomSheet anchored
          to viewport bottom felt off-center for items lower in the list). */}
      <Modal isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={paper.exam_title || 'প্রশ্নপত্র'}>
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/papers/${paper.id}`) }}
          label="সম্পাদনা করুন"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/papers/${paper.id}/preview`) }}
          label="PDF প্রিভিউ"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/papers/${paper.id}/omr`) }}
          label="OMR শিট"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-7-8h8a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm0 0V3m8 1V3" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); onDuplicate(paper) }}
          label={duplicating === paper.id ? 'কপি হচ্ছে...' : 'ডুপ্লিকেট করুন'}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>}
        />
        <div className="divider" />
        <BottomSheetItem
          onClick={async () => {
            setMenuOpen(false)
            onDelete(paper.id)
          }}
          label={deleting === paper.id ? 'মুছছে...' : 'মুছে দিন'}
          danger
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
        />
      </Modal>
    </>
  )
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 36,
      }}>
        📄
      </div>
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
        কোনো প্রশ্নপত্র নেই
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '0 0 24px' }}>
        এখনো কোনো প্রশ্নপত্র তৈরি করেননি। এখনই শুরু করুন!
      </p>
      <button
        onClick={onNew}
        className="btn btn-primary"
        style={{ margin: '0 auto', fontSize: 'var(--text-sm)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        প্রথম প্রশ্নপত্র তৈরি করুন
      </button>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────── */
export default function PapersList() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [duplicating, setDuplicating] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Dashboard-এর "OMR শিট" quick action `/papers?omr=1` দিয়ে আসে। সেক্ষেত্রে
  // banner দেখাই এবং paper-card click সরাসরি OMR route-এ পাঠাই, যাতে user
  // বুঝতে পারে কেন এই page-এ এলো।
  const omrPickerMode = searchParams.get('omr') === '1'
  const clearPaper = usePaperStore((s) => s.clearPaper)

  useEffect(() => { fetchPapers() }, [])

  async function fetchPapers() {
    setLoading(true)
    try {
      const { data } = await api.get('/papers')
      setPapers(data.papers || [])
    } catch {
      toast.error('প্রশ্নপত্র লোড করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(paperId) {
    if (!confirm('এই প্রশ্নপত্রটি মুছে ফেলতে চান?')) return
    setDeleting(paperId)
    try {
      await api.delete(`/papers/${paperId}`)
      setPapers(prev => prev.filter(p => p.id !== paperId))
      toast.success('প্রশ্নপত্র মুছে ফেলা হয়েছে')
    } catch {
      toast.error('মুছতে ব্যর্থ')
    } finally {
      setDeleting(null)
    }
  }

  async function handleDuplicate(paper) {
    setDuplicating(paper.id)
    try {
      // Strip server-managed fields, regenerate question IDs so the
      // duplicate is fully independent (drag-reorder, edits stay isolated).
      const { id, userId, createdAt, updatedAt, deleted, ...rest } = paper
      const newQuestions = (rest.questions || []).map((q) => ({
        ...q,
        id: (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      }))
      const payload = {
        ...rest,
        questions: newQuestions,
        exam_title: `${paper.exam_title || 'প্রশ্নপত্র'} (কপি)`,
      }
      const { data } = await api.post('/papers', payload)
      setPapers(prev => [data.paper, ...prev])
      toast.success('প্রশ্নপত্র ডুপ্লিকেট হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'ডুপ্লিকেট করতে ব্যর্থ')
    } finally {
      setDuplicating(null)
    }
  }

  function handleNew() {
    clearPaper()
    navigate('/papers/new')
  }

  // Filter by search
  const filtered = papers.filter(p =>
    !searchQuery ||
    (p.exam_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.institution_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* OMR-picker mode banner: shown when arrived via /papers?omr=1 */}
      {omrPickerMode && (
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100">
          <span className="text-base sm:text-lg flex-shrink-0">📋</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-rose-900 m-0">
              OMR-এর জন্য একটি প্রশ্নপত্র বাছাই করুন
            </p>
            <p className="text-[10px] sm:text-[11px] text-rose-600 m-0 mt-0.5 truncate">
              যে paper-এ click করবেন, তার OMR sheet দেখা যাবে
            </p>
          </div>
        </div>
      )}

      {/* Page header (desktop only, mobile uses MobileHeader) */}
      <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            আমার প্রশ্নপত্র
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            মোট {papers.length} টি প্রশ্নপত্র
          </p>
        </div>
        <button onClick={handleNew} className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          নতুন প্রশ্নপত্র
        </button>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <svg
          width="18" height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth={2}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className="input"
          style={{ paddingLeft: 44 }}
          placeholder="প্রশ্নপত্র খুঁজুন..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonListItem key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          {papers.length === 0 ? (
            <EmptyState onNew={handleNew} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ fontSize: 'var(--text-lg)', margin: '0 0 8px' }}>🔍</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                "{searchQuery}" এর জন্য কোনো ফলাফল পাওয়া যায়নি
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <AnimatePresence>
            {filtered.map(paper => (
              <PaperItem
                key={paper.id}
                paper={paper}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                deleting={deleting}
                duplicating={duplicating}
                omrPickerMode={omrPickerMode}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile FAB */}
      <FAB onClick={handleNew} label="নতুন প্রশ্নপত্র" />
    </motion.div>
  )
}
