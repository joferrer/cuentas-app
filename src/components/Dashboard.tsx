import { useMemo, useState } from 'react'
import { usePurchaseStore } from '../store/purchaseStore'
import { formatMoney } from '../lib/format'
import {
  byCategory,
  inRange,
  isSale,
  mostSold,
  mostUsed,
  periodRange,
  series,
  topSpend,
  totalsFor,
  type Period,
  type CategoryTotal,
} from '../lib/stats'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Semana',
  month: 'Mes',
  year: 'Año',
}

const PREV_LABELS: Record<Period, string> = {
  week: 'Semana anterior',
  month: 'Mes anterior',
  year: 'Año anterior',
}

const PALETTE = ['#166534', '#a16207', '#0e7490', '#7c3aed', '#6b7280']

export function Dashboard() {
  const { purchases, loading } = usePurchaseStore()
  const [period, setPeriod] = useState<Period>('month')

  const range = useMemo(() => periodRange(period), [period])
  const current = useMemo(() => purchases.filter((p) => inRange(p, range.start, range.end)), [purchases, range])
  const previous = useMemo(() => purchases.filter((p) => inRange(p, range.prevStart, range.prevEnd)), [purchases, range])

  const totals = totalsFor(current)
  const prevTotals = totalsFor(previous)
  const data = series(current, period, range)
  const spendCats = byCategory(current, false)
  const saleCats = byCategory(current, true)
  const topUsed = mostUsed(current)
  const topBuys = topSpend(current)
  const topSells = mostSold(current)
  const sales = current.filter(isSale)

  const spendDelta = prevTotals.purchases > 0 ? (totals.purchases - prevTotals.purchases) / prevTotals.purchases : null
  const maxBar = Math.max(1, ...data.map((b) => Math.max(b.purchase, b.sale)))

  if (loading) {
    return <div className="text-center text-ink-soft text-sm py-16">Cargando…</div>
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Period selector */}
      <div className="flex rounded-xl border border-line overflow-hidden self-start">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm font-medium ${period === p ? 'bg-green-900 text-paper' : 'bg-white/60 text-ink-soft'}`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard label="Total gastado" value={formatMoney(totals.purchases)} />
        <SummaryCard label="Total ventas" value={formatMoney(totals.sales)} />
        <SummaryCard label="Balance" value={formatMoney(totals.balance)} />
        <SummaryCard label="Transacciones" value={String(totals.transactions)} />
      </div>

      {/* Comparison */}
      <p className="text-xs text-ink-soft -mt-2">
        {PREV_LABELS[period]}: {formatMoney(prevTotals.purchases)} gastado
        {spendDelta !== null && (
          <> · {spendDelta >= 0 ? '▲' : '▼'} {Math.abs(Math.round(spendDelta * 100))}%</>
        )}
      </p>

      {/* Activity chart */}
      <Section title="Actividad">
        <div className="flex items-end gap-1 h-28">
          {data.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex items-end justify-center gap-0.5 h-24">
                <div
                  className="w-1/2 max-w-3 rounded-t bg-green-700"
                  style={{ height: `${(b.purchase / maxBar) * 100}%` }}
                  title={`Gastado: ${formatMoney(b.purchase)}`}
                />
                <div
                  className="w-1/2 max-w-3 rounded-t bg-gold-600"
                  style={{ height: `${(b.sale / maxBar) * 100}%` }}
                  title={`Vendido: ${formatMoney(b.sale)}`}
                />
              </div>
              <span className="text-[10px] text-ink-soft truncate w-full text-center">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-ink-soft">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-700 align-middle" /> Compras</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gold-600 align-middle" /> Ventas</span>
        </div>
      </Section>

      {/* Purchase categories */}
      <Section title="Gastos por categoría">
        {spendCats.length === 0 ? (
          <Empty>Sin compras en este período.</Empty>
        ) : (
          <CategoryBlock cats={spendCats} />
        )}
      </Section>

      {/* Most used / top spend */}
      <Section title="Productos más usados">
        {topUsed.length === 0 ? <Empty>Sin datos.</Empty> : (
          <ol className="flex flex-col gap-1 text-sm">
            {topUsed.map((p, i) => (
              <li key={p.name} className="flex justify-between gap-3">
                <span className="truncate">{i + 1}. {p.name}</span>
                <span className="text-ink-soft shrink-0">{p.count} transacción{p.count !== 1 ? 'es' : ''}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Productos con más gasto">
        {topBuys.length === 0 ? <Empty>Sin datos.</Empty> : (
          <ol className="flex flex-col gap-1 text-sm">
            {topBuys.map((p, i) => (
              <li key={p.name} className="flex justify-between gap-3">
                <span className="truncate">{i + 1}. {p.name}</span>
                <span className="font-tabular text-ink-soft shrink-0">{formatMoney(p.amount)}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Sales */}
      {sales.length > 0 ? (
        <Section title="Ventas">
          <p className="text-sm text-ink-soft mb-2">
            {formatMoney(totals.sales)} en {totals.saleCount} venta{totals.saleCount !== 1 ? 's' : ''}
          </p>
          {topSells.length > 0 && (
            <ol className="flex flex-col gap-1 text-sm mb-3">
              {topSells.map((p, i) => (
                <li key={p.name} className="flex justify-between gap-3">
                  <span className="truncate">{i + 1}. {p.name}</span>
                  <span className="text-ink-soft shrink-0">{p.count}</span>
                </li>
              ))}
            </ol>
          )}
          {saleCats.length > 0 && <CategoryBlock cats={saleCats} title="Ingresos por categoría" />}
        </Section>
      ) : (
        <Section title="Ventas">
          <Empty>No hay ventas en este período.</Empty>
        </Section>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/70 px-3 py-2.5">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="font-tabular font-semibold text-lg leading-tight">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white/50 p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-ink-soft text-sm">{children}</p>
}

function CategoryBlock({ cats, title }: { cats: CategoryTotal[]; title?: string }) {
  const stops = cats
    .map((c, i) => {
      const from = cats.slice(0, i).reduce((s, x) => s + x.pct, 0)
      return `${PALETTE[i % PALETTE.length]} ${from * 100}% ${(from + c.pct) * 100}%`
    })
    .join(', ')

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full shrink-0"
        style={{ background: `conic-gradient(${stops})` }}
      />
      <ul className="flex-1 flex flex-col gap-1 text-sm min-w-0">
        {title && <li className="text-xs text-ink-soft uppercase tracking-wide">{title}</li>}
        {cats.map((c, i) => (
          <li key={c.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="truncate flex-1">{c.label}</span>
            <span className="text-ink-soft text-xs shrink-0">{Math.round(c.pct * 100)}%</span>
            <span className="font-tabular shrink-0">{formatMoney(c.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
