import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock api before importing authStore
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import useAuthStore from './authStore'
import api from '@/services/api'

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    })
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should set user, token and isAuthenticated', () => {
      const user = { uid: '1', name: 'Test', email: 'test@test.com', role: 'school' }
      useAuthStore.getState().login(user, 'test-token', 'refresh-token')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(user)
      expect(state.token).toBe('test-token')
      expect(state.refreshToken).toBe('refresh-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('should set isAuthenticated false if user or token is missing', () => {
      useAuthStore.getState().login(null, 'token')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)

      useAuthStore.getState().login({ name: 'Test' }, null)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should keep existing refreshToken if not provided', () => {
      useAuthStore.setState({ refreshToken: 'old-refresh' })
      useAuthStore.getState().login({ uid: '1' }, 'token')

      expect(useAuthStore.getState().refreshToken).toBe('old-refresh')
    })
  })

  describe('logout', () => {
    it('should clear all auth state', () => {
      useAuthStore.setState({
        user: { uid: '1' },
        token: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      })

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should update only the user field', () => {
      useAuthStore.setState({ token: 'keep-me', isAuthenticated: true })
      useAuthStore.getState().setUser({ uid: '2', name: 'Updated' })

      expect(useAuthStore.getState().user).toEqual({ uid: '2', name: 'Updated' })
      expect(useAuthStore.getState().token).toBe('keep-me')
    })
  })

  describe('applySession', () => {
    it('should return null for session without access_token', async () => {
      const result = await useAuthStore.getState().applySession({})
      expect(result).toBeNull()
    })

    it('should return null for null session', async () => {
      const result = await useAuthStore.getState().applySession(null)
      expect(result).toBeNull()
    })

    it('should set auth state from valid session', async () => {
      api.get.mockResolvedValue({ data: { user: null } })

      const session = {
        access_token: 'jwt-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-123',
          email: 'test@test.com',
          user_metadata: { full_name: 'Test User' },
        },
      }

      const result = await useAuthStore.getState().applySession(session)

      expect(result).toBeTruthy()
      expect(result.uid).toBe('user-123')
      expect(result.email).toBe('test@test.com')
      expect(result.name).toBe('Test User')

      const state = useAuthStore.getState()
      expect(state.token).toBe('jwt-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('should fetch backend profile and update user', async () => {
      const backendUser = { uid: 'user-123', name: 'Backend Name', role: 'school', subscription: 'pro' }
      api.get.mockResolvedValue({ data: { user: backendUser } })

      const session = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        user: { id: 'user-123', email: 'x@x.com', user_metadata: {} },
      }

      await useAuthStore.getState().applySession(session)

      // Wait for the awaited /auth/me call (now passes Authorization header explicitly)
      expect(api.get).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }),
      }))
      expect(useAuthStore.getState().user).toEqual(backendUser)
    })

    it('should handle /auth/me failure gracefully', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      const session = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        user: { id: 'user-123', email: 'x@x.com', user_metadata: {} },
      }

      const result = await useAuthStore.getState().applySession(session)

      // Should still return basic user even if backend fails
      expect(result).toBeTruthy()
      expect(result.uid).toBe('user-123')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should deduplicate concurrent applySession calls', async () => {
      let resolveApi
      api.get.mockImplementation(() => new Promise((resolve) => { resolveApi = resolve }))

      const session = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        user: { id: 'user-123', email: 'x@x.com', user_metadata: {} },
      }

      const p1 = useAuthStore.getState().applySession(session)
      const p2 = useAuthStore.getState().applySession(session)

      resolveApi({ data: { user: null } })

      const [r1, r2] = await Promise.all([p1, p2])

      // Both should resolve to the same promise
      expect(r1).toEqual(r2)
      // API should only be called once
      expect(api.get).toHaveBeenCalledTimes(1)
    })
  })
})
