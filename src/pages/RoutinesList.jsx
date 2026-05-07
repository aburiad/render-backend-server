import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import useRoutineStore from '@/store/routineStore'
import { SkeletonListItem } from '@/components/shared/SkeletonCard'
import { BottomSheetItem } from '@/components/shared/BottomSheet'
import Modal from '@/components/shared/Modal'

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp)
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RoutineItem({ routine, onDelete, onDuplicate, deleting, duplicating }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const initial = (routine.class_name || routine.title || 'রু')?.charAt(0)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
          <div
            onClick={() => navigate(`/routines/${routine.id}`)}
            className="btn-press"
            style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1e40af', fontWeight: 800, fontSize: 18,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
                margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {routine.class_name || routine.title || 'নামহীন রুটিন'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {routine.school_name && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {routine.school_name}
                  </span>
                )}
                {(routine.periods?.length > 0) && (
                  <>
                    <span style={{ color: 'var(--border)', fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#2563eb', fontWeight: 600 }}>
                      {routine.days?.length || 0} দিন · {routine.periods.length} পিরিয়ড
                    </span>
                  </>
                )}
              </div>
              {routine.updatedAt && (
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  সর্বশেষ আপডেট: {formatDate(routine.updatedAt)}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              title="আরো অপশন"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: 'var(--bg-input)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
              className="btn-press"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/routines/${routine.id}`)}
              style={{
                width: 28, height: 28, borderRadius: 'var(--radius-full)',
                background: 'transparent', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              className="btn-press"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={routine.class_name || 'রুটিন'}>
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/routines/${routine.id}`) }}
          label="সম্পাদনা করুন"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/routines/${routine.id}/preview`) }}
          label="PDF প্রিভিউ"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); onDuplicate(routine) }}
          label={duplicating === routine.id ? 'কপি হচ্ছে...' : 'ডুপ্লিকেট করুন'}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25" /></svg>}
        />
        <div className="divider" />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); onDelete(routine.id) }}
          label={deleting === routine.id ? 'মুছছে...' : 'মুছে দিন'}
          danger
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" /></svg>}
        />
      </Modal>
    </>
  )
}

export default function RoutinesList() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [duplicating, setDuplicating] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const clearRoutine = useRoutineStore((s) => s.clearRoutine)

  useEffect(() => { fetchRoutines() }, [])

  async function fetchRoutines() {
    setLoading(true)
    try {
      const { data } = await api.get('/routines')
      setRoutines(data.routines || [])
    } catch {
      toast.error('রুটিন লোড করতে ব্যর্থ')
    } finally { setLoading(false) }
  }

  async function handleDelete(routineId) {
    if (!confirm('এই রুটিনটি মুছে ফেলতে চান?')) return
    setDeleting(routineId)
    try {
      await api.delete(`/routines/${routineId}`)
      setRoutines((prev) => prev.filter((r) => r.id !== routineId))
      toast.success('রুটিন মুছে ফেলা হয়েছে')
    } catch {
      toast.error('মুছতে ব্যর্থ')
    } finally { setDeleting(null) }
  }

  async function handleDuplicate(routine) {
    setDuplicating(routine.id)
    try {
      const { id, userId, createdAt, updatedAt, deleted, ...rest } = routine
      const payload = { ...rest, class_name: `${routine.class_name || 'রুটিন'} (কপি)` }
      const { data } = await api.post('/routines', payload)
      setRoutines((prev) => [data.routine, ...prev])
      toast.success('রুটিন ডুপ্লিকেট হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'ডুপ্লিকেট করতে ব্যর্থ')
    } finally { setDuplicating(null) }
  }

  function go(template) {
    clearRoutine()
    if (!template) navigate('/routines/new')
    else navigate(`/routines/new?template=${template}`)
  }

  const filtered = routines.filter(
    (r) =>
      !searchQuery ||
      (r.class_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.school_name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            ক্লাস রুটিন
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            মোট {routines.length} টি রুটিন
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => go('primary')} className="btn" style={{ fontSize: 'var(--text-sm)', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            ✨ প্রাথমিক ডেমো
          </button>
          <button onClick={() => go('secondary')} className="btn" style={{ fontSize: 'var(--text-sm)', background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
            ✨ মাধ্যমিক ডেমো
          </button>
          <button onClick={() => go(null)} className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            নতুন
          </button>
        </div>
      </div>

      {/* Mobile triple CTA */}
      <div className="flex lg:hidden gap-2">
        <button onClick={() => go('primary')} className="flex-1 py-3 rounded-xl text-xs font-bold border" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
          ✨ প্রাথমিক
        </button>
        <button onClick={() => go('secondary')} className="flex-1 py-3 rounded-xl text-xs font-bold border" style={{ background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>
          ✨ মাধ্যমিক
        </button>
        <button onClick={() => go(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          + নতুন
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className="input"
          style={{ paddingLeft: 44 }}
          placeholder="রুটিন খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[1, 2, 3].map((i) => <SkeletonListItem key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          {routines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
              }}>
                🗓️
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                কোনো রুটিন নেই
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '0 0 24px' }}>
                ক্লাসের সাপ্তাহিক রুটিন তৈরি করুন
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => go('primary')} className="btn" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                  ✨ প্রাথমিক ডেমো
                </button>
                <button onClick={() => go('secondary')} className="btn" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                  ✨ মাধ্যমিক ডেমো
                </button>
                <button onClick={() => go(null)} className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  খালি দিয়ে শুরু
                </button>
              </div>
            </div>
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
            {filtered.map((r) => (
              <RoutineItem
                key={r.id}
                routine={r}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                deleting={deleting}
                duplicating={duplicating}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
