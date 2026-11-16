import { useState, useMemo, useRef } from "react";
import { ChevronRight, RotateCcw, Trash2, User, Skull, X } from "lucide-react";

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
}

const VAZIO: DadosIniciativa = { rodada: 1, turnoId: null, combatentes: [] };

export default function SlotIniciativa({
    dados,
    onChange,
}: {
    dados?: DadosIniciativa;
    onChange: (d: DadosIniciativa) => void;
}) {
    const estado = dados ?? VAZIO;

    // Ordenação automática e reativa por iniciativa decrescente
    const ordenados = useMemo(() => {
        return [...estado.combatentes].sort((a, b) => {
            if (b.iniciativa !== a.iniciativa) return b.iniciativa - a.iniciativa;
            if (a.tipo !== b.tipo) return a.tipo === "jogador" ? -1 : 1;
            return a.nome.localeCompare(b.nome);
        });
    }, [estado.combatentes]);

    const turnoAtual = ordenados.find((c) => c.id === estado.turnoId) ?? ordenados[0] ?? null;

    const adicionarRapido = (tipo: TipoCombatente) => {
        const contagem = estado.combatentes.filter((c) => c.tipo === tipo).length + 1;
        const novo: Combatente = {
            id: crypto.randomUUID(),
            tipo,
            nome: tipo === "jogador" ? `Jogador ${contagem}` : `Ameaça ${contagem}`,
            iniciativa: 10,
            pv: tipo === "jogador" ? 20 : 30,
            pvMax: tipo === "jogador" ? 20 : 30,
        };
        const novaLista = [...estado.combatentes, novo];
        onChange({
            ...estado,
            combatentes: novaLista,
            turnoId: estado.turnoId ?? novo.id,
        });
    };

    const atualizarCombatente = (id: string, updates: Partial<Combatente>) => {
        onChange({
            ...estado,
            combatentes: estado.combatentes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        });
    };

    const remover = (id: string) => {
        const restantes = estado.combatentes.filter((c) => c.id !== id);
        onChange({
            ...estado,
            combatentes: restantes,
            turnoId: estado.turnoId === id ? (restantes[0]?.id ?? null) : estado.turnoId,
        });
    };

    const proximoTurno = () => {
        if (!turnoAtual || ordenados.length === 0) return;
        const indice = ordenados.findIndex((c) => c.id === turnoAtual.id);
        const proximo = (indice + 1) % ordenados.length;
        onChange({
            ...estado,
            turnoId: ordenados[proximo].id,
            rodada: proximo === 0 ? estado.rodada + 1 : estado.rodada,
        });
    };

    const reiniciarRodadas = () => {
        onChange({
            ...estado,
            rodada: 1,
            turnoId: ordenados[0]?.id ?? null,
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col text-gray-900 dark:text-zinc-100">
            {/* Barra superior de controle rápido */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-black/20 bg-black/5 px-3 py-2 dark:border-zinc-800 dark:bg-[#151917]">
                <div className="flex items-center gap-1.5">
                    <span className="font-special text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                        Rodada {estado.rodada}
                    </span>
                    <button
                        onClick={reiniciarRodadas}
                        title="Reiniciar rodada para 1"
                        className="cursor-pointer p-1 text-gray-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
                    >
                        <RotateCcw className="size-3" />
                    </button>
                    {ordenados.length > 0 && (
                        <button
                            onClick={proximoTurno}
                            className="flex cursor-pointer items-center gap-0.5 bg-gray-900 px-2.5 py-1 font-special text-[11px] uppercase tracking-wider text-white transition-colors hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            Próx <ChevronRight className="size-3" />
                        </button>
                    )}
                </div>

                {/* Botões Rápidos estilo Owlbear */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        onClick={() => adicionarRapido("jogador")}
                        className="flex cursor-pointer items-center gap-1 border border-emerald-700/60 bg-emerald-700/10 px-2 py-1 font-special text-[11px] uppercase tracking-wider text-emerald-800 transition-colors hover:bg-emerald-700/20 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                        title="Adicionar Jogador automaticamente"
                    >
                        <User className="size-3 text-emerald-700 dark:text-emerald-400" />
                        + Jogador
                    </button>

                    <button
                        onClick={() => adicionarRapido("inimigo")}
                        className="flex cursor-pointer items-center gap-1 border border-rose-700/60 bg-rose-700/10 px-2 py-1 font-special text-[11px] uppercase tracking-wider text-rose-800 transition-colors hover:bg-rose-700/20 dark:border-rose-500/60 dark:bg-rose-950/40 dark:text-rose-300"
                        title="Adicionar Inimigo / Ameaça automaticamente"
                    >
                        <Skull className="size-3 text-rose-700 dark:text-rose-400" />
                        + Inimigo
                    </button>

                    {estado.combatentes.length > 0 && (
                        <button
                            onClick={() => onChange(VAZIO)}
                            title="Limpar todos os combatentes"
                            className="cursor-pointer p-1 text-gray-500 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 ml-0.5"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Lista Compacta de Combatentes */}
            <div className="min-h-0 flex-1 divide-y divide-black/10 overflow-y-auto px-1.5 py-1 dark:divide-zinc-800/80">
                {ordenados.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <p className="font-special text-xs uppercase tracking-wider text-gray-500 dark:text-zinc-500 mb-2">
                            Nenhum combatente ativo
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-zinc-400 max-w-xs">
                            Clique em <strong>+ Jogador</strong> ou <strong>+ Inimigo</strong> para adicionar instantaneamente.
                        </p>
                    </div>
                ) : (
                    ordenados.map((c) => {
                        const ativo = turnoAtual?.id === c.id;
                        return (
                            <LinhaCombatente
                                key={c.id}
                                combatente={c}
                                isAtivo={ativo}
                                onSetTurno={() => onChange({ ...estado, turnoId: c.id })}
                                onUpdate={(updates) => atualizarCombatente(c.id, updates)}
                                onRemover={() => remover(c.id)}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

function LinhaCombatente({
    combatente,
    isAtivo,
    onSetTurno,
    onUpdate,
    onRemover,
}: {
    combatente: Combatente;
    isAtivo: boolean;
    onSetTurno: () => void;
    onUpdate: (u: Partial<Combatente>) => void;
    onRemover: () => void;
}) {
    const isJogador = combatente.tipo === "jogador";
    const [delta, setDelta] = useState("");
    const inputDeltaRef = useRef<HTMLInputElement>(null);

    const aplicarDelta = () => {
        const texto = delta.trim();
        if (!texto) return;

        const num = parseInt(texto, 10);
        if (!isNaN(num)) {
            const novoPv = Math.max(0, combatente.pv + num);
            onUpdate({ pv: novoPv });
        }
        setDelta("");
    };

    return (
        <div
            className={`flex items-center gap-2 px-2.5 py-2 transition-colors ${
                isAtivo
                    ? "bg-amber-400/20 dark:bg-emerald-950/40 border-l-3 border-amber-700 dark:border-emerald-500"
                    : "hover:bg-black/5 dark:hover:bg-white/5 border-l-3 border-transparent"
            }`}
        >
            {/* Indicador de Turno */}
            <button
                onClick={onSetTurno}
                title={isAtivo ? "Turno atual" : "Definir como turno atual"}
                className={`size-3.5 shrink-0 cursor-pointer rounded-full transition-all ${
                    isAtivo
                        ? "bg-emerald-500 ring-2 ring-emerald-400/50 scale-110"
                        : "bg-stone-400 dark:bg-zinc-600 hover:bg-emerald-400/60"
                }`}
            />

            {/* Iniciativa com botões + e - e sem estilo nativo de spinner */}
            <div className="flex shrink-0 items-center gap-0.5" title="Iniciativa (reordena na hora)">
                <button
                    type="button"
                    onClick={() => onUpdate({ iniciativa: combatente.iniciativa - 1 })}
                    className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 leading-none"
                    title="-1 Iniciativa"
                >
                    -
                </button>
                <input
                    type="number"
                    value={combatente.iniciativa}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdate({ iniciativa: isNaN(val) ? 0 : val });
                    }}
                    className="w-7 border border-gray-400 dark:border-zinc-700 bg-white/80 dark:bg-[#121514] px-0.5 py-0.5 text-center font-special text-xs font-bold text-gray-900 dark:text-emerald-400 outline-none focus:border-black dark:focus:border-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    type="button"
                    onClick={() => onUpdate({ iniciativa: combatente.iniciativa + 1 })}
                    className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 leading-none"
                    title="+1 Iniciativa"
                >
                    +
                </button>
            </div>

            {/* Tipo (Ponto sutil) */}
            <span
                className={`size-2 shrink-0 rounded-full ${
                    isJogador ? "bg-emerald-600 dark:bg-emerald-400" : "bg-rose-600 dark:bg-rose-400"
                }`}
                title={isJogador ? "Jogador" : "Inimigo / Ameaça"}
            />

            {/* Nome editável */}
            <input
                value={combatente.nome}
                onChange={(e) => onUpdate({ nome: e.target.value })}
                className={`min-w-0 flex-1 bg-transparent px-1 py-0.5 font-special text-xs text-gray-900 dark:text-zinc-100 outline-none border-b border-transparent focus:border-gray-500 dark:focus:border-zinc-600 truncate ${
                    combatente.pv <= 0 ? "line-through opacity-50 text-red-600 dark:text-red-400" : ""
                }`}
                placeholder="Nome..."
            />

            {/* Vida Sutil (ao lado do nome, sem barra gigante) */}
            <div className="flex shrink-0 items-center gap-1 text-xs">
                <span className="font-special text-[11px] text-gray-500 dark:text-zinc-500">PV</span>
                <input
                    type="number"
                    value={combatente.pv}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdate({ pv: isNaN(val) ? 0 : Math.max(0, val) });
                    }}
                    className={`w-10 border border-gray-400 dark:border-zinc-700 bg-white/80 dark:bg-[#121514] px-0.5 py-0.5 text-center font-mono text-xs font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        combatente.pv <= 0
                            ? "text-red-600 dark:text-red-400 border-red-500"
                            : "text-gray-900 dark:text-zinc-200"
                    }`}
                    title="PV atual"
                />

                {/* Input de Cálculo rápido (ex: digita -54 ou +10 e aperta Enter) */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        aplicarDelta();
                    }}
                    className="flex items-center"
                >
                    <input
                        ref={inputDeltaRef}
                        value={delta}
                        onChange={(e) => setDelta(e.target.value)}
                        onBlur={aplicarDelta}
                        placeholder="±"
                        title="Altere o PV: digite ex. -54 ou +10 e pressione Enter"
                        className="w-9 border border-dashed border-gray-400 dark:border-zinc-700 bg-white/50 dark:bg-[#161a18] px-0.5 py-0.5 text-center font-mono text-[11px] text-gray-800 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 outline-none focus:border-solid focus:border-black dark:focus:border-emerald-400"
                    />
                </form>

                {/* Botões rápidos + e - de PV */}
                <button
                    type="button"
                    onClick={() => onUpdate({ pv: Math.max(0, combatente.pv - 1) })}
                    className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-95 leading-none"
                    title="-1 PV"
                >
                    -
                </button>
                <button
                    type="button"
                    onClick={() => onUpdate({ pv: combatente.pv + 1 })}
                    className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 leading-none"
                    title="+1 PV"
                >
                    +
                </button>
            </div>

            {/* Botão Remover */}
            <button
                type="button"
                onClick={onRemover}
                className="cursor-pointer text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 p-0.5 ml-0.5"
                title="Remover combatente"
            >
                <X className="size-3" />
            </button>
        </div>
    );
}
