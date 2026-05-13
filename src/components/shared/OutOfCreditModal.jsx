import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import TopUpModal from './TopUpModal.jsx'

/**
 * Global out-of-credit overlay. Listens for the `out-of-credit` window
 * event dispatched by the api interceptor when a 402 with
 * `topUpRequired: true` is received.
 *
 * Rendered once at the app root (App.jsx). Self-managed visibility.
 */
export default function OutOfCreditModal() {
  const [open, setOpen] = useState(false)
  const [needed, setNeeded] = useState(0)
  const [available, setAvailable] = useState(0)
  const [showTopUp, setShowTopUp] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {}
      setNeeded(detail.needed || 0)
      setAvailable(detail.available || 0)
      setOpen(true)
    }
    window.addEventListener('out-of-credit', handler)
    return () => window.removeEventListener('out-of-credit', handler)
  }, [])

  const close = () => {
    setOpen(false)
    setShowTopUp(false)
  }

  if (!open) return null

  return (
    <>
      <AnimatePresence>
        {!showTopUp && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-3xl mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">AI ক্রেডিট শেষ</h3>
                <p className="text-sm text-gray-500 mb-1">
                  আপনার balance: <span className="font-bold text-gray-900">{available} AI prompt</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  দরকার: <span className="font-bold text-gray-900">{needed} AI prompt</span>
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowTopUp(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    + ক্রেডিট কিনুন
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ম্যানুয়ালি কাজ চালাবো
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-4">
                  💡 ম্যানুয়াল edit, reprint, PDF export সবসময় ফ্রি
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showTopUp && (
        <TopUpModal
          onClose={close}
          onSuccess={() => {
            // After submit, close everything — admin needs to verify before
            // balance actually changes, so no balance refresh here.
            close()
          }}
        />
      )}
    </>
  )
}
