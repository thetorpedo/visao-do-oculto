import { useData, type Categoria } from "@/context/DataContext";
import ItemCard from "@/components/ui/item-card";
import ThreatSheet from "@/components/ui/threat-sheet";

export default function SlotRegistro({ categoria, itemId }: { categoria: Categoria; itemId: string }) {
    const data = useData();
    const item = ((data[categoria] as any[]) ?? []).find((i) => i.id === itemId);

    if (!item) {
        return (
            <div className="flex h-full items-center justify-center border border-dashed border-red-400 dark:border-red-500/60 p-4 text-center text-sm text-red-700 dark:text-red-400">
                Registro não encontrado. Remova este slot ou selecione outro registro.
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 overflow-y-auto p-3.5 sm:p-4">
            {categoria === "ameacas" ? (
                <ThreatSheet ameaca={item} />
            ) : (
                <ItemCard item={item} categoria={categoria} expandAll withoutPaper />
            )}
        </div>
    );
}
