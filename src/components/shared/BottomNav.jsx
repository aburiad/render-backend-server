import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  {
    id: 'home',
    path: '/dashboard',
    label: 'হোম',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: 'papers',
    path: '/papers',
    label: 'পেপার',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'create',
    path: '/papers/new',
    label: 'তৈরি',
    isFab: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    id: 'bank',
    path: '/bank',
    label: 'ব্যাংক',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'results',
    path: '/results',
    label: 'ফলাফল',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export default function BottomNav({ className = '' }) {
  const location = useLocation()

  const isPathActive = (item) => {
    if (item.isFab) {
      // FAB active only when on /papers/new WITHOUT scan param
      return location.pathname === '/papers/new' && !location.search.includes('scan=true')
    }
    if (item.path === '/papers') {
      // papers active for /papers and /papers/new (non-scan)
      return location.pathname.startsWith('/papers') && !item.isFab
        && !(location.pathname === '/papers/new' && !location.search.includes('scan=true'))
    }
    return location.pathname === item.path
  }

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bottom-nav print:hidden ${className}`}
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div
        style={{
          height: 'var(--nav-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isPathActive(item)

          if (item.isFab) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                {/* Raised FAB circle */}
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    width: 52,
                    height: 52,
                    marginTop: -24, // raised above nav
                    borderRadius: 'var(--radius-full)',
                    background: isActive
                      ? 'linear-gradient(135deg, #1d4ed8, #7c3aed)'
                      : 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
                    border: '3px solid var(--bg-card)',
                  }}
                >
                  {item.icon}
                </motion.div>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                minWidth: 52,
                paddingTop: 4,
                paddingBottom: 4,
                position: 'relative',
                textDecoration: 'none',
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon */}
              <motion.span
                animate={{
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ display: 'flex', lineHeight: 0 }}
              >
                {item.icon}
              </motion.span>

              {/* Label */}
              <motion.span
                animate={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: 1,
                }}
              >
                {item.label}
              </motion.span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
