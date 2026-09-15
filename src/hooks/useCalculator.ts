import { useState } from "react";
import type { Product, ProductUnit } from "../types";
import { calcTotal } from "../lib/units";

interface CartProduct {
  product : Product;
  quantity : number;
  price: number;
  usedUnit: ProductUnit
}

export const useCalculator = () => {

  const [total, setTotal] = useState<number>(0);
  const [products, setProducts] = useState<CartProduct[]>([]);

  const addProduct = ({ product, quantity, inputUnit }: {
    product: Product, quantity: number, inputUnit: ProductUnit
  }) => {

    const price = calcTotal(product, quantity, inputUnit);

    setTotal(total => total + price);
    setProducts([...products, {product,quantity, price, usedUnit: inputUnit}]);

  }

  return {
    total,
    products,
    addProduct
  }
}