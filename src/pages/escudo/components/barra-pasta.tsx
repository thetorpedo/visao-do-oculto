import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Edit2, Maximize2, Minimize2, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUI } from "@/context/UiContext";
import { cn } from "@/lib/utils";
import type { Painel } from "@/hooks/useEscudo";

const ABA_BASE =
    "relative flex cursor-pointer items-start justify-center rounded-t-lg bg-[url(/assets/folder.jpg)] bg-size-[240%] bg-blend-overlay pt-3.5 font-special transition-all shrink-0 dark:m-0! dark:h-11! dark:items-center! dark:rounded-none! dark:border dark:bg-none dark:pt-0!";
const ABA_ATIVA =
    "-mt-10 h-14 bg-[#837156] shadow-[0_0_20px_rgba(0,0,0,0.75)] dark:border-emerald-500/60 dark:bg-[#222925]! dark:text-emerald-300 dark:shadow-none";
const ABA_INATIVA =
    "-mt-8 h-12 bg-[#7a6a51] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.35),0_0_20px_rgba(0,0,0,0.75)] hover:-mt-10 hover:h-14 dark:border-zinc-800 dark:bg-[#121514] dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-600 dark:hover:bg-[#1a1e1c] dark:hover:text-zinc-200";
const TEXTO_ABA =
    "truncate font-special text-xs uppercase tracking-wider text-black/80 sm:text-sm xl:text-xl dark:text-zinc-200";

function useFullscreen() {
    const [ativo, setAtivo] = useState(false);

    useEffect(() => {
        const atualizar = () => setAtivo(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", atualizar);
        return () => document.removeEventListener("fullscreenchange", atualizar);
    }, []);

    const alternar = async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
        } catch (err) {
            console.error("Erro ao alternar tela cheia:", err);
        }
    };

    return { ativo, alternar };
}

function Marcador({
    titulo,
    onClick,
    ativo = false,
    className,
    children,
}: {
    titulo: string;
    onClick: () => void;
    ativo?: boolean;
    className?: string;
    children: ReactNode;
}) {
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

function MesaTab({ painel, indice, ativo, podeRemover, onSelecionar, onRemover, onRenomear }: MesaTabProps) {
    const tabRef = useRef<HTMLDivElement>(null);
    const [editando, setEditando] = useState(false);
    const [nome, setNome] = useState(painel.nome);

    if (!ativo && editando) setEditando(false);

    useEffect(() => {
        if (ativo && tabRef.current) {
            tabRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
    }, [ativo]);

    const iniciarEdicao = () => {
        setNome(painel.nome);
        setEditando(true);
    };

    const salvar = () => {
        onRenomear(nome);
        setEditando(false);
    };

    return (
        <div
            ref={tabRef}
            className={cn(ABA_BASE, "w-32 sm:w-40 xl:w-48 shrink-0", ativo ? ABA_ATIVA : ABA_INATIVA)}
            style={{ zIndex: ativo ? 25 : 20 - indice }}
        >
            {ativo && editando ? (
                <div className="flex w-full items-center h-full gap-1 px-2.5 dark:mt-0">
                    <Input
                        autoFocus
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        onFocus={(e) => {
                            const el = e.currentTarget;
                            el.select();
                            requestAnimationFrame(() => el.select());
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") salvar();
                            if (e.key === "Escape") setEditando(false);
                        }}
                        className="h-10 border text-sm! border-black! bg-black/50 px-2 uppercase tracking-wider text-white dark:border-emerald-500/60 dark:bg-black/40"
                    />
                    <Button variant="default" size="icon-sm" className="text-white h-full grow" title="Salvar nome" onClick={salvar}>
                        <Check />
                    </Button>
                </div>
            ) : (
                <div onClick={onSelecionar} className="flex h-full w-full select-none items-center justify-between px-3 -mt-1">
                    <span className={TEXTO_ABA}>{painel.nome}</span>

                    {ativo && (
                        <div className="ml-1 flex shrink-0 gap-1 items-center">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="hover:border hover:border-dashed hover:border-black hover:text-black hover:bg-transparent"
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
                                    className="hover:border hover:border-dashed hover:border-red-900 hover:text-red-900 hover:bg-transparent"
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

export default function BarraPasta({ paineis, ativoId, onSelecionar, onAdicionar, onRemover, onRenomear }: BarraPastaProps) {
    const { tema, toggleTema } = useUI();
    const isEstrangeiro = tema === "estrangeiro";
    const fullscreen = useFullscreen();

    return (
        <div className="z-20 flex w-full flex-row items-end justify-between dark:mb-2">
            <div
                onWheel={(e) => {
                    if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
                        e.currentTarget.scrollLeft += e.deltaY;
                    }
                }}
                className="no-scrollbar z-10 flex min-w-0 flex-1 flex-row items-end gap-2 overflow-x-auto pt-10 pb-0 -mt-10 dark:pt-0 dark:mt-0 dark:pb-0"
            >
                <Link
                    to="/"
                    title="Voltar para o Dossiê"
                    className={cn(ABA_BASE, ABA_INATIVA, "z-30 w-28 items-start sm:w-36 xl:w-44")}
                >
                    <span className={cn(TEXTO_ABA, "flex items-center gap-1.5 -ml-2")}>
                        <ArrowLeft className="size-4 shrink-0" />
                        Voltar
                    </span>
                </Link>

                {paineis.map((painel, indice) => (
                    <MesaTab
                        key={painel.id}
                        painel={painel}
                        indice={indice}
                        ativo={painel.id === ativoId}
                        podeRemover={paineis.length > 1}
                        onSelecionar={() => onSelecionar(painel.id)}
                        onRemover={() => onRemover(painel.id)}
                        onRenomear={(nome) => onRenomear(painel.id, nome)}
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

            <div className="flex shrink-0 flex-row items-end gap-1.5 sm:gap-2 ml-2 mr-2 -mb-1">
                <Marcador
                    titulo={fullscreen.ativo ? "Sair da Tela Cheia" : "Tela Cheia"}
                    onClick={fullscreen.alternar}
                    ativo={fullscreen.ativo}
                    className="bg-orange-400/45"
                >
                    {fullscreen.ativo ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                </Marcador>

                <Marcador
                    titulo={isEstrangeiro ? "Modo Claro" : "Modo Estrangeiro (Dark)"}
                    onClick={toggleTema}
                    className={
                        isEstrangeiro
                            ? "bg-emerald-400/80 text-gray-950 dark:text-emerald-400!"
                            : "bg-emerald-400/45 hover:bg-emerald-400/60"
                    }
                >
                    {isEstrangeiro ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </Marcador>
            </div>
        </div>
    );
}
