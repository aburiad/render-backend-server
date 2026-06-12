import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock api before importing the store — Zustand persist + module-level
// state means we want the mock in place before the store is created.
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/services/api'
import usePaperListStore from './paperListStore'

const fresh = () => ({
  list: [],
  listFetchedAt: 0,
  listLoading: false,
  listError: null,
  byId: {},
  byIdFetchedAt: {},
  byIdLoading: {},
})

describe('paperListStore (cache-first behavior)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePaperListStore.setState(fresh())
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('paper-list-cache')
    }
  })

  describe('loadList', () => {
    it('fetches from API on first call (empty cache)', async () => {
      const papers = [{ id: '1', exam_title: 'A' }]
      api.get.mockResolvedValue({ data: { papers } })

      const result = await usePaperListStore.getState().loadList()

      expect(api.get).toHaveBeenCalledTimes(1)
      expect(api.get).toHaveBeenCalledWith('/papers')
      expect(result).toEqual(papers)
      expect(usePaperListStore.getState().list).toEqual(papers)
      expect(usePaperListStore.getState().listFetchedAt).toBeGreaterThan(0)
    })

    it('returns cached data on second call within TTL — no API hit', async () => {
      const papers = [{ id: '1', exam_title: 'A' }]
      api.get.mockResolvedValue({ data: { papers } })

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(1)

      // Second call — should be cache-only
      const second = await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(1) // still 1, no new call
      expect(second).toEqual(papers)
    })

    it('refetches when cache is stale (past TTL)', async () => {
      const papers = [{ id: '1' }]
      api.get.mockResolvedValue({ data: { papers } })

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(1)

      // Simulate stale cache: set fetchedAt to 10 min ago (TTL is 5 min)
      usePaperListStore.setState({
        listFetchedAt: Date.now() - 10 * 60 * 1000,
      })

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(2)
    })

    it('force=true bypasses cache and refetches', async () => {
      const papers = [{ id: '1' }]
      api.get.mockResolvedValue({ data: { papers } })

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(1)

      await usePaperListStore.getState().loadList({ force: true })
      expect(api.get).toHaveBeenCalledTimes(2)
    })

    it('propagates error and keeps loading flag clean', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      await expect(usePaperListStore.getState().loadList()).rejects.toThrow(
        'Network error',
      )
      expect(usePaperListStore.getState().listLoading).toBe(false)
      expect(usePaperListStore.getState().listError).toBe('Network error')
    })
  })

  describe('revalidateList (background)', () => {
    it('updates cache silently and swallows errors', async () => {
      // Seed cache
      const old = [{ id: '1', exam_title: 'old' }]
      usePaperListStore.setState({ list: old, listFetchedAt: Date.now() })

      const fresh = [{ id: '1', exam_title: 'fresh' }]
      api.get.mockResolvedValue({ data: { papers: fresh } })

      await usePaperListStore.getState().revalidateList()
      expect(usePaperListStore.getState().list).toEqual(fresh)

      // Now make it fail — cache should be untouched
      api.get.mockRejectedValue(new Error('boom'))
      await expect(
        usePaperListStore.getState().revalidateList(),
      ).resolves.toBeUndefined()
      expect(usePaperListStore.getState().list).toEqual(fresh)
    })
  })

  describe('loadById', () => {
    it('fetches single paper and caches it', async () => {
      const paper = { id: 'p1', exam_title: 'Test' }
      api.get.mockResolvedValue({ data: { paper } })

      const result = await usePaperListStore.getState().loadById('p1')

      expect(api.get).toHaveBeenCalledWith('/papers/p1')
      expect(result).toEqual(paper)
      expect(usePaperListStore.getState().byId.p1).toEqual(paper)
      expect(usePaperListStore.getState().byIdFetchedAt.p1).toBeGreaterThan(0)
    })

    it('returns cached paper on second call (within TTL)', async () => {
      const paper = { id: 'p1' }
      api.get.mockResolvedValue({ data: { paper } })

      await usePaperListStore.getState().loadById('p1')
      const second = await usePaperListStore.getState().loadById('p1')

      expect(api.get).toHaveBeenCalledTimes(1)
      expect(second).toEqual(paper)
    })

    it('refetches when single-paper cache is stale', async () => {
      const paper = { id: 'p1' }
      api.get.mockResolvedValue({ data: { paper } })

      await usePaperListStore.getState().loadById('p1')
      usePaperListStore.setState({
        byIdFetchedAt: { p1: Date.now() - 10 * 60 * 1000 },
      })
      await usePaperListStore.getState().loadById('p1')

      expect(api.get).toHaveBeenCalledTimes(2)
    })

    it('returns null for missing id', async () => {
      const result = await usePaperListStore.getState().loadById(null)
      expect(result).toBeNull()
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('upsertPaper', () => {
    it('adds new paper to list (front) and byId', () => {
      const paper = { id: 'p1', exam_title: 'New' }
      usePaperListStore.setState({
        list: [{ id: 'p2', exam_title: 'Existing' }],
      })

      usePaperListStore.getState().upsertPaper(paper)

      const { list, byId, byIdFetchedAt } = usePaperListStore.getState()
      expect(list).toHaveLength(2)
      expect(list[0]).toEqual(paper) // new one prepended
      expect(byId.p1).toEqual(paper)
      expect(byIdFetchedAt.p1).toBeGreaterThan(0)
    })

    it('updates existing paper in place', () => {
      usePaperListStore.setState({
        list: [
          { id: 'p1', exam_title: 'Old' },
          { id: 'p2', exam_title: 'Other' },
        ],
        byId: { p1: { id: 'p1', exam_title: 'Old' } },
      })

      usePaperListStore.getState().upsertPaper({
        id: 'p1',
        exam_title: 'Updated',
      })

      const { list, byId } = usePaperListStore.getState()
      expect(list).toHaveLength(2) // not duplicated
      expect(list[0].exam_title).toBe('Updated') // updated in place
      expect(list[1].exam_title).toBe('Other')
      expect(byId.p1.exam_title).toBe('Updated')
    })

    it('ignores paper without id', () => {
      usePaperListStore.getState().upsertPaper({ exam_title: 'no id' })
      expect(usePaperListStore.getState().list).toHaveLength(0)
    })
  })

  describe('removePaper', () => {
    it('removes from list and byId caches', () => {
      usePaperListStore.setState({
        list: [{ id: 'p1' }, { id: 'p2' }],
        byId: { p1: { id: 'p1' }, p2: { id: 'p2' } },
        byIdFetchedAt: { p1: 100, p2: 200 },
      })

      usePaperListStore.getState().removePaper('p1')

      const { list, byId, byIdFetchedAt } = usePaperListStore.getState()
      expect(list).toEqual([{ id: 'p2' }])
      expect(byId.p1).toBeUndefined()
      expect(byId.p2).toBeDefined()
      expect(byIdFetchedAt.p1).toBeUndefined()
    })
  })

  describe('invalidateAll', () => {
    it('zeros the timestamps so next load refetches', async () => {
      const papers = [{ id: 'p1' }]
      api.get.mockResolvedValue({ data: { papers } })

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(1)

      usePaperListStore.getState().invalidateAll()

      await usePaperListStore.getState().loadList()
      expect(api.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('persist middleware', () => {
    it('writes cached data to localStorage under "paper-list-cache"', async () => {
      const papers = [{ id: 'p1', exam_title: 'persisted' }]
      api.get.mockResolvedValue({ data: { papers } })

      await usePaperListStore.getState().loadList()

      const raw = localStorage.getItem('paper-list-cache')
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw)
      expect(parsed.state.list).toEqual(papers)
      expect(parsed.state.listFetchedAt).toBeGreaterThan(0)
    })

    it('does not persist loading flags', async () => {
      api.get.mockResolvedValue({ data: { papers: [] } })
      await usePaperListStore.getState().loadList()

      const parsed = JSON.parse(localStorage.getItem('paper-list-cache'))
      expect(parsed.state.listLoading).toBeUndefined()
      expect(parsed.state.byIdLoading).toBeUndefined()
    })
  })
})
