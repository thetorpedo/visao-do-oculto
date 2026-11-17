import { Pencil } from "lucide-react";
import type { Ameaca } from "@/lib/schemas";
import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UiContext";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";
import ExpandableText from "./expandable-text";
import MarkdownRenderer from "./markdown-renderer";
import Source from "./source";
import { badgeClass } from "./item-card";
import SaveButton from "@/pages/favoritos/components/save-button";

const badgeSmall =
    "text-xs uppercase font-daisy px-2 py-0.5 border whitespace-nowrap inline-flex items-center justify-center";

function corTagBloco(tag: string) {
    const primeiraPalavra = tag.split(" ")[0];
    if (
        ["Sangue", "Morte", "Energia", "Conhecimento", "Medo", "Intenção", "Transmissão"].includes(
            primeiraPalavra
        )
    ) {
        return corElemento(primeiraPalavra);
    }
    return estiloBadgeTipo("default");
}

function LinhaFicha({
    rotulo,
    children,
}: {
    rotulo: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row min-h-8">
            <div className="flex items-center px-3 py-1 text-white font-special font-normal text-xs uppercase tracking-wider bg-black sm:w-36 shrink-0">
                {rotulo}
            </div>
            <div className="flex items-center px-3 py-1.5 grow bg-gray-200/80 border border-t-0 sm:border-t sm:border-l-0 border-dashed border-gray-400 text-sm text-black">
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}

interface ThreatSheetProps {
    ameaca: Ameaca;
    hideChrome?: boolean;
}

export default function ThreatSheet({ ameaca, hideChrome = false }: ThreatSheetProps) {
    const { abrirLeitor, abrirEditar } = useUI();
    const { fontes } = useData();

    const fonteConfig =
        fontes[ameaca.fonteLivro] ??
        Object.values(fontes).find(
            (f) => f.label === ameaca.fonteLivro || f.id === ameaca.fonteLivro
        );

    const paginaBruta = ameaca.fontePagina;
    const paginaParaLeitor =
        paginaBruta === "~" || !paginaBruta || Number.isNaN(Number(paginaBruta))
            ? "~"
            : parseInt(String(paginaBruta), 10);

    const machucadoValor = ameaca.machucado ?? Math.floor(ameaca.pv / 2);

    const blocos = ameaca.blocos ?? [];
    const caracteristicas = blocos.filter(
        (b) => b.secao === "caracteristicas" || b.secao === "tracos"
    );
    const acoes = blocos.filter((b) => b.secao === "acoes");
    const comportamentos = blocos.filter((b) => b.secao === "comportamento");
    const enigmas = blocos.filter((b) => b.secao === "enigma");

    return (
        <div className="flex flex-col h-full w-full text-black">
            {/* Cabeçalho fixo no topo (como em Regras.tsx) */}
            {!hideChrome && (
                <div className="mb-4 border-b border-gray-400 border-dashed pb-4 shrink-0">
                    <div className="flex justify-between items-start mb-3 gap-3">
                        <div className="min-w-0">
                            <h2 className="text-3xl sm:text-4xl font-special text-black leading-tight uppercase wrap-break-word">
                                {ameaca.nome}
                            </h2>
                            <p className="font-special text-xs sm:text-sm uppercase tracking-widest text-gray-600 mt-0.5">
                                {ameaca.tipo} • {ameaca.tamanho}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-black text-white px-3 py-1 border border-black flex items-center gap-1.5">
                                <span className="font-keyes text-sm uppercase tracking-widest text-white">
                                    VD
                                </span>
                                <span className="font-keyes text-xl sm:text-2xl font-normal leading-none">
                                    {ameaca.vd}
                                </span>
                            </div>

                            <button
                                onClick={() => abrirEditar("ameacas", ameaca)}
                                className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
                                title="Editar"
                            >
                                <Pencil className="size-5 transition-all text-gray-500 hover:text-black" />
                            </button>
                            <SaveButton itemId={ameaca.id} categoria="ameacas" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-start justify-between">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap gap-2">
                                {ameaca.elementos.map((el) => (
                                    <span key={`p-${el}`} className={`${badgeClass} ${corElemento(el)}`}>
                                        {el}
                                    </span>
                                ))}
                                {ameaca.grupos.map((g) => (
                                    <span
                                        key={`g-${g}`}
                                        className={`${badgeClass} ${estiloBadgeTipo("default")}`}
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                            {ameaca.elementosSecundarios.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {ameaca.elementosSecundarios.map((el) => (
                                        <span
                                            key={`s-${el}`}
                                            title="Elemento secundário"
                                            className={`${badgeSmall} ${corElemento(el)}`}
                                        >
                                            {el}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 ml-auto [&>div]:mt-0 [&>div]:pt-0 [&>div]:border-none self-end">
                            <Source
                                fonte={ameaca.fonteLivro}
                                pagina={ameaca.fontePagina}
                                onOpenReader={() =>
                                    abrirLeitor(
                                        fonteConfig?.id ?? ameaca.fonteLivro,
                                        paginaParaLeitor
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Corpo rolável */}
            <div
                className={
                    hideChrome
                        ? "space-y-4"
                        : "flex-1 mb-2 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-500/10"
                }
            >
                {/* Apresentação / Lore com ExpandableText */}
                {ameaca.apresentacao && (
                    <div className="border-l-3 border-gray-800 pl-3.5 py-2 bg-black/5">
                        <ExpandableText text={ameaca.apresentacao} limit={240} />
                    </div>
                )}

                {/* Atributos em destaque */}
                <div className="grid grid-cols-5 gap-2 text-center">
                    {(
                        [
                            ["AGI", ameaca.atributos.agi],
                            ["FOR", ameaca.atributos.for],
                            ["INT", ameaca.atributos.int],
                            ["PRE", ameaca.atributos.pre],
                            ["VIG", ameaca.atributos.vig],
                        ] as const
                    ).map(([sigla, valor]) => (
                        <div key={sigla} className="flex flex-col">
                            <span className="bg-black text-white font-special text-xs uppercase tracking-widest py-1">
                                {sigla}
                            </span>
                            <span className="font-special text-xl sm:text-2xl font-bold text-black py-1.5 bg-white/80 border border-t-0 border-dashed border-gray-400">
                                {valor ?? "—"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Estatísticas principais em barras estilo ficha */}
                <div className="space-y-1.5">
                    <LinhaFicha rotulo="Sentidos">
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>
                                <strong>Percepção</strong> {ameaca.sentidos.percepcao}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>
                                <strong>Iniciativa</strong> {ameaca.sentidos.iniciativa}
                            </span>
                            {ameaca.sentidos.extras.length > 0 && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-medium">
                                        {ameaca.sentidos.extras.join(", ")}
                                    </span>
                                </>
                            )}
                        </div>
                    </LinhaFicha>

                    <LinhaFicha rotulo="Defesa">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <strong className="text-base font-special">{ameaca.defesa.valor}</strong>
                            <span className="text-gray-400">|</span>
                            <span>
                                <strong>Fortitude</strong> {ameaca.defesa.fortitude}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>
                                <strong>Reflexos</strong> {ameaca.defesa.reflexos}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>
                                <strong>Vontade</strong> {ameaca.defesa.vontade}
                            </span>
                        </div>
                    </LinhaFicha>

                    <LinhaFicha rotulo="Pontos de Vida">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <strong className="text-base font-special">{ameaca.pv} PV</strong>
                                <span className="text-xs text-gray-600">
                                    ({machucadoValor} machucado)
                                </span>
                            </div>

                            {(ameaca.resistencias.length > 0 ||
                                ameaca.imunidades.length > 0 ||
                                ameaca.vulnerabilidades.length > 0) && (
                                    <div className="border-t border-dashed border-gray-400/70 pt-1 space-y-0.5 text-xs">
                                        {ameaca.resistencias.length > 0 && (
                                            <p>
                                                <strong className="font-keyes uppercase text-black/70 mr-1">
                                                    Resistências:
                                                </strong>
                                                {ameaca.resistencias.join(", ")}
                                            </p>
                                        )}
                                        {ameaca.imunidades.length > 0 && (
                                            <p>
                                                <strong className="font-keyes uppercase text-black/70 mr-1">
                                                    Imunidades:
                                                </strong>
                                                {ameaca.imunidades.join(", ")}
                                            </p>
                                        )}
                                        {ameaca.vulnerabilidades.length > 0 && (
                                            <p>
                                                <strong className="font-keyes uppercase text-black/70 mr-1">
                                                    Vulnerabilidades:
                                                </strong>
                                                {ameaca.vulnerabilidades.join(", ")}
                                            </p>
                                        )}
                                    </div>
                                )}
                        </div>
                    </LinhaFicha>

                    {ameaca.pericias.length > 0 && (
                        <LinhaFicha rotulo="Perícias">
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                                {ameaca.pericias.map((p, idx) => (
                                    <span key={`${p.nome}-${idx}`}>
                                        <strong>{p.nome}</strong> {p.valor}
                                        {idx < ameaca.pericias.length - 1 ? " •" : ""}
                                    </span>
                                ))}
                            </div>
                        </LinhaFicha>
                    )}

                    <LinhaFicha rotulo="Deslocamento">
                        <strong>{ameaca.deslocamento}</strong>
                    </LinhaFicha>
                </div>

                {/* Características */}
                {caracteristicas.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-special text-xs uppercase tracking-widest text-white bg-black px-3 py-1">
                            Características
                        </h3>
                        <div className="space-y-2">
                            {caracteristicas.map((bloco, i) => (
                                <div
                                    key={`carac-${i}`}
                                    className="bg-white/60 border border-dashed border-gray-400 p-3 space-y-1.5"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {bloco.acao && (
                                            <span className="text-[11px] font-special uppercase bg-black text-white px-2 py-0.5">
                                                {bloco.acao} ◆
                                            </span>
                                        )}
                                        <span className="font-special font-bold text-sm uppercase text-black">
                                            {bloco.titulo}
                                        </span>
                                        {bloco.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`${badgeSmall} ${corTagBloco(tag)} text-[10px]`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <MarkdownRenderer content={bloco.descricao} isCompact />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ações */}
                {acoes.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-special text-xs uppercase tracking-widest text-white bg-black px-3 py-1">
                            Ações
                        </h3>
                        <div className="space-y-2">
                            {acoes.map((bloco, i) => (
                                <div
                                    key={`acao-${i}`}
                                    className="bg-white/60 border border-dashed border-gray-400 p-3 space-y-1.5"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {bloco.acao && (
                                            <span className="text-[11px] font-special uppercase bg-black text-white px-2 py-0.5">
                                                {bloco.acao} ◆
                                            </span>
                                        )}
                                        <span className="font-special font-bold text-sm uppercase text-black">
                                            {bloco.titulo}
                                        </span>
                                        {bloco.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`${badgeSmall} ${corTagBloco(tag)} text-[11px]`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <MarkdownRenderer content={bloco.descricao} isCompact />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comportamento */}
                {comportamentos.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-special text-xs uppercase tracking-widest text-white bg-black px-3 py-1">
                            Comportamento
                        </h3>
                        <div className="space-y-2">
                            {comportamentos.map((bloco, i) => (
                                <div
                                    key={`comp-${i}`}
                                    className="bg-white/60 border border-dashed border-gray-400 p-3 space-y-1.5"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {bloco.acao && (
                                            <span className="text-[11px] font-special uppercase bg-black text-white px-2 py-0.5">
                                                {bloco.acao} ◆
                                            </span>
                                        )}
                                        <span className="font-special font-bold text-sm uppercase text-black">
                                            {bloco.titulo}
                                        </span>
                                        {bloco.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`${badgeSmall} ${corTagBloco(tag)} text-[10px]`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <MarkdownRenderer content={bloco.descricao} isCompact />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enigma de Medo */}
                {enigmas.length > 0 && (
                    <div className="space-y-2">
                        {enigmas.map((bloco, i) => (
                            <div
                                key={`enigma-${i}`}
                                className="border-2 border-dashed border-black bg-black/5 p-3 space-y-2"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-black text-white font-special text-xs uppercase tracking-widest px-2.5 py-0.5">
                                            ◆ {bloco.titulo || "Enigma de Medo"}
                                        </span>
                                        {bloco.acao && (
                                            <span className="text-[10px] font-special uppercase border border-gray-700 px-1.5 py-0.5 text-gray-800">
                                                {bloco.acao}
                                            </span>
                                        )}
                                    </div>
                                    {bloco.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {bloco.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`${badgeSmall} ${corTagBloco(tag)} text-[10px]`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <MarkdownRenderer content={bloco.descricao} isCompact />
                            </div>
                        ))}
                    </div>
                )}

                {/* Observações */}
                {ameaca.observacoes && (
                    <div className="bg-black/5 border border-dashed border-gray-400 p-3 space-y-1">
                        <span className="font-special text-xs uppercase tracking-wider text-gray-700 block">
                            Observações
                        </span>
                        <MarkdownRenderer content={ameaca.observacoes} isCompact />
                    </div>
                )}
            </div>
        </div>
    );
}
