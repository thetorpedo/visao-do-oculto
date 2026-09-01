import FilterButton from "@/components/filter/filter-button";
import { Search, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
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
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-special uppercase text-sm tracking-wide transition-all cursor-pointer shrink-0 h-full"
        >
            <Plus className="size-4" /> Criar Novo
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

    return (
        <div className="flex gap-1.5 items-start border-b border-dashed border-black/20 pb-1 last:border-none">
            <div className="flex flex-col gap-1 w-24 shrink-0 mr-1 pt-0.5">
                <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-sm bg-black/5 w-full px-2 font-special text-black/80 lead uppercase tracking-wide truncate">
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

            <div
                className={`flex flex-wrap gap-1 grow transition-all duration-200 overflow-hidden ${expandido ? "max-h-125" : "max-h-19.5"
                    }`}
            >
                {config.opcoes.map(opcao => (
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

    return (
        <div className="relative">
            <div className="relative p-6 z-10 shadow-2xl bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-2">
                        <BuscaInput
                            busca={busca}
                            setBusca={setBusca}
                            placeholder={placeholder ?? `Buscando entre ${totalItens} registros...`}
                        />
                        {onCriarNovo && <BotaoCriarNovo onClick={onCriarNovo} />}
                    </div>

                    <div className="flex flex-col gap-1">
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