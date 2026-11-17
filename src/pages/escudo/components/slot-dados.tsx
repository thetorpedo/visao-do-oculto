import { Dices, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import IconeDado from "./icone-dado";

const DADOS_DISPONIVEIS = [20, 4, 6, 8, 10, 12, 100] as const;
const MAX_POR_DADO = 50;
const MAX_HISTORICO = 30;

export interface Rolagem {
    id: string;
    total: number;
    detalhe: string;
    formula: string;
    d20s?: { valor: number; mantido: boolean }[];
    outrosDados?: { dado: string; valor: number }[];
    modificador: number;
    critico?: boolean;
    desastre?: boolean;
}

export interface DadosRolador {
    pool?: Record<number, number>;
    modificador?: number;
    pegarMelhorD20?: boolean;
    historico: Rolagem[];
}

type Pool = Record<number, number>;

const VAZIO: DadosRolador = { pool: { 20: 1 }, modificador: 0, pegarMelhorD20: true, historico: [] };

const MOD_NEGATIVO = "border-red-700/50 bg-red-500/10 text-red-800 hover:bg-red-500/25 dark:border-red-500/50 dark:text-red-300";
const MOD_POSITIVO =
    "border-emerald-700/50 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/25 dark:border-emerald-500/50 dark:text-emerald-300";

const entradasOrdenadas = (pool: Pool): [number, number][] =>
    DADOS_DISPONIVEIS.filter((f) => (pool[f] ?? 0) > 0).map((f) => [f, pool[f]]);

function montarFormula(pool: Pool, mod: number): string {
    const texto = entradasOrdenadas(pool)
        .map(([f, q]) => `${q}d${f}`)
        .join(" + ");
    if (mod === 0) return texto;
    return `${texto} ${mod > 0 ? "+" : "-"} ${Math.abs(mod)}`;
}

const rolarDado = (faces: number) => Math.floor(Math.random() * faces) + 1;
const somar = (valores: number[]) => valores.reduce((s, v) => s + v, 0);

function rolarPool(pool: Pool, modificador: number, manterMaiorD20: boolean): Rolagem {
    const d20s: { valor: number; mantido: boolean }[] = [];
    const outrosDados: { dado: string; valor: number }[] = [];
    const partes: string[] = [];
    let total = 0;

    for (const [faces, qtd] of entradasOrdenadas(pool)) {
        const valores = Array.from({ length: qtd }, () => rolarDado(faces));

        if (faces === 20) {
            const maior = Math.max(...valores);
            const descartar = manterMaiorD20 && qtd > 1;
            let maiorUsado = false;
            for (const valor of valores) {
                const mantido = !descartar || (valor === maior && !maiorUsado);
                if (descartar && mantido) maiorUsado = true;
                d20s.push({ valor, mantido });
            }
            total += descartar ? maior : somar(valores);
            partes.push(`${qtd}d20 [${valores.join(", ")}]${descartar ? ` (maior: ${maior})` : ""}`);
        } else {
            total += somar(valores);
            valores.forEach((valor) => outrosDados.push({ dado: `d${faces}`, valor }));
            partes.push(`${qtd}d${faces} [${valores.join(", ")}]`);
        }
    }

    if (modificador !== 0) {
        total += modificador;
        partes.push(modificador > 0 ? `+${modificador}` : `${modificador}`);
    }

    return {
        id: crypto.randomUUID(),
        total,
        detalhe: partes.join(" + ").replace(/\+ -/g, "- "),
        formula: montarFormula(pool, modificador),
        d20s,
        outrosDados,
        modificador,
        critico: d20s.some((d) => d.mantido && d.valor === 20),
        desastre: d20s.length > 0 && d20s.every((d) => !d.mantido || d.valor === 1),
    };
}

function SeletorDado({ faces, qtd, onAjustar }: { faces: number; qtd: number; onAjustar: (delta: number) => void }) {
    const ativo = qtd > 0;

    return (
        <div
            className={cn(
                "relative flex flex-col border transition-all",
                ativo
                    ? "border-amber-700 bg-amber-400/25 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/40"
                    : "border-black/20 bg-white/40 hover:border-black/40 hover:bg-white/70 dark:border-zinc-800 dark:bg-[#121514] dark:hover:border-zinc-600"
            )}
        >
            <button
                type="button"
                onClick={() => onAjustar(1)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onAjustar(-1);
                }}
                className="group flex w-full cursor-pointer select-none flex-col items-center gap-px px-0.5 pb-0.5 pt-1.5 active:scale-95"
                title={`d${faces} — clique esquerdo: +1 · clique direito: −1`}
            >
                <IconeDado
                    faces={faces}
                    className={cn(
                        "size-6 transition-transform group-hover:scale-110",
                        ativo ? "text-amber-800 dark:text-emerald-400" : "text-gray-500 dark:text-zinc-500"
                    )}
                />
                <span className="font-special text-[10px] font-bold uppercase leading-none">d{faces}</span>
            </button>

            {ativo && (
                <span className="pointer-events-none absolute -right-1 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-700 px-1 font-mono text-[10px] font-bold text-white shadow dark:bg-emerald-500 dark:text-zinc-950">
                    {qtd}
                </span>
            )}

            <div className="grid grid-cols-2 border-t border-black/15 dark:border-zinc-800">
                <Button
                    variant="ghost"
                    className="h-6 border-r border-black/15 hover:bg-red-500/15 hover:text-red-700 disabled:opacity-25 dark:border-zinc-800 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                    disabled={!ativo}
                    aria-label={`Remover d${faces}`}
                    onClick={() => onAjustar(-1)}
                >
                    <Minus className="size-3" strokeWidth={3} />
                </Button>
                <Button
                    variant="ghost"
                    className="h-6 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
                    aria-label={`Adicionar d${faces}`}
                    onClick={() => onAjustar(1)}
                >
                    <Plus className="size-3" strokeWidth={3} />
                </Button>
            </div>
        </div>
    );
}

function Resultado({ rolagem }: { rolagem: Rolagem }) {
    const { total, formula, d20s, outrosDados, modificador, critico, desastre } = rolagem;

    return (
        <div
            className={cn(
                "flex shrink-0 items-center gap-3 border-2 px-2.5 py-2 transition-all",
                critico
                    ? "border-amber-600 bg-amber-400/20 dark:border-amber-500 dark:bg-amber-950/40"
                    : desastre
                    ? "border-red-600 bg-red-400/20 dark:border-red-500 dark:bg-red-950/40"
                    : "border-black/50 bg-white/80 dark:border-emerald-500/60 dark:bg-[#161a18]"
            )}
        >
            <div className="min-w-14 text-center font-special text-4xl font-bold leading-none text-gray-950 dark:text-zinc-100">
                {total}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-mono text-[10px] text-gray-600 dark:text-zinc-400">{formula}</span>

                <div className="flex flex-wrap items-center gap-1">
                    {d20s?.map((d, i) => (
                        <span
                            key={`d20-${i}`}
                            title={d.mantido ? "d20 mantido" : "d20 descartado"}
                            className={cn(
                                "inline-flex items-center gap-0.5 border px-1 py-px font-special text-[11px]",
                                d.mantido
                                    ? "border-emerald-600 bg-emerald-600/20 font-bold text-emerald-900 dark:text-emerald-300"
                                    : "border-gray-400 bg-black/5 text-gray-400 line-through opacity-50 dark:border-zinc-700 dark:text-zinc-500"
                            )}
                        >
                            <IconeDado faces={20} className="size-3 shrink-0" />
                            {d.valor}
                        </span>
                    ))}

                    {outrosDados?.map((d, i) => (
                        <span
                            key={`outro-${i}`}
                            title={d.dado}
                            className="inline-flex items-center gap-0.5 border border-sky-600/60 bg-sky-600/10 px-1 py-px font-special text-[11px] text-sky-900 dark:text-sky-300"
                        >
                            <IconeDado faces={parseInt(d.dado.slice(1), 10) || 6} className="size-3 shrink-0" />
                            {d.valor}
                        </span>
                    ))}

                    {modificador !== 0 && (
                        <span
                            className={cn(
                                "border px-1 py-px font-mono text-[11px] font-bold",
                                modificador > 0
                                    ? "border-emerald-600/60 text-emerald-700 dark:text-emerald-300"
                                    : "border-red-600/60 text-red-700 dark:text-red-300"
                            )}
                        >
                            {modificador > 0 ? `+${modificador}` : modificador}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SlotDados({ dados, onChange }: { dados?: DadosRolador; onChange: (d: DadosRolador) => void }) {
    const estado = dados ?? VAZIO;
    const pool = estado.pool ?? {};
    const modificador = estado.modificador ?? 0;
    const pegarMelhorD20 = estado.pegarMelhorD20 ?? true;

    const setModificador = (mod: number) => onChange({ ...estado, modificador: mod });

    const ajustarDado = (faces: number, delta: number) => {
        const atual = pool[faces] ?? 0;
        const novo = Math.max(0, Math.min(MAX_POR_DADO, atual + delta));
        if (novo === atual) return;
        const atualizado = { ...pool, [faces]: novo };
        if (novo === 0) delete atualizado[faces];
        onChange({ ...estado, pool: atualizado });
    };

    const totalDados = Object.values(pool).reduce((acc, q) => acc + q, 0);
    const poolEfetivo: Pool = totalDados > 0 ? pool : { 20: 1 };
    const equacao = montarFormula(poolEfetivo, modificador);
    const ultima = estado.historico[0];

    const rolar = () =>
        onChange({
            ...estado,
            historico: [rolarPool(poolEfetivo, modificador, pegarMelhorD20), ...estado.historico].slice(0, MAX_HISTORICO),
        });

    const corModificador =
        modificador > 0
            ? "border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300"
            : modificador < 0
            ? "border-red-600 bg-red-500/15 text-red-700 dark:border-red-500 dark:text-red-300"
            : "border-gray-400 bg-white/60 text-gray-500 dark:border-zinc-700 dark:bg-[#121514] dark:text-zinc-400";

    const botaoMod = (delta: number) => (
        <Button
            key={delta}
            variant="outline"
            className={cn("h-8 min-w-9 border-solid px-1.5 font-mono text-xs font-bold", delta < 0 ? MOD_NEGATIVO : MOD_POSITIVO)}
            onClick={() => setModificador(modificador + delta)}
        >
            {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
        </Button>
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-2 text-gray-900 sm:p-2.5 dark:text-zinc-100">
            <div className="grid shrink-0 grid-cols-7 gap-1">
                {DADOS_DISPONIVEIS.map((faces) => (
                    <SeletorDado key={faces} faces={faces} qtd={pool[faces] ?? 0} onAjustar={(d) => ajustarDado(faces, d)} />
                ))}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-black/15 py-2 sm:justify-between dark:border-zinc-800">
                <div className="flex items-stretch justify-center gap-1">
                    {[-5, -1].map(botaoMod)}
                    <Input
                        type="number"
                        value={modificador}
                        onChange={(e) => setModificador(parseInt(e.target.value, 10) || 0)}
                        aria-label="Modificador"
                        className={cn(
                            "h-8 w-16 border-2 px-0 text-center font-special text-xl font-bold leading-none [appearance:textfield] md:text-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                            corModificador
                        )}
                    />
                    {[1, 5].map(botaoMod)}
                </div>

                <label className="flex cursor-pointer select-none items-center gap-1.5">
                    <input
                        type="checkbox"
                        checked={pegarMelhorD20}
                        onChange={(e) => onChange({ ...estado, pegarMelhorD20: e.target.checked })}
                        className="size-3.5 cursor-pointer accent-emerald-600"
                    />
                    <span className="font-special text-[10px] uppercase tracking-wide text-gray-800 dark:text-zinc-200">
                        Manter maior d20
                    </span>
                </label>
            </div>

            <div className="flex shrink-0 gap-1.5">
                <Button
                    className="h-auto min-w-0 flex-1 gap-2 border-black/50 py-2 uppercase tracking-widest shadow-md dark:border-emerald-500/60 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
                    title={`Rolar ${equacao}`}
                    onClick={rolar}
                >
                    <Dices className="shrink-0" />
                    <span className="shrink-0">Rolar</span>
                    <span className="truncate font-mono normal-case tracking-normal opacity-80">{equacao}</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-auto w-9 border-solid border-black/30 hover:border-red-700/60 hover:bg-red-500/10 hover:text-red-700 dark:border-zinc-700 dark:hover:text-red-400"
                    disabled={totalDados === 0 && modificador === 0}
                    title="Zerar dados e bônus"
                    aria-label="Reset"
                    onClick={() => onChange({ ...estado, pool: {}, modificador: 0 })}
                >
                    <RotateCcw />
                </Button>
            </div>

            {ultima && <Resultado rolagem={ultima} />}

            {estado.historico.length > 1 && (
                <div className="shrink-0">
                    <div className="mb-1 flex items-center justify-between border-b border-black/15 pb-1 dark:border-zinc-800">
                        <span className="font-special text-[10px] uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            Histórico Recente
                        </span>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="h-5 px-1 text-[10px] uppercase text-gray-500 hover:bg-transparent hover:text-red-700 dark:text-zinc-400 dark:hover:bg-transparent dark:hover:text-red-400"
                            onClick={() => onChange({ ...estado, historico: [] })}
                        >
                            <Trash2 />
                            Limpar
                        </Button>
                    </div>
                    <ul className="space-y-0.5">
                        {estado.historico.slice(1).map((r) => (
                            <li
                                key={r.id}
                                className="flex items-baseline justify-between gap-2 border-b border-black/10 py-0.5 text-xs text-gray-700 dark:border-zinc-800/60 dark:text-zinc-300"
                            >
                                <span className="truncate font-mono text-[10px]">
                                    {r.formula} → {r.detalhe}
                                </span>
                                <strong className="shrink-0 font-special text-sm text-gray-900 dark:text-emerald-300">{r.total}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
