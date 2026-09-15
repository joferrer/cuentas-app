import type { ProductUnit, WeightUnit } from '../types'

export const WEIGHT_UNITS: WeightUnit[] = ['g', 'kg', 'lb']

/** grams in one libra, using the Colombian market convention (media kilo). */
export const DEFAULT_GRAMS_PER_LB = 500

export function isWeightUnit(unit: ProductUnit): unit is WeightUnit {
  return unit === 'g' || unit === 'kg' || unit === 'lb'
}

/** Convert an amount expressed in `unit` to grams. 'unit' products pass through unchanged. */
export function toGrams(amount: number, unit: ProductUnit, gramsPerLb = DEFAULT_GRAMS_PER_LB): number {
  switch (unit) {
    case 'g':
      return amount
    case 'kg':
      return amount * 1000
    case 'lb':
      return amount * gramsPerLb
    case 'unit':
      return amount
  }
}

/** Convert an amount in grams to the requested unit. 'unit' products pass through unchanged. */
export function fromGrams(grams: number, unit: ProductUnit, gramsPerLb = DEFAULT_GRAMS_PER_LB): number {
  switch (unit) {
    case 'g':
      return grams
    case 'kg':
      return grams / 1000
    case 'lb':
      return grams / gramsPerLb
    case 'unit':
      return grams
  }
}

/** Given a price for one `baseUnit`, return the price-per-gram (or price-per-unit for count products). */
export function pricePerGram(basePrice: number, baseUnit: ProductUnit, gramsPerLb = DEFAULT_GRAMS_PER_LB): number {
  if (baseUnit === 'unit') return basePrice
  const gramsInBase = toGrams(1, baseUnit, gramsPerLb)
  return basePrice / gramsInBase
}

/** Compute the equivalent price for every weight unit, given a base price + unit. Returns null for 'unit' products. */
export function equivalentPrices(basePrice: number, baseUnit: ProductUnit, gramsPerLb = DEFAULT_GRAMS_PER_LB) {
  if (baseUnit === 'unit') return null
  const perGram = pricePerGram(basePrice, baseUnit, gramsPerLb)
  return {
    g: perGram,
    kg: perGram * 1000,
    lb: perGram * gramsPerLb,
  }
}

export function unitLabel(unit: ProductUnit, plural = false): string {
  switch (unit) {
    case 'g':
      return 'g'
    case 'kg':
      return 'kg'
    case 'lb':
      return plural ? 'libras' : 'libra'
    case 'unit':
      return plural ? 'unidades' : 'unidad'
  }
}

/** Total price for a given quantity+unit of a product, using its base price/unit. */
export function calcTotal(
  product: { basePrice: number; baseUnit: ProductUnit },
  quantity: number,
  unit: ProductUnit,
  gramsPerLb = DEFAULT_GRAMS_PER_LB,
): number {
  if (product.baseUnit === 'unit' || unit === 'unit') {
    return quantity * product.basePrice
  }
  const perGram = pricePerGram(product.basePrice, product.baseUnit, gramsPerLb)
  const grams = toGrams(quantity, unit, gramsPerLb)
  return perGram * grams
}
