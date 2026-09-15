import { create } from 'zustand'
import { addDoc, collection, limit, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'
import type { Purchase } from '../types'

interface PurchaseState {
  purchases: Purchase[]
  loading: boolean
  unsubscribe: Unsubscribe | null
  subscribe: (uid: string, inventoryId: string) => void
  stop: () => void
  addPurchase: (uid: string, inventoryId: string, input: Omit<Purchase, 'id' | 'inventoryId' | 'createdAt'>) => Promise<void>
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  loading: true,
  unsubscribe: null,

  subscribe: (uid, inventoryId) => {
    get().unsubscribe?.()
    set({ loading: true, purchases: [] })
    const q = query(
      collection(db, 'users', uid, 'inventories', inventoryId, 'purchases'),
      orderBy('createdAt', 'desc'),
      limit(100),
    )
    const unsub = onSnapshot(q, (snap) => {
      const list: Purchase[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Purchase, 'id'>) }))
      set({ purchases: list, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  stop: () => {
    get().unsubscribe?.()
    set({ unsubscribe: null, purchases: [], loading: true })
  },

  addPurchase: async (uid, inventoryId, input) => {
    await addDoc(collection(db, 'users', uid, 'inventories', inventoryId, 'purchases'), {
      ...input,
      inventoryId,
      createdAt: Date.now(),
    })
  },
}))
