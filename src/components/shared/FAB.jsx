import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * FAB — Floating Action Button
 * Props: to (link path), onClick, icon, label (optional tooltip)
 */
export default function FAB({ to, onClick, icon, label, className = '' }) {
  const content = (
    <motion.span
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
    >
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    </motion.span>
  )

  const baseStyle = {
    position: 'fixed',
    bottom: `calc(var(--nav-height) + var(--safe-bottom) + 16px)`,
    right: '16px',
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-fab)',
    zIndex: 40,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  }

  if (to) {
    return (
      <Link to={to} style={baseStyle} className={`lg:hidden ${className}`} title={label}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} style={baseStyle} className={`lg:hidden ${className}`} title={label}>
      {content}
    </button>
  )
}
