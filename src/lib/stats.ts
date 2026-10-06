import type { Purchase, ProductCategory } from '../types'
import { PRODUCT_CATEGORY_LABELS } from '../types'

export type Period = 'week' | 'month' | 'year'

export const isSale = (p: Purchase) => (p.type ?? 'purchase') === 'sale'

export interface Range {
  start: Date
  end: Date
  prevStart: Date
  prevEnd: Date
}

export function periodRange(period: Period, now = new Date()): Range {
  const d = new Date(now)
  if (period === 'week') {
    const day = (d.getDay() + 6) % 7 // Monday = 0
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999)
    const prevStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 7)
    const prevEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 7)
    return { start, end, prevStart, prevEnd }
  }
  if (period === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1)
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999)
    return { start, end, prevStart, prevEnd }
  }
  const start = new Date(d.getFullYear(), 0, 1)
  const end = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
  const prevStart = new Date(d.getFullYear() - 1, 0, 1)
  const prevEnd = new Date(d.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
  return { start, end, prevStart, prevEnd }
}

export function inRange(p: Purchase, start: Date, end: Date): boolean {
  const t = p.createdAt
  return t >= start.getTime() && t <= end.getTime()
}

export interface Totals {
  purchases: number
  sales: number
  balance: number
  transactions: number
  purchaseCount: number
  saleCount: number
}

export function totalsFor(list: Purchase[]): Totals {
  let purchases = 0
  let sales = 0
  let purchaseCount = 0
  let saleCount = 0
  for (const p of list) {
    if (isSale(p)) {
      sales += p.total
      saleCount++
    } else {
      purchases += p.total
      purchaseCount++
    }
  }
  return { purchases, sales, balance: sales - purchases, transactions: list.length, purchaseCount, saleCount }
}

export interface Bucket {
  label: string
  purchase: number
  sale: number
}

export function series(purchases: Purchase[], period: Period, range: Range): Bucket[] {
  const buckets: { label: string; from: Date; to: Date }[] = []
  if (period === 'year') {
    for (let m = 0; m < 12; m++) {
      const from = new Date(range.start.getFullYear(), m, 1)
      const to = new Date(range.start.getFullYear(), m + 1, 0, 23, 59, 59, 999)
      buckets.push({
        label: from.toLocaleDateString('es-CO', { month: 'short' }),
        from,
        to,
      })
    }
  } else {
    const days = period === 'week' ? 7 : new Date(range.end.getFullYear(), range.end.getMonth() + 1, 0).getDate()
    for (let i = 0; i < days; i++) {
      const from = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate() + i)
      const to = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59, 999)
      buckets.push({
        label:
          period === 'week'
            ? from.toLocaleDateString('es-CO', { weekday: 'short' })
            : String(from.getDate()),
        from,
        to,
      })
    }
  }
  return buckets.map((b) => {
    let purchase = 0
    let sale = 0
    for (const p of purchases) {
      if (p.createdAt >= b.from.getTime() && p.createdAt <= b.to.getTime()) {
        if (isSale(p)) sale += p.total
        else purchase += p.total
      }
    }
    return { label: b.label, purchase, sale }
  })
}

export interface CategoryTotal {
  key: string
  label: string
  amount: number
  pct: number
}

export function byCategory(purchases: Purchase[], sale: boolean): CategoryTotal[] {
  const filtered = purchases.filter((p) => isSale(p) === sale)
  const map = new Map<string, { label: string; amount: number }>()
  let total = 0
  for (const p of filtered) {
    for (const line of p.products) {
      const key = line.product.category ?? 'none'
      const label = line.product.category ? PRODUCT_CATEGORY_LABELS[line.product.category as ProductCategory] : 'Sin categoría'
      const entry = map.get(key) ?? { label, amount: 0 }
      entry.amount += line.price
      map.set(key, entry)
      total += line.price
    }
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, amount: v.amount, pct: total > 0 ? v.amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

export interface ProductUsage {
  name: string
  count: number
}

export function mostUsed(purchases: Purchase[], limit = 5): ProductUsage[] {
  const map = new Map<string, number>()
  for (const p of purchases) {
    for (const line of p.products) {
      map.set(line.product.name, (map.get(line.product.name) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export interface ProductSpend {
  name: string
  amount: number
}

export function topSpend(purchases: Purchase[], limit = 5): ProductSpend[] {
  const map = new Map<string, number>()
  for (const p of purchases) {
    if (isSale(p)) continue
    for (const line of p.products) {
      map.set(line.product.name, (map.get(line.product.name) ?? 0) + line.price)
    }
  }
  return Array.from(map.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function mostSold(purchases: Purchase[], limit = 5): ProductUsage[] {
  const map = new Map<string, number>()
  for (const p of purchases) {
    if (!isSale(p)) continue
    for (const line of p.products) {
      map.set(line.product.name, (map.get(line.product.name) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}
