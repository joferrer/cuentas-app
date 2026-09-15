import { useRef, useState } from 'react'
import type { Product, ProductUnit } from '../types'
import type { ProductInput } from '../store/productStore'
import { IconPicker } from './IconPicker'
import { fileToCompressedDataUrl } from '../lib/image'
import { equivalentPrices, unitLabel } from '../lib/units'
import { formatMoney } from '../lib/format'
import { useSettingsStore } from '../store/settingsStore'

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'kg', label: 'kilogramo' },
  { value: 'lb', label: 'libra' },
  { value: 'g', label: 'gramo' },
  { value: 'unit', label: 'unidad' },
]

interface Props {
  initial?: Product | null
  onCancel: () => void
  onSubmit: (input: ProductInput) => Promise<void>
  onDelete?: () => Promise<void>
}

export function ProductForm({ initial, onCancel, onSubmit, onDelete }: Props) {
  const gramsPerLb = useSettingsStore((s) => s.gramsPerLb)
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '🥬')
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null)
  const [baseUnit, setBaseUnit] = useState<ProductUnit>(initial?.baseUnit ?? 'kg')
  const [basePrice, setBasePrice] = useState(initial?.basePrice?.toString() ?? '')
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const priceNum = Number(basePrice) || 0
  const equiv = equivalentPrices(priceNum, baseUnit, gramsPerLb)

  async function handlePhoto(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setPhoto(dataUrl)
    } catch {
      setError('No se pudo cargar la foto, intenta con otra imagen.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Ponle un nombre al producto.')
    if (priceNum <= 0) return setError('El precio debe ser mayor a 0.')
    setBusy(true)
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        photo,
        baseUnit,
        basePrice: priceNum,
        stock: Number(stock) || 0,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-paper w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-line max-h-[92dvh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-paper border-b border-line px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onCancel} className="text-ink-soft text-sm px-2 py-1">
            Cerrar
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-green-100 grid place-items-center overflow-hidden text-3xl">
              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : icon}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm px-3 py-2 rounded-lg border border-line bg-white/60 hover:bg-white"
              >
                Subir foto
              </button>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} className="text-sm text-brick-600 text-left">
                  Quitar foto
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />
            </div>
          </div>

          {!photo && (
            <div>
              <label className="text-sm font-medium text-ink-soft mb-2 block">O elige un ícono</label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink-soft mb-1 block">
              Nombre
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Tomate chonto"
              className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none focus-visible:border-green-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="text-sm font-medium text-ink-soft mb-1 block">
                Precio
              </label>
              <input
                id="price"
                inputMode="decimal"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="2000"
                className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 font-tabular outline-none focus-visible:border-green-700"
              />
            </div>
            <div>
              <label htmlFor="unit" className="text-sm font-medium text-ink-soft mb-1 block">
                Por
              </label>
              <select
                id="unit"
                value={baseUnit}
                onChange={(e) => setBaseUnit(e.target.value as ProductUnit)}
                className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none focus-visible:border-green-700"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {equiv && priceNum > 0 && (
            <div className="rounded-xl bg-green-100 px-4 py-3 text-sm flex flex-col gap-1 font-tabular">
              <p className="font-body text-ink-soft mb-1 font-medium">Conversión automática</p>
              <div className="flex justify-between">
                <span>por kilo</span>
                <span>{formatMoney(equiv.kg)}</span>
              </div>
              <div className="flex justify-between">
                <span>por libra</span>
                <span>{formatMoney(equiv.lb)}</span>
              </div>
              <div className="flex justify-between">
                <span>por gramo</span>
                <span>{formatMoney(equiv.g)}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="stock" className="text-sm font-medium text-ink-soft mb-1 block">
              Inventario actual ({baseUnit === 'unit' ? unitLabel('unit', true) : 'gramos'})
            </label>
            <input
              id="stock"
              inputMode="decimal"
              value={stock}
              onChange={(e) => setStock(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 font-tabular outline-none focus-visible:border-green-700"
            />
            <p className="text-xs text-ink-soft mt-1">
              {baseUnit !== 'unit'
                ? 'Guarda el inventario siempre en gramos para poder convertirlo a kilo o libra.'
                : 'Cantidad de unidades disponibles.'}
            </p>
          </div>

          {error && <p className="text-brick-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2 pb-4">
            {initial && onDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDelete()}
                className="rounded-xl border border-brick-600/40 text-brick-600 px-4 py-3 text-sm font-medium hover:bg-brick-100"
              >
                Eliminar
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-green-900 text-paper font-medium py-3 hover:bg-green-700 disabled:opacity-60"
            >
              {busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
