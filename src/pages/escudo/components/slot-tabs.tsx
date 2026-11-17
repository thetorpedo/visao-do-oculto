import { useRef, useState, type DragEvent } from "react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    FilePlus2,
    GripVertical,
    Plus,
    TableCellsMerge,
    TableCellsSplit,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import type { AbaSlot, ConteudoAba, OpcaoMesclagem, TipoEspecial } from "@/hooks/use-escudo";
import { ESPECIAIS } from "./slot-tipos";

interface SlotTabsProps {
    abas: AbaSlot[];
    abaAtivaId: string;
    colSpan: number;
    rowSpan: number;
    opcoesMesclagem: OpcaoMesclagem[];
    menuAberto: boolean;
    onToggleMenu: () => void;
    onFecharMenu: () => void;
    onSelecionarAba: (aba_id: string) => void;
    onRemoverAba: (aba_id: string) => void;
    onAdicionarRegistro: () => void;
    onAdicionarEspecial: (tipo: TipoEspecial) => void;
    onMesclar: (direcao: "baixo" | "cima" | "direita" | "esquerda") => void;
    onSeparar: () => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd?: () => void;
}

const ITEM_MENU =
    "h-auto w-full justify-start gap-2 px-2 py-1.5 uppercase tracking-wider text-gray-900 dark:text-zinc-100";

export default function SlotTabs({
    abas,
    abaAtivaId,
    colSpan,
    rowSpan,
    opcoesMesclagem,
    menuAberto,
    onToggleMenu,
    onFecharMenu,
    onSelecionarAba,
    onRemoverAba,
    onAdicionarRegistro,
    onAdicionarEspecial,
    onMesclar,
    onSeparar,
    onDragStart,
    onDragEnd,
}: SlotTabsProps) {
    const data = useData();
    const [menu_mesclar_aberto, setMenuMesclarAberto] = useState(false);
    const [abrir_para_esquerda, setAbrirParaEsquerda] = useState(false);
    const header_ref = useRef<HTMLDivElement>(null);
    const btn_ref = useRef<HTMLDivElement>(null);

    const is_mesclado = colSpan > 1 || rowSpan > 1;

    const handleToggleMenu = () => {
        if (!menuAberto && btn_ref.current && header_ref.current) {
            const btn_rect = btn_ref.current.getBoundingClientRect();
            const header_rect = header_ref.current.getBoundingClientRect();
            const espaco_no_slot = header_rect.right - btn_rect.left;
            const espaco_na_janela = window.innerWidth - btn_rect.left;
            setAbrirParaEsquerda(espaco_no_slot < 190 || espaco_na_janela < 190);
        }
        setMenuMesclarAberto(false);
        onToggleMenu();
    };

    const obterTituloAba = (conteudo: ConteudoAba): string => {
        if (conteudo.tipo === "registro") {
            const item = (data[conteudo.categoria] as { id: string; nome: string }[]).find(
                (i) => i.id === conteudo.itemId
            );
            return item?.nome ?? "Registro";
        }
        if (conteudo.tipo === "anotacoes") {
            const dados_anotacoes = conteudo.dados as { titulo?: string } | undefined;
            return dados_anotacoes?.titulo?.trim() || "Anotações";
        }
        return ESPECIAIS.find((e) => e.tipo === conteudo.tipo)?.rotulo ?? "Aba";
    };

    const executarAcaoMenu = (acao: () => void) => () => {
        onFecharMenu();
        setMenuMesclarAberto(false);
        acao();
    };

    return (
        <div
            ref={header_ref}
            className="relative z-30 flex h-7.5 shrink-0 select-none items-center justify-between border-b border-gray-400/90 bg-black/5 px-1 text-xs dark:border-zinc-800 dark:bg-[#161a18]"
        >
            <div className="flex min-w-0 flex-1 items-center gap-1 py-0.5">
                <div
                    draggable
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    className="flex size-5 cursor-grab items-center justify-center text-black/40 hover:bg-black/5 hover:text-black active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    title="Arraste para mover ou trocar este slot"
                >
                    <GripVertical className="size-3.5" />
                </div>

                <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
                    {abas.map((aba_item) => {
                        const titulo_aba = obterTituloAba(aba_item.conteudo);
                        return (
                            <div
                                key={aba_item.id}
                                onClick={() => onSelecionarAba(aba_item.id)}
                                title={titulo_aba}
                                className={cn(
                                    "flex max-w-32.5 shrink-0 cursor-pointer items-center gap-1 border px-2 py-0.5 font-special text-xs uppercase tracking-wider transition-colors sm:max-w-40",
                                    aba_item.id === abaAtivaId
                                        ? "border-gray-400 bg-white/95 font-bold text-gray-950 shadow-xs dark:border-emerald-500/60 dark:bg-[#202723] dark:text-emerald-300"
                                        : "border-transparent bg-black/5 text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:bg-[#121514] dark:text-zinc-400 dark:hover:bg-[#191e1b] dark:hover:text-zinc-200"
                                )}
                            >
                                <span className="truncate font-normal">{titulo_aba}</span>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-4 opacity-60 hover:text-red-600 hover:opacity-100 dark:hover:text-red-400"
                                    title="Fechar aba"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoverAba(aba_item.id);
                                    }}
                                >
                                    <X />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div ref={btn_ref} className="relative shrink-0">
                    <Button
                        variant="secondary"
                        className="size-5"
                        size="icon-xs"
                        aria-expanded={menuAberto}
                        onClick={handleToggleMenu}
                    >
                        <Plus />
                    </Button>

                    {menuAberto && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={onFecharMenu} />
                            <div
                                className={cn(
                                    "absolute top-full z-50 mt-1 w-44 border border-black/40 bg-white p-1 text-xs shadow-xl dark:border-zinc-700 dark:bg-[#181d1a]",
                                    abrir_para_esquerda ? "right-0" : "left-0"
                                )}
                            >
                                <Button
                                    variant="ghost"
                                    className={ITEM_MENU}
                                    onClick={executarAcaoMenu(onAdicionarRegistro)}
                                >
                                    <FilePlus2 className="text-gray-700 dark:text-emerald-400" />
                                    Registro
                                </Button>
                                {ESPECIAIS.map(({ tipo, rotulo, icone: Icone, cor }) => (
                                    <Button
                                        key={tipo}
                                        variant="ghost"
                                        className={ITEM_MENU}
                                        onClick={executarAcaoMenu(() => onAdicionarEspecial(tipo))}
                                    >
                                        <Icone className={cor} />
                                        {rotulo}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {(is_mesclado || opcoesMesclagem.length > 0) && (
                <div className="relative ml-1.5 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        title={
                            is_mesclado
                                ? `Slot mesclado (${colSpan}x${rowSpan}) — opções de mesclagem`
                                : "Opções de mesclagem"
                        }
                        aria-expanded={menu_mesclar_aberto}
                        onClick={() => {
                            onFecharMenu();
                            setMenuMesclarAberto(!menu_mesclar_aberto);
                        }}
                    >
                        {is_mesclado ? (
                            <TableCellsSplit className="size-3.5" />
                        ) : (
                            <TableCellsMerge className="size-3.5" />
                        )}
                    </Button>

                    {menu_mesclar_aberto && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                    setMenuMesclarAberto(false);
                                    onFecharMenu();
                                }}
                            />
                            <div className="absolute top-full right-0 z-50 mt-1 w-fit border border-black/40 bg-white p-1 text-xs shadow-xl dark:border-zinc-700 dark:bg-[#181d1a]">
                                {is_mesclado && (
                                    <Button
                                        variant="ghost"
                                        className={cn(ITEM_MENU)}
                                        onClick={executarAcaoMenu(onSeparar)}
                                    >
                                        <TableCellsSplit className="size-3.5 shrink-0" />
                                        Separar slot
                                    </Button>
                                )}

                                {opcoesMesclagem.map((op) => (
                                    <Button
                                        key={op.direcao}
                                        variant="ghost"
                                        className={ITEM_MENU}
                                        onClick={executarAcaoMenu(() => onMesclar(op.direcao))}
                                    >
                                        {op.direcao === "baixo" && <ArrowDown className="size-3.5 shrink-0" />}
                                        {op.direcao === "direita" && <ArrowRight className="size-3.5 shrink-0" />}
                                        {op.direcao === "cima" && <ArrowUp className="size-3.5 shrink-0" />}
                                        {op.direcao === "esquerda" && <ArrowLeft className="size-3.5 shrink-0" />}
                                        {op.rotulo}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
