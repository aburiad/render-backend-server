import useAuthStore from '@/store/authStore'
import axios from 'axios'

// Same-origin /api by default (Vite proxy in dev, Vercel function in prod).
// Set VITE_API_URL only if you split frontend and backend across separate domains.
const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
const baseURL = apiOrigin ? `${apiOrigin}/api` : '/api'

const api = axios.create({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
