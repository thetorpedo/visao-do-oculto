import { Button } from "@/components/ui/button";
import PaperDiv from "@/components/ui/paper-div";
import { FonteConfig } from "@/context/DataContext";
import {
    ArrowLeft,
    ExternalLink,
    Loader2,
    Maximize2,
    Minimize2,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function FonteLeitor({
    fonte,
    mediaUrl,
    isLoading,
    onVoltar,
}: {
    fonte: FonteConfig | null;
    mediaUrl: string;
    isLoading: boolean;
    onVoltar: () => void;
}) {
    const [maximizado, setMaximizado] = useState(false);
    const [zoom, setZoom] = useState(1);

    const isVisual = fonte?.tipo === "visual";
    const isFit = zoom === 1;

    // Fechar ao pressionar Escape quando maximizado e atalhos de zoom para imagens
    useEffect(() => {
        if (!maximizado) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMaximizado(false);
            } else if (isVisual) {
                if (e.key === "+" || e.key === "=") {
                    setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
                } else if (e.key === "-" || e.key === "_") {
                    setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
                } else if (e.key === "0") {
                    setZoom(1);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [maximizado, isVisual]);

    // Bloquear scroll do body quando maximizado
    useEffect(() => {
        if (!maximizado) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [maximizado]);

    // Resetar zoom ao fechar ou trocar de fonte
    useEffect(() => {
        if (!maximizado) {
            setZoom(1);
        }
    }, [maximizado, fonte?.id]);

    return (
        <>
            <div className="flex-1 w-full relative min-h-[85vh] flex flex-col mb-10">
                <PaperDiv>
                    <div className="py-2 mb-4 border-b-2 border-black/40 dark:border-zinc-700/80 border-dashed text-gray-800 dark:text-zinc-300 uppercase font-daisy tracking-wider flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 sm:gap-4 truncate min-w-0">
                            <Button
                                onClick={onVoltar}
                                variant="default"
                                size="sm"
                            >
                                <ArrowLeft className="size-4 -mb-0.5" /> <span>Voltar</span>
                            </Button>
                            <h2 className="font-special text-lg sm:text-xl truncate text-gray-900 dark:text-zinc-100">
                                Lendo: {fonte?.label || fonte?.id}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {mediaUrl && (
                                <a
                                    href={mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:inline-flex"
                                    title="Abrir arquivo em nova aba"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="uppercase gap-1.5 dark:text-zinc-200 dark:border-zinc-600"
                                    >
                                        <ExternalLink className="size-3.5" />
                                        <span className="hidden md:inline">Nova Aba</span>
                                    </Button>
                                </a>
                            )}
                            <Button
                                onClick={() => setMaximizado(true)}
                                variant="outline"
                                size="sm"
                                className="uppercase gap-1.5 dark:text-zinc-200 dark:border-zinc-600"
                                title="Maximizar visualizador"
                            >
                                <Maximize2 className="size-3.5" />
                                <span>Maximizar</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative bg-gray-900/5 dark:bg-black/40 border-2 border-gray-400 dark:border-zinc-700 flex items-center justify-center min-h-[70vh]">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 dark:text-zinc-300 z-10 gap-3 bg-gray-200/50 dark:bg-zinc-900/80 backdrop-blur-sm">
                                <Loader2 className="size-8 animate-spin" />
                                <span className="font-special tracking-widest uppercase">Carregando arquivo...</span>
                            </div>
                        )}

                        {mediaUrl &&
                            (isVisual ? (
                                <div
                                    className="absolute inset-0 overflow-auto flex justify-center custom-scrollbar p-4 cursor-pointer group"
                                    onClick={() => setMaximizado(true)}
                                    title="Clique para maximizar a imagem"
                                >
                                    <img
                                        src={mediaUrl}
                                        alt={fonte?.id}
                                        className="max-w-full h-auto object-contain shadow-2xl transition-transform duration-200 group-hover:scale-[1.01]"
                                    />
                                </div>
                            ) : (
                                <iframe
                                    src={mediaUrl}
                                    className="absolute inset-0 w-full h-full border-none invert-[0.05] contrast-[1.1] bg-white"
                                    title={`Leitor de PDF - ${fonte?.id}`}
                                    allow="fullscreen"
                                />
                            ))}
                    </div>
                </PaperDiv>

                {/* Efeito de papel amontoado no modo claro - escondido no dark mode */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%] pointer-events-none dark:hidden" />
            </div>

            {/* Modal Maximizado Fullscreen */}
            {maximizado &&
                createPortal(
                    <div
                        className="fixed inset-0 z-70 flex flex-col bg-black/95 backdrop-blur-md p-2 sm:p-4 text-white animate-in fade-in duration-150"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Visualizador maximizado: ${fonte?.label || fonte?.id}`}
                    >
                        {/* Barra superior de controle */}
                        <div className="flex items-center justify-between px-3 py-2 sm:py-2.5 mb-2 bg-[#1c201e] border border-zinc-700/80 shadow-md shrink-0">
                            <div className="flex items-center gap-3 truncate min-w-0">
                                <Button
                                    onClick={() => setMaximizado(false)}
                                    variant="default"
                                    size="sm"
                                    className="gap-1.5"
                                    title="Minimizar (Esc)"
                                >
                                    <Minimize2 className="size-4" />
                                    <span className="hidden sm:inline">Minimizar</span>
                                </Button>
                                <div className="flex items-center gap-2 truncate">
                                    <span className="font-special text-sm sm:text-base text-zinc-100 truncate">
                                        {fonte?.label || fonte?.id}
                                    </span>
                                    <span className="text-[10px] font-daisy uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 shrink-0 hidden xs:inline-block">
                                        {isVisual ? "Imagem" : "PDF"}
                                    </span>
                                </div>
                            </div>

                            {/* Controles à direita */}
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {isVisual && (
                                    <div className="flex items-center gap-1 bg-black/50 border border-zinc-700 px-1 py-0.5">
                                        <Button
                                            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-zinc-300 hover:text-white"
                                            title="Diminuir Zoom (-)"
                                        >
                                            <ZoomOut className="size-3.5" />
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => setZoom(1)}
                                            className="font-mono text-xs px-1 text-zinc-300 hover:text-white cursor-pointer select-none"
                                            title="Resetar Zoom (0)"
                                        >
                                            {Math.round(zoom * 100)}%
                                        </button>
                                        <Button
                                            onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-zinc-300 hover:text-white"
                                            title="Aumentar Zoom (+)"
                                        >
                                            <ZoomIn className="size-3.5" />
                                        </Button>
                                        <Button
                                            onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-zinc-300 hover:text-white"
                                            title={isFit ? "Ampliar (200%)" : "Ajustar à tela (100%)"}
                                        >
                                            <RotateCcw className="size-3" />
                                        </Button>
                                    </div>
                                )}

                                {mediaUrl && (
                                    <a
                                        href={mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Abrir em nova aba"
                                        className="inline-flex"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="uppercase gap-1.5 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            <span className="hidden md:inline">Nova Aba</span>
                                        </Button>
                                    </a>
                                )}

                                <Button
                                    onClick={() => setMaximizado(false)}
                                    size="sm"
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 px-2 sm:px-2.5"
                                    title="Fechar (Esc)"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Área do conteúdo maximizado */}
                        <div className="flex-1 w-full h-full relative bg-black/90 border border-zinc-800 overflow-hidden flex items-center justify-center">
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 z-10 gap-3 bg-zinc-950/80 backdrop-blur-sm">
                                    <Loader2 className="size-8 animate-spin" />
                                    <span className="font-special tracking-widest uppercase">Carregando arquivo...</span>
                                </div>
                            )}

                            {mediaUrl &&
                                (isVisual ? (
                                    <div className="w-full h-full overflow-auto flex p-4 custom-scrollbar select-none">
                                        <div className="m-auto flex items-center justify-center">
                                            <img
                                                src={mediaUrl}
                                                alt={fonte?.id}
                                                style={
                                                    isFit
                                                        ? { maxWidth: "100%", maxHeight: "100%" }
                                                        : { width: `${zoom * 100}%`, maxWidth: "none", maxHeight: "none" }
                                                }
                                                className={`object-contain shadow-2xl transition-all duration-150 ${
                                                    isFit ? "cursor-zoom-in" : "cursor-zoom-out"
                                                }`}
                                                onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
                                                title={isFit ? "Clique para ampliar (200%)" : "Clique para ajustar à tela"}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <iframe
                                        src={mediaUrl}
                                        className="w-full h-full border-none invert-[0.05] contrast-[1.1] bg-white"
                                        title={`Leitor de PDF - ${fonte?.id}`}
                                        allow="fullscreen"
                                    />
                                ))}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
