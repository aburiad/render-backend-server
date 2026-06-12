import useAuthStore from '@/store/authStore'
import usePaperStore from '@/store/paperStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomSheet, { BottomSheetItem } from './BottomSheet'

// Map paths to page titles
const PAGE_TITLES = {
  '/dashboard': 'ড্যাশবোর্ড',
  '/papers': 'আমার প্রশ্নপত্র',
  '/papers/new': 'নতুন প্রশ্নপত্র',
  '/bank': 'প্রশ্ন ব্যাংক',
  '/results': 'ফলাফল',
  '/scan': 'AI স্ক্যান',
  '/pricing': 'প্রাইসিং',
  '/admin': 'অ্যাডমিন',
  '/settings/ai-keys': 'AI Providers',
  '/notices': 'আমার নোটিশ',
  '/notices/new': 'নতুন নোটিশ',
  '/routines': 'ক্লাস রুটিন',
  '/routines/new': 'নতুন রুটিন',
  '/learning': 'লার্নিং হাব',
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" />
    </svg>
  )
}

export default function MobileHeader({ className = '' }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Paper editor state — only consumed when isEditor
  const currentPaper = usePaperStore((s) => s.currentPaper)
  const questions = usePaperStore((s) => s.questions)
  const isDirty = usePaperStore((s) => s.isDirty)
  const getTotalMarks = usePaperStore((s) => s.getTotalMarks)
  const setPublishModalOpen = usePaperStore((s) => s.setPublishModalOpen)

  const isDashboard = location.pathname === '/dashboard'
  const isEditor = location.pathname.startsWith('/papers/') && location.pathname !== '/papers' && !location.pathname.endsWith('/preview')

  // Get page title
  let title = PAGE_TITLES[location.pathname] || 'AI Question Hub'
  if (isEditor) title = location.search.includes('scan=true') ? 'AI স্ক্যান' : 'Paper Editing'
  if (location.pathname.endsWith('/preview')) title = 'PDF প্রিভিউ'
  if (location.pathname.startsWith('/notices/') && location.pathname !== '/notices/new') {
    title = location.pathname.endsWith('/preview') ? 'নোটিশ প্রিভিউ' : 'নোটিশ সম্পাদনা'
  }
  if (location.pathname.startsWith('/routines/') && location.pathname !== '/routines/new') {
    title = location.pathname.endsWith('/preview') ? 'রুটিন প্রিভিউ' : 'রুটিন সম্পাদনা'
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  // Editor strip data (computed only when isEditor)
  const totalMarks = isEditor ? getTotalMarks() : 0
  const targetMarks = currentPaper?.total_marks || 0
  const marksMatch = targetMarks === 0 || totalMarks === targetMarks
  const paperId = currentPaper?.id

  return (
    <div className={className}>
      {/* ── Fixed App Header ────────────────────────────── */}
      <header
        className="flex lg:hidden print:hidden flex-col"
        style={{
          background: 'var(--bg-card)',
          boxShadow: isEditor
            ? '0 1px 0 var(--border-light)'
            : '0 1px 0 var(--border-light), 0 2px 8px rgba(0,0,0,0.04)',
          zIndex: 30,
        }}
      >
        {/* ── Row 1: back / logo  |  title  |  avatar ── */}
        <div style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          paddingTop: 'var(--safe-top)',
          gap: 12,
        }}>
          {/* Left — back button or logo */}
          <div style={{ width: 36, display: 'flex', alignItems: 'center' }}>
            {!isDashboard ? (
              <button
                onClick={() => navigate(-1)}
                className="btn-press"
                style={{
                  width: 36, height: 36,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-input)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <BackIcon />
              </button>
            ) : (
              <div
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-english)' }}>Q</span>
              </div>
            )}
          </div>

          {/* Center — page title */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Right — user avatar + action menu */}
          <div style={{ width: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setMenuOpen(true)}
              className="btn-press"
              style={{
                width: 36, height: 36,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-english)',
              }}
              title="Menu"
            >
              {userInitial}
            </button>
          </div>
        </div>

        {/* ── Row 2: Editor info strip (visible only on paper-editor route) ── */}
        {isEditor && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px 6px',
            gap: 6,
          }}>
            {/* Left: marks badge + save indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: marksMatch ? '#ecfdf5' : '#fff7ed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={marksMatch ? '#10b981' : '#f59e0b'} strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={marksMatch
                    ? 'M4.5 12.75l6 6 9-13.5'
                    : 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
                  } />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {totalMarks}/{targetMarks || '—'} নম্বর
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: isDirty ? '#3b82f6' : '#10b981',
                flexShrink: 0,
              }}>
                {isDirty ? '• Unsaved' : '✓'}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                · {questions.length} প্রশ্ন
              </span>
            </div>

            {/* Right: action buttons */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
              {paperId && (
                <button
                  onClick={() => navigate(`/papers/${paperId}/preview`)}
                  className="btn-press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '4px 9px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: 8,
                    fontSize: 10, fontWeight: 800,
                    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Live Preview
                </button>
              )}
              {paperId && (
                <button
                  onClick={() => setPublishModalOpen(true)}
                  className="btn-press"
                  style={{
                    padding: '4px 9px',
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    borderRadius: 8,
                    fontSize: 10, fontWeight: 800,
                    border: '1px solid #ddd6fe',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        )}

        {/* Shadow only for editor (strip doesn't get box-shadow from outer) */}
        {isEditor && (
          <div style={{ height: 1, background: 'var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
        )}
      </header>

      {/* ── Action Bottom Sheet ──────────────────────────── */}
      <BottomSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="অ্যাকাউন্ট">
        {/* User info */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 34, height: 34, borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
              {user?.email}
            </p>
          </div>
          <span
            style={{ marginLeft: 'auto' }}
            className={`badge ${user?.tier === 'pro' ? 'badge-pro' : user?.tier === 'trial' ? 'badge-pro' : 'badge-free'}`}
          >
            {user?.tier === 'pro' ? 'PRO' : user?.tier === 'trial' ? 'TRIAL' : 'FREE'}
          </span>
        </div>

        {/* Actions */}
        {user?.tier !== 'pro' && (
          <BottomSheetItem
            onClick={() => { setMenuOpen(false); navigate('/pricing') }}
            label="Pro তে আপগ্রেড করুন"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            }
          />
        )}

        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate('/routines') }}
          label="ক্লাস রুটিন"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />

        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate('/notices') }}
          label="নোটিশ তৈরি করুন"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
        />

        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate('/learning') }}
          label="লার্নিং হাব"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          }
        />

        <BottomSheetItem
          onClick={() => { setMenuOpen(false); navigate('/settings/ai-keys') }}
          label="সেটিংস"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.932 6.932 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.281zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          }
        />

        {user?.role === 'admin' && (
          <BottomSheetItem
            onClick={() => { setMenuOpen(false); navigate('/admin') }}
            label="অ্যাডমিন প্যানেল"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
          />
        )}

        <div className="divider" />

        <BottomSheetItem
          onClick={handleLogout}
          label="লগআউট"
          danger
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          }
        />
      </BottomSheet>
    </div>
  )
}
