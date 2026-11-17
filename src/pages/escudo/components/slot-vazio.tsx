import type { DragEvent } from "react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    FilePlus2,
    GripVertical,
    TableCellsSplit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OpcaoMesclagem, TipoEspecial } from "@/hooks/use-escudo";
import { ESPECIAIS } from "./slot-tipos";

interface SlotVazioProps {
    colSpan: number;
    rowSpan: number;
    opcoesMesclagem: OpcaoMesclagem[];
    onAdicionarRegistro: () => void;
    onAdicionarEspecial: (tipo: TipoEspecial) => void;
    onMesclar: (direcao: "baixo" | "cima" | "direita" | "esquerda") => void;
    onSeparar: () => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd?: () => void;
}

export default function SlotVazio({
    colSpan,
    rowSpan,
    opcoesMesclagem,
    onAdicionarRegistro,
    onAdicionarEspecial,
    onMesclar,
    onSeparar,
    onDragStart,
    onDragEnd,
}: SlotVazioProps) {
    const is_mesclado = colSpan > 1 || rowSpan > 1;

    return (
        <div className="relative flex h-full min-h-0 flex-col items-center justify-center p-3 text-center sm:p-4">
            <div className="absolute top-1.5 right-1.5 left-1.5 flex items-center justify-between">
                <div
                    draggable
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    className="flex size-6 cursor-grab items-center justify-center rounded text-black/35 hover:bg-black/5 hover:text-black active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    title="Arraste para mover ou trocar este slot"
                >
                    <GripVertical className="size-4" />
                </div>
            </div>

            <div className="w-full max-w-72 space-y-2.5">
                <Button className="w-full" onClick={onAdicionarRegistro}>
                    <FilePlus2 />
                    Selecionar Registro
                </Button>

                <div className="grid grid-cols-2 gap-1.5">
                    {ESPECIAIS.map(({ tipo, rotulo, descricao, icone: Icone }) => (
                        <Button
                            key={tipo}
                            variant="default"
                            title={descricao}
                            onClick={() => onAdicionarEspecial(tipo)}
                        >
                            <Icone className="size-3.5" />
                            {rotulo}
                        </Button>
                    ))}
                </div>

                {(is_mesclado || opcoesMesclagem.length > 0) && (
                    <div className="space-y-2 pt-2">
                        {is_mesclado && (
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                onClick={onSeparar}
                            >
                                <TableCellsSplit className="size-3.5 shrink-0" />
                                Separar slot
                            </Button>
                        )}

                        {opcoesMesclagem.map((op) => (
                            <Button
                                key={op.direcao}
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => onMesclar(op.direcao)}
                            >
                                {op.direcao === "baixo" && <ArrowDown className="size-3 shrink-0" />}
                                {op.direcao === "direita" && <ArrowRight className="size-3 shrink-0" />}
                                {op.direcao === "cima" && <ArrowUp className="size-3 shrink-0" />}
                                {op.direcao === "esquerda" && <ArrowLeft className="size-3 shrink-0" />}
                                {op.rotulo}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
