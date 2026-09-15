import { useMemo } from 'react'
import type { Purchase } from '../types'
import { formatMoney, formatNumber } from '../lib/format'
import { unitLabel } from '../lib/units'

export function HistoryScreen({ purchases }: { purchases: Purchase[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Purchase[]>()
    for (const p of purchases) {
      const day = new Date(p.createdAt).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(p)
    }
    return Array.from(map.entries())
  }, [purchases])

  const grandTotal = purchases.reduce((sum, p) => sum + p.total, 0)

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-4xl mb-3">🧾</p>
        <p className="font-display font-semibold text-lg mb-1">Sin compras guardadas</p>
        <p className="text-ink-soft text-sm">Cuando calcules un producto y lo guardes, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-green-950 text-paper px-5 py-4 flex items-center justify-between">
        <span className="text-sm text-paper/70">Total de las últimas {purchases.length} compras</span>
        <span className="font-tabular text-xl font-semibold">{formatMoney(grandTotal)}</span>
      </div>

      {groups.map(([day, items]) => (
        <div key={day}>
          <h3 className="text-xs uppercase tracking-wide text-ink-soft mb-2 px-1">{day}</h3>
          <ul className="flex flex-col gap-2">
            {items.map(({ products, id,total ,createdAt}) => (
              <li
                key={id}
                className="bg-white/70 border border-line rounded-xl overflow-hidden"
              >
                <details className="group">
                  {/* Cabecera del acordeón */}
                  <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        Lista #{id} 
                      </p>

                      <p className="text-xs text-ink-soft">
                        {products.length} producto{products.length !== 1 ? 's' : ''} - $ {total} -
                        {new Date(createdAt).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                      </p>
                    </div>

                    <span className="text-xs text-ink-soft transition-transform duration-200 group-open:rotate-180">
                      ▼
                    </span>
                  </summary>

                  {/* Productos */}
                  <div className="border-t border-line px-4">
                    <div className="divide-y divide-line">
                      {products.map(({ product: p, quantity, usedUnit, price }) => (
                        <div
                          key={p.id}
                          className="py-3 flex items-center gap-3"
                        >
                          <span className="text-xl">
                            {p.icon}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {p.name}
                            </p>

                            <p className="text-xs text-ink-soft font-tabular">
                              {formatNumber(quantity)}{' '}
                              {unitLabel(usedUnit, quantity !== 1)} ·{' '}
                              {new Date(p.createdAt).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <span className="font-tabular font-semibold text-gold-600">
                            {formatMoney(price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
