import { useData, type Categoria } from "@/context/DataContext";
import ItemCard from "@/components/ui/item-card";
import ThreatSheet from "@/components/ui/threat-sheet";

type ItemDoCard = Parameters<typeof ItemCard>[0]["item"];

interface SlotRegistroProps {
    categoria: Categoria;
    itemId: string;
}

export default function SlotRegistro({ categoria, itemId }: SlotRegistroProps) {
    const data = useData();
    const item_registro = (data[categoria] as ItemDoCard[]).find((i) => i.id === itemId);

    if (!item_registro) {
        return (
            <div className="flex h-full items-center justify-center border border-dashed border-red-400 p-4 text-center text-sm text-red-700 dark:border-red-500/60 dark:text-red-400">
                Registro não encontrado. Remova este slot ou selecione outro registro.
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 overflow-y-auto p-3.5 sm:p-4">
            {categoria === "ameacas" ? (
                <ThreatSheet ameaca={item_registro as Parameters<typeof ThreatSheet>[0]["ameaca"]} />
            ) : (
                <ItemCard item={item_registro} categoria={categoria} expandAll withoutPaper />
            )}
        </div>
    );
}
