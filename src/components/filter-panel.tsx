import FilterButton from "@/components/filter-button";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ConfigFiltro, EstadoFiltro, OperadorFiltro } from "@/hooks/useFiltros";

interface FiltrosPainelProps {
    busca: string;
    setBusca: (v: string) => void;
    placeholder?: string;

    opcoesResolvidas: (ConfigFiltro & { opcoes: string[] })[];
    filtrosAtivos: Record<string, Record<string, EstadoFiltro>>;
    operadoresAtivos?: Record<string, OperadorFiltro>;
    toggleOperador?: (filtroId: string) => void;
    toggleFiltro: (filtroId: string, opcao: string) => void;
    temFiltroAtivo: boolean;
    limparFiltros: () => void;

    totalItens: number;
}

function LinhaFiltroExpansivel({
    config,
    filtrosAtivos,
    operador,
    possuiSelecoes,
    toggleOperador,
    toggleFiltro,
}: {
    config: ConfigFiltro & { opcoes: string[] };
    filtrosAtivos: Record<string, Record<string, EstadoFiltro>>;
    operador: OperadorFiltro;
    possuiSelecoes: boolean;
    toggleOperador?: (filtroId: string) => void;
    toggleFiltro: (filtroId: string, opcao: string) => void;
}) {
    const [expandido, setExpandido] = useState(false);

    const precisaDeExpansao = config.opcoes.length > 16;

    return (
        <div className="flex gap-1.5 items-start border-b border-dashed border-black/20 pb-2 last:border-none">
            <div className="flex flex-col gap-1 w-24 shrink-0 mr-1 pt-0.5">
                <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-sm font-special text-gray-600 uppercase tracking-wide truncate">
                        {config.label}:
                    </span>
                    {possuiSelecoes && toggleOperador && (
                        <button
                            type="button"
                            onClick={() => toggleOperador(config.id)}
                            title={`Mudando critério de combinação. Atual: ${operador === "and" ? "Exigir TODOS" : "Aceitar QUALQUER"}`}
                            className="px-1 text-[10px] font-bold uppercase bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300 cursor-pointer select-none transition-colors rounded-xs"
                        >
                            {operador === "and" ? "E" : "OU"}
                        </button>
                    )}
                </div>

                {precisaDeExpansao && (
                    <button
                        type="button"
                        onClick={() => setExpandido(!expandido)}
                        className="flex items-center gap-0.5 text-[10px] font-bold text-gray-500 hover:text-gray-800 uppercase tracking-wider text-left transition-colors cursor-pointer mt-0.5"
                    >
                        {expandido ? (
                            <>
                                <ChevronUp className="size-3 shrink-0" /> Ver menos
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-3 shrink-0" /> Ver mais
                            </>
                        )}
                    </button>
                )}
            </div>

            <div
                className={`flex flex-wrap gap-1.5 grow transition-all duration-200 overflow-hidden ${expandido ? "max-h-[500px]" : "max-h-[78px]"
                    }`}
            >
                {config.opcoes.map(opcao => (
                    <FilterButton
                        key={opcao}
                        label={opcao}
                        estado={filtrosAtivos[config.id]?.[opcao] ?? "neutro"}
                        onClick={() => toggleFiltro(config.id, opcao)}
                    />
                ))}
            </div>
        </div>
    );
}

export default function FilterPanel({
    busca,
    setBusca,
    placeholder,
    opcoesResolvidas,
    filtrosAtivos,
    operadoresAtivos = {},
    toggleOperador,
    toggleFiltro,
    temFiltroAtivo,
    limparFiltros,
    totalItens,
}: FiltrosPainelProps) {
    return (
        <div className="relative ">
            <div className="relative p-6 z-10 shadow-2xl bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%]">
                <div className="flex flex-col gap-4">

                    <div className="flex sticky items-center border border-gray-600 bg-white/40 px-3 py-2">
                        <Search className="size-5 mr-2 shrink-0 text-gray-600" />
                        <input
                            type="text"
                            placeholder={placeholder ?? `Buscando entre ${totalItens} registros...`}
                            className="w-full bg-transparent outline-none font-medium text-sm"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                        {busca && (
                            <button onClick={() => setBusca("")} className="ml-2 text-gray-400 hover:text-gray-700 cursor-pointer">
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        {opcoesResolvidas.map(config => {
                            if (config.opcoes.length === 0) return null;

                            const operador = operadoresAtivos[config.id] || "or";
                            const possuiSelecoes = Object.values(filtrosAtivos[config.id] ?? {}).some(e => e === "incluir");

                            return (
                                <LinhaFiltroExpansivel
                                    key={config.id}
                                    config={config}
                                    filtrosAtivos={filtrosAtivos}
                                    operador={operador}
                                    possuiSelecoes={possuiSelecoes}
                                    toggleOperador={toggleOperador}
                                    toggleFiltro={toggleFiltro}
                                />
                            );
                        })}
                    </div>

                    {temFiltroAtivo && (
                        <button
                            onClick={limparFiltros}
                            className="text-red-700 text-xs font-bold cursor-pointer flex items-center gap-1 underline w-fit mt-1 hover:text-red-900 transition-colors"
                        >
                            <X className="size-3" /> Limpar todos os filtros
                        </button>
                    )}

                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
        </div>
    );
}