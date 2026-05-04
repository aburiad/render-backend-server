import useAuthStore from '@/store/authStore'
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

  const isDashboard = location.pathname === '/dashboard'
  const isEditor = location.pathname.startsWith('/papers/') && location.pathname !== '/papers'

  // Get page title
  let title = PAGE_TITLES[location.pathname] || 'AI Question Hub'
  if (isEditor) title = location.search.includes('scan=true') ? 'AI স্ক্যান' : 'প্রশ্নপত্র সম্পাদক'

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className={className}>
      {/* ── Fixed App Header ────────────────────────────── */}
      <header
        className="flex lg:hidden print:hidden items-center"
        style={{
          height: 'var(--header-height)',
          background: 'var(--bg-card)',
          boxShadow: '0 1px 0 var(--border-light), 0 2px 8px rgba(0,0,0,0.04)',
          padding: '0 16px',
          paddingTop: 'var(--safe-top)',
          zIndex: 30,
          gap: 12,
        }}
      >
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
          {isDashboard && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
              {user?.subscription === 'pro' ? '✦ Pro' : 'Free'}
            </p>
          )}
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
      </header>

      {/* ── Action Bottom Sheet ──────────────────────────── */}
      <BottomSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="অ্যাকাউন্ট">
        {/* User info */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44, height: 44, borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18,
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <span
            style={{ marginLeft: 'auto' }}
            className={`badge ${user?.subscription === 'pro' ? 'badge-pro' : 'badge-free'}`}
          >
            {user?.subscription === 'pro' ? 'PRO' : 'FREE'}
          </span>
        </div>

        {/* Actions */}
        {user?.subscription !== 'pro' && (
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
