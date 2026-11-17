import { useMemo, useState } from "react";
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

const PRETO = "bg-gray-900 text-white hover:bg-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-black";
const ROTULO_BTN = "h-7 px-2.5 font-special text-[11px] uppercase tracking-wider";

const inteiro = (texto: string, minimo = -Infinity) => Math.max(minimo, parseInt(texto, 10) || 0);

/** Clique = ±1, Shift+clique ou clique direito = ±5. */
function Passo({ delta, onPasso, titulo }: { delta: 1 | -1; onPasso: (valor: number) => void; titulo: string }) {
    const sinal = delta > 0 ? "+" : "−";

    return (
        <Button
            className={cn(PRETO, "h-6 w-5")}
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
            nome: `Combatente ${estado.combatentes.length + 1}`,
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
                <div className="flex items-center gap-1">
                    <div
                        className="flex items-baseline gap-1 border-2 border-black/40 bg-white/70 px-1.5 py-px dark:border-zinc-600 dark:bg-[#121514]"
                        title="Rodada atual"
                    >
                        <span className="font-special text-[9px] uppercase tracking-widest text-gray-500 dark:text-zinc-400">Rodada</span>
                        <span className="font-special text-lg font-bold leading-none text-gray-950 dark:text-zinc-100">{estado.rodada}</span>
                    </div>

                    {ordenados.length > 0 && (
                        <Button className={cn(PRETO, ROTULO_BTN, "gap-0.5")} onClick={proximoTurno}>
                            Próx <ChevronRight className="size-3.5" />
                        </Button>
                    )}

                    <Button
                        className={cn(PRETO, "size-7")}
                        title="Reiniciar rodada para 1"
                        aria-label="Reiniciar rodada"
                        onClick={() => onChange({ ...estado, rodada: 1, turnoId: ordenados[0]?.id ?? null })}
                    >
                        <RotateCcw className="size-3" />
                    </Button>
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

                    <Button className={cn(PRETO, ROTULO_BTN, "gap-1")} title="Adicionar combatente" onClick={adicionar}>
                        <Plus className="size-3" strokeWidth={3} />
                        Combatente
                    </Button>

                    {estado.combatentes.length > 0 && (
                        <Button
                            className={cn(PRETO, "size-7")}
                            title="Limpar todos os combatentes"
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
                            Nenhum combatente
                        </p>
                        <p className="max-w-xs text-[11px] text-gray-600 dark:text-zinc-400">
                            Clique em <strong>+ Combatente</strong> para adicionar.
                        </p>
                    </div>
                ) : (
                    ordenados.map((c) => (
                        <LinhaCombatente
                            key={c.id}
                            combatente={c}
                            isAtivo={turnoAtual?.id === c.id}
                            mostrarPv={mostrarPv}
                            onSetTurno={() => onChange({ ...estado, turnoId: c.id })}
                            onUpdate={(updates) => atualizar(c.id, updates)}
                            onRemover={() => remover(c.id)}
                        />
                    ))
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

    const morto = mostrarPv && combatente.pv <= 0;
    const pctPv = combatente.pvMax > 0 ? Math.max(0, Math.min(100, (combatente.pv / combatente.pvMax) * 100)) : 0;

    const corPv = morto
        ? "border-red-500 text-red-600 dark:text-red-400"
        : pctPv <= 25
        ? "border-red-600/70 text-red-700 dark:text-red-300"
        : pctPv <= 50
        ? "border-amber-600/70 text-amber-700 dark:text-amber-300"
        : "border-emerald-700/60 text-emerald-800 dark:text-emerald-300";

    const corBarra = pctPv <= 25 ? "bg-red-500" : pctPv <= 50 ? "bg-amber-500" : "bg-emerald-500";

    const mudarPv = (d: number) => onUpdate({ pv: Math.max(0, combatente.pv + d) });
    const mudarIni = (d: number) => onUpdate({ iniciativa: combatente.iniciativa + d });

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

            <div className="flex shrink-0 items-center gap-px" title="Iniciativa (reordena na hora)">
                <Passo delta={-1} onPasso={mudarIni} titulo="Iniciativa −" />
                <input
                    type="number"
                    value={combatente.iniciativa}
                    onChange={(e) => onUpdate({ iniciativa: inteiro(e.target.value) })}
                    aria-label="Iniciativa"
                    className={cn(
                        "h-6 w-9 border-2 border-black/40 bg-white/80 text-center font-special text-base font-bold leading-none text-gray-950 outline-none focus:border-black dark:border-zinc-600 dark:bg-[#121514] dark:text-zinc-100 dark:focus:border-zinc-300",
                        SEM_SPINNER
                    )}
                />
                <Passo delta={1} onPasso={mudarIni} titulo="Iniciativa +" />
            </div>

            <input
                value={combatente.nome}
                onChange={(e) => onUpdate({ nome: e.target.value })}
                placeholder="Nome..."
                className={cn(
                    "min-w-0 flex-1 truncate border-b border-transparent bg-transparent px-1 py-0.5 font-special text-sm font-bold text-gray-900 outline-none focus:border-gray-500 dark:text-zinc-100 dark:focus:border-zinc-600",
                    morto && "text-red-600 line-through opacity-50 dark:text-red-400"
                )}
            />

            {mostrarPv && (
                <div className="flex shrink-0 items-center gap-px">
                    <Passo delta={-1} onPasso={mudarPv} titulo="PV −" />
                    <div className={cn("flex h-6 items-center border-2 bg-white/80 pr-0.5 dark:bg-[#121514]", corPv)}>
                        <input
                            type="number"
                            value={combatente.pv}
                            onChange={(e) => onUpdate({ pv: inteiro(e.target.value, 0) })}
                            aria-label="PV atual"
                            title="PV atual"
                            className={cn("h-full w-8 bg-transparent text-center font-special text-base font-bold leading-none outline-none", SEM_SPINNER)}
                        />
                        <span className="text-[10px] leading-none text-gray-400 dark:text-zinc-600">/</span>
                        <input
                            type="number"
                            value={combatente.pvMax}
                            onChange={(e) => onUpdate({ pvMax: inteiro(e.target.value, 0) })}
                            aria-label="PV máximo"
                            title="PV máximo"
                            className={cn("h-full w-7 bg-transparent text-center font-mono text-[10px] text-gray-500 outline-none dark:text-zinc-400", SEM_SPINNER)}
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
                            onChange={(e) => setDelta(e.target.value)}
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
                title="Remover combatente"
                aria-label="Remover combatente"
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
