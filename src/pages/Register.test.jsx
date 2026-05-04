import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
    },
  },
}))

// Mock api
vi.mock('@/services/api', () => ({
  default: {
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock authStore
let mockAuthState = { user: null }
vi.mock('@/store/authStore', () => ({
  default: vi.fn((selector) => selector(mockAuthState)),
}))

import toast from 'react-hot-toast'
import Register from './Register'

function renderRegister(path = '/register') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Register />
    </MemoryRouter>,
  )
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState = { user: null }
  })

  describe('step 1 — registration form', () => {
    it('should show step 1 by default', () => {
      renderRegister()
      expect(screen.getByText('অ্যাকাউন্ট তৈরি করুন')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('আপনার নাম')).toBeInTheDocument()
    })

    it('should require all fields', () => {
      renderRegister()
      expect(screen.getByPlaceholderText('আপনার নাম')).toBeRequired()
      expect(screen.getByPlaceholderText('example@email.com')).toBeRequired()
      expect(screen.getByPlaceholderText('কমপক্ষে ৬ অক্ষর')).toBeRequired()
      expect(screen.getByPlaceholderText('আবার পাসওয়ার্ড লিখুন')).toBeRequired()
    })
  })

  describe('password confirmation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.type(screen.getByPlaceholderText('আপনার নাম'), 'টেস্ট')
      await user.type(screen.getByPlaceholderText('example@email.com'), 'test@test.com')
      await user.type(screen.getByPlaceholderText('কমপক্ষে ৬ অক্ষর'), 'password123')
      await user.type(screen.getByPlaceholderText('আবার পাসওয়ার্ড লিখুন'), 'different456')
      await user.click(screen.getByText('পরবর্তী ধাপ'))

      expect(toast.error).toHaveBeenCalledWith('পাসওয়ার্ড মিলছে না')
    })

    it('should proceed to step 2 when passwords match', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.type(screen.getByPlaceholderText('আপনার নাম'), 'টেস্ট')
      await user.type(screen.getByPlaceholderText('example@email.com'), 'test@test.com')
      await user.type(screen.getByPlaceholderText('কমপক্ষে ৬ অক্ষর'), 'password123')
      await user.type(screen.getByPlaceholderText('আবার পাসওয়ার্ড লিখুন'), 'password123')
      await user.click(screen.getByText('পরবর্তী ধাপ'))

      await waitFor(() => {
        expect(screen.getByText('আপনি কে?')).toBeInTheDocument()
      })
    })
  })

  describe('step bypass protection', () => {
    it('should NOT skip to step 2 via URL when not logged in', () => {
      mockAuthState = { user: null }
      renderRegister('/register?step=role')

      // Should show step 1, not step 2
      expect(screen.getByText('অ্যাকাউন্ট তৈরি করুন')).toBeInTheDocument()
    })

    it('should allow step 2 via URL when logged in (Google OAuth)', () => {
      mockAuthState = { user: { uid: '1', email: 'test@test.com' } }
      renderRegister('/register?step=role')

      expect(screen.getByText('আপনি কে?')).toBeInTheDocument()
    })
  })
})
