import { Dices, RotateCcw, Trash2, Sparkles } from "lucide-react";

const DADOS_DISPONIVEIS = [20, 4, 6, 8, 10, 12, 100] as const;

function IconeDado({ faces, className = "size-5" }: { faces: number; className?: string }) {
    switch (faces) {
        case 4:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="12 3 2 21 22 21" />
                    <line x1="12" y1="3" x2="12" y2="21" opacity="0.5" strokeDasharray="2 2" />
                </svg>
            );
        case 6:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
                    <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
                    <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" />
                </svg>
            );
        case 8:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="12 2 21 12 12 22 3 12" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="22" opacity="0.5" />
                </svg>
            );
        case 10:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="12 2 20 8 16 22 8 22 4 8" />
                    <line x1="12" y1="2" x2="12" y2="22" opacity="0.6" />
                    <line x1="4" y1="8" x2="20" y2="8" opacity="0.5" />
                </svg>
            );
        case 12:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="12 2 22 9 18 21 6 21 2 9" />
                    <polygon points="12 7 17 11 15 17 9 17 7 11" opacity="0.6" />
                </svg>
            );
        case 20:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
                    <polygon points="12 6 18 16 6 16" opacity="0.6" />
                    <line x1="12" y1="2" x2="12" y2="6" opacity="0.5" />
                    <line x1="2" y1="8" x2="6" y2="16" opacity="0.5" />
                    <line x1="22" y1="8" x2="18" y2="16" opacity="0.5" />
                </svg>
            );
        case 100:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <circle cx="12" cy="12" r="9" />
                    <line x1="16" y1="8" x2="8" y2="16" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
                </svg>
            );
        default:
            return null;
    }
}

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

const VAZIO: DadosRolador = {
    pool: { 20: 1 },
    modificador: 0,
    pegarMelhorD20: true,
    historico: [],
};

export default function SlotDados({
    dados,
    onChange,
}: {
    dados?: DadosRolador;
    onChange: (d: DadosRolador) => void;
}) {
    const estado = dados ?? VAZIO;
    const pool = estado.pool ?? {};
    const modificador = estado.modificador ?? 0;
    const pegarMelhorD20 = estado.pegarMelhorD20 ?? true;

    const setPool = (novoPool: Record<number, number>) => {
        onChange({ ...estado, pool: novoPool });
    };

    const setModificador = (mod: number) => {
        onChange({ ...estado, modificador: mod });
    };

    const setPegarMelhor = (val: boolean) => {
        onChange({ ...estado, pegarMelhorD20: val });
    };

    const adicionarDado = (faces: number, delta: number = 1) => {
        const atual = pool[faces] ?? 0;
        const novo = Math.max(0, atual + delta);
        const atualizado = { ...pool };
        if (novo === 0) {
            delete atualizado[faces];
        } else {
            atualizado[faces] = Math.min(novo, 50);
        }
        setPool(atualizado);
    };

    // Reset limpa completamente os dados selecionados e bônus
    const limparPool = () => {
        setPool({});
        setModificador(0);
    };

    const totalDadosNoPool = Object.values(pool).reduce((acc, q) => acc + q, 0);

    const rolar = () => {
        // Se nenhum dado foi selecionado, rola 1d20 por padrão
        const poolEfetivo = totalDadosNoPool > 0 ? pool : { 20: 1 };
        const dadosAtivos = Object.entries(poolEfetivo).filter(([_, qtd]) => qtd > 0);

        let total = 0;
        const d20s: { valor: number; mantido: boolean }[] = [];
        const outrosDados: { dado: string; valor: number }[] = [];
        const partesFormula: string[] = [];

        // Rolar d20s
        const qtdD20 = poolEfetivo[20] ?? 0;
        let d20Subtotal = 0;
        if (qtdD20 > 0) {
            const rolagensD20: number[] = Array.from(
                { length: qtdD20 },
                () => Math.floor(Math.random() * 20) + 1
            );

            if (pegarMelhorD20 && qtdD20 > 1) {
                const maior = Math.max(...rolagensD20);
                let primeiroMaior = true;
                for (const val of rolagensD20) {
                    const mantido = val === maior && primeiroMaior;
                    if (mantido) primeiroMaior = false;
                    d20s.push({ valor: val, mantido });
                }
                d20Subtotal = maior;
                partesFormula.push(`${qtdD20}d20 [${rolagensD20.join(", ")}] (maior: ${maior})`);
            } else {
                for (const val of rolagensD20) {
                    d20s.push({ valor: val, mantido: true });
                }
                d20Subtotal = rolagensD20.reduce((s, v) => s + v, 0);
                partesFormula.push(`${qtdD20}d20 [${rolagensD20.join(", ")}]`);
            }
            total += d20Subtotal;
        }

        // Rolar outros dados
        for (const [facesStr, qtd] of dadosAtivos) {
            const faces = parseInt(facesStr, 10);
            if (faces === 20 || qtd <= 0) continue;

            const rolagens: number[] = Array.from(
                { length: qtd },
                () => Math.floor(Math.random() * faces) + 1
            );
            const sub = rolagens.reduce((s, v) => s + v, 0);
            total += sub;
            for (const v of rolagens) {
                outrosDados.push({ dado: `d${faces}`, valor: v });
            }
            partesFormula.push(`${qtd}d${faces} [${rolagens.join(", ")}]`);
        }

        // Bônus/Penalidade
        if (modificador !== 0) {
            total += modificador;
            partesFormula.push(modificador > 0 ? `+${modificador}` : `${modificador}`);
        }

        const critico = d20s.some((d) => d.mantido && d.valor === 20);
        const desastre = d20s.length > 0 && d20s.every((d) => !d.mantido || d.valor === 1);

        const novaRolagem: Rolagem = {
            id: crypto.randomUUID(),
            total,
            detalhe: partesFormula.join(" + ").replace(/\+ -/g, "- "),
            formula: `${Object.entries(poolEfetivo)
                .filter(([_, q]) => q > 0)
                .map(([f, q]) => `${q}d${f}`)
                .join(" + ")}${modificador !== 0 ? (modificador > 0 ? ` + ${modificador}` : ` - ${Math.abs(modificador)}`) : ""}`,
            d20s,
            outrosDados,
            modificador,
            critico,
            desastre,
        };

        onChange({
            ...estado,
            historico: [novaRolagem, ...estado.historico].slice(0, 30),
        });
    };

    const ultima = estado.historico[0];

    return (
        <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto p-3 text-gray-900 dark:text-zinc-100 sm:p-3.5">
            {/* Seletor de Dados com Ícones estilo WitchDice */}
            <div className="flex flex-col gap-2 border-b border-black/15 pb-2.5 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-special text-[11px] uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                        Pool de Dados:
                    </span>
                    {(totalDadosNoPool > 0 || modificador !== 0) && (
                        <button
                            type="button"
                            onClick={limparPool}
                            className="cursor-pointer text-[11px] text-gray-600 hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400 flex items-center gap-1 font-special uppercase"
                            title="Zerar todos os dados e bônus selecionados"
                        >
                            <RotateCcw className="size-3" /> Reset
                        </button>
                    )}
                </div>

                {/* Grade de Dados com Ícones e Contadores */}
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                    {DADOS_DISPONIVEIS.map((faces) => {
                        const qtd = pool[faces] ?? 0;
                        const isD20 = faces === 20;
                        return (
                            <div
                                key={faces}
                                className={`flex min-h-[82px] flex-col items-center justify-between border p-1.5 transition-colors ${
                                    qtd > 0
                                        ? isD20
                                            ? "border-amber-700 dark:border-emerald-500 bg-amber-400/25 dark:bg-emerald-950/40 shadow-xs"
                                            : "border-gray-500/70 bg-white/80 shadow-xs dark:border-zinc-600 dark:bg-[#161a18]"
                                        : "border-black/20 bg-white/40 opacity-80 hover:opacity-100 dark:border-zinc-800 dark:bg-[#121514]"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => adicionarDado(faces, 1)}
                                    className="group flex w-full cursor-pointer flex-col items-center py-1 text-center"
                                    title={`Adicionar d${faces}`}
                                >
                                    <IconeDado
                                        faces={faces}
                                        className={`size-5 transition-transform group-hover:scale-110 ${
                                            qtd > 0
                                                ? isD20
                                                    ? "text-amber-800 dark:text-emerald-400 stroke-2"
                                                    : "text-gray-900 dark:text-zinc-200 stroke-2"
                                                : "text-gray-600 dark:text-zinc-400 stroke-[1.5]"
                                        }`}
                                    />
                                    <span className="font-special text-[11px] uppercase font-bold mt-0.5 leading-none">
                                        d{faces}
                                    </span>
                                </button>

                                <div className="mt-1 flex w-full items-center justify-between gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => adicionarDado(faces, -1)}
                                        disabled={qtd === 0}
                                        className="flex size-5 shrink-0 cursor-pointer items-center justify-center border border-black/20 text-[10px] leading-none transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-white/10"
                                    >
                                        -
                                    </button>
                                    <span
                                        className={`font-mono text-xs font-bold px-0.5 ${
                                            qtd > 0
                                                ? isD20
                                                    ? "text-amber-900 dark:text-emerald-300"
                                                    : "text-gray-900 dark:text-zinc-100"
                                                : "text-gray-400 dark:text-zinc-500"
                                        }`}
                                    >
                                        {qtd}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => adicionarDado(faces, 1)}
                                        className="flex size-5 shrink-0 cursor-pointer items-center justify-center border border-black/20 text-[10px] leading-none transition-colors hover:bg-black/10 dark:border-zinc-700 dark:hover:bg-white/10"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bônus / Penalidade & Opção Melhor d20 */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/15 pb-2.5 text-xs dark:border-zinc-800">
                {/* Bônus / Penalidade */}
                <div className="flex items-center gap-1.5">
                    <span className="font-special text-[11px] uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                        Bônus / Mod:
                    </span>
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => setModificador(modificador - 5)}
                            className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/5"
                            title="-5"
                        >
                            -5
                        </button>
                        <button
                            type="button"
                            onClick={() => setModificador(modificador - 1)}
                            className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/5"
                            title="-1"
                        >
                            -1
                        </button>
                        <input
                            type="number"
                            value={modificador}
                            onChange={(e) => setModificador(parseInt(e.target.value, 10) || 0)}
                            className="w-10 border border-gray-400 dark:border-zinc-700 bg-white/80 dark:bg-[#121514] px-0.5 py-0.5 text-center font-mono text-xs font-bold text-gray-900 dark:text-zinc-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                            type="button"
                            onClick={() => setModificador(modificador + 1)}
                            className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/5"
                            title="+1"
                        >
                            +1
                        </button>
                        <button
                            type="button"
                            onClick={() => setModificador(modificador + 5)}
                            className="cursor-pointer border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#161a18] px-1 py-0.5 text-[10px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-black/5"
                            title="+5"
                        >
                            +5
                        </button>
                    </div>
                </div>

                {/* Opção Padrão de Ordem: Pegar Melhor d20 */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={pegarMelhorD20}
                        onChange={(e) => setPegarMelhor(e.target.checked)}
                        className="size-3.5 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-special text-[11px] tracking-wide uppercase text-gray-800 dark:text-zinc-200">
                        Pegar melhor d20 <span className="text-[10px] text-gray-500 dark:text-emerald-400/80">(Padrão Ordem)</span>
                    </span>
                </label>
            </div>

            {/* Botão ROLAR */}
            <button
                type="button"
                onClick={rolar}
                className="flex w-full cursor-pointer items-center justify-center gap-2 border border-black/50 bg-gray-900 px-3 py-2.5 font-special text-sm uppercase tracking-widest text-white shadow-md transition-all hover:bg-black active:translate-y-0.5 dark:border-emerald-500/60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
                <Dices className="size-4.5" />
                Rolar Dados {totalDadosNoPool > 0 ? `(${totalDadosNoPool}d)` : "(1d20)"}
            </button>

            {/* Resultado em Destaque estilo WitchDice */}
            {ultima && (
                <div
                    className={`border-2 p-2.5 text-center transition-all ${
                        ultima.critico
                            ? "border-amber-600 bg-amber-400/20 dark:border-amber-500 dark:bg-amber-950/40"
                            : ultima.desastre
                            ? "border-red-600 bg-red-400/20 dark:border-red-500 dark:bg-red-950/40"
                            : "border-black/50 dark:border-emerald-500/60 bg-white/80 dark:bg-[#161a18]"
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] text-gray-600 dark:text-zinc-400 truncate">
                            {ultima.formula}
                        </span>
                        {ultima.critico && (
                            <span className="flex items-center gap-0.5 font-special text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">
                                <Sparkles className="size-3" /> 20 Crítico!
                            </span>
                        )}
                        {ultima.desastre && (
                            <span className="font-special text-[11px] font-bold uppercase text-red-700 dark:text-red-300">
                                1 Desastre!
                            </span>
                        )}
                    </div>

                    {/* Total Grandioso */}
                    <div className="font-special text-4xl sm:text-5xl font-bold leading-none text-gray-950 dark:text-zinc-100 my-1">
                        {ultima.total}
                    </div>

                    {/* Dados individuais (Chips) com mini-ícones */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                        {ultima.d20s &&
                            ultima.d20s.map((d, i) => (
                                <span
                                    key={`d20-${i}`}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-special text-xs border ${
                                        d.mantido
                                            ? "border-emerald-600 bg-emerald-600/20 text-emerald-900 dark:text-emerald-300 font-bold"
                                            : "border-gray-400 bg-black/5 text-gray-400 line-through opacity-50 dark:border-zinc-700 dark:text-zinc-500"
                                    }`}
                                    title={d.mantido ? "d20 Mantido" : "d20 Descartado"}
                                >
                                    <IconeDado faces={20} className="size-3 shrink-0" />
                                    {d.valor}
                                </span>
                            ))}

                        {ultima.outrosDados &&
                            ultima.outrosDados.map((d, i) => {
                                const facesNum = parseInt(d.dado.replace("d", ""), 10) || 6;
                                return (
                                    <span
                                        key={`outro-${i}`}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 font-special text-xs border border-sky-600/60 bg-sky-600/10 text-sky-900 dark:text-sky-300"
                                    >
                                        <IconeDado faces={facesNum} className="size-3 shrink-0" />
                                        {d.valor}
                                    </span>
                                );
                            })}

                        {ultima.modificador !== 0 && (
                            <span className="px-1.5 py-0.5 font-mono text-xs border border-gray-400 dark:border-zinc-700 bg-white/60 dark:bg-[#121514] text-gray-700 dark:text-zinc-300 font-bold">
                                Mod: {ultima.modificador > 0 ? `+${ultima.modificador}` : ultima.modificador}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Histórico de Rolagens */}
            {estado.historico.length > 1 && (
                <div className="min-h-0 flex-1 overflow-y-auto pt-1">
                    <div className="mb-1 flex items-center justify-between border-b border-black/15 dark:border-zinc-800 pb-1">
                        <span className="font-special text-[11px] uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                            Histórico Recente
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange({ ...estado, historico: [] })}
                            className="flex cursor-pointer items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 font-special uppercase"
                        >
                            <Trash2 className="size-3" /> Limpar
                        </button>
                    </div>
                    <ul className="space-y-1">
                        {estado.historico.slice(1).map((r) => (
                            <li
                                key={r.id}
                                className="flex items-baseline justify-between gap-2 border-b border-black/10 dark:border-zinc-800/60 py-0.5 text-xs text-gray-700 dark:text-zinc-300"
                            >
                                <span className="truncate font-mono text-[11px]">
                                    {r.formula} → {r.detalhe}
                                </span>
                                <strong className="shrink-0 font-special text-sm text-gray-900 dark:text-emerald-300">
                                    {r.total}
                                </strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
