import { create } from 'zustand'
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

interface AuthState {
  user: User | null
  initializing: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  error: null,
  signInWithGoogle: async () => {
    set({ error: null })
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'No se pudo iniciar sesión' })
    }
  },
  signOut: async () => {
    await fbSignOut(auth)
  },
}))

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, initializing: false })
})
