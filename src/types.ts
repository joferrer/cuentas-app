export type WeightUnit = 'g' | 'kg' | 'lb'
export type ProductUnit = WeightUnit | 'unit'

export interface Inventory {
  id: string
  name: string
  icon: string
  createdAt: number
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
  createdAt: number
  updatedAt: number
}

export interface Purchase {
  id: string
  inventoryId: string
  productId: string
  productName: string
  productIcon: string
  quantity: number
  unit: ProductUnit
  unitPriceUsed: number
  total: number
  createdAt: number
}

export interface UnitSystem {
  /** grams in one 'libra' - 500 is the common commercial convention in Colombia, 453.592 is the imperial pound */
  gramsPerLb: number
}
