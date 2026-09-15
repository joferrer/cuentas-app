import { useEffect, useState } from "react";
import { useSearchStore } from "../store/searchStore";
import type { Product, ProductCard } from "../types";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";
import { CalculatorPanel } from "./CalculatorPanel";
//import { useSettingsStore } from "../store/settingsStore";
//import { toGrams } from "../lib/units";
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
    const [editing, setEditing] = useState<Product | null | 'new'>(null);
    const [purchasing, setPurchasing] = useState<boolean>(false);
    const query = useSearchStore((s) => s.query);

    //const gramsPerLb = useSettingsStore((s) => s.gramsPerLb)
    const { products,
        subscribe: subProducts,
        stop: stopProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
    const {  addPurchase } = usePurchaseStore();

    const { total, products: cart, addProduct: addToCart } = useCalculator();

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


    const handlePurchase = async()=>{

        setPurchasing(()=>true)
        let list:ProductCard[] =[];

        list = cart.map( p => {
            const {product,quantity,price,usedUnit} = p;
            return {
                quantity,
                product,
                price,
                usedUnit
            };
        })
        
        await addPurchase(uid,activeInventoryId,{
            products: list,
            total
        }).catch(error =>{
            console.error(error)
            alert('No se pudo guardar :/')
        })

        setPurchasing(()=>false)

    }

    return <>
        <div className="flex flex-col gap-4">

            <div className="self-center w-full max-w-md rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-sm">
                {/* Total */}
                <div className="mb-5 flex items-baseline justify-between border-b border-gray-100 pb-5">
                    <span className="text-xl font-medium text-gray-600">
                        Total
                    </span>

                    <span className="text-3xl font-bold text-gray-900">
                        ${total}
                    </span>
                </div>

                {/* Productos */}
                <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-3 font-medium text-gray-700 transition hover:bg-gray-50">
                        <span>
                            Productos ({cart.length})
                        </span>

                        {/* Flecha */}
                        <span className="text-gray-400 transition-transform duration-200 group-open:rotate-180">
                            ▼
                        </span>
                    </summary>

                    <div className="mt-2 rounded-lg bg-gray-50 p-3">
                        <ul className="divide-y divide-gray-200">
                            {cart.map(({ product: prod, price, quantity }) => (
                                <li
                                    key={prod.id}
                                    className="flex items-center justify-between gap-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-gray-800">
                                            {prod.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Cantidad: {quantity}
                                        </p>
                                    </div>

                                    <span className="shrink-0 font-semibold text-gray-700">
                                        ${price}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
                <div className="flex justify-end">
                <button className="bg-green-800 text-white px-5 py-1 rounded-sm cursor-pointer"
                    disabled={purchasing}
                    onClick={handlePurchase}
                >{
                    purchasing ? "Guardando.." : "Guardar"
                }</button>

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