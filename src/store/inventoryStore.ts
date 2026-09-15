import { create } from 'zustand'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Inventory } from '../types'

const LAST_ACTIVE_KEY = 'cuentas-claras-active-inventory'

interface InventoryState {
  inventories: Inventory[]
  activeInventoryId: string | null
  loading: boolean
  unsubscribe: Unsubscribe | null
  subscribe: (uid: string) => void
  stop: () => void
  setActive: (id: string) => void
  createInventory: (uid: string, name: string, icon: string) => Promise<string>
  deleteInventory: (uid: string, id: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventories: [],
  activeInventoryId: null,
  loading: true,
  unsubscribe: null,

  subscribe: (uid) => {
    get().unsubscribe?.()
    set({ loading: true })
    const q = query(collection(db, 'users', uid, 'inventories'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, async (snap) => {
      const list: Inventory[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inventory, 'id'>) }))

      if (list.length === 0) {
        // First time this account is seen: bootstrap a default "Mi negocio" inventory.
        await addDoc(collection(db, 'users', uid, 'inventories'), {
          name: 'Mi negocio',
          icon: '🏪',
          createdAt: Date.now(),
        })
        return
      }

      const savedActive = localStorage.getItem(LAST_ACTIVE_KEY)
      const stillExists = list.some((inv) => inv.id === savedActive)
      const nextActive = stillExists ? savedActive : (get().activeInventoryId && list.some((i) => i.id === get().activeInventoryId)
        ? get().activeInventoryId
        : list[0].id)

      set({ inventories: list, loading: false, activeInventoryId: nextActive })
    })
    set({ unsubscribe: unsub })
  },

  stop: () => {
    get().unsubscribe?.()
    set({ unsubscribe: null, inventories: [], activeInventoryId: null, loading: true })
  },

  setActive: (id) => {
    localStorage.setItem(LAST_ACTIVE_KEY, id)
    set({ activeInventoryId: id })
  },

  createInventory: async (uid, name, icon) => {
    const ref = await addDoc(collection(db, 'users', uid, 'inventories'), {
      name,
      icon,
      createdAt: Date.now(),
    })
    void serverTimestamp
    get().setActive(ref.id)
    return ref.id
  },

  deleteInventory: async (uid, id) => {
    // Cascade-delete products and purchases so the account doesn't accumulate orphaned data.
    const batch = writeBatch(db)
    const [productsSnap, purchasesSnap] = await Promise.all([
      getDocs(collection(db, 'users', uid, 'inventories', id, 'products')),
      getDocs(collection(db, 'users', uid, 'inventories', id, 'purchases')),
    ])
    productsSnap.forEach((d) => batch.delete(d.ref))
    purchasesSnap.forEach((d) => batch.delete(d.ref))
    batch.delete(doc(db, 'users', uid, 'inventories', id))
    await batch.commit()

    const remaining = get().inventories.filter((i) => i.id !== id)
    if (get().activeInventoryId === id && remaining.length > 0) {
      get().setActive(remaining[0].id)
    }
  },
}))
