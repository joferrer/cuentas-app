import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
  query: string
  onSelect: (product: Product) => void
  onEdit: (product: Product) => void
  onNew: () => void
}

export function ProductGrid({ products, query, onSelect, onEdit, onNew }: Props) {
  const q = query.trim().toLowerCase()
  const filtered = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
  const sorted = [...filtered].sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name))

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-4xl mb-3">🥬</p>
        <p className="font-display font-semibold text-lg mb-1">Aún no tienes productos</p>
        <p className="text-ink-soft text-sm mb-5">Agrega tu primer producto para empezar a sacar cuentas.</p>
        <button
          type="button"
          onClick={onNew}
          className="rounded-xl bg-green-900 text-paper font-medium px-5 py-3 hover:bg-green-700"
        >
          + Nuevo producto
        </button>
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-ink-soft text-sm">No hay productos que coincidan con "{query}".</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {sorted.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={() => onSelect(p)} onEdit={() => onEdit(p)} />
      ))}
    </div>
  )
}
