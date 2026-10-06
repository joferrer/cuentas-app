import { create } from 'zustand'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Obligation, Product } from '../types'

interface ObligationState {
  obligations: Obligation[]
  loading: boolean
  unsubscribe: Unsubscribe | null
  subscribe: (uid: string, inventoryId: string) => void
  stop: () => void
  addObligation: (uid: string, inventoryId: string, input: { productId: string; name: string; amount: number }) => Promise<void>
  updateObligation: (uid: string, inventoryId: string, id: string, input: Partial<{ name: string; amount: number }>) => Promise<void>
  deleteObligation: (uid: string, inventoryId: string, id: string) => Promise<void>
  setPaid: (uid: string, inventoryId: string, obligation: Obligation, product: Product, monthKey: string, paid: boolean, amount: number) => Promise<void>
}

export const useObligationStore = create<ObligationState>((set, get) => ({
  obligations: [],
  loading: true,
  unsubscribe: null,

  subscribe: (uid, inventoryId) => {
    get().unsubscribe?.()
    set({ loading: true, obligations: [] })
    const q = query(
      collection(db, 'users', uid, 'inventories', inventoryId, 'obligations'),
      orderBy('createdAt', 'asc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      const list: Obligation[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Obligation, 'id'>) }))
      set({ obligations: list, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  stop: () => {
    get().unsubscribe?.()
    set({ unsubscribe: null, obligations: [], loading: true })
  },

  addObligation: async (uid, inventoryId, input) => {
    const now = Date.now()
    await addDoc(collection(db, 'users', uid, 'inventories', inventoryId, 'obligations'), {
      ...input,
      inventoryId,
      payments: {},
      createdAt: now,
      updatedAt: now,
    })
  },

  updateObligation: async (uid, inventoryId, id, input) => {
    await updateDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'obligations', id), {
      ...input,
      updatedAt: Date.now(),
    })
  },

  deleteObligation: async (uid, inventoryId, id) => {
    await deleteDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'obligations', id))
  },

  setPaid: async (uid, inventoryId, obligation, product, monthKey, paid, amount) => {
    const obRef = doc(db, 'users', uid, 'inventories', inventoryId, 'obligations', obligation.id)

    if (paid) {
      const purchaseRef = await addDoc(collection(db, 'users', uid, 'inventories', inventoryId, 'purchases'), {
        inventoryId,
        name: obligation.name,
        type: 'purchase',
        products: [
          {
            product,
            quantity: 1,
            usedUnit: product.baseUnit,
            price: amount,
          },
        ],
        total: amount,
        createdAt: Date.now(),
      })
      const payments = { ...(obligation.payments ?? {}) }
      payments[monthKey] = { amount, paidAt: Date.now(), purchaseId: purchaseRef.id }
      await updateDoc(obRef, { payments, updatedAt: Date.now() })
      await updateDoc(productDocRef(uid, inventoryId, product.id), { usageCount: increment(1) }).catch(() => {})
      return
    }

    const existing = obligation.payments?.[monthKey]
    const payments = { ...(obligation.payments ?? {}) }
    delete payments[monthKey]
    if (existing?.purchaseId) {
      await deleteDoc(doc(db, 'users', uid, 'inventories', inventoryId, 'purchases', existing.purchaseId)).catch(() => {})
    }
    await updateDoc(obRef, { payments, updatedAt: Date.now() })
  },
}))

// helper kept local to avoid importing productStore (circular risk)
function productDocRef(uid: string, inventoryId: string, productId: string) {
  return doc(db, 'users', uid, 'inventories', inventoryId, 'products', productId)
}
