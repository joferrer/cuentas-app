import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_RECENT = 8

interface SearchState {
  query: string
  recent: string[]
  setQuery: (q: string) => void
  commitSearch: (term: string) => void
  removeRecent: (term: string) => void
  clearRecent: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      recent: [],
      setQuery: (q) => set({ query: q }),
      commitSearch: (term) => {
        const clean = term.trim()
        if (!clean) return
        const existing = get().recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())
        set({ recent: [clean, ...existing].slice(0, MAX_RECENT) })
      },
      removeRecent: (term) => set({ recent: get().recent.filter((r) => r !== term) }),
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'cuentas-claras-recent-searches', partialize: (s) => ({ recent: s.recent }) },
  ),
)
