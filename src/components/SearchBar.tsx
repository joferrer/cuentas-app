import { useMemo, useState } from 'react'
import type { Product } from '../types'
import { useSearchStore } from '../store/searchStore'

interface Props {
  products: Product[]
  onPickProduct: (product: Product) => void
}

export function SearchBar({ products, onPickProduct }: Props) {
  const query = useSearchStore((s) => s.query)
  const setQuery = useSearchStore((s) => s.setQuery)
  const commitSearch = useSearchStore((s) => s.commitSearch)
  const recent = useSearchStore((s) => s.recent)
  const removeRecent = useSearchStore((s) => s.removeRecent)
  const [focused, setFocused] = useState(false)

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [products, query])

  const showPanel = focused && (query.trim() ? suggestions.length > 0 : recent.length > 0)

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) commitSearch(query)
          }}
          placeholder="Buscar producto…"
          className="w-full rounded-xl border border-line bg-white/70 pl-10 pr-4 py-3 outline-none focus-visible:border-green-700"
        />
      </div>

      {showPanel && (
        <div className="absolute z-20 mt-1 w-full bg-paper border border-line rounded-xl shadow-lg overflow-hidden">
          {query.trim() ? (
            <ul>
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      commitSearch(p.name)
                      onPickProduct(p)
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-green-100"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-sm">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2">
              <p className="text-xs text-ink-soft px-2 pb-1 pt-1">Búsquedas recientes</p>
              <ul>
                {recent.map((term) => (
                  <li key={term} className="flex items-center group">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setQuery(term)
                      }}
                      className="flex-1 text-left px-2 py-2 text-sm rounded-lg hover:bg-green-100 flex items-center gap-2"
                    >
                      <span className="text-ink-soft">↺</span>
                      {term}
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${term}`}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        removeRecent(term)
                      }}
                      className="px-2 text-ink-soft/60 hover:text-brick-600 text-xs"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
