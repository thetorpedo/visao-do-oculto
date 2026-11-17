import { FilePlus2, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import type { AbaSlot, ConteudoAba, TipoEspecial } from "@/hooks/useEscudo";
import { ESPECIAIS } from "./slot-tipos";

interface SlotTabsProps {
    abas: AbaSlot[];
    abaAtivaId: string;
    menuAberto: boolean;
    onToggleMenu: () => void;
    onFecharMenu: () => void;
    onSelecionarAba: (abaId: string) => void;
    onRemoverAba: (abaId: string) => void;
    onTrocarRegistro: (abaId: string) => void;
    onAdicionarRegistro: () => void;
    onAdicionarEspecial: (tipo: TipoEspecial) => void;
}

const ITEM_MENU = "w-full justify-start gap-2 px-2 py-1.5 h-auto uppercase tracking-wider text-gray-900 dark:text-zinc-100";

export default function SlotTabs({
    abas,
    abaAtivaId,
    menuAberto,
    onToggleMenu,
    onFecharMenu,
    onSelecionarAba,
    onRemoverAba,
    onTrocarRegistro,
    onAdicionarRegistro,
    onAdicionarEspecial,
}: SlotTabsProps) {
    const data = useData();

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

    const abaAtiva = abas.find((a) => a.id === abaAtivaId) ?? abas[0];

    const escolher = (acao: () => void) => () => {
        onFecharMenu();
        acao();
    };

    return (
        <div className="relative z-30 flex h-7.5 shrink-0 select-none items-center justify-between border-b border-gray-400/90 bg-black/5 px-1.5 text-xs dark:border-zinc-800 dark:bg-[#161a18]">
            <div className="flex min-w-0 flex-1 items-center gap-1 py-0.5">
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
                                <span className="truncate">{titulo}</span>
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

                <div className="relative shrink-0">
                    <Button
                        variant="outline"
                        size="icon-xs"
                        title="Adicionar nova aba a este slot"
                        aria-expanded={menuAberto}
                        onClick={onToggleMenu}
                    >
                        <Plus />
                    </Button>

                    {menuAberto && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={onFecharMenu} />
                            <div className="absolute left-0 top-full z-50 mt-1 w-44 border border-black/40 bg-white p-1 text-xs shadow-xl dark:border-zinc-700 dark:bg-[#181d1a]">
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

            {abaAtiva?.conteudo.tipo === "registro" && (
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-1.5 shrink-0"
                    title="Trocar registro desta aba"
                    onClick={() => onTrocarRegistro(abaAtiva.id)}
                >
                    <RefreshCw />
                </Button>
            )}
        </div>
    );
}
