import api from '@/services/api'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Single in-flight applySession — stops TOKEN_REFRESHED / multi-tab from stacking /auth/me calls. */
let isProcessingLogout = false

/** Use a global symbol to ensure shared state across all chunks/bundles */
const FLIGHT_KEY = typeof globalThis !== 'undefined'
  ? (globalThis.__authApplySessionFlight ??= Symbol.for('authApplySessionFlight'))
  : Symbol.for('authApplySessionFlight')

const getFlightState = () => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis[FLIGHT_KEY]) globalThis[FLIGHT_KEY] = { promise: null }
    return globalThis[FLIGHT_KEY]
  }
  return { promise: null }
}

const setFlightState = (promise) => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis[FLIGHT_KEY]) globalThis[FLIGHT_KEY] = { promise: null }
    globalThis[FLIGHT_KEY].promise = promise
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken = null) =>
        set({
          user,
          token,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: !!user && !!token,
        }),

      setUser: (user) => set({ user }),

      logout: () => {
        if (isProcessingLogout) return
        isProcessingLogout = true
        setFlightState(null)
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
        setTimeout(() => { isProcessingLogout = false }, 50)
      },

      /**
       * Hydrate auth state from a Supabase session.
       *
       * Sequence:
       *   1. Set a basic user immediately from session + metadata so the UI doesn't flash empty.
       *      Role is read from user_metadata when present (email signup writes it there).
       *   2. Fetch /auth/me to get the authoritative profile (role, subscription) from Supabase
       *      profiles table. Backend will auto-create the row on first hit.
       *   3. Return the final user. Callers (Login, AuthCallback) await this and then navigate
       *      based on role — so by the time they navigate, role is settled.
       */
      applySession: async (session) => {
        if (!session?.access_token) return null

        const flight = getFlightState()
        if (flight.promise) return flight.promise

        const promise = (async () => {
          try {
            const { user: currentUser } = get()
            const sessionUser = session.user
            const meta = sessionUser.user_metadata || {}

            const basicUser = {
              ...(currentUser || {}),
              uid: sessionUser.id,
              email: sessionUser.email,
              name: meta.full_name || meta.name || currentUser?.name || sessionUser.email?.split('@')[0] || 'User',
              role: currentUser?.role || meta.role || null,
              subscription: currentUser?.subscription || 'free',
            }

            set({
              token: session.access_token,
              refreshToken: session.refresh_token,
              user: basicUser,
              isAuthenticated: true,
            })

            // Fetch authoritative profile. Auto-creates row if missing.
            try {
              const res = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${session.access_token}` },
              })
              const backendUser = res.data?.user
              if (backendUser) {
                set({ user: backendUser })
                return backendUser
              }
            } catch (err) {
              console.warn('[authStore] /auth/me failed:', err.message)
            }

            return basicUser
          } catch (err) {
            console.error('[authStore] applySession error:', err)
            return null
          } finally {
            setFlightState(null)
          }
        })()

        setFlightState(promise)
        return promise
      },
    }),
    { name: 'auth-storage' },
  ),
)

export default useAuthStore
