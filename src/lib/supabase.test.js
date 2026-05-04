import { describe, it, expect, vi } from 'vitest'

describe('supabase client', () => {
  it('should throw error when env variables are missing', async () => {
    // Reset modules so supabase.js re-executes
    vi.resetModules()

    // Mock import.meta.env with missing values
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(() => import('./supabase.js')).rejects.toThrow()

    vi.unstubAllEnvs()
  })
})
