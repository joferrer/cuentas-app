import { useMemo, useState } from 'react'
import type { Purchase } from '../types'
import { formatMoney, formatNumber } from '../lib/format'
import { unitLabel } from '../lib/units'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, type ProductCategory } from '../types'

function buildShareText(purchase: Pick<Purchase, 'products' | 'total'>): string {
  const lines = purchase.products.map(
    ({ product: p, quantity, usedUnit, price }) =>
      `${p.name} — Cantidad: ${quantity} ${unitLabel(usedUnit, quantity !== 1)} — ${formatMoney(price)}`,
  )
  lines.push(`Total: ${formatMoney(purchase.total)}`)
  return lines.join('\n')
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

export function HistoryScreen({ purchases }: { purchases: Purchase[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('')

  const filteredPurchases = useMemo(
    () =>
      categoryFilter
        ? purchases.filter((p) => p.products.some((line) => line.product.category === categoryFilter))
        : purchases,
    [purchases, categoryFilter],
  )

  const groups = useMemo(() => {
    const months = new Map<string, { label: string; total: number; days: Map<string, Purchase[]> }>()
    for (const p of filteredPurchases) {
      const date = new Date(p.createdAt)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthLabel = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
      const day = date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      if (!months.has(monthKey)) months.set(monthKey, { label: monthLabel, total: 0, days: new Map() })
      const m = months.get(monthKey)!
      m.total += p.total
      if (!m.days.has(day)) m.days.set(day, [])
      m.days.get(day)!.push(p)
    }
    return Array.from(months.entries()).map(([key, m]) => ({
      key,
      label: m.label,
      total: m.total,
      days: Array.from(m.days.entries()),
    }))
  }, [filteredPurchases])

  const grandTotal = filteredPurchases.reduce((sum, p) => sum + p.total, 0)

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
        <span className="text-sm text-paper/70">Total de las últimas {filteredPurchases.length} transacciones</span>
        <span className="font-tabular text-xl font-semibold">{formatMoney(grandTotal)}</span>
      </div>

      <div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
          className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-sm outline-none focus-visible:border-green-700"
        >
          <option value="">Todas las categorías</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PRODUCT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {groups.map((month) => (
        <section key={month.key} className="flex flex-col gap-4">
          <div className="rounded-2xl bg-green-950 text-paper px-5 py-3 flex items-center justify-between">
            <span className="font-semibold capitalize">{month.label}</span>
            <span className="font-tabular text-sm">
              Total: <span className="font-semibold">{formatMoney(month.total)}</span>
            </span>
          </div>

          {month.days.map(([day, items]) => (
            <div key={day}>
              <h3 className="text-xs uppercase tracking-wide text-ink-soft mb-2 px-1">{day}</h3>
              <ul className="flex flex-col gap-2">
                {items.map(({ products, id, name, total, createdAt, type }) => (
              <li
                key={id}
                className="bg-white/70 border border-line rounded-xl overflow-hidden"
              >
                <details className="group">
                  {/* Cabecera del acordeón */}
                  <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {name?.trim() ? name : `Lista #${id}`}
                        <span className={`ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          (type ?? 'purchase') === 'sale' ? 'bg-gold-100 text-ink' : 'bg-green-100 text-green-900'
                        }`}>
                          {(type ?? 'purchase') === 'sale' ? 'Venta' : 'Compra'}
                        </span>
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
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyToClipboard(buildShareText({ products, total }))
                          if (ok) {
                            setCopiedId(id)
                            setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
                          } else {
                            alert('No se pudo copiar :/')
                          }
                        }}
                        className="text-xs text-green-900 font-medium px-2 py-1 rounded-md border border-line bg-white/60 hover:bg-white"
                      >
                        {copiedId === id ? '✓ Copiado' : 'Compartir'}
                      </button>
                    </div>
                    <div className="divide-y divide-line">
                      {products.map(({ product: p, quantity, usedUnit, price, branch, location }) => (
                        <div
                          key={`${p.id}-${branch ?? ''}-${location ?? ''}`}
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
                            {(branch || location) && (
                              <p className="text-xs text-ink-soft">
                                📍 {branch}{branch && location ? ' · ' : ''}{location}
                              </p>
                            )}
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
        </section>
      ))}
    </div>
  )
}
