import { supabase } from '@/lib/supabase'
import useAuthStore from '@/store/authStore'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    let cancelled = false
    ;(async () => {
      try {
        await supabase.auth.initialize()

        const code = new URLSearchParams(window.location.search).get('code')
        let {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError) throw sessionError

        if (!session && code) {
          const { data, error: exErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exErr) throw exErr
          session = data.session
        }

        if (cancelled) return
        if (!session) {
          navigate('/login', { replace: true })
          return
        }

        window.history.replaceState({}, document.title, '/auth/callback')

        const user = await useAuthStore.getState().applySession(session)
        if (cancelled) return
        if (!user) {
          navigate('/login', { replace: true })
          return
        }
        if (!user.role) {
          navigate('/register?step=role', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (e) {
        if (!cancelled) {
          console.error('AuthCallback:', e)
          if (e.banned) toast.error(e.message)
          navigate('/login', { replace: true })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      লগইন সম্পন্ন হচ্ছে…
    </div>
  )
}
