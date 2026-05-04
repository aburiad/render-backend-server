import AuthBootstrap from '@/components/AuthBootstrap'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/store/authStore'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

function isOAuthCallbackRoute() {
  return typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback')
}

supabase.auth.onAuthStateChange((event, session) => {
  // Skip callback route handling
  if (isOAuthCallbackRoute()) {
    if (!session) useAuthStore.getState().logout()
    return
  }
  // Only handle sessions, not auth changes that trigger logout
  if (session) {
    void useAuthStore.getState().applySession(session)
  }
})

supabase.auth.getSession().then(({ data: { session } }) => {
  if (isOAuthCallbackRoute()) return
  if (session) void useAuthStore.getState().applySession(session)
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthBootstrap>
      <App />
    </AuthBootstrap>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'var(--font-bengali)',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      }}
    />
  </BrowserRouter>,
)
