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
import usePaperListStore from '@/store/paperListStore'

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
    // paperListStore is a module-singleton with persist middleware — reset
    // its in-memory state so cached papers from one test don't leak into
    // the next (cache-first branch would skip the API call).
    usePaperListStore.setState({
      list: [],
      listFetchedAt: 0,
      listLoading: false,
      listError: null,
      byId: {},
      byIdFetchedAt: {},
      byIdLoading: {},
    })
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('paper-list-cache')
    }
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

  describe('cache-first behavior (end-to-end)', () => {
    // Dashboard also renders <CreditBalance> which hits /auth/credits, so
    // we filter mock calls down to /papers for these assertions.
    const papersCallCount = () =>
      api.get.mock.calls.filter(([url]) => url === '/papers').length

    // Default mock returns paper list for /papers, empty object for anything else.
    function mockPapers(papers) {
      api.get.mockImplementation((url) => {
        if (url === '/papers') return Promise.resolve({ data: { papers } })
        return Promise.resolve({ data: {} })
      })
    }

    it('does NOT call /papers on second mount when cache is fresh', async () => {
      mockPapers([
        { id: '1', exam_title: 'Paper 1', questions: [{ id: 'q1' }], createdAt: new Date().toISOString() },
      ])

      const { unmount } = renderDashboard()
      await waitFor(() => {
        expect(screen.getByText('Paper 1')).toBeInTheDocument()
      })
      expect(papersCallCount()).toBe(1)

      // Unmount → simulate user navigating away
      unmount()

      // Second mount — should render from cache instantly, no new /papers call
      renderDashboard()
      await waitFor(() => {
        expect(screen.getByText('Paper 1')).toBeInTheDocument()
      })
      expect(papersCallCount()).toBe(1) // still 1 — cache hit
    })

    it('refetches /papers on second mount when cache is stale', async () => {
      mockPapers([{ id: '1', exam_title: 'Old' }])

      const { unmount } = renderDashboard()
      await waitFor(() => {
        expect(screen.getByText('Old')).toBeInTheDocument()
      })
      expect(papersCallCount()).toBe(1)

      unmount()

      // Force the cache to be stale (>5 min old)
      usePaperListStore.setState({
        listFetchedAt: Date.now() - 10 * 60 * 1000,
      })
      mockPapers([{ id: '1', exam_title: 'Fresh' }])

      renderDashboard()
      // Cache shows immediately
      expect(screen.getByText('Old')).toBeInTheDocument()
      // Background revalidate fires → eventually fresh
      await waitFor(() => {
        expect(screen.getByText('Fresh')).toBeInTheDocument()
      })
      expect(papersCallCount()).toBe(2)
    })

    it('skips the skeleton on second mount with cached data', async () => {
      mockPapers([
        { id: '1', exam_title: 'Cached', questions: [], createdAt: new Date().toISOString() },
      ])

      const { unmount } = renderDashboard()
      await waitFor(() => {
        expect(screen.getByText('Cached')).toBeInTheDocument()
      })
      unmount()

      // Second mount — skeleton must NOT appear because cache is hot
      renderDashboard()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Cached')).toBeInTheDocument()
    })
  })
})
