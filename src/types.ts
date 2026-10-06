export type WeightUnit = 'g' | 'kg' | 'lb'
export type ProductUnit = WeightUnit | 'unit'

export interface Inventory {
  id: string
  name: string
  icon: string
  createdAt: number
}

export const PRODUCT_CATEGORIES = ['food', 'bills', 'subscriptions', 'other'] as const
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  food: 'Comida',
  bills: 'Facturas y servicios',
  subscriptions: 'Suscripciones',
  other: 'Otro',
}

export interface Product {
  id: string
  inventoryId: string
  name: string
  /** emoji / short icon glyph, always present as fallback */
  icon: string
  /** optional compressed photo as data URL */
  photo?: string | null
  /** the unit the shopkeeper priced it in */
  baseUnit: ProductUnit
  /** price for one baseUnit, in COP (or local currency) */
  basePrice: number
  /** current stock, always stored in grams for weight units, or count for 'unit' */
  stock: number
  /** how many times this product has been used in a saved purchase or calculation */
  usageCount: number
  /** optional per branch+location prices; falls back to basePrice */
  prices?: PriceEntry[]
  /** optional category for organizing/filtering */
  category?: ProductCategory
  createdAt: number
  updatedAt: number
}

export interface ProductCard{
  product: Product,
  quantity: number,
  usedUnit : ProductUnit,
  price : number,
  branch?: string,
  location?: string,
}

export interface Purchase {
  id: string
  inventoryId: string
  /** optional friendly name, e.g. "Mercado para la casa" */
  name?: string
  /** 'purchase' | 'sale' — missing on old docs, which means 'purchase' */
  type?: 'purchase' | 'sale'
  products: ProductCard[]
  total: number
  createdAt: number
}

export interface UnitSystem {
  /** grams in one 'libra' - 500 is the common commercial convention in Colombia, 453.592 is the imperial pound */
  gramsPerLb: number
}

export interface Branch {
  id: string
  name: string
  createdAt: number
}

export interface Location {
  id: string
  name: string
  createdAt: number
}

/** price for one baseUnit of a product at a specific branch + location */
export interface PriceEntry {
  branch: string
  location: string
  price: number
}
