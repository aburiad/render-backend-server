import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '@/services/api'
import useNoticeStore from '@/store/noticeStore'
import { SkeletonListItem } from '@/components/shared/SkeletonCard'
import { BottomSheetItem } from '@/components/shared/BottomSheet'
import Modal from '@/components/shared/Modal'

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp._seconds
    ? new Date(timestamp._seconds * 1000)
    : new Date(timestamp)
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
}

function NoticeItem({ notice, onDelete, onDuplicate, deleting, duplicating }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const initial = (notice.title || notice.header_org_name || 'ন')?.charAt(0)

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
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 16px',
            transition: 'background 0.15s ease',
          }}
        >
          <div
            onClick={() => navigate(`/notices/${notice.id}`)}
            className="btn-press"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#92400e', fontWeight: 800, fontSize: 18,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)',
                margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {notice.title || 'শিরোনামবিহীন নোটিশ'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {notice.header_org_name && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {notice.header_org_name}
                  </span>
                )}
                {notice.notice_date && (
                  <>
                    <span style={{ color: 'var(--border)', fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: '#2563eb', fontWeight: 600 }}>
                      {notice.notice_date}
                    </span>
                  </>
                )}
              </div>
              {notice.updatedAt && (
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  সর্বশেষ আপডেট: {formatDate(notice.updatedAt)}
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
                background: 'var(--bg-input)', border: 'none', cursor: 'pointer',
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
              onClick={() => navigate(`/notices/${notice.id}`)}
              title="সম্পাদনা"
              style={{
                width: 28, height: 28, borderRadius: 'var(--radius-full)',
                background: 'transparent', border: 'none', cursor: 'pointer',
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

      <Modal isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={notice.title || 'নোটিশ'}>
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/notices/${notice.id}`) }}
          label="সম্পাদনা করুন"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate(`/notices/${notice.id}/preview`) }}
          label="PDF প্রিভিউ"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); onDuplicate(notice) }}
          label={duplicating === notice.id ? 'কপি হচ্ছে...' : 'ডুপ্লিকেট করুন'}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>}
        />
        <div className="divider" />
        <BottomSheetItem
          onClick={() => { setMenuOpen(false); onDelete(notice.id) }}
          label={deleting === notice.id ? 'মুছছে...' : 'মুছে দিন'}
          danger
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" /></svg>}
        />
      </Modal>
    </>
  )
}

export default function NoticesList() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [duplicating, setDuplicating] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const clearNotice = useNoticeStore((s) => s.clearNotice)

  useEffect(() => { fetchNotices() }, [])

  async function fetchNotices() {
    setLoading(true)
    try {
      const { data } = await api.get('/notices')
      setNotices(data.notices || [])
    } catch {
      toast.error('নোটিশ লোড করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(noticeId) {
    if (!confirm('এই নোটিশটি মুছে ফেলতে চান?')) return
    setDeleting(noticeId)
    try {
      await api.delete(`/notices/${noticeId}`)
      setNotices((prev) => prev.filter((n) => n.id !== noticeId))
      toast.success('নোটিশ মুছে ফেলা হয়েছে')
    } catch {
      toast.error('মুছতে ব্যর্থ')
    } finally {
      setDeleting(null)
    }
  }

  async function handleDuplicate(notice) {
    setDuplicating(notice.id)
    try {
      const { id, userId, createdAt, updatedAt, deleted, ...rest } = notice
      const payload = {
        ...rest,
        title: `${notice.title || 'নোটিশ'} (কপি)`,
      }
      const { data } = await api.post('/notices', payload)
      setNotices((prev) => [data.notice, ...prev])
      toast.success('নোটিশ ডুপ্লিকেট হয়েছে')
    } catch (err) {
      toast.error(err.response?.data?.message || 'ডুপ্লিকেট করতে ব্যর্থ')
    } finally {
      setDuplicating(null)
    }
  }

  function handleNew() {
    clearNotice()
    navigate('/notices/new')
  }

  function handleNewWithDemo() {
    clearNotice()
    navigate('/notices/new?template=demo')
  }

  const filtered = notices.filter(
    (n) =>
      !searchQuery ||
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.header_org_name || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            আমার নোটিশ
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            মোট {notices.length} টি নোটিশ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleNewWithDemo} className="btn" style={{ fontSize: 'var(--text-sm)', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            ✨ ডেমো দিয়ে শুরু
          </button>
          <button onClick={handleNew} className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            নতুন নোটিশ
          </button>
        </div>
      </div>

      {/* Mobile dual CTA */}
      <div className="flex lg:hidden gap-2">
        <button onClick={handleNewWithDemo} className="flex-1 py-3 rounded-xl text-sm font-bold border" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
          ✨ ডেমো নোটিশ
        </button>
        <button onClick={handleNew} className="flex-1 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          + নতুন নোটিশ
        </button>
      </div>

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
          placeholder="নোটিশ খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => <SkeletonListItem key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          {notices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 36,
              }}>
                📋
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                কোনো নোটিশ নেই
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '0 0 24px' }}>
                স্কুল / অফিসের জন্য নোটিশ তৈরি করুন এক ক্লিকে
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleNewWithDemo} className="btn" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                  ✨ ডেমো দিয়ে শুরু
                </button>
                <button onClick={handleNew} className="btn btn-primary">
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
            {filtered.map((notice) => (
              <NoticeItem
                key={notice.id}
                notice={notice}
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
