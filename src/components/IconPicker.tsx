const ICONS = [
  '🥔', '🍅', '🧅', '🥕', '🥬', '🥦', '🌽', '🫑', '🥒', '🧄',
  '🍋', '🍊', '🍎', '🍌', '🍇', '🍍', '🥭', '🍉', '🥑', '🍈',
  '🥚', '🧀', '🥩', '🍗', '🐟', '🍞', '🌾', '☕', '🍯', '🧂',
  '🧴', '🧻', '🧼', '🛒', '📦', '🏷️',
]

export function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          aria-pressed={value === icon}
          className={`aspect-square rounded-lg grid place-items-center text-lg transition-colors ${
            value === icon ? 'bg-green-900' : 'bg-green-100 hover:bg-gold-100'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
