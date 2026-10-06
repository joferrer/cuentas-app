import { useState } from "react";
import type { Product, ProductUnit } from "../types";
import { calcTotal } from "../lib/units";
import { useSettingsStore } from "../store/settingsStore";

export const findPriceEntry = (product: { prices?: { branch: string; location: string; price: number }[] }, branch: string, location: string) => {
  const b = branch.trim().toLowerCase()
  const l = location.trim().toLowerCase()
  return product.prices?.find(
    (p) => p.branch.trim().toLowerCase() === b && p.location.trim().toLowerCase() === l,
  )
}

interface CartProduct {
  product : Product;
  quantity : number;
  price: number;
  usedUnit: ProductUnit;
  branch: string;
  location: string;
}

export const useCalculator = () => {

  const gramsPerLb = useSettingsStore((s) => s.gramsPerLb);
  const [total, setTotal] = useState<number>(0);
  const [products, setProducts] = useState<CartProduct[]>([]);

  const addProduct = ({ product, quantity, inputUnit, branch, location }: {
    product: Product, quantity: number, inputUnit: ProductUnit, branch: string, location: string
  }) => {

    const entry = findPriceEntry(product, branch, location);
    const unitPrice = entry?.price ?? product.basePrice;
    const price = calcTotal({ ...product, basePrice: unitPrice }, quantity, inputUnit, gramsPerLb);

    setTotal(total => total + price);
    setProducts([...products, {product,quantity, price, usedUnit: inputUnit, branch, location}]);

  }

  const clear = () => {
    setTotal(0);
    setProducts([]);
  }

  return {
    total,
    products,
    addProduct,
    clear,
  }
}