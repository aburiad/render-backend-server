import api from '@/services/api'
import { supabase } from '@/lib/supabase'
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
      isHydrating: false, // true while applySession is fetching /auth/me

      login: (user, token, refreshToken = null) =>
        set({
          user,
          token,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: !!user && !!token,
        }),

      setUser: (user) => set({ user }),

      /**
       * Full logout = clear local store AND invalidate the Supabase session.
       * Without `supabase.auth.signOut()`, Supabase's own localStorage entry
       * (`sb-*-auth-token`) would still hold a valid session, so on the next
       * page load `getSession()` would return it and the app would silently
       * re-authenticate — bypassing /login and landing on /dashboard.
       */
      logout: async () => {
        if (isProcessingLogout) return
        isProcessingLogout = true
        setFlightState(null)
        // Clear our store first so the UI flips to the unauthenticated tree
        // immediately even if signOut takes a moment.
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
        try {
          await supabase.auth.signOut()
        } catch (err) {
          console.warn('[authStore] supabase signOut failed:', err.message)
        }
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
              isHydrating: true, // role not yet confirmed — block AdminRoute redirect
            })

            // Fetch authoritative profile. Auto-creates row if missing.
            try {
              const res = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${session.access_token}` },
              })
              const backendUser = res.data?.user
              if (backendUser) {
                set({ user: backendUser, isHydrating: false })
                return backendUser
              }
            } catch (err) {
              if (err.response?.status === 403 && err.response?.data?.banned) {
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isHydrating: false })
                try { await supabase.auth.signOut() } catch { /* best-effort */ }
                const banErr = new Error(err.response.data.message || 'আপনার অ্যাকাউন্ট নিষিদ্ধ')
                banErr.banned = true
                throw banErr
              }
              console.warn('[authStore] /auth/me failed:', err.message)
            }

            set({ isHydrating: false })
            return basicUser
          } catch (err) {
            console.error('[authStore] applySession error:', err)
            set({ isHydrating: false })
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
