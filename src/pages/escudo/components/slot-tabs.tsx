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
import type { AbaSlot, ConteudoAba, OpcaoMesclagem, TipoEspecial } from "@/hooks/useEscudo";
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
    onSelecionarAba: (abaId: string) => void;
    onRemoverAba: (abaId: string) => void;
    onAdicionarRegistro: () => void;
    onAdicionarEspecial: (tipo: TipoEspecial) => void;
    onMesclar: (direcao: "baixo" | "cima" | "direita" | "esquerda") => void;
    onSeparar: () => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd?: () => void;
}

const ITEM_MENU = "w-full justify-start gap-2 px-2 py-1.5 h-auto uppercase tracking-wider text-gray-900 dark:text-zinc-100";

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
    const [menuMesclarAberto, setMenuMesclarAberto] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const [abrirParaEsquerda, setAbrirParaEsquerda] = useState(false);

    const isMerged = colSpan > 1 || rowSpan > 1;

    const handleToggleMenu = () => {
        if (!menuAberto && btnRef.current && headerRef.current) {
            const btnRect = btnRef.current.getBoundingClientRect();
            const headerRect = headerRef.current.getBoundingClientRect();
            // Se a distância do botão até o final do slot ou da tela for menor que a largura do menu (190px),
            // abre o menu alinhado à direita (expandindo para a esquerda)
            const espacoNoSlot = headerRect.right - btnRect.left;
            const espacoNaJanela = window.innerWidth - btnRect.left;
            setAbrirParaEsquerda(espacoNoSlot < 190 || espacoNaJanela < 190);
        }
        setMenuMesclarAberto(false);
        onToggleMenu();
    };

    const tituloAba = (conteudo: ConteudoAba) => {
        if (conteudo.tipo === "registro") {
            const item = (data[conteudo.categoria] as { id: string; nome: string }[]).find((i) => i.id === conteudo.itemId);
            return item?.nome ?? "Registro";
        }
        if (conteudo.tipo === "anotacoes") {
            const titulo = (conteudo.dados as { titulo?: string } | undefined)?.titulo?.trim();
            return titulo || "Anotações";
        }
        return ESPECIAIS.find((e) => e.tipo === conteudo.tipo)?.rotulo ?? "Aba";
    };

    const escolher = (acao: () => void) => () => {
        onFecharMenu();
        setMenuMesclarAberto(false);
        acao();
    };

    return (
        <div ref={headerRef} className="relative z-30 flex h-7.5 shrink-0 select-none items-center justify-between border-b border-gray-400/90 bg-black/5 px-1 text-xs dark:border-zinc-800 dark:bg-[#161a18]">
            <div className="flex min-w-0 flex-1 items-center gap-1 py-0.5">
                {/* Drag handle */}
                <div
                    draggable
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    className="flex size-5 cursor-grab items-center justify-center  text-black/40 hover:bg-black/5 hover:text-black active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    title="Arraste para mover ou trocar este slot"
                >
                    <GripVertical className="size-3.5" />
                </div>

                {/* Lista de abas */}
                <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
                    {abas.map((aba) => {
                        const titulo = tituloAba(aba.conteudo);
                        return (
                            <div
                                key={aba.id}
                                onClick={() => onSelecionarAba(aba.id)}
                                title={titulo}
                                className={cn(
                                    "flex max-w-32.5 shrink-0 cursor-pointer items-center gap-1 border px-2 py-0.5 font-special text-xs uppercase tracking-wider transition-colors sm:max-w-40",
                                    aba.id === abaAtivaId
                                        ? "border-gray-400 bg-white/95 font-bold text-gray-950 shadow-xs dark:border-emerald-500/60 dark:bg-[#202723] dark:text-emerald-300"
                                        : "border-transparent bg-black/5 text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:bg-[#121514] dark:text-zinc-400 dark:hover:bg-[#191e1b] dark:hover:text-zinc-200"
                                )}
                            >
                                <span className="truncate font-normal">{titulo}</span>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="size-4 opacity-60 hover:text-red-600 hover:opacity-100 dark:hover:text-red-400"
                                    title="Fechar aba"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoverAba(aba.id);
                                    }}
                                >
                                    <X />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* Botão Adicionar Aba (+) */}
                <div ref={btnRef} className="relative shrink-0">
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
                                    abrirParaEsquerda ? "right-0" : "left-0"
                                )}
                            >
                                <Button variant="ghost" className={ITEM_MENU} onClick={escolher(onAdicionarRegistro)}>
                                    <FilePlus2 className="text-gray-700 dark:text-emerald-400" />
                                    Registro
                                </Button>
                                {ESPECIAIS.map(({ tipo, rotulo, icone: Icone, cor }) => (
                                    <Button
                                        key={tipo}
                                        variant="ghost"
                                        className={ITEM_MENU}
                                        onClick={escolher(() => onAdicionarEspecial(tipo))}
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

            {(isMerged || opcoesMesclagem.length > 0) && (
                <div className="relative ml-1.5 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        title={isMerged ? `Slot mesclado (${colSpan}x${rowSpan}) — opções de mesclagem` : "Opções de mesclagem"}
                        aria-expanded={menuMesclarAberto}
                        onClick={() => {
                            onFecharMenu();
                            setMenuMesclarAberto(!menuMesclarAberto);
                        }}
                    >
                        {isMerged ? <TableCellsSplit className="size-3.5" /> : <TableCellsMerge className="size-3.5" />}
                    </Button>

                    {menuMesclarAberto && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => {
                                    setMenuMesclarAberto(false);
                                    onFecharMenu();
                                }}
                            />
                            <div className="absolute w-fit right-0 top-full z-50 mt-1 border border-black/40 bg-white p-1 text-xs shadow-xl dark:border-zinc-700 dark:bg-[#181d1a]">
                                {isMerged && (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            ITEM_MENU)}
                                        onClick={escolher(onSeparar)}
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
                                        onClick={escolher(() => onMesclar(op.direcao))}
                                    >
                                        {op.direcao === "baixo" && <ArrowDown className="size-3.5 shrink-0 " />}
                                        {op.direcao === "direita" && <ArrowRight className="size-3.5 shrink-0 " />}
                                        {op.direcao === "cima" && <ArrowUp className="size-3.5 shrink-0 " />}
                                        {op.direcao === "esquerda" && <ArrowLeft className="size-3.5 shrink-0 " />}
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
