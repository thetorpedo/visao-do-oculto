import { Dices, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { selecionarAoFocar, tratarSubstituicaoZero } from "../escudo-utils";

const ARESTA_DADO = { strokeWidth: 1.1, opacity: 0.75 };

function FormaD10() {
    return (
        <>
            <path d="M12 2 21.5 10v4L12 22l-9.5-8v-4Z" />
            <g {...ARESTA_DADO}>
                <path d="M12 2 7 13M12 2l5 11" />
                <path d="M2.5 14 7 13l5 2 5-2 4.5 1" />
                <path d="M12 15v7" />
            </g>
        </>
    );
}

const FORMAS_DADOS: Record<number, ReactNode> = {
    4: (
        <>
            <path d="M12 2.5 21.5 19.5h-19Z" />
            <path {...ARESTA_DADO} d="M12 2.5V14M2.5 19.5 12 14l9.5 5.5" />
        </>
    ),
    6: (
        <>
            <path d="M12 2.5 20.5 7.25v9.5L12 21.5l-8.5-4.75v-9.5Z" />
            <path {...ARESTA_DADO} d="M3.5 7.25 12 12l8.5-4.75M12 12v9.5" />
        </>
    ),
    8: (
        <>
            <path d="M12 2 21 12 12 22 3 12Z" />
            <path {...ARESTA_DADO} d="M3 12l9 2.5 9-2.5M12 2v20" />
        </>
    ),
    10: <FormaD10 />,
    12: (
        <>
            <path d="M12 2l5.88 1.91 3.63 5v6.18l-3.63 5L12 22l-5.88-1.91-3.63-5V8.91l3.63-5Z" />
            <g {...ARESTA_DADO}>
                <path d="M12 6.5l5.23 3.8-2 6.15H8.77l-2-6.15Z" />
                <path d="M12 6.5V2M17.23 10.3l4.28-1.39M15.23 16.45l2.65 3.64M8.77 16.45l-2.65 3.64M6.77 10.3 2.49 8.91" />
            </g>
        </>
    ),
    20: (
        <>
            <path d="M12 2l8.66 5v10L12 22l-8.66-5V7Z" />
            <g {...ARESTA_DADO}>
                <path d="M12 7.5 17.5 16h-11Z" />
                <path d="M12 2v5.5M3.34 7 12 7.5l8.66-.5M3.34 7l3.16 9M20.66 7l-3.16 9" />
                <path d="M3.34 17l3.16-1M20.66 17l-3.16-1M6.5 16 12 22l5.5-6" />
            </g>
        </>
    ),
    100: (
        <>
            <g transform="translate(9 0) scale(0.62)" opacity={0.55} strokeWidth={2.4}>
                <FormaD10 />
            </g>
            <g transform="translate(0 6.5) scale(0.72)" strokeWidth={2.2}>
                <FormaD10 />
            </g>
        </>
    ),
};

export function IconeDado({ faces, className = "size-5" }: { faces: number; className?: string }) {
    const forma_svg = FORMAS_DADOS[faces];
    if (!forma_svg) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {forma_svg}
        </svg>
    );
}

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

const obterEntradasOrdenadas = (pool_dados: Pool): [number, number][] =>
    DADOS_DISPONIVEIS.filter((f) => (pool_dados[f] ?? 0) > 0).map((f) => [f, pool_dados[f]]);

function montarFormula(pool_dados: Pool, mod_valor: number): string {
    const texto_formula = obterEntradasOrdenadas(pool_dados)
        .map(([faces, qtd]) => `${qtd}d${faces}`)
        .join(" + ");

    if (mod_valor === 0) return texto_formula;
    return `${texto_formula} ${mod_valor > 0 ? "+" : "-"} ${Math.abs(mod_valor)}`;
}

const rolarDado = (faces: number): number => Math.floor(Math.random() * faces) + 1;
const somar = (valores: number[]): number => valores.reduce((acumulado, v) => acumulado + v, 0);

function rolarPool(pool_dados: Pool, mod_valor: number, manter_maior_d20: boolean): Rolagem {
    const d20_lista: { valor: number; mantido: boolean }[] = [];
    const outros_dados: { dado: string; valor: number }[] = [];
    const partes_detalhe: string[] = [];
    let total_rolado = 0;

    for (const [faces, qtd] of obterEntradasOrdenadas(pool_dados)) {
        const valores_gerados = Array.from({ length: qtd }, () => rolarDado(faces));

        if (faces === 20) {
            const maior_d20 = Math.max(...valores_gerados);
            const descartar_menores = manter_maior_d20 && qtd > 1;
            let maior_utilizado = false;

            for (const valor of valores_gerados) {
                const mantido = !descartar_menores || (valor === maior_d20 && !maior_utilizado);
                if (descartar_menores && mantido) maior_utilizado = true;
                d20_lista.push({ valor, mantido });
            }

            total_rolado += descartar_menores ? maior_d20 : somar(valores_gerados);
            partes_detalhe.push(
                `${qtd}d20 [${valores_gerados.join(", ")}]${descartar_menores ? ` (maior: ${maior_d20})` : ""}`
            );
        } else {
            total_rolado += somar(valores_gerados);
            valores_gerados.forEach((valor) => outros_dados.push({ dado: `d${faces}`, valor }));
            partes_detalhe.push(`${qtd}d${faces} [${valores_gerados.join(", ")}]`);
        }
    }

    if (mod_valor !== 0) {
        total_rolado += mod_valor;
        partes_detalhe.push(mod_valor > 0 ? `+${mod_valor}` : `${mod_valor}`);
    }

    return {
        id: crypto.randomUUID(),
        total: total_rolado,
        detalhe: partes_detalhe.join(" + ").replace(/\+ -/g, "- "),
        formula: montarFormula(pool_dados, mod_valor),
        d20s: d20_lista,
        outrosDados: outros_dados,
        modificador: mod_valor,
        critico: d20_lista.some((d) => d.mantido && d.valor === 20),
        desastre: d20_lista.length > 0 && d20_lista.every((d) => !d.mantido || d.valor === 1),
    };
}

function SeletorDado({
    faces,
    qtd,
    onAjustar,
}: {
    faces: number;
    qtd: number;
    onAjustar: (delta: number) => void;
}) {
    const is_ativo = qtd > 0;

    return (
        <div
            className={cn(
                "relative flex flex-col border transition-all",
                is_ativo
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
                        is_ativo ? "text-amber-800 dark:text-emerald-400" : "text-gray-500 dark:text-zinc-500"
                    )}
                />
                <span className="font-daisy text-sm font-bold uppercase leading-none">d{faces}</span>
            </button>

            {is_ativo && (
                <span className="pointer-events-none absolute -right-1 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-700 px-1 font-mono text-[10px] font-bold text-white shadow dark:bg-emerald-500 dark:text-zinc-950">
                    {qtd}
                </span>
            )}

            <div className="grid grid-cols-2 border-t border-black/15 dark:border-zinc-800">
                <Button
                    variant="ghost"
                    className="h-6 border-b-0! border-l-0! border-r border-t-0! border-black/15 hover:bg-white/50"
                    disabled={!is_ativo}
                    aria-label={`Remover d${faces}`}
                    onClick={() => onAjustar(-1)}
                >
                    <Minus className="size-3" strokeWidth={3} />
                </Button>
                <Button
                    variant="ghost"
                    className="h-6 border-0! hover:bg-white/50"
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

    const estilo_container = critico
        ? "border-amber-600 bg-amber-400/20 dark:border-amber-500 dark:bg-amber-950/40"
        : desastre
            ? "border-red-600 bg-red-400/20 dark:border-red-500 dark:bg-red-950/40"
            : "border-black/50 bg-white/80 dark:border-emerald-500/60 dark:bg-[#161a18]";

    return (
        <div className={cn("flex shrink-0 items-center gap-3 border px-2.5 py-2 transition-all", estilo_container)}>
            <div className="min-w-14 text-center font-special text-4xl font-bold leading-none text-gray-950 dark:text-zinc-100">
                {total}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-mono text-[10px] text-gray-600 dark:text-zinc-400">{formula}</span>

                <div className="flex flex-wrap items-center gap-1">
                    {d20s?.map((dado_item, idx) => (
                        <span
                            key={`d20-${idx}`}
                            title={dado_item.mantido ? "d20 mantido" : "d20 descartado"}
                            className={cn(
                                "inline-flex items-center gap-0.5 border px-1 py-px font-special text-[11px]",
                                dado_item.mantido
                                    ? "border-emerald-600 bg-emerald-600/20 font-bold text-emerald-900 dark:text-emerald-300"
                                    : "border-gray-400 bg-black/5 text-gray-400 line-through opacity-50 dark:border-zinc-700 dark:text-zinc-500"
                            )}
                        >
                            <IconeDado faces={20} className="size-3 shrink-0" />
                            {dado_item.valor}
                        </span>
                    ))}

                    {outrosDados?.map((dado_item, idx) => (
                        <span
                            key={`outro-${idx}`}
                            title={dado_item.dado}
                            className="inline-flex items-center gap-0.5 border border-sky-600/60 bg-sky-600/10 px-1 py-px font-special text-[11px] text-sky-900 dark:text-sky-300"
                        >
                            <IconeDado
                                faces={parseInt(dado_item.dado.slice(1), 10) || 6}
                                className="size-3 shrink-0"
                            />
                            {dado_item.valor}
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

export default function SlotDados({
    dados,
    onChange,
}: {
    dados?: DadosRolador;
    onChange: (d: DadosRolador) => void;
}) {
    const estado_atual = dados ?? VAZIO;
    const pool_dados = estado_atual.pool ?? {};
    const modificador_atual = estado_atual.modificador ?? 0;
    const pegar_melhor_d20 = estado_atual.pegarMelhorD20 ?? true;

    const [mod_texto, setModTexto] = useState(String(modificador_atual));

    useEffect(() => {
        setModTexto(String(modificador_atual));
    }, [modificador_atual]);

    const atualizarModificador = (novo_mod: number) => {
        onChange({ ...estado_atual, modificador: novo_mod });
    };

    const alterarModTexto = (texto_digitado: string) => {
        const valor_ajustado = tratarSubstituicaoZero(texto_digitado, mod_texto);
        setModTexto(valor_ajustado);
        if (valor_ajustado === "" || valor_ajustado === "-" || valor_ajustado === "+") {
            atualizarModificador(0);
        } else {
            const numero = parseInt(valor_ajustado, 10);
            if (!isNaN(numero)) {
                atualizarModificador(numero);
            }
        }
    };

    const salvarModificador = () => {
        if (mod_texto === "" || mod_texto === "-" || mod_texto === "+") {
            setModTexto("0");
            atualizarModificador(0);
        } else {
            const numero = parseInt(mod_texto, 10) || 0;
            setModTexto(String(numero));
            atualizarModificador(numero);
        }
    };

    const ajustarDado = (faces: number, delta: number) => {
        const qtd_atual = pool_dados[faces] ?? 0;
        const nova_qtd = Math.max(0, Math.min(MAX_POR_DADO, qtd_atual + delta));
        if (nova_qtd === qtd_atual) return;

        const pool_atualizado = { ...pool_dados, [faces]: nova_qtd };
        if (nova_qtd === 0) delete pool_atualizado[faces];

        onChange({ ...estado_atual, pool: pool_atualizado });
    };

    const total_dados = Object.values(pool_dados).reduce((acc, q) => acc + q, 0);
    const pool_efetivo: Pool = total_dados > 0 ? pool_dados : { 20: 1 };
    const equacao_formula = montarFormula(pool_efetivo, modificador_atual);
    const ultima_rolagem = estado_atual.historico[0];

    const executarRolagem = () => {
        const nova_rolagem = rolarPool(pool_efetivo, modificador_atual, pegar_melhor_d20);
        onChange({
            ...estado_atual,
            historico: [nova_rolagem, ...estado_atual.historico].slice(0, MAX_HISTORICO),
        });
    };

    const cor_modificador =
        modificador_atual > 0
            ? "border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300"
            : modificador_atual < 0
                ? "border-red-600 bg-red-500/15 text-red-700 dark:border-red-500 dark:text-red-300"
                : "border-gray-400 bg-white/60 text-gray-500 dark:border-zinc-700 dark:bg-[#121514] dark:text-zinc-400";

    const renderizarBotaoMod = (delta: number) => (
        <Button
            key={delta}
            variant="default"
            className="h-8 min-w-9 border-solid px-1.5 font-daisy text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-black"
            onClick={() => atualizarModificador(modificador_atual + delta)}
        >
            {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
        </Button>
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-2 text-gray-900 sm:p-2.5 dark:text-zinc-100">
            <div className="grid shrink-0 grid-cols-7 gap-1">
                {DADOS_DISPONIVEIS.map((faces) => (
                    <SeletorDado
                        key={faces}
                        faces={faces}
                        qtd={pool_dados[faces] ?? 0}
                        onAjustar={(d) => ajustarDado(faces, d)}
                    />
                ))}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-black/15 py-2 sm:justify-between dark:border-zinc-800">
                <div className="flex items-stretch justify-center gap-1">
                    {[-5, -1].map(renderizarBotaoMod)}
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={mod_texto}
                        onChange={(e) => alterarModTexto(e.target.value)}
                        onFocus={selecionarAoFocar}
                        onBlur={salvarModificador}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                salvarModificador();
                                e.currentTarget.blur();
                            }
                        }}
                        aria-label="Modificador"
                        className={cn(
                            "h-8 w-16 px-0 text-center font-daisy text-xl leading-none md:text-xl",
                            cor_modificador
                        )}
                    />
                    {[1, 5].map(renderizarBotaoMod)}
                </div>

                <label className="flex cursor-pointer select-none items-center gap-1.5">
                    <input
                        type="checkbox"
                        checked={pegar_melhor_d20}
                        onChange={(e) => onChange({ ...estado_atual, pegarMelhorD20: e.target.checked })}
                        className="size-3.5 cursor-pointer accent-black dark:accent-emerald-600"
                    />
                    <span className="font-daisy text-sm uppercase tracking-tight text-gray-800 dark:text-zinc-200">
                        Manter maior d20
                    </span>
                </label>
            </div>

            <div className="flex shrink-0 gap-1.5">
                <Button
                    variant="default"
                    className="w-full shrink border-0 dark:bg-[#273a2f] dark:text-emerald-200"
                    title={`Rolar ${equacao_formula}`}
                    onClick={executarRolagem}
                >
                    <Dices className="shrink-0" />
                    <span className="shrink-0">Rolar</span>
                    <span className="truncate bg-white/20 px-2 font-mono normal-case tracking-normal opacity-80 dark:bg-black/20">
                        {equacao_formula}
                    </span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-auto"
                    disabled={total_dados === 0 && modificador_atual === 0}
                    title="Zerar dados e bônus"
                    aria-label="Reset"
                    onClick={() => onChange({ ...estado_atual, pool: {}, modificador: 0 })}
                >
                    <RotateCcw />
                </Button>
            </div>

            {ultima_rolagem && <Resultado rolagem={ultima_rolagem} />}

            {estado_atual.historico.length > 1 && (
                <div className="shrink-0">
                    <div className="mb-1 flex items-center justify-between border-b border-black/15 pb-1 dark:border-zinc-800">
                        <span className="font-special text-xs text-gray-500 dark:text-zinc-400">
                            Histórico
                        </span>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="h-5 px-1 text-[10px] uppercase text-gray-500 hover:bg-transparent hover:text-red-700 dark:text-zinc-400 dark:hover:bg-transparent dark:hover:text-red-400"
                            onClick={() => onChange({ ...estado_atual, historico: [] })}
                        >
                            <Trash2 />
                            Limpar
                        </Button>
                    </div>
                    <ul className="space-y-0.5">
                        {estado_atual.historico.slice(1).map((r) => (
                            <li
                                key={r.id}
                                className="flex items-baseline justify-between gap-2 border-b border-black/10 py-0.5 text-xs text-gray-700 dark:border-zinc-800/60 dark:text-zinc-300"
                            >
                                <span className="truncate font-mono text-[10px]">
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
