import { useEffect, useMemo, useState } from 'react'
import { useObligationStore } from '../store/obligationStore'
import { useProductStore } from '../store/productStore'
import { formatMoney } from '../lib/format'

interface Props {
  uid: string
  activeInventoryId: string
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export function BillsScreen({ uid, activeInventoryId }: Props) {
  const { obligations, addObligation, deleteObligation, setPaid } = useObligationStore()
  const { products, subscribe: subProducts, stop: stopProducts } = useProductStore()

  useEffect(() => {
    subProducts(uid, activeInventoryId)
    return () => stopProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, activeInventoryId])

  const [viewDate, setViewDate] = useState(() => new Date())
  const [adding, setAdding] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newProductId, setNewProductId] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const key = monthKey(viewDate)
  const monthLabel = viewDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const paidTotal = useMemo(
    () => obligations.reduce((s, o) => s + (o.payments?.[key]?.amount ?? 0), 0),
    [obligations, key],
  )
  const expectedTotal = useMemo(() => obligations.reduce((s, o) => s + o.amount, 0), [obligations])

  async function toggle(o: (typeof obligations)[number]) {
    const product = products.find((pr) => pr.id === o.productId)
    if (!product) return
    const existing = o.payments?.[key]
    await setPaid(uid, activeInventoryId, o, product, key, !existing, existing?.amount ?? o.amount)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="px-2 py-1 text-ink-soft">◀</button>
        <h2 className="font-display font-semibold capitalize">{monthLabel}</h2>
        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="px-2 py-1 text-ink-soft">▶</button>
      </div>

      <div className="rounded-2xl bg-green-950 text-paper px-5 py-4 flex items-center justify-between">
        <span className="text-sm text-paper/70">Pagado este mes</span>
        <span className="font-tabular text-xl font-semibold">
          {formatMoney(paidTotal)} <span className="text-paper/60 text-sm">/ {formatMoney(expectedTotal)}</span>
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {obligations.map((o) => {
          const paid = !!o.payments?.[key]
          return (
            <li key={o.id} className="bg-white/70 border border-line rounded-xl p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void toggle(o)}
                  aria-label={paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                  className={`w-6 h-6 rounded-full border grid place-items-center text-xs shrink-0 ${paid ? 'bg-green-900 border-green-900 text-paper' : 'border-line bg-white/60'}`}
                >
                  {paid ? '✓' : ''}
                </button>
                <button type="button" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sm truncate">{o.name}</p>
                  <p className="text-xs text-ink-soft">
                    {paid ? `Pagado: ${formatMoney(o.payments[key].amount)}` : `Esperado: ${formatMoney(o.amount)}`}
                  </p>
                </button>
                <button type="button" aria-label="Eliminar" onClick={() => void deleteObligation(uid, activeInventoryId, o.id)} className="text-brick-600 text-sm px-1">✕</button>
              </div>

              {expandedId === o.id && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from({ length: 12 }, (_, m) => {
                    const mk = `${viewDate.getFullYear()}-${String(m + 1).padStart(2, '0')}`
                    const p = o.payments?.[mk]
                    return (
                      <button
                        key={mk}
                        type="button"
                        title={p ? formatMoney(p.amount) : 'Pendiente'}
                        onClick={async () => {
                          const product = products.find((pr) => pr.id === o.productId)
                          if (!product) return
                          if (p) {
                            await setPaid(uid, activeInventoryId, o, product, mk, false, p.amount)
                          } else {
                            await setPaid(uid, activeInventoryId, o, product, mk, true, o.amount)
                          }
                        }}
                        className={`w-9 h-7 rounded-md text-[10px] font-medium border ${p ? 'bg-green-900 text-paper border-green-900' : 'bg-white/60 text-ink-soft border-line'}`}
                      >
                        {new Date(viewDate.getFullYear(), m, 1).toLocaleDateString('es-CO', { month: 'short' })}
                      </button>
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {adding ? (
        <form
          className="rounded-xl border border-line bg-white/70 p-4 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const amount = Number(newAmount) || 0
            const product = products.find((p) => p.id === newProductId)
            if (!product || amount <= 0) return
            await addObligation(uid, activeInventoryId, {
              productId: product.id,
              name: newName.trim() || product.name,
              amount,
            })
            setAdding(false)
            setNewName('')
            setNewProductId('')
            setNewAmount('')
          }}
        >
          <select
            value={newProductId}
            onChange={(e) => {
              const id = e.target.value
              setNewProductId(id)
              const product = products.find((p) => p.id === id)
              if (product) setNewAmount(String(product.basePrice))
            }}
            className="rounded-lg border border-line bg-white/70 px-3 py-2 text-sm"
          >
            <option value="">Selecciona un producto…</option>
            {products.filter(p => p.category == 'bills').map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (opcional)"
            className="rounded-lg border border-line bg-white/70 px-3 py-2 text-sm"
          />
          <input
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Monto esperado"
            inputMode="decimal"
            className="rounded-lg border border-line bg-white/70 px-3 py-2 text-sm font-tabular"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-xl bg-green-900 text-paper py-2 text-sm font-medium">Guardar</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 rounded-xl border border-line text-sm">Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="rounded-xl border border-dashed border-line text-ink-soft py-3 text-sm">
          + Nueva obligación
        </button>
      )}
    </div>
  )
}
