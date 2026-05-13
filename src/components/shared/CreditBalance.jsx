import { useEffect, useState, useCallback } from 'react'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import TopUpModal from './TopUpModal.jsx'

/**
 * CreditBalance widget — shown in dashboard, paper editor header, etc.
 *
 * Reads from authStore.user.credits if available, otherwise hits
 * /api/auth/credits. Listens for the global "credits-changed" CustomEvent
 * dispatched after any AI op so the number updates without a page reload.
 *
 * Props:
 *   - compact: render as a slim inline pill (default false → full card)
 *   - showTopUp: render the "Top Up" CTA button (default true)
 */
export default function CreditBalance({ compact = false, showTopUp = true }) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [data, setData] = useState(() => user?.credits || null)
  const [showModal, setShowModal] = useState(false)

  const refetch = useCallback(async () => {
    try {
      const { data: res } = await api.get('/auth/credits')
      setData({
        aiOps: res.balance,
        papersEquivalent: res.papersEquivalent,
        opsPerPaper: res.opsPerPaper,
        bdtPerPaper: res.bdtPerPaper,
      })
      // Sync auth store so other widgets get the new value.
      if (user) {
        setUser({
          ...user,
          credits: {
            aiOps: res.balance,
            papersEquivalent: res.papersEquivalent,
            opsPerPaper: res.opsPerPaper,
            bdtPerPaper: res.bdtPerPaper,
          },
        })
      }
    } catch {
      // Silent — keep cached values
    }
  }, [user, setUser])

  useEffect(() => {
    if (!data) refetch()
  }, [data, refetch])

  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener('credits-changed', handler)
    return () => window.removeEventListener('credits-changed', handler)
  }, [refetch])

  if (!data) {
    return (
      <div className={compact ? 'text-xs text-gray-400' : 'p-4 bg-gray-50 rounded-xl text-sm text-gray-400'}>
        ক্রেডিট লোড হচ্ছে…
      </div>
    )
  }

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => showTopUp && setShowModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <span>⚡</span>
          <span>{data.aiOps} AI</span>
          <span className="text-blue-400">·</span>
          <span>{data.papersEquivalent} পেপার</span>
          {showTopUp && <span className="text-blue-600 ml-1">+</span>}
        </button>
        {showModal && <TopUpModal onClose={() => setShowModal(false)} onSuccess={refetch} />}
      </>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">আপনার ক্রেডিট</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {data.aiOps} <span className="text-sm font-bold text-gray-400">AI prompt</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              ≈ {data.papersEquivalent} পেপার (avg {data.opsPerPaper}/পেপার)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            ⚡
          </div>
        </div>
        {showTopUp && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            + ক্রেডিট কিনুন
          </button>
        )}
      </div>
      {showModal && <TopUpModal onClose={() => setShowModal(false)} onSuccess={refetch} />}
    </>
  )
}
