import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { normalizarTexto } from "../escudo-utils";

const MENSAGEM_AVISO_VAZIO = "p-4 text-center text-xs italic text-gray-500 dark:text-zinc-400";

export default function SlotCondicoes() {
    const { regras } = useData();
    const [busca, setBusca] = useState("");
    const [aberta_id, setAbertaId] = useState<string | null>(null);

    const condicoes = useMemo(
        () =>
            regras
                .filter((r) => r.categoria?.some((c) => /condi/i.test(c)))
                .sort((a, b) => a.nome.localeCompare(b.nome)),
        [regras]
    );

    const filtradas = useMemo(() => {
        const termo_busca = normalizarTexto(busca.trim());
        return termo_busca
            ? condicoes.filter((c) => normalizarTexto(c.nome).includes(termo_busca))
            : condicoes;
    }, [condicoes, busca]);

    return (
        <div className="flex h-full min-h-0 flex-col gap-2.5 p-3 text-gray-900 sm:p-3.5 dark:text-zinc-100">
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-zinc-400" />
                <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={`Buscar entre ${condicoes.length} condições...`}
                    className="h-9 border-gray-400 bg-white/70 pl-9 text-sm dark:border-zinc-700 dark:bg-[#121514]"
                />
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                {condicoes.length === 0 && (
                    <p className={MENSAGEM_AVISO_VAZIO}>
                        Nenhuma regra com a categoria "Condições" foi encontrada.
                    </p>
                )}
                {condicoes.length > 0 && filtradas.length === 0 && (
                    <p className={MENSAGEM_AVISO_VAZIO}>Nenhuma condição correspondente.</p>
                )}

                {filtradas.map((condicao) => {
                    const is_aberta = aberta_id === condicao.id;
                    return (
                        <div
                            key={condicao.id}
                            className="border border-gray-300 bg-white/60 dark:border-zinc-800 dark:bg-[#161a18]"
                        >
                            <button
                                type="button"
                                onClick={() => setAbertaId(is_aberta ? null : condicao.id)}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <span className="font-special text-sm uppercase tracking-wide">
                                    {condicao.nome}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "size-4 shrink-0 text-gray-500 transition-transform dark:text-zinc-400",
                                        is_aberta && "rotate-180 text-gray-900 dark:text-emerald-400"
                                    )}
                                />
                            </button>
                            {is_aberta && (
                                <div className="border-t border-gray-300 bg-black/5 px-3 py-3 dark:border-zinc-800 dark:bg-[#121514]">
                                    <MarkdownRenderer content={condicao.descricao} isCompact />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
