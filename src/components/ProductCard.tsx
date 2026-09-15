import type { Product } from '../types'
import { formatMoney } from '../lib/format'
import { unitLabel } from '../lib/units'

interface Props {
  product: Product
  onSelect: () => void
  onEdit: () => void
}

export function ProductCard({ product, onSelect, onEdit }: Props) {
  const lowStock = product.baseUnit === 'unit' ? product.stock <= 3 : product.stock <= 500

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left bg-white/70 border border-line rounded-2xl p-3 flex flex-col gap-2 hover:border-green-700 hover:bg-white transition-colors"
      >
        <div className="w-full aspect-square rounded-xl bg-green-100 grid place-items-center overflow-hidden text-3xl">
          {product.photo ? (
            <img src={product.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            product.icon
          )}
        </div>
        <div>
          <p className="font-medium text-sm leading-snug line-clamp-2">{product.name}</p>
          <p className="font-tabular text-gold-600 font-semibold text-sm mt-0.5">
            {formatMoney(product.basePrice)}
            <span className="text-ink-soft font-normal"> / {unitLabel(product.baseUnit)}</span>
          </p>
          <p className={`text-xs mt-0.5 ${lowStock ? 'text-brick-600' : 'text-ink-soft'}`}>
            {formatStock(product)}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${product.name}`}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-paper/90 border border-line grid place-items-center text-xs opacity-80 hover:opacity-100"
      >
        ✎
      </button>
    </div>
  )
}

function formatStock(product: Product) {
  if (product.baseUnit === 'unit') {
    return `${product.stock} en inventario`
  }
  if (product.stock >= 1000) return `${(product.stock / 1000).toFixed(1)} kg en inventario`
  return `${product.stock} g en inventario`
}
