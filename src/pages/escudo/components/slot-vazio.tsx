import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TipoEspecial } from "@/hooks/useEscudo";
import { ESPECIAIS } from "./slot-tipos";

export default function SlotVazio({
    onAdicionarRegistro,
    onAdicionarEspecial,
}: {
    onAdicionarRegistro: () => void;
    onAdicionarEspecial: (tipo: TipoEspecial) => void;
}) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="w-full max-w-72 space-y-2.5">
                <Button
                    variant="outline"
                    className="w-full border-solid border-black/40 bg-white/40 uppercase tracking-wider text-gray-900 shadow-xs hover:bg-white/60 dark:border-zinc-700 dark:bg-black/30 dark:text-zinc-100 dark:hover:bg-black/50"
                    onClick={onAdicionarRegistro}
                >
                    <FilePlus2 className="text-gray-800 dark:text-emerald-400" />
                    Adicionar Registro
                </Button>

                <div className="grid grid-cols-2 gap-1.5">
                    {ESPECIAIS.map(({ tipo, rotulo, descricao, icone: Icone, cor }) => (
                        <Button
                            key={tipo}
                            variant="outline"
                            title={descricao}
                            className="h-auto flex-col gap-1 border-solid border-black/25 bg-white/30 px-1 py-1.5 text-[10px] uppercase tracking-wider text-gray-800 hover:bg-white/60 dark:border-zinc-700 dark:bg-black/25 dark:text-zinc-200 dark:hover:bg-white/10"
                            onClick={() => onAdicionarEspecial(tipo)}
                        >
                            <Icone className={`size-3.5 ${cor}`} />
                            {rotulo}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
