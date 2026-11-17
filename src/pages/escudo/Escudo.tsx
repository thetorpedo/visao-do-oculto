import { useState, type DragEvent } from "react";
import type { Categoria } from "@/context/DataContext";
import PaperDiv from "@/components/ui/paper-div";
import { cn } from "@/lib/utils";
import {
    useEscudo,
    obterOpcoesMesclagem,
    type TipoEspecial,
    type SlotItem,
} from "@/hooks/useEscudo";
import BarraPasta from "./components/barra-pasta";
import RegistroPicker from "./components/registro-picker";
import SlotConteudo from "./components/slot-conteudo";
import SlotTabs from "./components/slot-tabs";
import SlotVazio from "./components/slot-vazio";

interface AlvoPicker {
    slotId: string;
}

const SLOT_LIVRE =
    "overflow-hidden border-2 border-dashed border-black/25 bg-black/5 dark:border-zinc-700/60 dark:bg-black/15";

const MD_COL_START: Record<number, string> = {
    0: "md:col-start-1",
    1: "md:col-start-2",
    2: "md:col-start-3",
};

const MD_COL_SPAN: Record<number, string> = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
};

const MD_ROW_START: Record<number, string> = {
    0: "md:row-start-1",
    1: "md:row-start-2",
};

const MD_ROW_SPAN: Record<number, string> = {
    1: "md:row-span-1",
    2: "md:row-span-2",
};

export default function Escudo() {
    const {
        paineis,
        painelAtivo,
        setAtivo,
        adicionarPainel,
        removerPainel,
        renomearPainel,
        adicionarAba,
        removerAba,
        selecionarAba,
        atualizarConteudoAba,
        mesclarSlot,
        separarSlot,
        reorganizarSlots,
    } = useEscudo();

    const [alvoPicker, setAlvoPicker] = useState<AlvoPicker | null>(null);
    const [menuAbertoSlotId, setMenuAbertoSlotId] = useState<string | null>(null);
    const [arrastandoSlotId, setArrastandoSlotId] = useState<string | null>(null);
    const [alvoDropSlotId, setAlvoDropSlotId] = useState<string | null>(null);

    const painelId = painelAtivo.id;

    const adicionarEspecial = (slotId: string, tipo: TipoEspecial) =>
        adicionarAba(painelId, slotId, { tipo, dados: undefined });

    const selecionarRegistro = (categoria: Categoria, itemId: string) => {
        if (!alvoPicker) return;
        const conteudo = { tipo: "registro" as const, categoria, itemId };

        adicionarAba(painelId, alvoPicker.slotId, conteudo);
        setAlvoPicker(null);
    };

    const handleDragStart = (slotId: string) => (e: DragEvent) => {
        e.dataTransfer.setData("text/plain", slotId);
        e.dataTransfer.effectAllowed = "move";
        setArrastandoSlotId(slotId);
    };

    const handleDragEnd = () => {
        setArrastandoSlotId(null);
        setAlvoDropSlotId(null);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (slotId: string) => () => {
        if (arrastandoSlotId && arrastandoSlotId !== slotId) {
            setAlvoDropSlotId(slotId);
        }
    };

    const handleDragLeave = (slotId: string) => (e: DragEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        if (alvoDropSlotId === slotId) {
            setAlvoDropSlotId(null);
        }
    };

    const handleDrop = (destinoSlotId: string) => (e: DragEvent) => {
        e.preventDefault();
        const origemId = e.dataTransfer.getData("text/plain") || arrastandoSlotId;
        if (origemId && origemId !== destinoSlotId) {
            reorganizarSlots(painelId, origemId, destinoSlotId);
        }
        setArrastandoSlotId(null);
        setAlvoDropSlotId(null);
    };

    return (
        <div className="relative flex h-screen max-h-screen w-full select-none flex-col items-center justify-start overflow-hidden bg-[#453b13] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] px-2  dark:bg-[#040c07] dark:bg-[radial-gradient(#123520_1px,transparent_1px)]">
            <main className="relative z-10 mx-auto flex h-full min-h-0 w-full flex-1 flex-col pt-10 pb-2 sm:pt-12 sm:pb-3 lg:pt-11 lg:pb-3 dark:pt-2 sm:dark:pt-2.5 lg:dark:pt-2 dark:pb-2 sm:dark:pb-2.5 lg:dark:pb-2">
                <BarraPasta
                    paineis={paineis}
                    ativoId={painelId}
                    onSelecionar={setAtivo}
                    onAdicionar={adicionarPainel}
                    onRemover={removerPainel}
                    onRenomear={renomearPainel}
                />

                <div className="relative z-35! hidden h-5 shrink-0 rounded-tr-sm w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:block dark:hidden!" />

                <div className="relative z-20 flex min-h-0 flex-1 w-full flex-col rounded-md bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay p-2 shadow-2xl/90 sm:p-3 lg:rounded-t-none lg:rounded-b-lg lg:p-3.5 dark:rounded-none! dark:border dark:border-zinc-800 dark:bg-[#141716] dark:bg-none not-dark:pt-0! overflow-y-auto md:overflow-hidden">
                    <div className="grid h-full min-h-0 flex-1 w-full grid-cols-1 auto-rows-[340px] gap-2.5 md:auto-rows-auto md:grid-cols-3 md:grid-rows-2">
                        {painelAtivo.slots.map((slot: SlotItem) => {
                            const container = slot.conteudo;
                            const abaAtiva = container?.abas.find((a) => a.id === container.abaAtivaId) ?? container?.abas[0];
                            const opcoesMesclagem = obterOpcoesMesclagem(slot, painelAtivo.slots);
                            const isArrastando = arrastandoSlotId === slot.id;
                            const isAlvoDrop = alvoDropSlotId === slot.id;

                            const colStartClass = MD_COL_START[slot.col] ?? "md:col-start-1";
                            const colSpanClass = MD_COL_SPAN[slot.colSpan] ?? "md:col-span-1";
                            const rowStartClass = MD_ROW_START[slot.row] ?? "md:row-start-1";
                            const rowSpanClass = MD_ROW_SPAN[slot.rowSpan] ?? "md:row-span-1";

                            const isMenuAberto = menuAbertoSlotId === slot.id;

                            return (
                                <div
                                    key={slot.id}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter(slot.id)}
                                    onDragLeave={handleDragLeave(slot.id)}
                                    onDrop={handleDrop(slot.id)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "relative flex h-full min-h-0 w-full flex-col transition-all duration-150",
                                        colStartClass,
                                        colSpanClass,
                                        rowStartClass,
                                        rowSpanClass,
                                        container ? "overflow-visible" : SLOT_LIVRE,
                                        isMenuAberto ? "z-50" : "z-0",
                                        isArrastando && "opacity-40 scale-[0.99] border-dashed border-emerald-500",
                                        isAlvoDrop &&
                                        "ring-2 ring-emerald-500 bg-emerald-500/10 shadow-lg dark:ring-emerald-400 dark:bg-emerald-400/20"
                                    )}
                                >
                                    {/* Indicador visual ao soltar drag sobre o slot */}
                                    {isAlvoDrop && !isArrastando && (
                                        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded bg-emerald-500/15 backdrop-blur-[1px] dark:bg-emerald-400/20">
                                            <span className="border border-emerald-600 bg-emerald-700 px-3 py-1 font-keyes text-xs font-bold uppercase tracking-wider text-white shadow-lg dark:border-emerald-400 dark:bg-emerald-600">
                                                {container ? "Solte para trocar de posição" : "Solte para mover para cá"}
                                            </span>
                                        </div>
                                    )}

                                    {container && abaAtiva ? (
                                        <PaperDiv className="min-h-0 overflow-visible p-0!">
                                            <SlotTabs
                                                abas={container.abas}
                                                abaAtivaId={container.abaAtivaId}
                                                colSpan={slot.colSpan}
                                                rowSpan={slot.rowSpan}
                                                opcoesMesclagem={opcoesMesclagem}
                                                menuAberto={isMenuAberto}
                                                onToggleMenu={() =>
                                                    setMenuAbertoSlotId((atual) => (atual === slot.id ? null : slot.id))
                                                }
                                                onFecharMenu={() => setMenuAbertoSlotId(null)}
                                                onSelecionarAba={(abaId) => selecionarAba(painelId, slot.id, abaId)}
                                                onRemoverAba={(abaId) => removerAba(painelId, slot.id, abaId)}
                                                onAdicionarRegistro={() => setAlvoPicker({ slotId: slot.id })}
                                                onAdicionarEspecial={(tipo) => adicionarEspecial(slot.id, tipo)}
                                                onMesclar={(direcao) => mesclarSlot(painelId, slot.id, direcao)}
                                                onSeparar={() => separarSlot(painelId, slot.id)}
                                                onDragStart={handleDragStart(slot.id)}
                                                onDragEnd={handleDragEnd}
                                            />

                                            <div className="relative min-h-0 flex-1 select-text overflow-hidden">
                                                <SlotConteudo
                                                    key={abaAtiva.id}
                                                    conteudo={abaAtiva.conteudo}
                                                    onChangeDados={(dados) =>
                                                        atualizarConteudoAba(painelId, slot.id, abaAtiva.id, (c) =>
                                                            c.tipo === "registro" ? c : { ...c, dados }
                                                        )
                                                    }
                                                />
                                            </div>
                                        </PaperDiv>
                                    ) : (
                                        <SlotVazio
                                            colSpan={slot.colSpan}
                                            rowSpan={slot.rowSpan}
                                            opcoesMesclagem={opcoesMesclagem}
                                            onAdicionarRegistro={() => setAlvoPicker({ slotId: slot.id })}
                                            onAdicionarEspecial={(tipo) => adicionarEspecial(slot.id, tipo)}
                                            onMesclar={(direcao) => mesclarSlot(painelId, slot.id, direcao)}
                                            onSeparar={() => separarSlot(painelId, slot.id)}
                                            onDragStart={handleDragStart(slot.id)}
                                            onDragEnd={handleDragEnd}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {alvoPicker && <RegistroPicker onSelect={selecionarRegistro} onClose={() => setAlvoPicker(null)} />}
        </div>
    );
}
