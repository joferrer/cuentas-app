import { useEffect, useState } from "react";
import { useSearchStore } from "../store/searchStore";
import type { Product } from "../types";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";
import { CalculatorPanel } from "./CalculatorPanel";
import { useSettingsStore } from "../store/settingsStore";
import { toGrams } from "../lib/units";
import { useProductStore } from "../store/productStore";
import { usePurchaseStore } from "../store/purchaseStore";
import { ProductForm } from "./ProductForm";
import { useCalculator } from "../hooks/useCalculator";

interface Props {
    uid: string;
    activeInventoryId: string;


}

export const CalculatorCompoment = ({ uid, activeInventoryId }: Props) => {

    const [calculating, setCalculating] = useState<Product | null>(null)
    const [editing, setEditing] = useState<Product | null | 'new'>(null)
    const query = useSearchStore((s) => s.query);

    const gramsPerLb = useSettingsStore((s) => s.gramsPerLb)
    const { products,
        subscribe: subProducts,
        stop: stopProducts, adjustStock, bumpUsage, addProduct, updateProduct, deleteProduct } = useProductStore();
    const {  addPurchase } = usePurchaseStore();

    const {total, products: cart ,addProduct: addToCart} = useCalculator();
 
    useEffect(() => {
        if (!activeInventoryId) return
        subProducts(uid, activeInventoryId)
        //subPurchases(uid, activeInventoryId)
        return () => {
            stopProducts()
            //stopPurchases()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid, activeInventoryId])

    return <>
        <div className="flex flex-col gap-4">

            <div>
                <div className="">
                    <span className="text-2xl">Total: </span>
                    <span className="text-4xl ">{total}</span>
                </div>
                <div>
                    {/* Productos */}
                    <div>
                        <ul>
                            {
                                cart.map(({product:prod, price, quantity}) => (
                                    <div>{prod.name} x {quantity} - {price}$ </div>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>

            <SearchBar products={products} onPickProduct={setCalculating} />
            <ProductGrid
                products={products}
                query={query}
                onSelect={setCalculating}
                onEdit={setEditing}
                onNew={() => setEditing('new')}
            />
        </div>


        <button
            type="button"
            onClick={() => setEditing('new')}
            aria-label="Nuevo producto"
            className="fixed right-5 bottom-24 z-20 w-14 h-14 rounded-full bg-gold-600 text-ink text-2xl shadow-lg grid place-items-center hover:brightness-105"
        >
            +
        </button>

        {calculating && (
            <CalculatorPanel
                product={calculating}
                onClose={() => setCalculating(null)}
                onSave={addToCart}
            />
        )}

        {editing && (
            <ProductForm
                initial={editing === 'new' ? null : editing}
                onCancel={() => setEditing(null)}
                onSubmit={async (input) => {
                    if (editing === 'new') {
                        await addProduct(uid, activeInventoryId, input)
                    } else {
                        await updateProduct(uid, activeInventoryId, editing.id, input)
                    }
                    setEditing(null)
                }}
                onDelete={
                    editing !== 'new'
                        ? async () => {
                            if (confirm(`¿Eliminar "${editing.name}"?`)) {
                                await deleteProduct(uid, activeInventoryId, editing.id)
                                setEditing(null)
                            }
                        }
                        : undefined
                }
            />
        )}
    </>
}

//TODO: Esto es para cuando vallamos a guardar la cuenta.
// async (quantity, unit, total) => {
//                     await addPurchase(uid, activeInventoryId, {
//                         productId: calculating.id,
//                         productName: calculating.name,
//                         productIcon: calculating.icon,
//                         quantity,
//                         unit,
//                         unitPriceUsed: calculating.basePrice,
//                         total,
//                     })
//                     const grams = unit === 'unit' ? quantity : toGrams(quantity, unit, gramsPerLb)
//                     await adjustStock(uid, activeInventoryId, calculating.id, -grams)
//                     await bumpUsage(uid, activeInventoryId, calculating.id)
//                 }