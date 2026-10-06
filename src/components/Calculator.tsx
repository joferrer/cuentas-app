import { useEffect, useState } from "react";
import { useSearchStore } from "../store/searchStore";
import type { Product, ProductCard } from "../types";
import { ProductGrid, type ProductView } from "./ProductGrid";
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
    const [purchaseName, setPurchaseName] = useState<string>('');
    const [purchaseType, setPurchaseType] = useState<'purchase' | 'sale'>('purchase');
    const [view, setView] = useState<ProductView>(() => {
        const saved = localStorage.getItem('cuentas-claras-product-view')
        return saved === 'list' ? 'list' : 'grid'
    });
    const query = useSearchStore((s) => s.query);

    //const gramsPerLb = useSettingsStore((s) => s.gramsPerLb)
    const { products,
        subscribe: subProducts,
        stop: stopProducts, addProduct, updateProduct, deleteProduct, bumpUsage } = useProductStore();
    const {  addPurchase } = usePurchaseStore();

    const { total, products: cart, addProduct: addToCart, clear: clearCart } = useCalculator();

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


    const changeView = (v: ProductView) => {
        setView(v)
        localStorage.setItem('cuentas-claras-product-view', v)
    }

    const handlePurchase = async()=>{
        if (purchasing || cart.length === 0) return

        setPurchasing(()=>true)
        let list:ProductCard[] =[];

        list = cart.map( p => {
            const {product,quantity,price,usedUnit,branch,location} = p;
            return {
                quantity,
                product,
                price,
                usedUnit,
                branch,
                location,
            };
        })

        try {
            await addPurchase(uid,activeInventoryId,{
                products: list,
                total,
                name: purchaseName.trim() || undefined,
                type: purchaseType,
            })
            const usedProductIds = [...new Set(list.map((l) => l.product.id))]
            await Promise.all(usedProductIds.map((id) => bumpUsage(uid, activeInventoryId, id)))
            clearCart()
            setPurchaseName('')
            setPurchaseType('purchase')
        } catch (error) {
            console.error(error)
            alert('No se pudo guardar :/')
        } finally {
            setPurchasing(()=>false)
        }

    }

    return <>
        <div className="flex flex-col gap-4">

            <div className="self-center w-full max-w-md rounded-xl border border-gray-200 bg-white/50 p-4 shadow-sm">
                {/* Total */}
                <div className="mb-3 flex items-baseline justify-between border-b border-gray-100 pb-3">
                    <span className="text-base font-medium text-gray-600">
                        Total
                    </span>

                    <span className="text-2xl font-bold text-gray-900">
                        ${total}
                    </span>
                </div>

                {/* Productos */}
                <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        <span>
                            Productos ({cart.length})
                        </span>

                        <span className="text-gray-400 transition-transform duration-200 group-open:rotate-180">
                            ▼
                        </span>
                    </summary>

                    <div className="mt-1 rounded-lg bg-gray-50 p-2">
                        <ul className="divide-y divide-gray-200">
                            {cart.map(({ product: prod, price, quantity, branch, location }) => (
                                <li
                                    key={`${prod.id}-${branch}-${location}`}
                                    className="py-1.5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                                            {prod.name}
                                        </p>
                                        <span className="shrink-0 text-sm font-semibold text-gray-700">
                                            ${price}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Cantidad: {quantity}
                                        {(branch || location) && (
                                            <span className="text-gray-400"> · 📍 {branch}{branch && location ? ' · ' : ''}{location}</span>
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
                <div className="mt-3 flex gap-2">
                    <select
                        value={purchaseType}
                        onChange={(e) => setPurchaseType(e.target.value as 'purchase' | 'sale')}
                        className="rounded-lg border border-gray-200 bg-white/70 px-2 py-1.5 text-sm outline-none focus-visible:border-green-700"
                    >
                        <option value="purchase">Compra</option>
                        <option value="sale">Venta</option>
                    </select>
                    <input
                        value={purchaseName}
                        onChange={(e) => setPurchaseName(e.target.value)}
                        placeholder="Nombre de la compra (opcional)"
                        className="flex-1 rounded-lg border border-gray-200 bg-white/70 px-3 py-1.5 text-sm outline-none focus-visible:border-green-700"
                    />
                </div>
                <div className="flex justify-end mt-2">
                <button className="bg-green-800 text-white px-4 py-1.5 text-sm rounded-md cursor-pointer disabled:opacity-60"
                    disabled={purchasing || cart.length === 0}
                    onClick={handlePurchase}
                >{
                    purchasing ? "Guardando.." : "Guardar"
                }</button>

                </div>
            </div>

            <div className="flex justify-end gap-1">
                <button
                    type="button"
                    onClick={() => changeView('grid')}
                    aria-label="Vista de cuadrícula"
                    className={`px-2.5 py-1 rounded-lg text-sm border ${view === 'grid' ? 'bg-green-900 text-paper border-green-900' : 'bg-white/60 text-ink-soft border-line'}`}
                >
                    ▦
                </button>
                <button
                    type="button"
                    onClick={() => changeView('list')}
                    aria-label="Vista de lista"
                    className={`px-2.5 py-1 rounded-lg text-sm border ${view === 'list' ? 'bg-green-900 text-paper border-green-900' : 'bg-white/60 text-ink-soft border-line'}`}
                >
                    ☰
                </button>
            </div>

            <SearchBar products={products} onPickProduct={setCalculating} />
            <ProductGrid
                products={products}
                query={query}
                view={view}
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
                uid={uid}
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