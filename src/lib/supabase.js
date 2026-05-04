import { createBrowserClient } from '@supabase/ssr'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('[Proshno Shala] VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY .env ফাইলে সেট করুন')
}

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'

export const supabase = createBrowserClient(url, anonKey, {
  cookieOptions: {
    path: '/',
    sameSite: 'lax',
    ...(isHttps ? { secure: true } : {}),
  },
  auth: {
    lockAcquireTimeout: 60_000,
  },
})
