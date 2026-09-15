import { create } from 'zustand'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Product, ProductUnit } from '../types'

export interface ProductInput {
  name: string
  icon: string
  photo?: string | null
  baseUnit: ProductUnit
  basePrice: number
  stock: number
}

interface ProductState {
  products: Product[]
  loading: boolean
  unsubscribe: Unsubscribe | null
  subscribe: (uid: string, inventoryId: string) => void
  stop: () => void
  addProduct: (uid: string, inventoryId: string, input: ProductInput) => Promise<void>
  updateProduct: (uid: string, inventoryId: string, id: string, input: Partial<ProductInput>) => Promise<void>
  deleteProduct: (uid: string, inventoryId: string, id: string) => Promise<void>
  adjustStock: (uid: string, inventoryId: string, id: string, deltaGramsOrUnits: number) => Promise<void>
  bumpUsage: (uid: string, inventoryId: string, id: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: true,
  unsubscribe: null,

  subscribe: (uid, inventoryId) => {
    get().unsubscribe?.()
    set({ loading: true, products: [] })
    const col = collection(db, 'users', uid, 'inventories', inventoryId, 'products')
    const unsub = onSnapshot(col, (snap) => {
      const list: Product[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))
      set({ products: list, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  stop: () => {
    get().unsubscribe?.()
    set({ unsubscribe: null, products: [], loading: true })
  },

  addProduct: async (uid, inventoryId, input) => {
    const now = Date.now()
    await addDoc(collection(db, 'users', uid, 'inventories', inventoryId, 'products'), {
      ...input,
      photo: input.photo ?? null,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  },

  updateProduct: async (uid, inventoryId, id, input) => {
    await updateDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'products', id), {
      ...input,
      updatedAt: Date.now(),
    })
  },

  deleteProduct: async (uid, inventoryId, id) => {
    await deleteDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'products', id))
  },

  adjustStock: async (uid, inventoryId, id, delta) => {
    await updateDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'products', id), {
      stock: increment(delta),
      updatedAt: Date.now(),
    })
  },

  bumpUsage: async (uid, inventoryId, id) => {
    await updateDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'products', id), {
      usageCount: increment(1),
    })
  },
}))
