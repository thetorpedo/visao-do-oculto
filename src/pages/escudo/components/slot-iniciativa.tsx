import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Minus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selecionarAoFocar, tratarSubstituicaoZero } from "../escudo-utils";

export type TipoCombatente = "jogador" | "inimigo";

export interface Combatente {
    id: string;
    tipo: TipoCombatente;
    nome: string;
    iniciativa: number;
    pv: number;
    pvMax: number;
}

export interface DadosIniciativa {
    rodada: number;
    turnoId: string | null;
    combatentes: Combatente[];
    mostrarPv?: boolean;
}

const VAZIO: DadosIniciativa = { rodada: 1, turnoId: null, combatentes: [], mostrarPv: true };

const SEM_SPINNER =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const ESTILO_BOTAO_PRETO =
    "border-0 bg-black text-white hover:bg-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-black";
const ESTILO_ROTULO_BOTAO = "h-7 px-2.5 font-special text-[11px] uppercase tracking-wider";
const ESTILO_ROTULO_COLUNA = "font-daisy text-xs uppercase tracking-tight text-black/60 dark:text-zinc-400";
const LARGURA_INICIATIVA = "w-[4.75rem]";
const LARGURA_PV = "w-[9.25rem]";

function Passo({
    delta,
    onPasso,
    titulo,
}: {
    delta: 1 | -1;
    onPasso: (valor: number) => void;
    titulo: string;
}) {
    const sinal = delta > 0 ? "+" : "−";

    return (
        <Button
            className={cn(ESTILO_BOTAO_PRETO, "h-6 w-5 border-0!")}
            title={`${titulo} — clique: ${sinal}1 · direito/Shift: ${sinal}5`}
            aria-label={titulo}
            onClick={(e) => onPasso(e.shiftKey ? delta * 5 : delta)}
            onContextMenu={(e) => {
                e.preventDefault();
                onPasso(delta * 5);
            }}
        >
            {delta < 0 ? <Minus className="size-3" strokeWidth={3} /> : <Plus className="size-3" strokeWidth={3} />}
        </Button>
    );
}

export default function SlotIniciativa({
    dados,
    onChange,
}: {
    dados?: DadosIniciativa;
    onChange: (d: DadosIniciativa) => void;
}) {
    const estado_atual = dados ?? VAZIO;
    const mostrar_pv = estado_atual.mostrarPv ?? true;

    const combatentes_ordenados = useMemo(
        () =>
            [...estado_atual.combatentes].sort((a, b) =>
                b.iniciativa !== a.iniciativa ? b.iniciativa - a.iniciativa : a.nome.localeCompare(b.nome)
            ),
        [estado_atual.combatentes]
    );

    const turno_atual =
        combatentes_ordenados.find((c) => c.id === estado_atual.turnoId) ?? combatentes_ordenados[0] ?? null;

    const adicionarCombatente = () => {
        const novo_combatente: Combatente = {
            id: crypto.randomUUID(),
            tipo: "jogador",
            nome: `Participante ${estado_atual.combatentes.length + 1}`,
            iniciativa: 10,
            pv: 20,
            pvMax: 20,
        };
        onChange({
            ...estado_atual,
            combatentes: [...estado_atual.combatentes, novo_combatente],
            turnoId: estado_atual.turnoId ?? novo_combatente.id,
        });
    };

    const atualizarCombatente = (combatente_id: string, atualizacao: Partial<Combatente>) => {
        onChange({
            ...estado_atual,
            combatentes: estado_atual.combatentes.map((c) => (c.id === combatente_id ? { ...c, ...atualizacao } : c)),
        });
    };

    const removerCombatente = (combatente_id: string) => {
        const restantes = estado_atual.combatentes.filter((c) => c.id !== combatente_id);
        onChange({
            ...estado_atual,
            combatentes: restantes,
            turnoId: estado_atual.turnoId === combatente_id ? (restantes[0]?.id ?? null) : estado_atual.turnoId,
        });
    };

    const avancarProximoTurno = () => {
        if (!turno_atual) return;
        const indice_proximo = (combatentes_ordenados.findIndex((c) => c.id === turno_atual.id) + 1) % combatentes_ordenados.length;
        onChange({
            ...estado_atual,
            turnoId: combatentes_ordenados[indice_proximo].id,
            rodada: indice_proximo === 0 ? estado_atual.rodada + 1 : estado_atual.rodada,
        });
    };

    const reiniciarRodada = () => {
        onChange({ ...estado_atual, rodada: 1, turnoId: combatentes_ordenados[0]?.id ?? null });
    };

    const alternarExibicaoPv = () => {
        onChange({ ...estado_atual, mostrarPv: !mostrar_pv });
    };

    const limparParticipantes = () => {
        onChange({ ...VAZIO, mostrarPv: mostrar_pv });
    };

    return (
        <div className="flex h-full min-h-0 flex-col text-gray-900 dark:text-zinc-100">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-black/20 bg-black/5 px-2 py-1.5 dark:border-zinc-800 dark:bg-[#151917]">
                <div className="flex h-full items-center gap-1">
                    <div className="flex h-full items-end gap-1 border border-dashed border-black/40 bg-white/50 px-1.5 py-px dark:border-zinc-600 dark:bg-[#121514]">
                        <span className="-mt-0.5 font-daisy text-xs uppercase tracking-tight text-black/80 dark:text-zinc-400">
                            Rodada
                        </span>
                        <span className="font-special text-lg font-bold leading-none text-gray-950 pb-0.5 dark:text-zinc-100">
                            {estado_atual.rodada}
                        </span>
                    </div>

                    <Button
                        className={cn(ESTILO_BOTAO_PRETO, "size-7")}
                        title="Reiniciar rodada para 1"
                        aria-label="Reiniciar rodada"
                        onClick={reiniciarRodada}
                    >
                        <RotateCcw className="size-3" />
                    </Button>

                    {combatentes_ordenados.length > 0 && (
                        <Button
                            className={cn(ESTILO_BOTAO_PRETO, ESTILO_ROTULO_BOTAO, "gap-0.5")}
                            onClick={avancarProximoTurno}
                        >
                            Próx <ChevronRight className="size-3.5" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant={mostrar_pv ? "default" : "outline"}
                        className={cn(
                            ESTILO_ROTULO_BOTAO,
                            "gap-1",
                            mostrar_pv
                                ? ESTILO_BOTAO_PRETO
                                : "border-solid border-black/40 text-gray-500 hover:bg-black/10 dark:border-zinc-700 dark:text-zinc-500 dark:hover:bg-white/10"
                        )}
                        title={mostrar_pv ? "Desligar contador de vida" : "Ligar contador de vida"}
                        aria-pressed={mostrar_pv}
                        onClick={alternarExibicaoPv}
                    >
                        <Heart className="size-3" fill={mostrar_pv ? "currentColor" : "none"} />
                        PV
                    </Button>

                    <Button
                        className={cn(ESTILO_BOTAO_PRETO, ESTILO_ROTULO_BOTAO, "gap-1 border-0")}
                        title="Adicionar participante"
                        onClick={adicionarCombatente}
                    >
                        <Plus className="size-3" strokeWidth={3} />
                        Participante
                    </Button>

                    {estado_atual.combatentes.length > 0 && (
                        <Button
                            className="size-7"
                            variant="outline"
                            title="Limpar todos os participantes"
                            aria-label="Limpar todos"
                            onClick={limparParticipantes}
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-black/10 overflow-y-auto dark:divide-zinc-800/80">
                {combatentes_ordenados.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <p className="mb-1.5 font-special text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500">
                            Nenhum participante
                        </p>
                        <p className="max-w-xs text-[11px] text-gray-600 dark:text-zinc-400">
                            Clique em <strong>+ Participante</strong> para adicionar.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end gap-1.5 px-1.5 py-0.5">
                            <span className="w-4 shrink-0" />
                            <span className={cn(ESTILO_ROTULO_COLUNA, LARGURA_INICIATIVA, "shrink-0 text-center")}>
                                Iniciativa
                            </span>
                            <span className={cn(ESTILO_ROTULO_COLUNA, "min-w-0 flex-1 px-1")}>Nome</span>
                            {mostrar_pv && (
                                <span className={cn(ESTILO_ROTULO_COLUNA, LARGURA_PV, "shrink-0 text-center")}>
                                    Vida
                                </span>
                            )}
                            <span className="w-5 shrink-0" />
                        </div>

                        {combatentes_ordenados.map((combatente_item) => (
                            <LinhaCombatente
                                key={combatente_item.id}
                                combatente={combatente_item}
                                isAtivo={turno_atual?.id === combatente_item.id}
                                mostrarPv={mostrar_pv}
                                onSetTurno={() => onChange({ ...estado_atual, turnoId: combatente_item.id })}
                                onUpdate={(atualizacao) => atualizarCombatente(combatente_item.id, atualizacao)}
                                onRemover={() => removerCombatente(combatente_item.id)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

interface LinhaCombatenteProps {
    combatente: Combatente;
    isAtivo: boolean;
    mostrarPv: boolean;
    onSetTurno: () => void;
    onUpdate: (atualizacao: Partial<Combatente>) => void;
    onRemover: () => void;
}

function LinhaCombatente({
    combatente,
    isAtivo,
    mostrarPv,
    onSetTurno,
    onUpdate,
    onRemover,
}: LinhaCombatenteProps) {
    const [delta, setDelta] = useState("");
    const [iniciativa_texto, setIniciativaTexto] = useState(String(combatente.iniciativa));
    const [pv_texto, setPvTexto] = useState(String(combatente.pv));
    const [pv_max_texto, setPvMaxTexto] = useState(String(combatente.pvMax));

    useEffect(() => {
        setIniciativaTexto(String(combatente.iniciativa));
    }, [combatente.iniciativa]);

    useEffect(() => {
        setPvTexto(String(combatente.pv));
    }, [combatente.pv]);

    useEffect(() => {
        setPvMaxTexto(String(combatente.pvMax));
    }, [combatente.pvMax]);

    const is_morto = mostrarPv && combatente.pv <= 0;
    const pct_pv =
        combatente.pvMax > 0 ? Math.max(0, Math.min(100, (combatente.pv / combatente.pvMax) * 100)) : 0;

    const cor_barra = pct_pv <= 25 ? "bg-red-500" : pct_pv <= 50 ? "bg-amber-500" : "bg-emerald-500";

    const mudarPv = (delta_pv: number) => {
        onUpdate({ pv: Math.max(0, combatente.pv + delta_pv) });
    };

    const mudarIniciativaPasso = (delta_iniciativa: number) => {
        onUpdate({ iniciativa: combatente.iniciativa + delta_iniciativa });
    };

    const alterarIniciativa = (novo_valor: string) => {
        setIniciativaTexto(tratarSubstituicaoZero(novo_valor, iniciativa_texto));
    };

    const salvarIniciativa = () => {
        const texto_limpo = iniciativa_texto.trim();
        const numero = parseInt(texto_limpo, 10);
        const valor_final = isNaN(numero) ? combatente.iniciativa : numero;
        setIniciativaTexto(String(valor_final));
        if (valor_final !== combatente.iniciativa) {
            onUpdate({ iniciativa: valor_final });
        }
    };

    const alterarPvInput = (novo_valor: string) => {
        const valor_ajustado = tratarSubstituicaoZero(novo_valor, pv_texto);
        setPvTexto(valor_ajustado);
        if (valor_ajustado !== "") {
            onUpdate({ pv: Math.max(0, parseInt(valor_ajustado, 10) || 0) });
        }
    };

    const salvarPv = () => {
        if (pv_texto === "") {
            setPvTexto("0");
            onUpdate({ pv: 0 });
        } else {
            const numero = Math.max(0, parseInt(pv_texto, 10) || 0);
            setPvTexto(String(numero));
            onUpdate({ pv: numero });
        }
    };

    const alterarPvMaxInput = (novo_valor: string) => {
        const valor_ajustado = tratarSubstituicaoZero(novo_valor, pv_max_texto);
        setPvMaxTexto(valor_ajustado);
        if (valor_ajustado !== "") {
            onUpdate({ pvMax: Math.max(0, parseInt(valor_ajustado, 10) || 0) });
        }
    };

    const salvarPvMax = () => {
        if (pv_max_texto === "") {
            setPvMaxTexto("0");
            onUpdate({ pvMax: 0 });
        } else {
            const numero = Math.max(0, parseInt(pv_max_texto, 10) || 0);
            setPvMaxTexto(String(numero));
            onUpdate({ pvMax: numero });
        }
    };

    const aplicarDeltaPv = () => {
        const texto = delta.trim();
        if (!texto) return;
        const numero = parseInt(texto, 10);
        if (!isNaN(numero)) mudarPv(numero);
        setDelta("");
    };

    return (
        <div
            className={cn(
                "relative flex items-center gap-1.5 px-1.5 py-1 transition-colors",
                isAtivo ? "bg-amber-400/25 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
            )}
        >
            <Button
                variant="ghost"
                size="icon-xs"
                className={cn(
                    "size-4 hover:bg-transparent",
                    isAtivo
                        ? "text-gray-950 dark:text-zinc-100"
                        : "text-black/20 hover:text-black/60 dark:text-zinc-700 dark:hover:text-zinc-400"
                )}
                title={isAtivo ? "Turno atual" : "Definir como turno atual"}
                aria-label="Definir turno"
                onClick={onSetTurno}
            >
                <ChevronRight className="size-4" strokeWidth={3} />
            </Button>

            <div className={cn("flex shrink-0 items-center", LARGURA_INICIATIVA)}>
                <Passo delta={-1} onPasso={mudarIniciativaPasso} titulo="Iniciativa −" />
                <input
                    type="number"
                    value={iniciativa_texto}
                    onChange={(e) => alterarIniciativa(e.target.value)}
                    onFocus={selecionarAoFocar}
                    onBlur={salvarIniciativa}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            salvarIniciativa();
                            e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                            e.preventDefault();
                            setIniciativaTexto(String(combatente.iniciativa));
                            e.currentTarget.blur();
                        }
                    }}
                    aria-label="Iniciativa"
                    title="Iniciativa — pressione Enter ou clique fora para salvar"
                    className={cn(
                        "h-6 w-9 border border-black bg-white/80 text-center font-daisy text-base font-bold leading-none tracking-tighter text-gray-950 outline-none focus:border-black dark:border-zinc-600 dark:bg-[#121514] dark:text-zinc-100 dark:focus:border-zinc-300",
                        SEM_SPINNER
                    )}
                />
                <Passo delta={1} onPasso={mudarIniciativaPasso} titulo="Iniciativa +" />
            </div>

            <input
                value={combatente.nome}
                onChange={(e) => onUpdate({ nome: e.target.value })}
                onFocus={(e) => {
                    if (combatente.nome.startsWith("Participante ")) {
                        selecionarAoFocar(e);
                    }
                }}
                placeholder="Nome..."
                className={cn(
                    "min-w-0 flex-1 truncate border-b border-transparent bg-transparent px-1 py-0.5 font-special text-sm font-bold text-gray-900 outline-none focus:border-gray-500 dark:text-zinc-100 dark:focus:border-zinc-600",
                    is_morto && "text-red-600 line-through opacity-50 dark:text-red-400"
                )}
            />

            {mostrarPv && (
                <div className={cn("flex shrink-0 items-center justify-center", LARGURA_PV)}>
                    <Passo delta={-1} onPasso={mudarPv} titulo="PV −" />
                    <div className="flex h-6 items-center border border-black bg-white/80 pr-0.5 dark:bg-[#121514]">
                        <input
                            type="number"
                            value={pv_texto}
                            onChange={(e) => alterarPvInput(e.target.value)}
                            onFocus={selecionarAoFocar}
                            onBlur={salvarPv}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    salvarPv();
                                    e.currentTarget.blur();
                                }
                            }}
                            aria-label="PV atual"
                            title="PV atual"
                            className={cn(
                                "h-full w-8 bg-transparent text-center font-daisy text-base font-bold leading-none tracking-tighter outline-none",
                                SEM_SPINNER
                            )}
                        />
                        <span className="text-xs leading-none text-black/60 dark:text-zinc-600">/</span>
                        <input
                            type="number"
                            value={pv_max_texto}
                            onChange={(e) => alterarPvMaxInput(e.target.value)}
                            onFocus={selecionarAoFocar}
                            onBlur={salvarPvMax}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    salvarPvMax();
                                    e.currentTarget.blur();
                                }
                            }}
                            aria-label="PV máximo"
                            title="PV máximo"
                            className={cn(
                                "h-full w-7 bg-transparent text-center font-daisy text-xs font-bold text-black/50 outline-none dark:text-zinc-400",
                                SEM_SPINNER
                            )}
                        />
                    </div>
                    <Passo delta={1} onPasso={mudarPv} titulo="PV +" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            aplicarDeltaPv();
                        }}
                        className="ml-0.5 flex items-center"
                    >
                        <input
                            value={delta}
                            onChange={(e) => setDelta(tratarSubstituicaoZero(e.target.value, delta))}
                            onFocus={selecionarAoFocar}
                            onBlur={aplicarDeltaPv}
                            placeholder="±"
                            title="Ajuste rápido: digite ex. -10 ou +5 e pressione Enter"
                            className="h-6 w-9 border border-dashed border-gray-500 bg-white/50 text-center font-mono text-[11px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-solid focus:border-black dark:border-zinc-600 dark:bg-[#161a18] dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-300"
                        />
                    </form>
                </div>
            )}

            <Button
                variant="ghost"
                size="icon-xs"
                className="size-5 text-gray-400 hover:bg-transparent hover:text-gray-950 dark:text-zinc-500 dark:hover:bg-transparent dark:hover:text-zinc-100"
                title="Remover participante"
                aria-label="Remover participante"
                onClick={onRemover}
            >
                <X className="size-3" />
            </Button>

            {mostrarPv && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-black/10 dark:bg-white/10">
                    <div className={cn("h-full transition-all", cor_barra)} style={{ width: `${pct_pv}%` }} />
                </div>
            )}
        </div>
    );
}
