import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`premium-modal p-4 sm:p-6 rounded-2xl sm:rounded-[28px] ${className}`}
            style={{
              width: '100%', maxWidth: 400,
              background: '#fff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              position: 'relative',
              zIndex: 101, overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 m-0" style={{ fontFamily: 'var(--font-bengali)' }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="btn-press w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-0 cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }} className="no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
