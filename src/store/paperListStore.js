import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'

const LIST_TTL_MS = 5 * 60 * 1000
const ITEM_TTL_MS = 5 * 60 * 1000

const usePaperListStore = create(
  persist(
    (set, get) => ({
      // ── Papers list (Dashboard, PapersList) ────────────────
      list: [],
      listFetchedAt: 0,
      listLoading: false,
      listError: null,

      // ── Per-paper cache (PaperEditor, PDFPreview) ─────────
      byId: {},
      byIdFetchedAt: {},
      byIdLoading: {},

      // List: cache-first. Returns cached immediately if fresh,
      // otherwise fetches. Pass { force: true } from a refresh
      // button to bypass the TTL.
      async loadList({ force = false, silent = false } = {}) {
        const { listFetchedAt, list, listLoading } = get()
        const stale = !listFetchedAt || Date.now() - listFetchedAt > LIST_TTL_MS

        if (!force && list.length > 0 && !stale) return list
        if (listLoading && !force) return list

        if (!silent) set({ listLoading: true, listError: null })
        try {
          const { data } = await api.get('/papers')
          const papers = data.papers || []
          set({
            list: papers,
            listFetchedAt: Date.now(),
            listLoading: false,
            listError: null,
          })
          return papers
        } catch (err) {
          set({ listLoading: false, listError: err?.message || 'load failed' })
          throw err
        }
      },

      // Background refresh — never touches loading state, swallows errors.
      // Use when cached data is shown and we want silent freshness.
      async revalidateList() {
        try {
          const { data } = await api.get('/papers')
          set({ list: data.papers || [], listFetchedAt: Date.now() })
        } catch {
          /* keep cached data on background failure */
        }
      },

      async loadById(id, { force = false, silent = false } = {}) {
        if (!id) return null
        const { byId, byIdFetchedAt, byIdLoading } = get()
        const cached = byId[id]
        const fetchedAt = byIdFetchedAt[id]
        const stale = !fetchedAt || Date.now() - fetchedAt > ITEM_TTL_MS

        if (!force && cached && !stale) return cached
        if (byIdLoading[id] && !force) return cached

        if (!silent) {
          set((s) => ({ byIdLoading: { ...s.byIdLoading, [id]: true } }))
        }
        try {
          const { data } = await api.get(`/papers/${id}`)
          set((s) => ({
            byId: { ...s.byId, [id]: data.paper },
            byIdFetchedAt: { ...s.byIdFetchedAt, [id]: Date.now() },
            byIdLoading: { ...s.byIdLoading, [id]: false },
          }))
          return data.paper
        } catch (err) {
          set((s) => ({ byIdLoading: { ...s.byIdLoading, [id]: false } }))
          throw err
        }
      },

      async revalidateById(id) {
        if (!id) return
        try {
          const { data } = await api.get(`/papers/${id}`)
          set((s) => ({
            byId: { ...s.byId, [id]: data.paper },
            byIdFetchedAt: { ...s.byIdFetchedAt, [id]: Date.now() },
          }))
        } catch {
          /* keep cached data on background failure */
        }
      },

      // Mutations — keep caches consistent without a round-trip
      upsertPaper(paper) {
        if (!paper?.id) return
        set((s) => {
          const exists = s.list.some((p) => p.id === paper.id)
          const list = exists
            ? s.list.map((p) => (p.id === paper.id ? paper : p))
            : [paper, ...s.list]
          return {
            list,
            byId: { ...s.byId, [paper.id]: paper },
            byIdFetchedAt: { ...s.byIdFetchedAt, [paper.id]: Date.now() },
          }
        })
      },

      removePaper(id) {
        if (!id) return
        set((s) => {
          const list = s.list.filter((p) => p.id !== id)
          const byId = { ...s.byId }
          const byIdFetchedAt = { ...s.byIdFetchedAt }
          delete byId[id]
          delete byIdFetchedAt[id]
          return { list, byId, byIdFetchedAt }
        })
      },

      // Force-stale everything — next loadList/loadById will re-fetch.
      invalidateAll() {
        set({ listFetchedAt: 0, byIdFetchedAt: {} })
      },
    }),
    {
      name: 'paper-list-cache',
      // Persist only data + timestamps; never persist loading flags.
      partialize: (s) => ({
        list: s.list,
        listFetchedAt: s.listFetchedAt,
        byId: s.byId,
        byIdFetchedAt: s.byIdFetchedAt,
      }),
      version: 1,
    }
  )
)

export default usePaperListStore
