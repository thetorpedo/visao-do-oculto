import { useEffect, useMemo, useState, type FocusEvent } from "react";
import { ChevronRight, Heart, Minus, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const PRETO = "bg-black text-white hover:bg-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-black border-0";
const ROTULO_BTN = "h-7 px-2.5 font-special text-[11px] uppercase tracking-wider";
const ROTULO_COLUNA = "font-daisy text-xs uppercase tracking-tight text-black/60 dark:text-zinc-400";
const LARGURA_INICIATIVA = "w-[4.75rem]";
const LARGURA_PV = "w-[9.25rem]";

const tratarSubstituicaoZero = (novoTexto: string, textoAnterior: string): string => {
    let val = novoTexto.trim();
    if (textoAnterior === "0") {
        if (/^[+-]?[1-9]0$/.test(val)) val = val.slice(0, -1);
        else if (/^[+-]?0[0-9]+$/.test(val)) val = val.replace(/^([+-]?)0+/, "$1") || "0";
    } else if (/^[+-]?0[0-9]+$/.test(val)) {
        val = val.replace(/^([+-]?)0+/, "$1") || "0";
    }
    return val;
};

const selecionarAoFocar = (e: FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    el.select();
    requestAnimationFrame(() => el.select());
};

/** Clique = ±1, Shift+clique ou clique direito = ±5. */
function Passo({ delta, onPasso, titulo }: { delta: 1 | -1; onPasso: (valor: number) => void; titulo: string }) {
    const sinal = delta > 0 ? "+" : "−";

    return (
        <Button
            className={cn(PRETO, "h-6 w-5 border-0!")}
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

export default function SlotIniciativa({ dados, onChange }: { dados?: DadosIniciativa; onChange: (d: DadosIniciativa) => void }) {
    const estado = dados ?? VAZIO;
    const mostrarPv = estado.mostrarPv ?? true;

    const ordenados = useMemo(
        () =>
            [...estado.combatentes].sort((a, b) =>
                b.iniciativa !== a.iniciativa ? b.iniciativa - a.iniciativa : a.nome.localeCompare(b.nome)
            ),
        [estado.combatentes]
    );

    const turnoAtual = ordenados.find((c) => c.id === estado.turnoId) ?? ordenados[0] ?? null;

    const adicionar = () => {
        const novo: Combatente = {
            id: crypto.randomUUID(),
            tipo: "jogador",
            nome: `Participante ${estado.combatentes.length + 1}`,
            iniciativa: 10,
            pv: 20,
            pvMax: 20,
        };
        onChange({ ...estado, combatentes: [...estado.combatentes, novo], turnoId: estado.turnoId ?? novo.id });
    };

    const atualizar = (id: string, updates: Partial<Combatente>) =>
        onChange({
            ...estado,
            combatentes: estado.combatentes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        });

    const remover = (id: string) => {
        const restantes = estado.combatentes.filter((c) => c.id !== id);
        onChange({
            ...estado,
            combatentes: restantes,
            turnoId: estado.turnoId === id ? (restantes[0]?.id ?? null) : estado.turnoId,
        });
    };

    const proximoTurno = () => {
        if (!turnoAtual) return;
        const proximo = (ordenados.findIndex((c) => c.id === turnoAtual.id) + 1) % ordenados.length;
        onChange({
            ...estado,
            turnoId: ordenados[proximo].id,
            rodada: proximo === 0 ? estado.rodada + 1 : estado.rodada,
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col text-gray-900 dark:text-zinc-100">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-black/20 bg-black/5 px-2 py-1.5 dark:border-zinc-800 dark:bg-[#151917]">
                <div className="flex items-center gap-1 h-full ">
                    <div
                        className="flex  gap-1 h-full items-end  border border-dashed  border-black/40 bg-white/50 px-1.5 py-px dark:border-zinc-600 dark:bg-[#121514]"
                    >
                        <span className="font-daisy text-xs -mt-0.5 uppercase tracking-tight text-black/80 dark:text-zinc-400">Rodada</span>
                        <span className="font-special text-lg  pb-0.5 font-bold leading-none text-gray-950 dark:text-zinc-100">{estado.rodada}</span>
                    </div>

                    <Button
                        className={cn(PRETO, "size-7")}
                        title="Reiniciar rodada para 1"
                        aria-label="Reiniciar rodada"
                        onClick={() => onChange({ ...estado, rodada: 1, turnoId: ordenados[0]?.id ?? null })}
                    >
                        <RotateCcw className="size-3" />
                    </Button>

                    {ordenados.length > 0 && (
                        <Button className={cn(PRETO, ROTULO_BTN, "gap-0.5")} onClick={proximoTurno}>
                            Próx <ChevronRight className="size-3.5" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant={mostrarPv ? "default" : "outline"}
                        className={cn(
                            ROTULO_BTN,
                            "gap-1",
                            mostrarPv
                                ? PRETO
                                : "border-solid border-black/40 text-gray-500 hover:bg-black/10 dark:border-zinc-700 dark:text-zinc-500 dark:hover:bg-white/10"
                        )}
                        title={mostrarPv ? "Desligar contador de vida" : "Ligar contador de vida"}
                        aria-pressed={mostrarPv}
                        onClick={() => onChange({ ...estado, mostrarPv: !mostrarPv })}
                    >
                        <Heart className="size-3" fill={mostrarPv ? "currentColor" : "none"} />
                        PV
                    </Button>

                    <Button className={cn(PRETO, ROTULO_BTN, "gap-1 border-0")} title="Adicionar participante" onClick={adicionar}>
                        <Plus className="size-3" strokeWidth={3} />
                        Participante
                    </Button>

                    {estado.combatentes.length > 0 && (
                        <Button
                            className="size-7"
                            variant="outline"
                            title="Limpar todos os participantes"
                            aria-label="Limpar todos"
                            onClick={() => onChange({ ...VAZIO, mostrarPv })}
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-black/10 overflow-y-auto dark:divide-zinc-800/80">
                {ordenados.length === 0 ? (
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
                            <span className={cn(ROTULO_COLUNA, LARGURA_INICIATIVA, "shrink-0 text-center")}>Iniciativa</span>
                            <span className={cn(ROTULO_COLUNA, "min-w-0 flex-1 px-1")}>Nome</span>
                            {mostrarPv && <span className={cn(ROTULO_COLUNA, LARGURA_PV, "shrink-0 text-center")}>Vida</span>}
                            <span className="w-5 shrink-0" />
                        </div>

                        {ordenados.map((c) => (
                            <LinhaCombatente
                                key={c.id}
                                combatente={c}
                                isAtivo={turnoAtual?.id === c.id}
                                mostrarPv={mostrarPv}
                                onSetTurno={() => onChange({ ...estado, turnoId: c.id })}
                                onUpdate={(updates) => atualizar(c.id, updates)}
                                onRemover={() => remover(c.id)}
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
    onUpdate: (u: Partial<Combatente>) => void;
    onRemover: () => void;
}

function LinhaCombatente({ combatente, isAtivo, mostrarPv, onSetTurno, onUpdate, onRemover }: LinhaCombatenteProps) {
    const [delta, setDelta] = useState("");
    const [iniciativaTexto, setIniciativaTexto] = useState(String(combatente.iniciativa));
    const [pvTexto, setPvTexto] = useState(String(combatente.pv));
    const [pvMaxTexto, setPvMaxTexto] = useState(String(combatente.pvMax));

    useEffect(() => {
        setIniciativaTexto(String(combatente.iniciativa));
    }, [combatente.iniciativa]);

    useEffect(() => {
        setPvTexto(String(combatente.pv));
    }, [combatente.pv]);

    useEffect(() => {
        setPvMaxTexto(String(combatente.pvMax));
    }, [combatente.pvMax]);

    const morto = mostrarPv && combatente.pv <= 0;
    const pctPv = combatente.pvMax > 0 ? Math.max(0, Math.min(100, (combatente.pv / combatente.pvMax) * 100)) : 0;

    const corBarra = pctPv <= 25 ? "bg-red-500" : pctPv <= 50 ? "bg-amber-500" : "bg-emerald-500";

    const mudarPv = (d: number) => onUpdate({ pv: Math.max(0, combatente.pv + d) });
    const mudarIni = (d: number) => onUpdate({ iniciativa: combatente.iniciativa + d });

    const mudarIniciativa = (novo: string) => {
        setIniciativaTexto(tratarSubstituicaoZero(novo, iniciativaTexto));
    };

    const salvarIniciativa = () => {
        const limpo = iniciativaTexto.trim();
        const num = parseInt(limpo, 10);
        const valorFinal = isNaN(num) ? combatente.iniciativa : num;
        setIniciativaTexto(String(valorFinal));
        if (valorFinal !== combatente.iniciativa) {
            onUpdate({ iniciativa: valorFinal });
        }
    };

    const mudarPvInput = (novo: string) => {
        const val = tratarSubstituicaoZero(novo, pvTexto);
        setPvTexto(val);
        if (val !== "") {
            onUpdate({ pv: Math.max(0, parseInt(val, 10) || 0) });
        }
    };

    const salvarPv = () => {
        if (pvTexto === "") {
            setPvTexto("0");
            onUpdate({ pv: 0 });
        } else {
            const num = Math.max(0, parseInt(pvTexto, 10) || 0);
            setPvTexto(String(num));
            onUpdate({ pv: num });
        }
    };

    const mudarPvMaxInput = (novo: string) => {
        const val = tratarSubstituicaoZero(novo, pvMaxTexto);
        setPvMaxTexto(val);
        if (val !== "") {
            onUpdate({ pvMax: Math.max(0, parseInt(val, 10) || 0) });
        }
    };

    const salvarPvMax = () => {
        if (pvMaxTexto === "") {
            setPvMaxTexto("0");
            onUpdate({ pvMax: 0 });
        } else {
            const num = Math.max(0, parseInt(pvMaxTexto, 10) || 0);
            setPvMaxTexto(String(num));
            onUpdate({ pvMax: num });
        }
    };

    const aplicarDelta = () => {
        const texto = delta.trim();
        if (!texto) return;
        const num = parseInt(texto, 10);
        if (!isNaN(num)) mudarPv(num);
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

            <div className={cn("flex shrink-0 items-center", LARGURA_INICIATIVA)} title="Iniciativa (reordena ao sair ou dar Enter)">
                <Passo delta={-1} onPasso={mudarIni} titulo="Iniciativa −" />
                <input
                    type="number"
                    value={iniciativaTexto}
                    onChange={(e) => mudarIniciativa(e.target.value)}
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
                    title="Iniciativa — pressione Enter ou clique fora para reordenar"
                    className={cn(
                        "h-6 w-9 border border-black bg-white/80 text-center font-daisy tracking-tighter text-base font-bold leading-none text-gray-950 outline-none focus:border-black dark:border-zinc-600 dark:bg-[#121514] dark:text-zinc-100 dark:focus:border-zinc-300",
                        SEM_SPINNER
                    )}
                />
                <Passo delta={1} onPasso={mudarIni} titulo="Iniciativa +" />
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
                    morto && "text-red-600 line-through opacity-50 dark:text-red-400"
                )}
            />

            {mostrarPv && (
                <div className={cn("flex shrink-0 items-center justify-center", LARGURA_PV)}>
                    <Passo delta={-1} onPasso={mudarPv} titulo="PV −" />
                    <div className="flex h-6 items-center border border-black bg-white/80 pr-0.5 dark:bg-[#121514]">
                        <input
                            type="number"
                            value={pvTexto}
                            onChange={(e) => mudarPvInput(e.target.value)}
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
                            className={cn("h-full w-8 bg-transparent text-center font-daisy tracking-tighter text-base font-bold leading-none outline-none", SEM_SPINNER)}
                        />
                        <span className="text-xs leading-none text-black/60 dark:text-zinc-600">/</span>
                        <input
                            type="number"
                            value={pvMaxTexto}
                            onChange={(e) => mudarPvMaxInput(e.target.value)}
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
                            className={cn("h-full w-7 bg-transparent text-center font-daisy font-bold text-xs text-black/50 outline-none dark:text-zinc-400", SEM_SPINNER)}
                        />
                    </div>
                    <Passo delta={1} onPasso={mudarPv} titulo="PV +" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            aplicarDelta();
                        }}
                        className="ml-0.5 flex items-center"
                    >
                        <input
                            value={delta}
                            onChange={(e) => setDelta(tratarSubstituicaoZero(e.target.value, delta))}
                            onFocus={selecionarAoFocar}
                            onBlur={aplicarDelta}
                            placeholder="±"
                            title="Ajuste rápido: digite ex. -54 ou +10 e pressione Enter"
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
                    <div className={cn("h-full transition-all", corBarra)} style={{ width: `${pctPv}%` }} />
                </div>
            )}
        </div>
    );
}