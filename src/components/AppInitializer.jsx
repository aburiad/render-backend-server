import { useState, useEffect } from 'react'
import { initBackendUrl } from '@/services/api'
import useAuthStore from '@/store/authStore'

const MAX_WAIT_MS = 10_000

/**
 * Blocks the app tree until all critical async initialization completes:
 *
 *   1. initBackendUrl()  — determines which backend (Render vs Vercel) to use
 *   2. Auth hydration     — supabase.getSession → applySession → /auth/me
 *
 * Shows a branded preloader while waiting. Unauthenticated users see the
 * preloader briefly (only backend-init), then get the login page quickly.
 */
export default function AppInitializer({ children }) {
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('backend') // 'backend' | 'auth' | 'done'

  useEffect(() => {
    let cancelled = false
    let unsub = null

    async function boot() {
      try {
        // ── Step 1: Backend URL ────────────────────────────────
        // Determines Render vs Vercel + health-check. Must complete
        // before ANY API call so axios uses the correct baseURL.
        await initBackendUrl()
        if (cancelled) return

        // ── Step 2: Auth hydration ─────────────────────────────
        // supabase.auth.getSession() is already fired in main.jsx
        // and triggers applySession(). We just wait for isHydrating
        // to become false (or already be false = no session).
        setStatus('auth')

        const check = () => {
          const { isHydrating } = useAuthStore.getState()
          if (!isHydrating) {
            if (cancelled) return
            setStatus('done')
            // Small delay so the "done" state is visible
            setTimeout(() => { if (!cancelled) setReady(true) }, 200)
            return true
          }
          return false
        }

        // Check immediately — may already be resolved
        if (check()) return

        // Otherwise subscribe to isHydrating changes
        unsub = useAuthStore.subscribe(
          (state) => state.isHydrating,
          () => { check() },
        )

        // Double-check in case we missed it between getState and subscribe
        if (check()) {
          if (unsub) { unsub(); unsub = null }
          return
        }
      } catch (err) {
        console.error('[AppInitializer] boot error:', err)
        // Don't block the app forever — show it anyway
        setReady(true)
      }
    }

    boot()

    // ── Safety timeout: show the app after MAX_WAIT_MS regardless ──
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[AppInitializer] timeout — showing app anyway')
        setReady(true)
      }
    }, MAX_WAIT_MS)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      if (unsub) unsub()
    }
  }, [])

  // ── App is ready — render children ──
  if (ready) return children

  // ── Preloader screen ──
  return <PreloaderScreen status={status} />
}

/* ─── Branded preloader ──────────────────────────────────────────────── */
function PreloaderScreen({ status }) {
  const labels = {
    backend: 'সার্ভার খোঁজা হচ্ছে...',
    auth: 'সংযোগ হচ্ছে...',
    done: 'প্রস্তুত!',
  }

  return (
    <div style={styles.root}>
      <div style={styles.center}>
        {/* Logo / brand */}
        <div style={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#2563eb" />
            <path d="M14 18h20M14 24h14M14 30h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="30" r="5" fill="#60a5fa" />
            <path d="M34 30l1.5 1.5L38 28.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={styles.title}>প্রশ্ন শালা</h1>

        {/* Spinner */}
        <div style={styles.spinnerWrap}>
          <svg style={styles.spinner} viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" strokeWidth="4"
              strokeDasharray="80 126" strokeLinecap="round"
              style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }}
            />
          </svg>
        </div>

        <p style={styles.status}>{labels[status] || labels.backend}</p>
      </div>

      {/* Inline keyframes — no external CSS dependency */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    background: '#fff',
    boxShadow: '0 4px 24px rgba(37, 99, 235, 0.15)',
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  spinnerWrap: {
    width: 36,
    height: 36,
    marginTop: 4,
  },
  spinner: {
    width: '100%',
    height: '100%',
  },
  status: {
    fontSize: 13,
    color: '#64748b',
    margin: 0,
    fontWeight: 500,
    minHeight: 20,
  },
}