import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// We need to mock nested page components to keep tests fast
vi.mock('@/pages/Login', () => ({ default: () => <div data-testid="login-page">Login</div> }))
vi.mock('@/pages/Register', () => ({ default: () => <div data-testid="register-page">Register</div> }))
vi.mock('@/pages/AuthCallback', () => ({ default: () => <div data-testid="callback-page">Callback</div> }))
vi.mock('@/pages/Dashboard', () => ({ default: () => <div data-testid="dashboard-page">Dashboard</div> }))
vi.mock('@/pages/ExamPortal', () => ({ default: () => <div data-testid="exam-page">Exam</div> }))
vi.mock('@/pages/PaperEditor', () => ({ default: () => <div data-testid="editor-page">Editor</div> }))
vi.mock('@/pages/PapersList', () => ({ default: () => <div data-testid="papers-page">Papers</div> }))
vi.mock('@/pages/PDFPreview', () => ({ default: () => <div data-testid="pdf-page">PDF</div> }))
vi.mock('@/pages/OmrPreview', () => ({ default: () => <div data-testid="omr-page">OMR</div> }))
vi.mock('@/pages/ScanUpload', () => ({ default: () => <div data-testid="scan-page">Scan</div> }))
vi.mock('@/pages/QuestionBank', () => ({ default: () => <div data-testid="bank-page">Bank</div> }))
vi.mock('@/pages/Results', () => ({ default: () => <div data-testid="results-page">Results</div> }))
vi.mock('@/pages/Pricing', () => ({ default: () => <div data-testid="pricing-page">Pricing</div> }))
vi.mock('@/pages/AdminDashboard', () => ({ default: () => <div data-testid="admin-page">Admin</div> }))
vi.mock('@/components/shared/AppShell', () => {
  const { Outlet } = require('react-router-dom')
  return { default: () => <div data-testid="app-shell"><Outlet /></div> }
})

// Mock authStore — we control the state per test
let mockAuthState = {}
vi.mock('@/store/authStore', () => ({
  default: vi.fn((selector) => selector(mockAuthState)),
}))

import App from './App'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App route guards', () => {
  describe('GuestRoute (/login)', () => {
    it('should show login for unauthenticated users', () => {
      mockAuthState = { isAuthenticated: false, user: null }
      renderApp('/login')
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('should redirect authenticated user with role to /dashboard', () => {
      mockAuthState = { isAuthenticated: true, user: { role: 'school' } }
      renderApp('/login')
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })

    it('should redirect authenticated user without role to /register?step=role', () => {
      mockAuthState = { isAuthenticated: true, user: { name: 'Test' } }
      renderApp('/login')
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })
  })

  describe('ProtectedRoute (/dashboard)', () => {
    it('should redirect unauthenticated to /login', () => {
      mockAuthState = { isAuthenticated: false, user: null }
      renderApp('/dashboard')
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('should show Dashboard for authenticated user with role', () => {
      mockAuthState = { isAuthenticated: true, user: { role: 'school' } }
      renderApp('/dashboard')
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })

    it('should redirect to register for authenticated user without role', () => {
      mockAuthState = { isAuthenticated: true, user: { name: 'Test' } }
      renderApp('/dashboard')
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
    })
  })

  describe('AdminRoute (/admin)', () => {
    it('should redirect non-admin to /dashboard', () => {
      mockAuthState = { isAuthenticated: true, user: { role: 'school' } }
      renderApp('/admin')
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument()
    })

    it('should show admin dashboard for admin user', () => {
      mockAuthState = { isAuthenticated: true, user: { role: 'admin' } }
      renderApp('/admin')
      expect(screen.getByTestId('admin-page')).toBeInTheDocument()
    })
  })

  describe('Public routes', () => {
    it('should allow exam portal without auth', () => {
      mockAuthState = { isAuthenticated: false, user: null }
      renderApp('/exam/test-123')
      expect(screen.getByTestId('exam-page')).toBeInTheDocument()
    })

    it('should allow auth callback without auth', () => {
      mockAuthState = { isAuthenticated: false, user: null }
      renderApp('/auth/callback')
      expect(screen.getByTestId('callback-page')).toBeInTheDocument()
    })
  })
})
