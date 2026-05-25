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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 transition-colors"
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
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100">
        {/* Simple header */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <p className="text-[13px] sm:text-sm font-bold text-gray-900 m-0 leading-tight">
              আপনি আরো <span className="text-blue-600">{data.papersEquivalent}</span>টি প্রশ্নপত্র বানাতে পারবেন
            </p>
          </div>
        </div>

        {/* Visual progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500">ব্যালেন্স</span>
            <span className="text-[11px] sm:text-xs font-bold text-blue-600">{data.aiOps} প্রশ্ন বাকি</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(5, (data.papersEquivalent / 10) * 100))}%`,
                background: data.papersEquivalent <= 1
                  ? 'linear-gradient(90deg, #ef4444, #f87171)'
                  : data.papersEquivalent <= 3
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #2563eb, #60a5fa)',
              }}
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 m-0">
            প্রতি পেপারে গড়ে {data.opsPerPaper}টি প্রশ্ন তৈরি লাগে
          </p>
        </div>

        {/* Top-up button */}
        {showTopUp && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-bold text-[13px] sm:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>💰</span>
            <span>আরো প্রশ্নপত্র বানাতে চান? ক্রেডিট যোগ করুন</span>
          </button>
        )}
      </div>
      {showModal && <TopUpModal onClose={() => setShowModal(false)} onSuccess={refetch} />}
    </>
  )
}
