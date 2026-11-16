import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    BookOpen,
    Check,
    Dices,
    Edit2,
    FilePlus2,
    Maximize2,
    Minimize2,
    Moon,
    Plus,
    RefreshCw,
    Sun,
    Trash2,
    X,
} from "lucide-react";
import { useEscudo, novoId, type TipoEspecial } from "@/hooks/useEscudo";
import { useUI } from "@/context/UiContext";
import { useData } from "@/context/DataContext";
import SlotIniciativa, { type DadosIniciativa } from "./components/slot-iniciativa";
import SlotDados, { type DadosRolador } from "./components/slot-dados";
import SlotCondicoes from "./components/slot-condicoes";
import SlotRegistro from "./components/slot-registro";
import RegistroPicker, { ROTULO_CATEGORIA } from "./components/registro-picker";

export default function Escudo() {
    const {
        paineis,
        painelAtivo,
        setAtivo,
        adicionarPainel,
        removerPainel,
        renomearPainel,
        definirSlot,
        atualizarDados,
    } = useEscudo();

    const { tema, toggleTema } = useUI();
    const isEstrangeiro = tema === "estrangeiro";
    const data = useData();

    const [slotPickerIndice, setSlotPickerIndice] = useState<number | null>(null);
    const [editandoMesa, setEditandoMesa] = useState(false);
    const [nomeMesa, setNomeMesa] = useState(painelAtivo.nome);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setNomeMesa(painelAtivo.nome);
        setEditandoMesa(false);
    }, [painelAtivo.id, painelAtivo.nome]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const alternarFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error("Erro ao alternar tela cheia:", err);
        }
    };

    const salvarNomeMesa = () => {
        if (nomeMesa.trim()) {
            renomearPainel(painelAtivo.id, nomeMesa.trim());
        }
        setEditandoMesa(false);
    };

    const adicionarEspecial = (indice: number, tipo: TipoEspecial) => {
        definirSlot(painelAtivo.id, indice, {
            id: novoId(),
            tipo,
            dados: tipo === "iniciativa" ? undefined : tipo === "dados" ? undefined : undefined,
        });
    };

    const limparSlot = (indice: number) => {
        definirSlot(painelAtivo.id, indice, null);
    };

    const getRotuloSlot = (slot: (typeof painelAtivo.slots)[0]) => {
        if (!slot) return null;
        if (slot.tipo === "iniciativa") return { tipo: "Tracker", titulo: "Iniciativa & PV" };
        if (slot.tipo === "dados") return { tipo: "Rolador", titulo: "Dados & Testes" };
        if (slot.tipo === "condicoes") return { tipo: "Glossário", titulo: "Condições" };
        if (slot.tipo === "registro") {
            const item = ((data[slot.categoria] as any[]) ?? []).find((i) => i.id === slot.itemId);
            const cat = ROTULO_CATEGORIA[slot.categoria] ?? slot.categoria;
            return {
                tipo: cat,
                titulo: item ? item.nome : "Registro Carregado",
            };
        }
        return { tipo: "Card", titulo: "Painel" };
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-[#453b13] dark:bg-[#040c07] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] dark:bg-[radial-gradient(#123520_1px,transparent_1px)] h-full! bg-size-[16px_16px] px-2 sm:px-4 lg:px-6 select-none">
            {/* Estrutura de Pasta idêntica ao FolderLayout */}
            <main className="relative z-10 mx-auto mt-14 sm:mt-16 lg:mt-14 w-full  pb-6">
                {/* Abas e Marcadores no topo da pasta */}
                <div className="flex flex-row items-end justify-between w-full z-20 dark:mb-2">
                    {/* Esquerda: Botão Voltar + Abas de Mesas */}
                    <div className="flex flex-row items-end z-10 gap-2">
                        {/* Aba Voltar idêntica ao DesktopTab */}
                        <Link
                            to="/"
                            title="Voltar para o Dossiê"
                            className={`
                                -mt-8 flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)]
                                bg-size-[240%] bg-blend-overlay pt-4 font-special text-lg text-black/70 transition-all
                                hover:-mt-12 hover:h-16 xl:text-2xl
                                dark:m-0! dark:h-11! dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none dark:border
                                w-28 sm:w-36 xl:w-44 z-30
                                h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)]
                                dark:bg-[#121514] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-[#1a1e1c] dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:shadow-none
                            `}
                        >
                            <span className="-mt-1.5 dark:mt-0 truncate px-1 flex items-center gap-1.5">
                                <ArrowLeft className="size-5 shrink-0" />
                                <span>VOLTAR</span>
                            </span>
                        </Link>

                        {/* Abas das Mesas */}
                        {paineis.map((p, idx) => {
                            const ativo = p.id === painelAtivo.id;
                            return (
                                <div
                                    key={p.id}
                                    className={`
                                        flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)]
                                        bg-size-[240%] bg-blend-overlay pt-4 font-special text-lg text-black/70 transition-all
                                        xl:text-2xl
                                        dark:m-0! dark:h-11! dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none dark:border
                                        w-28 sm:w-36 xl:w-48 
                                        ${ativo
                                            ? "-mt-10 z-20! h-14 bg-[#837156] shadow-[0_0_20px_rgba(0,0,0,0.75)] dark:bg-[#222925]! dark:border-emerald-500/60 dark:text-emerald-300 dark:shadow-none"
                                            : "-mt-8 h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)] hover:-mt-12 hover:h-16 dark:bg-[#121514] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-[#1a1e1c] dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:shadow-none"
                                        }
                                    `}
                                    style={{ zIndex: ativo ? 25 : 20 - idx }}
                                >
                                    {ativo && editandoMesa ? (
                                        <div className="flex items-center gap-1 px-2 -mt-2 dark:mt-0 w-full">
                                            <input
                                                autoFocus
                                                value={nomeMesa}
                                                onChange={(e) => setNomeMesa(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") salvarNomeMesa();
                                                    if (e.key === "Escape") setEditandoMesa(false);
                                                }}
                                                className="w-full bg-black/40 px-1.5 py-0.5 font-special text-sm text-white outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={salvarNomeMesa}
                                                className="cursor-pointer text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Check className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAtivo(p.id)}
                                            className="w-full h-full flex items-center justify-center cursor-pointer px-2"
                                        >
                                            <span className="-mt-1.5 dark:mt-0 truncate px-1 flex items-center gap-1.5 sm:gap-2">
                                                <span>{p.nome}</span>
                                                {ativo && (
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditandoMesa(true);
                                                            }}
                                                            className="cursor-pointer text-black/60 hover:text-black dark:text-zinc-400 dark:hover:text-emerald-300"
                                                            title="Renomear mesa"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </span>
                                                        {paineis.length > 1 && (
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removerPainel(p.id);
                                                                }}
                                                                className="cursor-pointer text-black/60 hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400"
                                                                title="Excluir mesa"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {/* Botão + Nova Mesa */}
                        <button
                            type="button"
                            onClick={adicionarPainel}
                            title="Criar nova mesa"
                            className={`
                                -mt-8 flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)]
                                bg-size-[240%] bg-blend-overlay pt-4 font-special text-lg text-black/70 transition-all
                                hover:-mt-12 hover:h-16 xl:text-2xl
                                dark:m-0! dark:h-11! dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none dark:border
                                w-12 sm:w-14 z-0
                                h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)]
                                dark:bg-[#121514] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-[#1a1e1c] dark:hover:border-zinc-600 dark:hover:text-zinc-200 dark:shadow-none
                            `}
                        >
                            <span className="-mt-1.5 dark:mt-0">
                                <Plus className="size-5 sm:size-6 shrink-0" />
                            </span>
                        </button>
                    </div>

                    {/* Direita: Marcadores Coloridos no Topo com Ícones Ampliados */}
                    <div className="flex flex-row items-end gap-1.5 sm:gap-2">
                        {/* Marcador Tela Cheia */}
                        <button
                            type="button"
                            onClick={alternarFullscreen}
                            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                            aria-label="Alternar tela cheia"
                            className={`
                                -mt-8 flex cursor-pointer items-start justify-center rounded-t-lg
                                bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
                                pt-4 transition-all hover:-mt-12 hover:h-16
                                dark:m-0! dark:h-11! dark:w-12 dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none! dark:border
                                w-12 sm:w-14 xl:w-16 h-12 bg-sky-400/80 text-gray-900 shadow-[inset_0_-8px_5px_rgba(0,0,0,0.2),0_-2px_8px_rgba(0,0,0,0.3)]
                                dark:bg-[#121514]! dark:border-zinc-800 dark:text-zinc-300! dark:hover:bg-[#1a1e1c]! dark:hover:border-zinc-600 dark:hover:text-zinc-100! dark:shadow-none!
                            `}
                        >
                            <span className="-mt-1.5 dark:mt-0">
                                {isFullscreen ? (
                                    <Minimize2 className="size-5 sm:size-6 shrink-0" />
                                ) : (
                                    <Maximize2 className="size-5 sm:size-6 shrink-0" />
                                )}
                            </span>
                        </button>

                        {/* Marcador Modo Noturno / Tema */}
                        <button
                            type="button"
                            onClick={toggleTema}
                            title={isEstrangeiro ? "Modo Claro" : "Modo Estrangeiro (Dark)"}
                            aria-label="Alternar tema"
                            className={`
                                -mt-8 flex cursor-pointer items-start justify-center rounded-t-lg
                                bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
                                pt-4 transition-all hover:-mt-12 hover:h-16
                                dark:m-0! dark:h-11! dark:w-12 dark:items-center! dark:pt-0! dark:rounded-none! dark:bg-none! dark:border
                                w-12 sm:w-14 xl:w-16 h-12 shadow-[inset_0_-8px_5px_rgba(0,0,0,0.2),0_-2px_8px_rgba(0,0,0,0.3)]
                                ${isEstrangeiro
                                    ? "bg-emerald-400/80 text-gray-950 dark:bg-[#121514]! dark:border-zinc-800 dark:text-emerald-400! dark:hover:bg-[#1a1e1c]! dark:hover:border-zinc-600 dark:shadow-none!"
                                    : "bg-amber-400/80 text-gray-900 hover:bg-amber-400"
                                }
                            `}
                        >
                            <span className="-mt-1.5 dark:mt-0">
                                {isEstrangeiro ? (
                                    <Sun className="size-5 sm:size-6 shrink-0" />
                                ) : (
                                    <Moon className="size-5 sm:size-6 shrink-0" />
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Borda superior da pasta (lip) idêntica ao FolderLayout */}
                <div className="relative hidden h-5 w-full rounded-t-md z-10 bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:block lg:rounded-t-none dark:hidden!" />

                {/* Corpo da Pasta com os 6 Espaços */}
                <div className="relative h-full w-full rounded-md pt-0! lg:rounded-t-none lg:rounded-b-lg dark:rounded-none! bg-[#837156] dark:bg-[#141716] bg-[url(/assets/folder.jpg)] dark:bg-none bg-size-[30%] bg-blend-overlay dark:border dark:border-zinc-800 p-2 sm:p-4 lg:p-5 shadow-2xl/90">
                    {/* Grid com os 6 Slots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full h-[calc(100vh-130px)] min-h-[600px]">
                        {painelAtivo.slots.map((slot, indice) => {
                            const info = getRotuloSlot(slot);
                            return (
                                <div
                                    key={indice}
                                    className="flex flex-col h-full min-h-[290px] lg:min-h-0 border border-black/40 dark:border-zinc-800/90 bg-[linear-gradient(rgba(249,249,249,0.85),rgba(249,249,249,0.85)),url(/assets/paper.png)] dark:bg-[#101312] dark:bg-none bg-repeat bg-size-[30%] shadow-md overflow-hidden"
                                >
                                    {/* Header do Slot */}
                                    <div className="flex h-7.5 shrink-0 items-center justify-between border-b border-gray-400/90 dark:border-zinc-800 bg-black/5 dark:bg-[#161a18] px-2.5 text-xs">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="bg-black text-white dark:bg-emerald-500/20 dark:border dark:border-emerald-500/50 dark:text-emerald-300 font-special text-[11px] px-1.5 py-0.2 tracking-wider uppercase font-bold shrink-0">
                                                #{indice + 1}
                                            </span>
                                            {info ? (
                                                <>
                                                    <span className="font-special text-[11px] uppercase tracking-wider text-gray-500 dark:text-zinc-500 shrink-0">
                                                        [{info.tipo}]
                                                    </span>
                                                    <span className="truncate font-special uppercase tracking-wider text-gray-900 dark:text-zinc-200 font-bold">
                                                        {info.titulo}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-special text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500">
                                                    Slot Disponível
                                                </span>
                                            )}
                                        </div>

                                        {slot && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                {slot.tipo === "registro" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSlotPickerIndice(indice)}
                                                        className="cursor-pointer p-1 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                                        title="Trocar registro"
                                                    >
                                                        <RefreshCw className="size-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => limparSlot(indice)}
                                                    className="cursor-pointer p-1 text-gray-600 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                    title="Limpar card"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Corpo do Slot com Scroll Suave Contínuo */}
                                    <div className="flex-1 min-h-0 overflow-hidden relative select-text">
                                        {slot ? (
                                            slot.tipo === "registro" ? (
                                                <SlotRegistro categoria={slot.categoria} itemId={slot.itemId} />
                                            ) : slot.tipo === "iniciativa" ? (
                                                <SlotIniciativa
                                                    dados={slot.dados as DadosIniciativa | undefined}
                                                    onChange={(novos) =>
                                                        atualizarDados(painelAtivo.id, slot.id, novos)
                                                    }
                                                />
                                            ) : slot.tipo === "dados" ? (
                                                <SlotDados
                                                    dados={slot.dados as DadosRolador | undefined}
                                                    onChange={(novos) =>
                                                        atualizarDados(painelAtivo.id, slot.id, novos)
                                                    }
                                                />
                                            ) : slot.tipo === "condicoes" ? (
                                                <SlotCondicoes />
                                            ) : null
                                        ) : (
                                            /* Estado Vazio estilo Dossiê */
                                            <div className="flex h-full flex-col items-center justify-center p-3 text-center select-none">
                                                <div className="w-full max-w-[280px] border-2 border-dashed border-gray-400/90 dark:border-zinc-800 bg-white/40 dark:bg-black/20 p-3.5">
                                                    <p className="font-special text-xs uppercase tracking-widest text-gray-600 dark:text-zinc-400 mb-2.5 font-bold">
                                                        [ Slot {indice + 1} Livre ]
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSlotPickerIndice(indice)}
                                                        className="w-full mb-2.5 flex cursor-pointer items-center justify-center gap-1.5 border border-black/40 dark:border-emerald-500/60 bg-[linear-gradient(rgba(249,249,249,0.9),rgba(249,249,249,0.9)),url(/assets/paper.png)] dark:bg-[#161a18] dark:bg-none bg-size-[200%] px-3 py-1.5 font-special text-xs uppercase tracking-wider text-gray-900 dark:text-emerald-300 hover:border-black dark:hover:bg-[#1c221f] transition-all shadow-xs"
                                                    >
                                                        <FilePlus2 className="size-3.5 text-gray-800 dark:text-emerald-400" />
                                                        Adicionar Registro
                                                    </button>

                                                    <div className="grid grid-cols-3 gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => adicionarEspecial(indice, "iniciativa")}
                                                            className="flex cursor-pointer flex-col items-center gap-1 border border-black/20 dark:border-zinc-800 bg-white/60 dark:bg-[#141716] py-1 px-1 font-special text-[10px] uppercase tracking-wider text-gray-800 dark:text-zinc-300 hover:bg-white dark:hover:border-zinc-600 transition-colors"
                                                            title="Tracker de iniciativa e pontos de vida"
                                                        >
                                                            <Activity className="size-3.5 text-rose-600 dark:text-rose-400" />
                                                            Iniciativa
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => adicionarEspecial(indice, "dados")}
                                                            className="flex cursor-pointer flex-col items-center gap-1 border border-black/20 dark:border-zinc-800 bg-white/60 dark:bg-[#141716] py-1 px-1 font-special text-[10px] uppercase tracking-wider text-gray-800 dark:text-zinc-300 hover:bg-white dark:hover:border-zinc-600 transition-colors"
                                                            title="Rolador de dados customizado"
                                                        >
                                                            <Dices className="size-3.5 text-sky-600 dark:text-sky-400" />
                                                            Dados
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => adicionarEspecial(indice, "condicoes")}
                                                            className="flex cursor-pointer flex-col items-center gap-1 border border-black/20 dark:border-zinc-800 bg-white/60 dark:bg-[#141716] py-1 px-1 font-special text-[10px] uppercase tracking-wider text-gray-800 dark:text-zinc-300 hover:bg-white dark:hover:border-zinc-600 transition-colors"
                                                            title="Glossário rápido de condições"
                                                        >
                                                            <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                                            Condições
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Modal RegistroPicker */}
            {slotPickerIndice !== null && (
                <RegistroPicker
                    onSelect={(categoria, itemId) => {
                        definirSlot(painelAtivo.id, slotPickerIndice, {
                            id: novoId(),
                            tipo: "registro",
                            categoria,
                            itemId,
                        });
                        setSlotPickerIndice(null);
                    }}
                    onClose={() => setSlotPickerIndice(null)}
                />
            )}
        </div>
    );
}
