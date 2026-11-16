import { estiloBadgeTipo, corElemento } from "@/utils/badgeUtils";
import ExpandableText, { ExpandableTextToggle } from "./expandable-text";
import MarkdownRenderer from "./markdown-renderer";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Source from "./source";
import SaveButton from "../../pages/favoritos/components/save-button";
import { useUI } from "@/context/UiContext";
import PaperDiv from "./paper-div";
import { Categoria, useData } from "@/context/DataContext";

const capitalizeFirst = (str: string | number | null | undefined) => {
    if (!str) return "";
    const s = String(str);
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatarDescricao = (nome: string, descricao: string) => {
    if (!descricao) return "";
    const nomeEscapado = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${nomeEscapado}[\\.\\-\\:\\s]*`, 'i');
    const textoLimpo = descricao.replace(regex, '').trim();
    if (!textoLimpo) return "";
    return textoLimpo.charAt(0).toUpperCase() + textoLimpo.slice(1);
};

export const badgeClass = "text-sm uppercase font-daisy px-2 py-1 border whitespace-nowrap flex items-center justify-center";

const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
    if (valor === null || valor === undefined || valor === "") return null;
    return (
        <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-400/80 py-1 gap-x-2 gap-y-0.5">
            <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
            <span className="font-bold text-gray-900 text-sm text-right wrap-break-word">{capitalizeFirst(valor)}</span>
        </div>
    );
};

function AprimoramentoDropdown({ aprimoramento }: { aprimoramento: { nome: string; custo: string; descricao: string } }) {
    const [isOpen, setIsOpen] = useState(false);
    if (!aprimoramento) return null;
    return (
        <div className="mb-2 last:mb-0 transition-all">
            <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 text-left">
                <div className="flex items-center gap-2 h-7 bg-black w-fit shrink-0">
                    <span className="font-special text-sm tracking-wider uppercase text-white px-3 shrink-0">
                        {aprimoramento.nome} <span className="font-sans font-bold opacity-80 tracking-normal ml-0.5">({aprimoramento.custo})</span>
                    </span>
                </div>
                <div className="w-full flex justify-end bg-gray-200 h-7 border border-l-0 border-dashed border-gray-400 items-center">
                    <ChevronDown className={`size-4 mr-3 text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-3 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm text-justify text-gray-800 leading-relaxed">
                    <MarkdownRenderer content={capitalizeFirst(aprimoramento.descricao)} isCompact />
                </div>
            )}
        </div>
    );
}

function NexDropdown({ label, text }: { label: string; text?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    if (!text) return null;
    const indexPonto = text.indexOf(".");
    const titulo = indexPonto !== -1 ? text.substring(0, indexPonto) : "Habilidade";
    const descricao = indexPonto !== -1 ? text.substring(indexPonto + 1).trim() : text;
    return (
        <div className="mb-2 last:mb-0 transition-all">
            <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 text-left">
                <div className="flex items-center gap-2 h-7 bg-black w-fit shrink-0">
                    <span className="font-special text-sm tracking-wider uppercase text-white px-3 shrink-0">
                        {label}
                    </span>
                </div>
                <div className="w-full flex justify-between px-3 bg-gray-200 h-7 border border-l-0 border-dashed border-gray-400 items-center">
                    <span className="font-semibold font-blur text-base text-gray-900 leading-tight">{titulo}</span>
                    <ChevronDown className={`size-4 ml-2 text-black transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-3 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed ">
                    <MarkdownRenderer content={descricao} isCompact />
                </div>
            )}
        </div>
    );
}

function RegraExpandivel({ content, expandAll = false }: { content: string; expandAll?: boolean }) {
    const [expandido, setExpandido] = useState(false);
    if (expandAll) {
        return <MarkdownRenderer content={content} isCompact={true} />;
    }
    return (
        <div className="relative">
            <div className={`transition-all duration-300 ${expandido ? "max-h-none" : "max-h-40 overflow-hidden"}`}>
                <MarkdownRenderer content={content} isCompact={true} />
            </div>
            <ExpandableTextToggle
                expanded={expandido}
                onClick={() => setExpandido(!expandido)}
            />
        </div>
    );
}

function AmeacaCardBody({ item }: { item: any }) {
    const navigate = useNavigate();
    const machucadoValor = item.machucado ?? Math.floor((item.pv ?? 0) / 2);
    const caracteristicas = (item.blocos ?? []).filter(
        (b: any) => b.secao === "caracteristicas" || b.secao === "tracos"
    );
    const acoes = (item.blocos ?? []).filter((b: any) => b.secao === "acoes");
    const temEnigma = (item.blocos ?? []).some((b: any) => b.secao === "enigma");

    return (
        <div className="space-y-3">
            {/* Cabeçalho de badges do card */}
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-gray-900 text-white font-special text-sm uppercase px-2.5 py-0.5 font-bold">
                        VD {item.vd}
                    </span>
                    <span className={`${badgeClass} ${estiloBadgeTipo("default")} text-xs py-0.5`}>
                        {item.tipo} • {item.tamanho}
                    </span>
                    {(item.elementos ?? []).map((e: string) => (
                        <span key={`p-${e}`} className={`${badgeClass} ${corElemento(e)} text-xs py-0.5`}>
                            {e}
                        </span>
                    ))}
                    {(item.grupos ?? []).map((g: string) => (
                        <span key={`g-${g}`} className={`${badgeClass} ${estiloBadgeTipo("default")} text-xs py-0.5`}>
                            {g}
                        </span>
                    ))}
                    {temEnigma && (
                        <span className="text-[11px] font-special uppercase px-2 py-0.5 border border-dashed border-gray-900 bg-gray-900/10 text-gray-900 font-bold">
                            ◆ Enigma
                        </span>
                    )}
                </div>
                {(item.elementosSecundarios ?? []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {(item.elementosSecundarios ?? []).map((e: string) => (
                            <span
                                key={`s-${e}`}
                                title="Elemento secundário"
                                className={`${badgeClass} ${corElemento(e)} text-[10px] px-1.5 py-0`}
                            >
                                {e}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Atributos compactos */}
            {item.atributos && (
                <div className="grid grid-cols-5 gap-1.5 text-center">
                    {(
                        [
                            ["AGI", item.atributos.agi],
                            ["FOR", item.atributos.for],
                            ["INT", item.atributos.int],
                            ["PRE", item.atributos.pre],
                            ["VIG", item.atributos.vig],
                        ] as const
                    ).map(([sigla, valor]) => (
                        <div key={sigla} className="flex flex-col">
                            <span className="bg-gray-900 text-white font-special text-[10px] uppercase tracking-wider py-0.5">
                                {sigla}
                            </span>
                            <span className="font-special text-base font-bold text-gray-900 py-0.5 bg-white/70 border border-t-0 border-dashed border-gray-400">
                                {valor ?? "—"}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Painel de status resumido */}
            <div className="bg-gray-100/90 border border-gray-400/50 p-3 space-y-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <LinhaStatus label="PV" valor={`${item.pv} (Mach. ${machucadoValor})`} />
                    <LinhaStatus label="Defesa" valor={item.defesa?.valor} />
                    <LinhaStatus
                        label="Resistências"
                        valor={
                            item.defesa
                                ? `F ${item.defesa.fortitude} • R ${item.defesa.reflexos} • V ${item.defesa.vontade}`
                                : null
                        }
                    />
                    <LinhaStatus label="Desloc." valor={item.deslocamento} />
                    <LinhaStatus
                        label="Sentidos"
                        valor={
                            item.sentidos
                                ? `Perc. ${item.sentidos.percepcao} • Inic. ${item.sentidos.iniciativa}`
                                : null
                        }
                    />
                    {item.vulnerabilidades?.length > 0 && (
                        <LinhaStatus label="Vulnerável" valor={item.vulnerabilidades.join(", ")} />
                    )}
                </div>
                {item.resistencias?.length > 0 && (
                    <LinhaStatus label="RD / Resist." valor={item.resistencias.join(", ")} />
                )}
            </div>

            {/* Lista rápida de Características e Ações */}
            {(caracteristicas.length > 0 || acoes.length > 0) && (
                <div className="bg-gray-200/60 border border-dashed border-gray-400 px-3 py-2 space-y-1.5 text-xs">
                    {caracteristicas.length > 0 && (
                        <div>
                            <span className="font-special uppercase text-gray-700 font-bold mr-1.5">
                                Características:
                            </span>
                            <span className="text-gray-900 font-medium">
                                {caracteristicas.map((c: any) => c.titulo).join(" • ")}
                            </span>
                        </div>
                    )}
                    {acoes.length > 0 && (
                        <div>
                            <span className="font-special uppercase text-gray-700 font-bold mr-1.5">
                                Ações:
                            </span>
                            <span className="text-gray-900 font-medium">
                                {acoes
                                    .map((a: any) => (a.acao ? `${a.acao} ◆ ${a.titulo}` : a.titulo))
                                    .join(" • ")}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="pt-1">
                <button
                    type="button"
                    onClick={() => navigate(`/ameacas?id=${encodeURIComponent(item.id)}`)}
                    className="inline-flex cursor-pointer items-center bg-black/5 gap-0.5 px-1.5 py-0.5 font-special text-[11px] text-black/80 transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
                >
                    Ler completo
                    <ChevronRight className="size-2.5" />
                </button>
            </div>
        </div>
    );
}

export default function ItemCard({
    item,
    categoria,
    showCategory,
    expandAll = false,
    withoutPaper = false,
}: {
    item: any;
    categoria: Categoria;
    showCategory?: boolean;
    expandAll?: boolean;
    withoutPaper?: boolean;
}) {
    const { abrirLeitor, abrirEditar } = useUI();
    const { fontes } = useData();

    const fonteConfig =
        fontes[item.fonteLivro] ??
        Object.values(fontes).find(f => f.label === item.fonteLivro || f.id === item.fonteLivro);

    const paginaBruta = item.fontePagina ?? item.pag;
    const paginaParaLeitor =
        paginaBruta === '~' || paginaBruta === undefined || paginaBruta === null || Number.isNaN(Number(paginaBruta))
            ? '~'
            : parseInt(String(paginaBruta), 10);

    const cardContent = (
        <div className="flex flex-col min-h-full w-full">
            <div className="grow">
                <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="text-2xl font-special underline wrap-break-word text-gray-950 dark:text-zinc-100">
                        {item.nome}
                    </h3>
                    {showCategory && (
                        <span className="text-xs uppercase font-daisy bg-black text-white px-2 py-1 shrink-0">
                            {categoria}
                        </span>
                    )}
                </div>

                {RenderCardBody(item, categoria, expandAll)}
            </div>

            <div className="flex items-center justify-between pt-3 mt-4 border-t border-dashed border-gray-400 dark:border-zinc-700 shrink-0">
                <Source
                    fonte={item.fonteLivro || item.fonte}
                    pagina={item.fontePagina || item.pag}
                    onOpenReader={() =>
                        abrirLeitor(fonteConfig?.id ?? item.fonteLivro, paginaParaLeitor)
                    }
                />
                <div className="flex flex-row gap-2">
                    <button
                        onClick={() => abrirEditar(categoria, item)}
                        className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer rounded"
                        title="Editar"
                    >
                        <Pencil className="size-5 transition-all text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100" />
                    </button>
                    <SaveButton itemId={item.id} categoria={categoria} />
                </div>
            </div>
        </div>
    );

    if (withoutPaper) {
        return (
            <div key={item.id} className="relative w-full">
                {cardContent}
            </div>
        );
    }

    return (
        <div key={item.id} className="relative group flex h-full">
            <PaperDiv className="flex flex-col h-full w-full">
                {cardContent}
            </PaperDiv>
        </div>
    );
}

export const RenderCardBody = (item: any, categoria: string, expandAll: boolean = false) => {
    switch (categoria) {
        case "poderes":
            return (
                <>
                    <div className="flex flex-row flex-wrap gap-2 mb-4">
                        <span className={`${badgeClass} ${estiloBadgeTipo(item.tipo)}`}>{item.tipo}</span>
                        {item.elemento && <span className={`${badgeClass} ${corElemento(item.elemento)}`}>{item.elemento}</span>}
                    </div>
                    <div className="mb-4 text-sm text-gray-800 leading-relaxed">
                        <ExpandableText text={item.descricao} limit={item.afinidade ? 180 : item.preRequisitos ? 240 : 320} forceExpand={expandAll} />
                    </div>

                    {item.preRequisitos && (
                        <div className="flex mb-4 flex-row min-h-7">
                            <div className="flex items-center px-3 py-1 text-white font-special font-normal text-sm bg-gray-900 ">
                                Pré-requisitos:
                            </div>
                            <div className="flex items-center px-3 py-1 grow bg-gray-200 border border-l-0 border-dashed border-gray-400">
                                <span className="text-sm font-medium text-gray-800">{item.preRequisitos}</span>
                            </div>
                        </div>
                    )}

                    {item.afinidade && (
                        <div className={`mb-3 px-3 py-2 border-l-4 ${corElemento(item.elemento).replace('bg-', 'border-').split(' ')[1]} bg-gray-300/30`}>
                            <span className="font-special text-base tracking-wider block uppercase text-gray-900 mb-1">Afinidade:</span>
                            <div className="text-sm text-gray-800 leading-relaxed">
                                <ExpandableText text={item.afinidade} limit={160} forceExpand={expandAll} />
                            </div>
                        </div>
                    )}
                </>
            );

        case "rituais":
            const statusRituais = [
                { label: "Execução", valor: item.execucao }, { label: "Alcance", valor: item.alcance },
                { label: "Alvo", valor: item.alvo }, { label: "Área", valor: item.area },
                { label: "Duração", valor: item.duracao }, { label: "Resistência", valor: item.resistencia }
            ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");
            return (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {item.elemento.map((e: string) => (
                            <span key={e} className={`${badgeClass} ${corElemento(e)}`}>{e} {item.circulo}</span>
                        ))}
                    </div>

                    {statusRituais.length > 0 && (
                        <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusRituais.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {statusRituais.map((status, index) => <LinhaStatus key={index} label={status.label} valor={status.valor} />)}
                        </div>
                    )}

                    <div className="mb-4 text-sm text-gray-800 leading-relaxed">
                        <ExpandableText text={item.descricao} limit={item.aprimoramentos?.length ? 180 : 300} forceExpand={expandAll} />
                    </div>

                    {item.aprimoramentos && item.aprimoramentos.length > 0 && (
                        <div className="mt-2">
                            {item.aprimoramentos.map((ap: any, index: number) => <AprimoramentoDropdown key={index} aprimoramento={ap} />)}
                        </div>
                    )}
                </>
            );

        case "origens":
            return (
                <>
                    <div className="text-sm text-gray-800 leading-relaxed mb-4">
                        <ExpandableText text={item.descricao} limit={180} forceExpand={expandAll} />
                    </div>

                    <div className="flex mb-4 flex-row min-h-7">
                        <div className="flex items-center px-3 py-1 text-white font-special font-normal text-sm bg-gray-900">
                            Perícias Treinadas:
                        </div>
                        <div className="flex items-center px-3 py-1 grow bg-gray-200 border border-l-0 border-dashed border-gray-400">
                            <span className="text-sm font-medium text-gray-800">{item.pericias}</span>
                        </div>
                    </div>

                    <div className="mb-3 bg-gray-200 border border-gray-400/50 px-3 py-2">
                        <span className="font-special text-base tracking-wider block uppercase text-gray-900 mb-1">{item.tecnicaNome}:</span>
                        <div className="text-sm text-gray-800 leading-relaxed">
                            <ExpandableText text={item.tecnicaDescricao} limit={220} forceExpand={expandAll} />
                        </div>
                    </div>
                </>
            );

        case "trilhas":
            return (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`${badgeClass} ${estiloBadgeTipo(item.tipo)}`}>{item.tipo}</span>
                    </div>

                    <div className="mb-4 text-sm text-gray-800 leading-relaxed">
                        <ExpandableText text={item.descricao ?? ""} limit={item.especial ? 180 : 260} forceExpand={expandAll} />
                    </div>

                    {item.especial && (
                        <div className="mb-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                            <p className="text-xs text-gray-800"><span className="font-special text-xs tracking-wider mr-1 uppercase text-gray-900">Especial:</span><span className="font-medium text-sm">{item.especial}</span></p>
                        </div>
                    )}

                    <div className="mt-2">
                        <NexDropdown label={item.tipo === "Sobrevivente" ? "Estágio 2" : "NEX 10%"} text={item.nex10} />
                        <NexDropdown label={item.tipo === "Sobrevivente" ? "Estágio 4" : "NEX 40%"} text={item.nex40} />
                        {item.tipo !== "Sobrevivente" && (
                            <><NexDropdown label="NEX 65%" text={item.nex65} /><NexDropdown label="NEX 99%" text={item.nex99} /></>
                        )}
                    </div>
                </>
            );

        case "regras":
            return (
                <>
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {item.categoria.map((cat: string) => (
                            <span key={cat} className={`${badgeClass} ${estiloBadgeTipo('default')}`}>{cat}</span>
                        ))}
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed">
                        <RegraExpandivel content={item.descricao} expandAll={expandAll} />
                    </div>
                </>
            );

        case "ameacas":
            return <AmeacaCardBody item={item} />;

        case "equipamentos":
            const tipos = Array.isArray(item.tipo) ? item.tipo : [item.tipo];
            const isArma = tipos.includes("Arma");
            const isAmaldicoado = tipos.includes("Item Amaldiçoado");
            const hideSubtipo = isAmaldicoado && !isArma;

            const showCatEsp = !tipos.includes('Modificação') && !tipos.includes('Maldição');

            const statusEquip = [
                { label: "Proficiência", valor: item.arma?.armaTipo },
                { label: "Empunhadura", valor: item.arma?.empunhadura },
                { label: "Categoria", valor: item.arma?.catArma },
                { label: "Munição", valor: item.arma?.municao },
                { label: "Dano", valor: item.dano },
                { label: "Crítico", valor: item.critico },
                { label: "Alcance", valor: item.alcance },
                { label: "Tipo Dano", valor: item.tipoDano },
            ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

            return (
                <>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="w-full flex gap-2">
                            {showCatEsp && item.categoria && (
                                <div className="flex items-center justify-center overflow-hidden h-5">
                                    <span className="bg-gray-900 text-white font-special text-xs px-2 h-full flex items-center uppercase">Cat</span>
                                    <span className="font-bold text-gray-900 bg-white/70 border border-l-0 border-dashed border-gray-600 px-2 h-full text-sm flex items-center">{item.categoria}</span>
                                </div>
                            )}

                            {showCatEsp && item.espaco !== undefined && item.espaco !== null && (
                                <div className="flex items-center justify-center overflow-hidden h-5">
                                    <span className="bg-gray-900 text-white font-special text-xs px-2 h-full flex items-center uppercase">Esp</span>
                                    <span className="font-bold text-gray-900 bg-white/70 border border-l-0 border-dashed border-gray-600 px-2 h-full text-sm flex items-center">{item.espaco}</span>
                                </div>
                            )}
                        </div>

                        {tipos.map((t: string) => (
                            <span key={t} className={`${badgeClass} ${estiloBadgeTipo(t)}`}>{t}</span>
                        ))}

                        {item.subtipo && !hideSubtipo && (
                            <span className={`${badgeClass} border-dashed border-gray-400 bg-gray-200/50 text-gray-700`}>
                                {item.subtipo}
                            </span>
                        )}

                        {item.elemento && <span className={`${badgeClass} ${corElemento(item.elemento)}`}>{item.elemento}</span>}
                    </div>

                    {(isArma || tipos.includes("Proteção")) && statusEquip.length > 0 && (
                        <div className="mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 grid-cols-1 sm:grid-cols-2">
                            {statusEquip.map((s, i) => <LinhaStatus key={i} label={s.label} valor={s.valor} />)}
                        </div>
                    )}

                    <div className="text-sm text-gray-800 leading-relaxed mb-2">
                        <ExpandableText text={formatarDescricao(item.nome, item.descricao || "")} limit={isArma ? (statusEquip.length > 4 ? 160 : 280) : 240} forceExpand={expandAll} />
                    </div>
                </>
            );

        default:
            return (
                <>
                    {item.elemento && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Array.isArray(item.elemento) ? item.elemento.map((e: string) => (
                                <span key={e} className={`${badgeClass} border-gray-800`}>{e} {item.circulo}</span>
                            )) : (
                                <span className={`${badgeClass} border-gray-800`}>{item.elemento}</span>
                            )}
                        </div>
                    )}
                    <div className="text-sm text-gray-800 leading-relaxed mb-2">
                        <ExpandableText text={item.descricao || ""} limit={240} forceExpand={expandAll} />
                    </div>
                </>
            );
    }
};