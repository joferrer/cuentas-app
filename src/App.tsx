import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import { useInventoryStore } from './store/inventoryStore'
import { usePurchaseStore } from './store/purchaseStore'
import { useSearchStore } from './store/searchStore'
import { LoginScreen } from './components/LoginScreen'

import { HistoryScreen } from './components/HistoryScreen'

import { CalculatorCompoment } from './components/Calculator';
import { HeaderComponent } from './components/ui/HeaderComponent';

type Tab = 'calcular' | 'historial'

export default function App() {
  const { user, initializing, signOut } = useAuthStore()

  if (initializing) {
    return <div className="min-h-dvh grid place-items-center bg-paper text-ink-soft text-sm">Cargando…</div>
  }

  if (!user) return <LoginScreen />

  return <AuthedApp uid={user.uid} displayName={user.displayName} photoURL={user.photoURL} onSignOut={signOut} />
}

function AuthedApp({
  uid,
  displayName,
  photoURL,
  onSignOut,
}: {
  uid: string
  displayName: string | null
  photoURL: string | null
  onSignOut: () => Promise<void>
}) {
  const [tab, setTab] = useState<Tab>('calcular')

  const {
    activeInventoryId,
    loading: invLoading,
    subscribe: subInv,
    stop: stopInv,
  
  } = useInventoryStore()



  const setQuery = useSearchStore((s) => s.setQuery)
  const { purchases,subscribe:subPurchases, stop:stopPurchases } = usePurchaseStore();

   useEffect(() => {
        if (!activeInventoryId) return
        //subProducts(uid, activeInventoryId)
        subPurchases(uid, activeInventoryId)
        return () => {
            //stopProducts()
            stopPurchases()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid, activeInventoryId])

  useEffect(() => {
    subInv(uid)
    return () => stopInv()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])



  useEffect(() => {
    setQuery('')
  }, [activeInventoryId, setQuery])

  if (invLoading || !activeInventoryId) {
    return (
      <div className="min-h-dvh grid place-items-center bg-paper text-ink-soft text-sm">
        Preparando tu inventario…
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-paper text-ink flex flex-col">

      <HeaderComponent displayName={displayName}
        photoURL={photoURL}
        onSignOut={onSignOut}
        uid={uid}
      />

      <main className="flex-1 px-4 py-4 max-w-3xl w-full mx-auto pb-24">
        {tab === 'calcular' ? (
          <CalculatorCompoment uid={uid} activeInventoryId={activeInventoryId} />
        ) : (
          <HistoryScreen purchases={purchases} />
        )}
      </main>


      <nav className="fixed bottom-0 inset-x-0 z-20 bg-paper/95 backdrop-blur border-t border-line px-4 py-2 flex justify-around">
        <NavButton label="Calcular" icon="⚖️" active={tab === 'calcular'} onClick={() => setTab('calcular')} />
        <NavButton label="Historial" icon="🧾" active={tab === 'historial'} onClick={() => setTab('historial')} />
      </nav>




    </div>
  )
}

function NavButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg text-xs font-medium ${active ? 'text-green-900' : 'text-ink-soft'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  )
}
