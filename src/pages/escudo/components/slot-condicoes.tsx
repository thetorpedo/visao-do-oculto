import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useData } from "@/context/DataContext";
import MarkdownRenderer from "@/components/ui/markdown-renderer";

const normalizar = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function SlotCondicoes() {
    const { regras } = useData();
    const [busca, setBusca] = useState("");
    const [abertaId, setAbertaId] = useState<string | null>(null);

    const condicoes = useMemo(
        () =>
            regras
                .filter((r) => r.categoria && r.categoria.some((c) => /condi/i.test(c)))
                .sort((a, b) => a.nome.localeCompare(b.nome)),
        [regras]
    );

    const filtradas = useMemo(() => {
        const termo = normalizar(busca.trim());
        if (!termo) return condicoes;
        return condicoes.filter((c) => normalizar(c.nome).includes(termo));
    }, [condicoes, busca]);

    return (
        <div className="flex h-full min-h-0 flex-col gap-2.5 p-3 text-gray-900 dark:text-zinc-100 sm:p-3.5">
            {/* Campo de Busca */}
            <div className="flex items-center border border-gray-400 bg-white/70 px-2.5 py-2 transition-colors focus-within:border-gray-700 dark:border-zinc-700 dark:bg-[#121514] dark:focus-within:border-emerald-500/60">
                <Search className="mr-2.5 size-4 shrink-0 text-gray-500 dark:text-zinc-400" />
                <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={`Buscar entre ${condicoes.length} condições...`}
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
            </div>

            {/* Lista de Condições */}
            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                {condicoes.length === 0 && (
                    <p className="p-4 text-center text-xs italic text-gray-500 dark:text-zinc-400">
                        Nenhuma regra com a categoria "Condições" foi encontrada.
                    </p>
                )}
                {condicoes.length > 0 && filtradas.length === 0 && (
                    <p className="p-4 text-center text-xs italic text-gray-500 dark:text-zinc-400">
                        Nenhuma condição correspondente.
                    </p>
                )}
                {filtradas.map((condicao) => {
                    const aberta = abertaId === condicao.id;
                    return (
                        <div
                            key={condicao.id}
                            className="border border-gray-300 bg-white/60 transition-colors dark:border-zinc-800 dark:bg-[#161a18]"
                        >
                            <button
                                onClick={() => setAbertaId(aberta ? null : condicao.id)}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <span className="font-special text-sm uppercase tracking-wide text-gray-900 dark:text-zinc-100">
                                    {condicao.nome}
                                </span>
                                <ChevronDown
                                    className={`size-4 shrink-0 text-gray-500 dark:text-zinc-400 transition-transform ${
                                        aberta ? "rotate-180 text-gray-900 dark:text-emerald-400" : ""
                                    }`}
                                />
                            </button>
                            {aberta && (
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
