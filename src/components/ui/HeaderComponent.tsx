import { useState } from "react";
import { InventorySwitcher } from "../InventorySwitcher";

import { useInventoryStore } from "../../store/inventoryStore";

interface Props {
    displayName: string | null,
    photoURL: string | null,
    onSignOut: () => Promise<void>,
    uid: string

}
export const HeaderComponent = ({ displayName, photoURL, onSignOut, uid }: Props) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const {
        inventories,
        activeInventoryId,

        setActive,
        createInventory,
        deleteInventory,
    } = useInventoryStore()

    return <>
        <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <div className="grid place-items-center w-9 h-9 rounded-xl bg-green-900 text-paper font-display font-semibold">
                    $
                </div>
                <InventorySwitcher
                    inventories={inventories}
                    activeId={activeInventoryId}
                    onSelect={setActive}
                    onCreate={async (name, icon) => {
                        await createInventory(uid, name, icon)
                    }}
                    onDelete={(id) => deleteInventory(uid, id)}
                />
            </div>


            <div className="relative">
                <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-line bg-green-100 grid place-items-center text-sm font-medium"
                >
                    {photoURL ? <img src={photoURL} alt="" className="w-full h-full object-cover" /> : displayName?.[0] ?? '?'}
                </button>
                {menuOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 z-40 mt-1 w-48 bg-paper border border-line rounded-xl shadow-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-line">
                                <p className="text-sm font-medium truncate">{displayName ?? 'Cuenta'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void onSignOut()}
                                className="w-full text-left px-4 py-2.5 text-sm text-brick-600 hover:bg-brick-100"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    </>
}