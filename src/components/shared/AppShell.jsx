import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import DesktopSidebar from './DesktopSidebar'
import MobileHeader from './MobileHeader'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <>
      {/* ── Mobile Layout (< lg) ──────────────────────────────
           Key rules for inner scroll to work:
           1. Outer = exact height: 100dvh, overflow: hidden
           2. Main  = flex: 1, min-height: 0, overflow-y: auto
           3. Header/Nav are NOT flex-grow items (fixed size)        */}
      <div
        className="flex lg:hidden print:hidden flex-col"
        style={{
          height: '100dvh',
          overflow: 'hidden',
          background: 'var(--bg-base)',
        }}
      >
        {/* Header — shrinks to its natural height */}
        <div style={{ flexShrink: 0 }}>
          <MobileHeader />
        </div>

        {/* Scrollable content — flex: 1 + min-height: 0 is the magic */}
        <motion.main
          style={{
            flex: 1,
            minHeight: 0,           /* ← critical: allow flex child to shrink */
            overflowY: 'auto',
            overflowX: 'hidden',    /* ← prevent horizontal bleed */
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom) + 24px)',
          }}
          className="no-scrollbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>

        {/* BottomNav stays fixed — does not consume flex space */}
        <BottomNav />
      </div>

      {/* ── Desktop Layout (≥ lg) ─────────────────────────────── */}
      <div
        className="hidden lg:flex print:flex"
        style={{ minHeight: '100vh', background: 'var(--bg-base)' }}
      >
        <DesktopSidebar className="print:hidden" />
        <div
          className="print:ml-0"
          style={{ flex: 1, marginLeft: 256, display: 'flex', flexDirection: 'column' }}
        >
          <motion.main
            className="no-scrollbar print:p-0 print:overflow-visible"
            style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </>
  )
}
