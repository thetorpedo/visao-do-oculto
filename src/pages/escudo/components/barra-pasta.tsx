import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Edit2, Maximize2, Minimize2, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUI } from "@/context/UiContext";
import { cn } from "@/lib/utils";
import type { Painel } from "@/hooks/use-escudo";

const ABA_BASE =
    "relative flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)] bg-size-[240%] bg-blend-overlay pt-3.5 font-special transition-all shrink-0 dark:m-0! dark:h-11! dark:items-center! dark:rounded-none! dark:border dark:bg-none dark:pt-0!";
const ABA_ATIVA =
    "-mt-10 h-14 bg-[#837156] shadow-[0_0_20px_rgba(0,0,0,0.75)] dark:border-emerald-500/60 dark:bg-[#222925]! dark:text-emerald-300 dark:shadow-none";
const ABA_INATIVA =
    "-mt-8 h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)] hover:-mt-10 hover:h-14 dark:border-zinc-800 dark:bg-[#121514] dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-600 dark:hover:bg-[#1a1e1c] dark:hover:text-zinc-200";
const TEXTO_ABA =
    "truncate font-special text-xs uppercase tracking-wider text-black/80 sm:text-sm xl:text-xl dark:text-zinc-200";

function useFullscreen() {
    const [is_ativo, setIsAtivo] = useState(false);

    useEffect(() => {
        const atualizar = () => setIsAtivo(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", atualizar);
        return () => document.removeEventListener("fullscreenchange", atualizar);
    }, []);

    const alternarFullscreen = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch (erro) {
            console.error("Erro ao alternar tela cheia:", erro);
        }
    };

    return { isAtivo: is_ativo, alternar: alternarFullscreen };
}

interface MarcadorProps {
    titulo: string;
    onClick: () => void;
    ativo?: boolean;
    className?: string;
    children: ReactNode;
}

function Marcador({ titulo, onClick, ativo = false, className, children }: MarcadorProps) {
    return (
        <button
            type="button"
            title={titulo}
            aria-label={titulo}
            onClick={onClick}
            className={cn(
                "flex w-10 cursor-pointer items-center justify-center rounded-t-xs bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%] text-gray-900 shadow-[inset_0_-8px_5px_rgba(0,0,0,0.2),0_-2px_8px_rgba(0,0,0,0.3)] transition-all sm:w-11",
                ativo ? "-mt-10 h-14" : "-mt-8 h-12 hover:-mt-10 hover:h-14",
                "dark:m-0! dark:h-11! dark:w-10! dark:rounded-none! dark:border dark:border-zinc-800 dark:bg-[#121514]! dark:bg-none! dark:text-zinc-300! dark:shadow-none! dark:hover:border-zinc-600 dark:hover:bg-[#1a1e1c]! dark:hover:text-zinc-100!",
                className
            )}
        >
            {children}
        </button>
    );
}

interface MesaTabProps {
    painel: Painel;
    indice: number;
    ativo: boolean;
    podeRemover: boolean;
    onSelecionar: () => void;
    onRemover: () => void;
    onRenomear: (nome: string) => void;
}

function MesaTab({
    painel,
    indice,
    ativo,
    podeRemover,
    onSelecionar,
    onRemover,
    onRenomear,
}: MesaTabProps) {
    const tab_ref = useRef<HTMLDivElement>(null);
    const [is_editando, setIsEditando] = useState(false);
    const [nome_painel, setNomePainel] = useState(painel.nome);

    if (!ativo && is_editando) setIsEditando(false);

    useEffect(() => {
        if (ativo && tab_ref.current) {
            tab_ref.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
    }, [ativo]);

    const iniciarEdicao = () => {
        setNomePainel(painel.nome);
        setIsEditando(true);
    };

    const salvarNomePainel = () => {
        onRenomear(nome_painel);
        setIsEditando(false);
    };

    return (
        <div
            ref={tab_ref}
            className={cn(ABA_BASE, "w-32 shrink-0 sm:w-40 xl:w-48", ativo ? ABA_ATIVA : ABA_INATIVA)}
            style={{ zIndex: ativo ? 25 : 20 - indice }}
        >
            {ativo && is_editando ? (
                <div className="flex h-full w-full items-center gap-1 px-2.5 dark:mt-0">
                    <Input
                        autoFocus
                        value={nome_painel}
                        onChange={(e) => setNomePainel(e.target.value)}
                        onFocus={(e) => {
                            const el = e.currentTarget;
                            el.select();
                            requestAnimationFrame(() => el.select());
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") salvarNomePainel();
                            if (e.key === "Escape") setIsEditando(false);
                        }}
                        className="h-10 border border-black! bg-black/50 px-2 text-sm! uppercase tracking-wider text-white dark:border-emerald-500/60 dark:bg-black/40"
                    />
                    <Button
                        variant="default"
                        size="icon-sm"
                        className="h-full grow text-white"
                        title="Salvar nome"
                        onClick={salvarNomePainel}
                    >
                        <Check />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={onSelecionar}
                    className="-mt-1 flex h-full w-full select-none items-center justify-between px-3"
                >
                    <span className={TEXTO_ABA}>{painel.nome}</span>

                    {ativo && (
                        <div className="ml-1 flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="hover:border hover:border-dashed hover:border-black hover:bg-transparent hover:text-black"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    iniciarEdicao();
                                }}
                            >
                                <Edit2 />
                            </Button>
                            {podeRemover && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="hover:border hover:border-dashed hover:border-red-900 hover:bg-transparent hover:text-red-900"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemover();
                                    }}
                                >
                                    <Trash2 />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface BarraPastaProps {
    paineis: Painel[];
    ativoId: string;
    onSelecionar: (id: string) => void;
    onAdicionar: () => void;
    onRemover: (id: string) => void;
    onRenomear: (id: string, nome: string) => void;
}

export default function BarraPasta({
    paineis,
    ativoId,
    onSelecionar,
    onAdicionar,
    onRemover,
    onRenomear,
}: BarraPastaProps) {
    const { tema, toggleTema } = useUI();
    const is_estrangeiro = tema === "estrangeiro";
    const fullscreen_control = useFullscreen();

    const handleScrollAbas = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
            e.currentTarget.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="z-20 flex w-full flex-row items-end justify-between dark:mb-2">
            <div
                onWheel={handleScrollAbas}
                className="no-scrollbar -mt-10 z-10 flex min-w-0 flex-1 flex-row items-end gap-2 overflow-x-auto pt-10 pb-0 dark:mt-0 dark:pt-0 dark:pb-0"
            >
                <Link
                    to="/"
                    title="Voltar para o Dossiê"
                    className={cn(ABA_BASE, ABA_INATIVA, "-ml-2 z-30 w-28 items-start sm:w-36 xl:w-44")}
                >
                    <span className={cn(TEXTO_ABA, "flex items-center gap-1.5")}>
                        <ArrowLeft className="size-4 shrink-0" />
                        Voltar
                    </span>
                </Link>

                {paineis.map((painel_item, indice) => (
                    <MesaTab
                        key={painel_item.id}
                        painel={painel_item}
                        indice={indice}
                        ativo={painel_item.id === ativoId}
                        podeRemover={paineis.length > 1}
                        onSelecionar={() => onSelecionar(painel_item.id)}
                        onRemover={() => onRemover(painel_item.id)}
                        onRenomear={(nome) => onRenomear(painel_item.id, nome)}
                    />
                ))}

                <button
                    type="button"
                    title="Criar nova mesa"
                    onClick={onAdicionar}
                    className={cn(ABA_BASE, ABA_INATIVA, "z-0 w-11 sm:w-12")}
                >
                    <Plus className="size-5 shrink-0 text-black/70 dark:text-zinc-400" />
                </button>
            </div>

            <div className="-mb-1 mr-2 ml-2 flex shrink-0 flex-row items-end gap-1.5 sm:gap-2">
                <Marcador
                    titulo={fullscreen_control.isAtivo ? "Sair da Tela Cheia" : "Tela Cheia"}
                    onClick={fullscreen_control.alternar}
                    ativo={fullscreen_control.isAtivo}
                    className="bg-orange-400/45"
                >
                    {fullscreen_control.isAtivo ? (
                        <Minimize2 className="size-5" />
                    ) : (
                        <Maximize2 className="size-5" />
                    )}
                </Marcador>

                <Marcador
                    titulo={is_estrangeiro ? "Modo Claro" : "Modo Estrangeiro (Dark)"}
                    onClick={toggleTema}
                    className={
                        is_estrangeiro
                            ? "bg-emerald-400/80 text-gray-950 dark:text-emerald-400!"
                            : "bg-emerald-400/45 hover:bg-emerald-400/60"
                    }
                >
                    {is_estrangeiro ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </Marcador>
            </div>
        </div>
    );
}
