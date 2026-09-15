import { useState } from 'react'
import type { Inventory } from '../types'
import { IconPicker } from './IconPicker'

interface Props {
  inventories: Inventory[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: (name: string, icon: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function InventorySwitcher({ inventories, activeId, onSelect, onCreate, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const active = inventories.find((i) => i.id === activeId)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-line bg-white/70 px-3 py-2 hover:bg-white"
      >
        <span className="text-lg">{active?.icon ?? '📦'}</span>
        <span className="font-medium text-sm max-w-28 truncate">{active?.name ?? 'Inventario'}</span>
        <span className="text-ink-soft text-xs">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 w-64 bg-paper border border-line rounded-xl shadow-lg overflow-hidden">
            <ul className="max-h-64 overflow-y-auto">
              {inventories.map((inv) => (
                <li key={inv.id} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(inv.id)
                      setOpen(false)
                    }}
                    className={`flex-1 text-left px-4 py-2.5 flex items-center gap-2 hover:bg-green-100 ${
                      inv.id === activeId ? 'bg-green-100' : ''
                    }`}
                  >
                    <span>{inv.icon}</span>
                    <span className="text-sm">{inv.name}</span>
                  </button>
                  {inventories.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Eliminar ${inv.name}`}
                      onClick={() => {
                        if (confirm(`¿Eliminar el inventario "${inv.name}" y todo su contenido?`)) {
                          void onDelete(inv.id)
                        }
                      }}
                      className="px-3 text-ink-soft/50 hover:text-brick-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setCreating(true)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-green-900 border-t border-line hover:bg-green-100"
            >
              + Crear otro inventario
            </button>
          </div>
        </>
      )}

      {creating && (
        <CreateInventoryModal
          onCancel={() => setCreating(false)}
          onCreate={async (name, icon) => {
            await onCreate(name, icon)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

function CreateInventoryModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void
  onCreate: (name: string, icon: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏠')
  const [busy, setBusy] = useState(false)

  return (
    <div className="fixed w-full h-screen inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center">
      <div className="bg-paper w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border border-line p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Nuevo inventario</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-green-100 grid place-items-center text-2xl">{icon}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mi casa"
            className="flex-1 rounded-xl border border-line bg-white/70 px-4 py-3 outline-none focus-visible:border-green-700"
          />
        </div>
        <IconPicker value={icon} onChange={setIcon} />
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onCancel} className="rounded-xl border border-line px-4 py-3 text-sm font-medium hover:bg-white">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!name.trim() || busy}
            onClick={async () => {
              setBusy(true)
              await onCreate(name.trim(), icon)
              setBusy(false)
            }}
            className="flex-1 rounded-xl bg-green-900 text-paper font-medium py-3 hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? 'Creando…' : 'Crear inventario'}
          </button>
        </div>
      </div>
    </div>
  )
}
