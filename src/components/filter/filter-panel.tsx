import FilterButton from "@/components/filter/filter-button";
import { Search, X, ChevronDown, ChevronUp, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
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
    onCriarNovo?: () => void;
}

const MAX_OPCOES_VISIVEIS = 16;

function BuscaInput({
    busca,
    setBusca,
    placeholder,
}: {
    busca: string;
    setBusca: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="flex w-full sticky items-center border border-gray-600 bg-white/40 px-3 py-2">
            <Search className="size-5 mr-2 shrink-0 text-gray-600" />
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-transparent font-special outline-none font-medium text-sm"
                value={busca}
                onChange={e => setBusca(e.target.value)}
            />
            {busca && (
                <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="ml-2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    aria-label="Limpar busca"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

function BotaoCriarNovo({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-900 text-white font-special uppercase text-xs sm:text-sm tracking-wide transition-all cursor-pointer shrink-0"
            title="Criar Novo"
        >
            <Plus className="size-4 shrink-0" />
            <span className="hidden sm:inline">Criar Novo</span>
            <span className="sm:hidden">Novo</span>
        </button>
    );
}

function OperadorToggle({
    operador,
    onToggle,
}: {
    operador: OperadorFiltro;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            title={`Mudando critério de combinação. Atual: ${operador === "and" ? "Exigir TODOS" : "Aceitar QUALQUER"}`}
            className="px-1 text-[10px] font-bold uppercase bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300 cursor-pointer select-none transition-colors rounded-xs"
        >
            {operador === "and" ? "E" : "OU"}
        </button>
    );
}

function ToggleExpansao({
    expandido,
    onToggle,
}: {
    expandido: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
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
    );
}

function LinhaFiltroExpansivel({
    config,
    estadosOpcoes,
    operador,
    possuiSelecoes,
    toggleOperador,
    toggleFiltro,
}: {
    config: ConfigFiltro & { opcoes: string[] };
    estadosOpcoes: Record<string, EstadoFiltro>;
    operador: OperadorFiltro;
    possuiSelecoes: boolean;
    toggleOperador?: (filtroId: string) => void;
    toggleFiltro: (filtroId: string, opcao: string) => void;
}) {
    const [expandido, setExpandido] = useState(false);

    const precisaDeExpansao = config.opcoes.length > MAX_OPCOES_VISIVEIS;
    const opcoesVisiveis = expandido
        ? config.opcoes
        : config.opcoes.slice(0, MAX_OPCOES_VISIVEIS);

    return (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-1.5 items-stretch sm:items-start border-b border-dashed border-black/20 py-1.5 sm:py-0 sm:pb-1 last:border-none">
            <div className="flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-1 sm:w-24 shrink-0 sm:mr-1 sm:pt-0.5">
                <div className="flex items-center gap-1.5 justify-between sm:w-full">
                    <span className="text-xs sm:text-sm bg-black/5 sm:w-full px-2 py-0.5 sm:py-0 font-special text-black/80 lead uppercase tracking-wide truncate">
                        {config.label}:
                    </span>
                    {possuiSelecoes && toggleOperador && (
                        <OperadorToggle operador={operador} onToggle={() => toggleOperador(config.id)} />
                    )}
                </div>

                {precisaDeExpansao && (
                    <ToggleExpansao expandido={expandido} onToggle={() => setExpandido(v => !v)} />
                )}
            </div>

            <div className="flex flex-wrap gap-1 grow">
                {opcoesVisiveis.map(opcao => (
                    <FilterButton
                        key={opcao}
                        label={opcao}
                        estado={estadosOpcoes[opcao] ?? "neutro"}
                        onClick={() => toggleFiltro(config.id, opcao)}
                    />
                ))}
            </div>
        </div>
    );
}

function BotaoLimparFiltros({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-red-700 text-xs font-bold cursor-pointer flex items-center gap-1 underline w-fit mt-1 hover:text-red-900 transition-colors"
        >
            <X className="size-3" /> Limpar todos os filtros
        </button>
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
    onCriarNovo,
}: FiltrosPainelProps) {
    const filtrosVisiveis = useMemo(
        () =>
            opcoesResolvidas
                .filter(config => config.opcoes.length > 0)
                .map(config => {
                    const estadosOpcoes = filtrosAtivos[config.id] ?? {};
                    return {
                        config,
                        estadosOpcoes,
                        operador: operadoresAtivos[config.id] ?? "or",
                        possuiSelecoes: Object.values(estadosOpcoes).some(e => e === "incluir"),
                    };
                }),
        [opcoesResolvidas, filtrosAtivos, operadoresAtivos]
    );

    const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);

    const totalFiltrosAtivos = useMemo(() => {
        return Object.values(filtrosAtivos).reduce(
            (acc, opcoes) => acc + Object.values(opcoes).filter(e => e !== "neutro").length,
            0
        );
    }, [filtrosAtivos]);

    return (
        <div className="relative">
            <div className="relative p-3.5 sm:p-6 z-10 shadow-2xl bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%]">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-row gap-1.5 sm:gap-2">
                        <BuscaInput
                            busca={busca}
                            setBusca={setBusca}
                            placeholder={placeholder ?? `Buscando entre ${totalItens} registros...`}
                        />
                        {filtrosVisiveis.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setMostrarFiltrosMobile(v => !v)}
                                className={`sm:hidden flex items-center justify-center gap-1 px-2.5 py-2 border font-special uppercase text-xs tracking-wide transition-all cursor-pointer shrink-0 ${
                                    mostrarFiltrosMobile || totalFiltrosAtivos > 0
                                        ? "border-gray-900 bg-gray-900 text-white"
                                        : "border-gray-600 bg-white/60 text-gray-800"
                                }`}
                                aria-label="Mostrar filtros"
                            >
                                <SlidersHorizontal className="size-3.5 shrink-0" />
                                {totalFiltrosAtivos > 0 && (
                                    <span className="font-sans text-[11px] font-bold">
                                        {totalFiltrosAtivos}
                                    </span>
                                )}
                            </button>
                        )}
                        {onCriarNovo && <BotaoCriarNovo onClick={onCriarNovo} />}
                    </div>

                    <div className={`${mostrarFiltrosMobile ? "flex" : "hidden"} sm:flex flex-col gap-1`}>
                        {filtrosVisiveis.map(({ config, estadosOpcoes, operador, possuiSelecoes }) => (
                            <LinhaFiltroExpansivel
                                key={config.id}
                                config={config}
                                estadosOpcoes={estadosOpcoes}
                                operador={operador}
                                possuiSelecoes={possuiSelecoes}
                                toggleOperador={toggleOperador}
                                toggleFiltro={toggleFiltro}
                            />
                        ))}
                    </div>

                    {temFiltroAtivo && <BotaoLimparFiltros onClick={limparFiltros} />}
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
        </div>
    );
}