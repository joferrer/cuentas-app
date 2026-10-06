import { useId } from 'react'

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  /** called on blur / Enter so the parent can persist-ensure the value */
  onCommit?: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export function AutocompleteInput({ id, value, onChange, onCommit, options, placeholder, className }: Props) {
  const autoId = useId()
  const listId = id ?? `options-${autoId}`

  return (
    <>
      <input
        id={id}
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit?.(value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onCommit?.(value)
          }
        }}
        className={className}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  )
}
