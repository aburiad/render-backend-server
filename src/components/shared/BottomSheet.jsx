import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * BottomSheet — slide-up modal from bottom
 * Props: isOpen, onClose, title, children, snapHeight ('half' | 'auto')
 */
export default function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-[70] bottom-sheet ${className}`}
            style={{ maxWidth: 'var(--app-max-width)', margin: '0 auto' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
          >
            {/* Drag handle */}
            <div className="bottom-sheet-handle" />

            {/* Title */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="btn-press"
                  style={{
                    width: 32, height: 32,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-input)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * BottomSheetItem — a single action row inside a BottomSheet
 */
export function BottomSheetItem({ icon, label, onClick, danger = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`list-item btn-press w-full text-left rounded-xl ${className}`}
      style={{
        borderRadius: 'var(--radius-md)',
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-base)',
        fontFamily: 'var(--font-bengali)',
      }}
    >
      {icon && (
        <span style={{
          width: 36, height: 36,
          borderRadius: 'var(--radius-sm)',
          background: danger ? '#fef2f2' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: danger ? 'var(--danger)' : 'var(--text-secondary)',
        }}>
          {icon}
        </span>
      )}
      <span style={{ fontWeight: 500 }}>{label}</span>
    </button>
  )
}
