const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '$0'
  return currencyFormatter.format(Math.round(value))
}

export function formatNumber(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: maxDecimals }).format(value)
}
