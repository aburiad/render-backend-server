import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Compact icon button to force-refresh the data the parent page shows.
 * Pass an async `onRefresh` — it returns a promise we use to drive the
 * spinning state. Errors are toasted; the spinner stops either way.
 */
export default function RefreshButton({
  onRefresh,
  title = 'রিফ্রেশ করুন',
  size = 36,
  className = '',
  style = {},
  successMessage = 'আপডেট হয়েছে',
  errorMessage = 'রিফ্রেশ ব্যর্থ হয়েছে',
}) {
  const [spinning, setSpinning] = useState(false)

  async function handleClick() {
    if (spinning) return
    setSpinning(true)
    try {
      await onRefresh()
      if (successMessage) toast.success(successMessage, { duration: 1500 })
    } catch (err) {
      if (errorMessage) toast.error(err?.message || errorMessage)
    } finally {
      setSpinning(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={spinning}
      title={title}
      aria-label={title}
      className={`btn-press ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full, 999px)',
        background: '#fff',
        border: '1px solid var(--border-light, #e2e8f0)',
        cursor: spinning ? 'wait' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted, #64748b)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        ...style,
      }}
    >
      <svg
        width={Math.round(size * 0.45)}
        height={Math.round(size * 0.45)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        style={{
          animation: spinning ? 'rb-spin 0.8s linear infinite' : 'none',
          transformOrigin: 'center',
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992V4.356M2.985 19.644V14.652h4.992m0 0a8.25 8.25 0 0113.803-3.7l3.181 3.183m-21 0l3.182 3.182a8.25 8.25 0 0013.803-3.7"
        />
      </svg>
      <style>{`
        @keyframes rb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
