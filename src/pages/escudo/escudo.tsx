import { useState, type DragEvent } from "react";
import type { Categoria } from "@/context/DataContext";
import PaperDiv from "@/components/ui/paper-div";
import { cn } from "@/lib/utils";
import {
    useEscudo,
    obterOpcoesMesclagem,
    type TipoEspecial,
    type SlotItem,
} from "@/hooks/use-escudo";
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

    const [alvo_picker, setAlvoPicker] = useState<AlvoPicker | null>(null);
    const [menu_aberto_slot_id, setMenuAbertoSlotId] = useState<string | null>(null);
    const [arrastando_slot_id, setArrastandoSlotId] = useState<string | null>(null);
    const [alvo_drop_slot_id, setAlvoDropSlotId] = useState<string | null>(null);

    const painel_id = painelAtivo.id;

    const adicionarEspecial = (slot_id: string, tipo_especial: TipoEspecial) => {
        adicionarAba(painel_id, slot_id, { tipo: tipo_especial, dados: undefined });
    };

    const selecionarRegistro = (categoria: Categoria, item_id: string) => {
        if (!alvo_picker) return;
        adicionarAba(painel_id, alvo_picker.slotId, {
            tipo: "registro",
            categoria,
            itemId: item_id,
        });
        setAlvoPicker(null);
    };

    const handleDragStart = (slot_id: string) => (e: DragEvent) => {
        e.dataTransfer.setData("text/plain", slot_id);
        e.dataTransfer.effectAllowed = "move";
        setArrastandoSlotId(slot_id);
    };

    const handleDragEnd = () => {
        setArrastandoSlotId(null);
        setAlvoDropSlotId(null);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (slot_id: string) => () => {
        if (arrastando_slot_id && arrastando_slot_id !== slot_id) {
            setAlvoDropSlotId(slot_id);
        }
    };

    const handleDragLeave = (slot_id: string) => (e: DragEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        if (alvo_drop_slot_id === slot_id) {
            setAlvoDropSlotId(null);
        }
    };

    const handleDrop = (destino_slot_id: string) => (e: DragEvent) => {
        e.preventDefault();
        const origem_id = e.dataTransfer.getData("text/plain") || arrastando_slot_id;
        if (origem_id && origem_id !== destino_slot_id) {
            reorganizarSlots(painel_id, origem_id, destino_slot_id);
        }
        setArrastandoSlotId(null);
        setAlvoDropSlotId(null);
    };

    return (
        <div className="relative flex h-screen max-h-screen w-full select-none flex-col items-center justify-start overflow-hidden bg-[#453b13] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] px-2 dark:bg-[#040c07] dark:bg-[radial-gradient(#123520_1px,transparent_1px)]">
            <main className="relative z-10 mx-auto flex h-full min-h-0 w-full flex-1 flex-col pt-10 pb-2 sm:pt-12 sm:pb-3 lg:pt-11 lg:pb-3 dark:pt-2 sm:dark:pt-2.5 lg:dark:pt-2 dark:pb-2 sm:dark:pb-2.5 lg:dark:pb-2">
                <BarraPasta
                    paineis={paineis}
                    ativoId={painel_id}
                    onSelecionar={setAtivo}
                    onAdicionar={adicionarPainel}
                    onRemover={removerPainel}
                    onRenomear={renomearPainel}
                />

                <div className="relative z-35! hidden h-5 shrink-0 rounded-tr-sm w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:block dark:hidden!" />

                <div className="relative z-20 flex min-h-0 flex-1 w-full flex-col rounded-md bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay p-2 shadow-2xl/90 sm:p-3 lg:rounded-t-none lg:rounded-b-lg lg:p-3.5 dark:rounded-none! dark:border dark:border-zinc-800 dark:bg-[#141716] dark:bg-none not-dark:pt-0! overflow-y-auto md:overflow-hidden">
                    <div className="grid h-full min-h-0 flex-1 w-full grid-cols-1 auto-rows-[340px] gap-2.5 md:auto-rows-auto md:grid-cols-3 md:grid-rows-2">
                        {painelAtivo.slots.map((slot_item: SlotItem) => {
                            const container_slot = slot_item.conteudo;
                            const aba_ativa =
                                container_slot?.abas.find((a) => a.id === container_slot.abaAtivaId) ??
                                container_slot?.abas[0];
                            const opcoes_mesclagem = obterOpcoesMesclagem(slot_item, painelAtivo.slots);
                            const is_arrastando = arrastando_slot_id === slot_item.id;
                            const is_alvo_drop = alvo_drop_slot_id === slot_item.id;

                            const col_start_class = MD_COL_START[slot_item.col] ?? "md:col-start-1";
                            const col_span_class = MD_COL_SPAN[slot_item.colSpan] ?? "md:col-span-1";
                            const row_start_class = MD_ROW_START[slot_item.row] ?? "md:row-start-1";
                            const row_span_class = MD_ROW_SPAN[slot_item.rowSpan] ?? "md:row-span-1";
                            const is_menu_aberto = menu_aberto_slot_id === slot_item.id;

                            return (
                                <div
                                    key={slot_item.id}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter(slot_item.id)}
                                    onDragLeave={handleDragLeave(slot_item.id)}
                                    onDrop={handleDrop(slot_item.id)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "relative flex h-full min-h-0 w-full flex-col transition-all duration-150",
                                        col_start_class,
                                        col_span_class,
                                        row_start_class,
                                        row_span_class,
                                        container_slot ? "overflow-visible" : SLOT_LIVRE,
                                        is_menu_aberto ? "z-50" : "z-0",
                                        is_arrastando && "scale-[0.99] border-dashed border-emerald-500 opacity-40",
                                        is_alvo_drop &&
                                            "bg-emerald-500/10 shadow-lg ring-2 ring-emerald-500 dark:bg-emerald-400/20 dark:ring-emerald-400"
                                    )}
                                >
                                    {is_alvo_drop && !is_arrastando && (
                                        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded bg-emerald-500/15 backdrop-blur-[1px] dark:bg-emerald-400/20">
                                            <span className="border border-emerald-600 bg-emerald-700 px-3 py-1 font-keyes text-xs font-bold uppercase tracking-wider text-white shadow-lg dark:border-emerald-400 dark:bg-emerald-600">
                                                {container_slot
                                                    ? "Solte para trocar de posição"
                                                    : "Solte para mover para cá"}
                                            </span>
                                        </div>
                                    )}

                                    {container_slot && aba_ativa ? (
                                        <PaperDiv className="min-h-0 overflow-visible p-0!">
                                            <SlotTabs
                                                abas={container_slot.abas}
                                                abaAtivaId={container_slot.abaAtivaId}
                                                colSpan={slot_item.colSpan}
                                                rowSpan={slot_item.rowSpan}
                                                opcoesMesclagem={opcoes_mesclagem}
                                                menuAberto={is_menu_aberto}
                                                onToggleMenu={() =>
                                                    setMenuAbertoSlotId((atual) =>
                                                        atual === slot_item.id ? null : slot_item.id
                                                    )
                                                }
                                                onFecharMenu={() => setMenuAbertoSlotId(null)}
                                                onSelecionarAba={(aba_id) =>
                                                    selecionarAba(painel_id, slot_item.id, aba_id)
                                                }
                                                onRemoverAba={(aba_id) =>
                                                    removerAba(painel_id, slot_item.id, aba_id)
                                                }
                                                onAdicionarRegistro={() =>
                                                    setAlvoPicker({ slotId: slot_item.id })
                                                }
                                                onAdicionarEspecial={(tipo) =>
                                                    adicionarEspecial(slot_item.id, tipo)
                                                }
                                                onMesclar={(direcao) =>
                                                    mesclarSlot(painel_id, slot_item.id, direcao)
                                                }
                                                onSeparar={() => separarSlot(painel_id, slot_item.id)}
                                                onDragStart={handleDragStart(slot_item.id)}
                                                onDragEnd={handleDragEnd}
                                            />

                                            <div className="relative min-h-0 flex-1 select-text overflow-hidden">
                                                <SlotConteudo
                                                    key={aba_ativa.id}
                                                    conteudo={aba_ativa.conteudo}
                                                    onChangeDados={(dados) =>
                                                        atualizarConteudoAba(
                                                            painel_id,
                                                            slot_item.id,
                                                            aba_ativa.id,
                                                            (c) =>
                                                                c.tipo === "registro" ? c : { ...c, dados }
                                                        )
                                                    }
                                                />
                                            </div>
                                        </PaperDiv>
                                    ) : (
                                        <SlotVazio
                                            colSpan={slot_item.colSpan}
                                            rowSpan={slot_item.rowSpan}
                                            opcoesMesclagem={opcoes_mesclagem}
                                            onAdicionarRegistro={() =>
                                                setAlvoPicker({ slotId: slot_item.id })
                                            }
                                            onAdicionarEspecial={(tipo) =>
                                                adicionarEspecial(slot_item.id, tipo)
                                            }
                                            onMesclar={(direcao) =>
                                                mesclarSlot(painel_id, slot_item.id, direcao)
                                            }
                                            onSeparar={() => separarSlot(painel_id, slot_item.id)}
                                            onDragStart={handleDragStart(slot_item.id)}
                                            onDragEnd={handleDragEnd}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {alvo_picker && (
                <RegistroPicker
                    onSelect={selecionarRegistro}
                    onClose={() => setAlvoPicker(null)}
                />
            )}
        </div>
    );
}
