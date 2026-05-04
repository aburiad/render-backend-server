import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock api
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock authStore
vi.mock('@/store/authStore', () => ({
  default: vi.fn((selector) =>
    selector({
      user: { name: 'রিয়াদ', role: 'school', subscription: 'free' },
    }),
  ),
}))

// Mock skeleton
vi.mock('@/components/shared/SkeletonCard', () => ({
  default: () => <div data-testid="skeleton">Loading...</div>,
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import api from '@/services/api'
import toast from 'react-hot-toast'
import Dashboard from './Dashboard'

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show skeleton while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}))
    renderDashboard()
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should show user name after loading papers', async () => {
    api.get.mockResolvedValue({ data: { papers: [] } })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/রিয়াদ/)).toBeInTheDocument()
    })
  })

  it('should show paper count stats', async () => {
    const papers = [
      { id: '1', exam_title: 'Paper 1', questions: [{ id: 'q1' }], createdAt: new Date().toISOString() },
      { id: '2', exam_title: 'Paper 2', questions: [{ id: 'q2' }, { id: 'q3' }], createdAt: new Date().toISOString() },
    ]
    api.get.mockResolvedValue({ data: { papers } })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('মোট পেপার')).toBeInTheDocument()
      expect(screen.getByText('মোট প্রশ্ন')).toBeInTheDocument()
    })
  })

  it('should show empty state when no papers', async () => {
    api.get.mockResolvedValue({ data: { papers: [] } })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('প্রথম পেপার তৈরি করুন')).toBeInTheDocument()
    })
  })

  it('should show error toast on API failure', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    renderDashboard()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('পেপার লোড করতে ব্যর্থ হয়েছে')
    })
  })

  it('should show premium CTA for free users', async () => {
    api.get.mockResolvedValue({ data: { papers: [] } })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/প্রিমিয়াম ফিচারে আপগ্রেড/)).toBeInTheDocument()
    })
  })
})
