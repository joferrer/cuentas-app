import type { Product } from '../types'
import { formatMoney } from '../lib/format'
import { unitLabel } from '../lib/units'

interface Props {
  product: Product
  onSelect: () => void
  onEdit: () => void
}

export function ProductRow({ product, onSelect, onEdit }: Props) {
  const lowStock = product.baseUnit === 'unit' ? product.stock <= 3 : product.stock <= 500

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left bg-white/70 border border-line rounded-xl p-2.5 flex items-center gap-3 hover:border-green-700 hover:bg-white transition-colors"
      >
        <div className="w-11 h-11 shrink-0 rounded-lg bg-green-100 grid place-items-center overflow-hidden text-xl">
          {product.photo ? (
            <img src={product.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            product.icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug truncate">{product.name}</p>
          <p className="font-tabular text-gold-600 font-semibold text-sm">
            {formatMoney(product.basePrice)}
            <span className="text-ink-soft font-normal"> / {unitLabel(product.baseUnit)}</span>
          </p>
          <p className={`text-xs ${lowStock ? 'text-brick-600' : 'text-ink-soft'}`}>
            {formatStock(product)}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${product.name}`}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-paper/90 border border-line grid place-items-center text-[10px] opacity-80 hover:opacity-100"
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
