import useAuthStore from '@/store/authStore'
import axios from 'axios'

// ─── Dynamic Backend URL ──────────────────────────────────────────────────────
// Admin can switch between Vercel and Render from the admin panel.
// On app load we fetch /api/backend-config (from current origin = Vercel),
// then point all subsequent API calls to the active backend URL.
//
// Flow:
//   1. App starts → baseURL = same-origin /api (Vercel)
//   2. initBackendUrl() fetches /api/backend-config
//   3. If active=render and render_url is set → update axios baseURL to Render
//   4. All subsequent API calls go to the active backend
//
// localStorage caches the last known config so there's no flash on reload.

const VITE_API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
const defaultBase = VITE_API_URL ? `${VITE_API_URL}/api` : '/api'

// Read cached backend URL from localStorage (set by initBackendUrl below)
function getCachedBackendBase() {
  try {
    const cached = localStorage.getItem('_backend_base')
    if (cached) return cached
  } catch {}
  return null
}

const api = axios.create({
  baseURL: getCachedBackendBase() || defaultBase,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Fetch backend config from Vercel (always same-origin) and update
 * axios baseURL if Render is active. Called once on app startup.
 */
export async function initBackendUrl() {
  try {
    // Always fetch from Vercel (same-origin) — this is the source of truth
    const res = await fetch(`${defaultBase}/backend-config`)
    if (!res.ok) return
    const data = await res.json()
    const bc = data?.backendConfig
    if (!bc) return

    let newBase = defaultBase
    if (bc.active === 'render' && bc.render_url) {
      newBase = `${bc.render_url}/api`
    } else if (bc.active === 'vercel' && bc.vercel_url) {
      newBase = `${bc.vercel_url}/api`
    }

    // Update axios instance baseURL
    api.defaults.baseURL = newBase
    // Cache for next reload (avoids flash)
    try { localStorage.setItem('_backend_base', newBase) } catch {}
    console.log(`[api] backend → ${newBase}`)
  } catch (err) {
    console.warn('[api] initBackendUrl failed:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Detect Vercel returning index.html for an /api/* miss (function not deployed).
    const contentType = response.headers['content-type'] || ''
    if (
      contentType.includes('text/html') &&
      typeof response.data === 'string' &&
      response.data.includes('<!DOCTYPE html>')
    ) {
      console.warn(
        '[api] Got HTML for an API route — backend function probably not deployed.',
        response.config.url,
      )
    }
    // If the response carries a credit charge, signal widgets to refetch balance.
    if (response.data?.creditsCharged && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('credits-changed'))
    }
    return response
  },
  (error) => {
    // Don't auto-logout on every 401 — that creates a redirect loop with Supabase auto-login.
    // Logging out aggressively also masks real backend bugs (bad service-role key, RLS, etc.).
    // Just surface the error to the caller; the user can manually log out if their session truly expired.
    if (error.response?.status === 401) {
      console.warn('[api] 401 from', error.config?.url, '— check backend logs')
    }
    // 402 Payment Required + topUpRequired = AI credit pool exhausted.
    // Dispatch a global event so the <OutOfCreditModal/> in App.jsx surfaces
    // a friendly top-up flow instead of each calling component handling it.
    if (error.response?.status === 402 && error.response?.data?.topUpRequired) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('out-of-credit', { detail: error.response.data }),
        )
      }
    }
    // After any successful AI op, the backend response carries `creditsCharged`.
    // Trigger a balance refetch so widgets update without polling.
    if (error.response?.data?.creditsCharged && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('credits-changed'))
    }
    return Promise.reject(error)
  },
)

export default api
