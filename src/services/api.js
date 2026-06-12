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

// IMPORTANT: Always start with same-origin /api (Vercel) as the base URL.
// Previously we read localStorage cache synchronously, which pointed to
// a Render backend that may be sleeping (free tier). The first API calls
// then went to Render → ERR_CONNECTION_CLOSED → broken first-load UX.
// Now initBackendUrl() health-checks Render first and only switches if
// it's actually healthy. The cache is only used as a hint inside
// initBackendUrl, not as the initial baseURL.
const api = axios.create({
  baseURL: defaultBase,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Fetch backend config from Vercel (always same-origin) and update
 * axios baseURL if Render is active. Called once on app startup.
 *
 * Health-check strategy:
 *   1. Fetch /api/backend-config from Vercel (source of truth)
 *   2. If active=render → ping Render's /api/health (3s timeout)
 *   3. Render healthy → use Render URL
 *   4. Render down/slow → silently fall back to Vercel
 *   5. Cache result in localStorage for next reload
 */
function isLocalDev() {
  try {
    return typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1')
  } catch { return false }
}

export async function initBackendUrl() {
  // In local dev, all /api calls go through the Vite proxy to localhost:5000.
  // Never redirect to a remote Vercel/Render URL — the proxy is the source of truth.
  if (isLocalDev()) {
    api.defaults.baseURL = defaultBase
    try { localStorage.removeItem('_backend_base') } catch {}
    console.log('[api] local dev — using Vite proxy (/api → localhost:5000)')
    return
  }

  try {
    // Always fetch config from Vercel (same-origin)
    const res = await fetch(`${defaultBase}/backend-config`)
    if (!res.ok) {
      console.warn('[api] backend-config fetch failed — using default /api')
      api.defaults.baseURL = defaultBase
      try { localStorage.removeItem('_backend_base') } catch {}
      return
    }
    const data = await res.json()
    const bc = data?.backendConfig
    if (!bc) return

    let newBase = defaultBase
    // Determine vercel base — used as fallback in all cases
    const vercelBase = bc.vercel_url ? `${bc.vercel_url}/api` : defaultBase

    if (bc.active === 'render' && bc.render_url) {
      // Health-check Render before committing to it
      const renderHealthy = await checkHealth(`${bc.render_url}/api/health`, 3000)
      if (renderHealthy) {
        newBase = `${bc.render_url}/api`
        console.log('[api] backend → Render ✓')
      } else {
        // Render is down — silently fall back to Vercel
        newBase = vercelBase
        console.warn('[api] Render unreachable — falling back to Vercel')
      }
    } else {
      // active=vercel, or render_url not set → use Vercel
      newBase = vercelBase
      if (bc.active === 'vercel') console.log('[api] backend → Vercel')
    }

    api.defaults.baseURL = newBase
    // Always store Render URL for PDF requests (even when Vercel is active)
    // because PDF rendering needs Render's longer 90s timeout.
    if (bc.render_url) {
      setRenderPdfUrl(`${bc.render_url}/api`)
      console.log('[api] PDF requests → Render (dedicated)')
    }
    try { localStorage.setItem('_backend_base', newBase) } catch {}
  } catch (err) {
    console.warn('[api] initBackendUrl failed:', err.message, '— using default /api')
    api.defaults.baseURL = defaultBase
    try { localStorage.removeItem('_backend_base') } catch {}
  }
}

/**
 * Ping a health endpoint with a timeout.
 * Returns true if the server responds with any 2xx within timeoutMs.
 */
async function checkHealth(url, timeoutMs) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
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
    // Network error to a remote backend (Render) → auto-fall back to
    // same-origin Vercel proxy so the user is not stuck with a broken
    // app. This handles ERR_CONNECTION_CLOSED, ERR_CONNECTION_REFUSED,
    // and general network failures when Render's free tier is sleeping.
    if (!error.response && api.defaults.baseURL && !api.defaults.baseURL.startsWith('/')) {
      const failedUrl = error.config?.baseURL || api.defaults.baseURL
      if (failedUrl.includes('onrender.com')) {
        console.warn('[api] Render backend unreachable — falling back to Vercel')
        api.defaults.baseURL = '/api'
        try { localStorage.removeItem('_backend_base') } catch {}
        // Retry the original request against Vercel
        if (error.config) {
          error.config.baseURL = '/api'
          return api.request(error.config)
        }
      }
    }

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

// ─── Render URL for PDF requests ─────────────────────────────────────────────
// PDF rendering via Puppeteer can take 30-60 seconds. Render backend has a 90s
// timeout and works reliably. When Vercel is active, PDF requests still need
// to go through Render — Vercel's 60s function limit is too tight for PDF.
let _renderPdfUrl = null

function setRenderPdfUrl(url) {
  _renderPdfUrl = url
}

function getRenderPdfUrl() {
  return _renderPdfUrl
}

export { setRenderPdfUrl, getRenderPdfUrl }
export default api
