import { useMemo, useState } from 'react'
import type { Product, ProductUnit } from '../types'
import { calcTotal, isWeightUnit, toGrams, unitLabel, WEIGHT_UNITS } from '../lib/units'
import { formatMoney, formatNumber } from '../lib/format'
import { useSettingsStore } from '../store/settingsStore'

interface Props {
  product: Product
  onClose: () => void
  onSave: ({ product, quantity, inputUnit }: {
    product: Product;
    quantity: number;
    inputUnit: ProductUnit;
}) => void
}

export function CalculatorPanel({ product, onClose, onSave }: Props) {
  const gramsPerLb = useSettingsStore((s) => s.gramsPerLb)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<ProductUnit>(product.baseUnit === 'unit' ? 'unit' : product.baseUnit)
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const qtyNum = Number(quantity) || 0
  const total = useMemo(() => calcTotal(product, qtyNum, unit, gramsPerLb), [product, qtyNum, unit, gramsPerLb])

  const requestedGrams = isWeightUnit(unit) ? toGrams(qtyNum, unit, gramsPerLb) : qtyNum
  const overStock = requestedGrams > product.stock

  async function handleSave() {
    setSaving(true)
    try {
       onSave(
        {
          inputUnit: unit,
          quantity: qtyNum,
          product
        }
       )
      setSaved(true)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center">
      <div className="bg-paper w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border border-line max-h-[92dvh] overflow-y-auto">
        <div className="sticky top-0 bg-paper border-b border-line px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 grid place-items-center overflow-hidden text-xl">
              {product.photo ? <img src={product.photo} alt="" className="w-full h-full object-cover" /> : product.icon}
            </div>
            <div>
              <h2 className="font-display font-semibold leading-tight">{product.name}</h2>
              <p className="text-xs text-ink-soft font-tabular">
                {formatMoney(product.basePrice)} / {unitLabel(product.baseUnit)}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-ink-soft text-sm px-2 py-1">
            Cerrar
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qty" className="text-sm font-medium text-ink-soft mb-1 block">
                Cantidad
              </label>
              <input
                id="qty"
                inputMode="decimal"
                autoFocus
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value.replace(/[^0-9.]/g, ''))
                  setSaved(false)
                }}
                className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 font-tabular text-lg outline-none focus-visible:border-green-700"
              />
            </div>
            <div>
              <label htmlFor="unit" className="text-sm font-medium text-ink-soft mb-1 block">
                Unidad
              </label>
              {product.baseUnit === 'unit' ? (
                <div className="w-full rounded-xl border border-line bg-white/40 px-4 py-3 text-ink-soft text-sm">
                  unidad
                </div>
              ) : (
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value as ProductUnit)
                    
                    setSaved(false)
                  }}
                  className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none focus-visible:border-green-700"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {unitLabel(u)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

         
            <button
              type="button"
              onClick={handleSave}
              disabled={qtyNum <= 0}
              className="w-full rounded-xl border border-green-900 text-green-900 font-medium py-3 hover:bg-green-100 disabled:opacity-50"
            >
              Agregar
            </button>
         
            <div className="rounded-2xl bg-green-950 text-paper px-5 py-5 flex flex-col items-center gap-1">
              <p className="text-xs uppercase tracking-wide text-paper/60">
                {formatNumber(qtyNum)} {unitLabel(unit, qtyNum !== 1)}
              </p>
              <p className="font-tabular text-4xl font-semibold">{formatMoney(total)}</p>
              {overStock && (
                <p className="text-gold-100 text-xs mt-2 text-center">
                  Ojo: pides más de lo que hay en inventario ({formatNumber(product.stock)} g disponibles).
                </p>
              )}
            </div>
          

          {/* {calculated && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCalculated(false)}
                className="rounded-xl border border-line px-4 py-3 text-sm font-medium hover:bg-white"
              >
                Ajustar
              </button>
              <button
                type="button"
                disabled={saving || saved}
                onClick={() => void handleSave()}
                className="flex-1 rounded-xl bg-gold-600 text-ink font-semibold py-3 hover:brightness-105 disabled:opacity-60"
              >
                {saved ? '✓ Guardado como compra' : saving ? 'Guardando…' : 'Guardar como compra'}
              </button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
