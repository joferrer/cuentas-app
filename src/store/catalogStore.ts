import { create } from 'zustand'
import { addDoc, collection, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'
import type { Branch, Location } from '../types'

interface CatalogState {
  branches: Branch[]
  locations: Location[]
  loading: boolean
  unsubBranches: Unsubscribe | null
  unsubLocations: Unsubscribe | null
  subscribe: (uid: string) => void
  stop: () => void
  ensureBranch: (uid: string, name: string) => Promise<string>
  ensureLocation: (uid: string, name: string) => Promise<string>
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')
const sameName = (a: string, b: string) => normalize(a).toLowerCase() === normalize(b).toLowerCase()

export const useCatalogStore = create<CatalogState>((set, get) => ({
  branches: [],
  locations: [],
  loading: true,
  unsubBranches: null,
  unsubLocations: null,

  subscribe: (uid) => {
    get().unsubBranches?.()
    get().unsubLocations?.()
    set({ loading: true })

    const qBranches = query(collection(db, 'users', uid, 'branches'), orderBy('name', 'asc'))
    const unsubBranches = onSnapshot(qBranches, (snap) => {
      const list: Branch[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Branch, 'id'>) }))
      set({ branches: list, loading: false })
    })

    const qLocations = query(collection(db, 'users', uid, 'locations'), orderBy('name', 'asc'))
    const unsubLocations = onSnapshot(qLocations, (snap) => {
      const list: Location[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Location, 'id'>) }))
      set({ locations: list, loading: false })
    })

    set({ unsubBranches, unsubLocations })
  },

  stop: () => {
    get().unsubBranches?.()
    get().unsubLocations?.()
    set({ unsubBranches: null, unsubLocations: null, branches: [], locations: [], loading: true })
  },

  ensureBranch: async (uid, name) => {
    const clean = normalize(name)
    if (!clean) return ''
    const existing = get().branches.find((b) => sameName(b.name, clean))
    if (existing) return existing.name
    await addDoc(collection(db, 'users', uid, 'branches'), { name: clean, createdAt: Date.now() })
    return clean
  },

  ensureLocation: async (uid, name) => {
    const clean = normalize(name)
    if (!clean) return ''
    const existing = get().locations.find((l) => sameName(l.name, clean))
    if (existing) return existing.name
    await addDoc(collection(db, 'users', uid, 'locations'), { name: clean, createdAt: Date.now() })
    return clean
  },
}))
