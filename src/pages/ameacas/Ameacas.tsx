import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import PaperDiv from "@/components/ui/paper-div";
import ThreatSheet from "@/components/ui/threat-sheet";
import FilterPanel from "@/components/filter/filter-panel";
import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UiContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import type { Ameaca } from "@/lib/schemas";
import { corElemento } from "@/utils/badgeUtils";

function calcularFaixaVd(vd: number): string {
    if (vd <= 20) return "0–20";
    if (vd <= 60) return "21–60";
    if (vd <= 120) return "61–120";
    if (vd <= 200) return "121–200";
    return "201+";
}

const CONFIGS_FILTRO: ConfigFiltro[] = [
    {
        id: "faixaVd",
        label: "VD",
        opcoes: ["0–20", "21–60", "61–120", "121–200", "201+"],
    },
    {
        id: "tipo",
        label: "Tipo",
        opcoes: "auto",
    },
    {
        id: "tamanho",
        label: "Tamanho",
        opcoes: "auto",
    },
    {
        id: "todosElementos",
        label: "Elemento",
        opcoes: "auto",
        match: "array",
    },
    {
        id: "grupos",
        label: "Grupos",
        opcoes: "auto",
        match: "array",
    },
    {
        id: "temEnigma",
        label: "Enigma",
        opcoes: ["Sim", "Não"],
    },
    {
        id: "fonteLivro",
        label: "Fonte",
        opcoes: "auto",
        match: "partial",
    },
];

function removerMarkdown(texto: string): string {
    if (!texto) return "";
    return texto.replace(/[\*\_#]/g, "");
}

function extrairTextoBusca(a: Ameaca): string {
    const partes = [
        a.apresentacao ?? "",
        a.observacoes ?? "",
        ...(a.grupos ?? []),
        ...(a.blocos ?? []).map((b) => `${b.titulo} ${(b.tags ?? []).join(" ")} ${b.descricao}`),
    ];
    return removerMarkdown(partes.filter(Boolean).join(" "));
}

function SafeHTMLText({ html }: { html: string }) {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type AmeacaComVirtuais = Ameaca & {
    faixaVd: string;
    todosElementos: string[];
    temEnigma: string;
};

export default function Ameacas() {
    const { ameacas } = useData();
    const { abrirCriar } = useUI();
    const [searchParams, setSearchParams] = useSearchParams();
    const idSelecionadoUrl = searchParams.get("id");
    const [ameacaSelecionada, setAmeacaSelecionada] = useState<Ameaca | null>(null);

    const ameacasMapeadas = useMemo<AmeacaComVirtuais[]>(() => {
        return ameacas.map((a) => ({
            ...a,
            faixaVd: calcularFaixaVd(a.vd),
            todosElementos: Array.from(new Set([...(a.elementos ?? []), ...(a.elementosSecundarios ?? [])])),
            temEnigma: (a.blocos ?? []).some((b) => b.secao === "enigma") ? "Sim" : "Não",
        }));
    }, [ameacas]);

    const filtros = useFiltros(ameacasMapeadas, CONFIGS_FILTRO);

    const dadosHigienizadosParaFuse = useMemo(() => {
        return ameacasMapeadas.map((a) => ({
            id: a.id,
            nomeLimpo: removerMarkdown(a.nome),
            descricaoLimpa: extrairTextoBusca(a),
        }));
    }, [ameacasMapeadas]);

    const fuse = useMemo(() => {
        return new Fuse(dadosHigienizadosParaFuse, {
            keys: [
                { name: "nomeLimpo", weight: 3.0 },
                { name: "descricaoLimpa", weight: 1.0 },
            ],
            threshold: 0.35,
            location: 0,
            distance: 40,
            findAllMatches: false,
            includeMatches: true,
            ignoreLocation: true,
        });
    }, [dadosHigienizadosParaFuse]);

    const ameacasOrdenadas = useMemo(() => {
        const termoBusca = filtros.busca.trim();
        if (!termoBusca) {
            return [...filtros.dadosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
        }

        const resultadoFuse = fuse.search(termoBusca);
        const idsFiltrados = new Set(filtros.dadosFiltrados.map((d) => d.id));
        const termo = termoBusca.toLowerCase();

        const idsEncontrados = new Set<string>();
        const filtrados: AmeacaComVirtuais[] = [];

        for (const item of filtros.dadosFiltrados) {
            const textoCompleto = `${item.nome} ${extrairTextoBusca(item)}`.toLowerCase();
            if (textoCompleto.includes(termo)) {
                idsEncontrados.add(item.id);
                filtrados.push(item);
            }
        }

        for (const res of resultadoFuse) {
            if (idsFiltrados.has(res.item.id) && !idsEncontrados.has(res.item.id)) {
                const encontrado = ameacasMapeadas.find((a) => a.id === res.item.id);
                if (encontrado) {
                    idsEncontrados.add(encontrado.id);
                    filtrados.push(encontrado);
                }
            }
        }

        return filtrados.sort((a, b) => {
            const nomeExatoA = a.nome.toLowerCase().includes(termo);
            const nomeExatoB = b.nome.toLowerCase().includes(termo);
            if (nomeExatoA && !nomeExatoB) return -1;
            if (!nomeExatoA && nomeExatoB) return 1;
            return 0;
        });
    }, [filtros.dadosFiltrados, filtros.busca, fuse, ameacasMapeadas]);

    useEffect(() => {
        if (idSelecionadoUrl && ameacasMapeadas.length > 0) {
            const daUrl = ameacasMapeadas.find((a) => a.id === idSelecionadoUrl);
            if (daUrl) {
                setAmeacaSelecionada(daUrl);
                setSearchParams(
                    (prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("id");
                        return next;
                    },
                    { replace: true }
                );
                return;
            }
        }

        if (ameacasOrdenadas.length > 0 && !ameacasOrdenadas.find((a) => a.id === ameacaSelecionada?.id)) {
            setAmeacaSelecionada(ameacasOrdenadas[0]);
        } else if (ameacasOrdenadas.length === 0) {
            setAmeacaSelecionada(null);
        } else if (ameacaSelecionada) {
            const atualizada = ameacasOrdenadas.find((a) => a.id === ameacaSelecionada.id);
            if (atualizada && atualizada !== ameacaSelecionada) {
                setAmeacaSelecionada(atualizada);
            }
        }
    }, [idSelecionadoUrl, ameacasMapeadas, ameacasOrdenadas, ameacaSelecionada, setSearchParams]);

    return (
        <div className="flex flex-col gap-6 h-full min-h-[85vh]">
            <FilterPanel
                {...filtros}
                placeholder={`Procurar nas ${ameacasOrdenadas.length} ameaças...`}
                totalItens={ameacasOrdenadas.length}
                onCriarNovo={() => abrirCriar("ameacas")}
            />

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[85vh]">
                {/* Lista compacta à esquerda */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="relative h-full flex flex-col grow group">
                        <PaperDiv className="flex-1 flex flex-col w-full h-full p-1! max-h-60 sm:max-h-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-500/10">
                            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-2 py-1.5 border-b-2 border-gray-400 font-special text-[10px] uppercase tracking-wider text-gray-600 bg-black/5">
                                <span>Nome</span>
                                <span className="text-center">VD</span>
                                <span className="hidden sm:inline">Tipo</span>
                                <span>Elem.</span>
                                <span>Fonte</span>
                            </div>

                            <div className="flex flex-col">
                                {ameacasOrdenadas.map((ameaca) => {
                                    const estaSelecionado = ameacaSelecionada?.id === ameaca.id;
                                    const termoRaw = filtros.busca.trim();

                                    let termoValido = termoRaw;
                                    if (
                                        ameaca.nome.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 &&
                                        termoValido.length > 4
                                    ) {
                                        termoValido = termoRaw.slice(0, termoRaw.length - 1);
                                    }
                                    const regexNome = new RegExp(
                                        `(${termoValido.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                                        "i"
                                    );
                                    const nomeFormatado =
                                        filtros.busca && filtros.busca.trim().length >= 2
                                            ? ameaca.nome.replace(
                                                regexNome,
                                                `<mark class="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded-sm">$1</mark>`
                                            )
                                            : ameaca.nome;

                                    return (
                                        <div
                                            key={ameaca.id}
                                            onClick={() => setAmeacaSelecionada(ameaca)}
                                            className={`group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 py-1.5 px-2 text-left transition-all border-b border-gray-200 cursor-pointer select-none relative ${estaSelecionado
                                                    ? "bg-gray-300/70 text-gray-900 shadow-xs"
                                                    : "hover:bg-gray-100/80 text-gray-700"
                                                }`}
                                        >
                                            <span
                                                className={`text-xs tracking-wide text-black truncate leading-relaxed min-w-0 ${estaSelecionado ? "font-bold" : "font-medium"
                                                    }`}
                                            >
                                                <SafeHTMLText html={nomeFormatado} />
                                            </span>

                                            <span className="font-special text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 shrink-0">
                                                VD {ameaca.vd}
                                            </span>

                                            <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-tight text-black/70 bg-black/10 px-1.5 py-0.5 truncate max-w-20">
                                                {ameaca.tipo}
                                            </span>

                                            <div className="flex items-center gap-0.5 shrink-0">
                                                {ameaca.elementos.length === 0 &&
                                                    ameaca.elementosSecundarios.length === 0 ? (
                                                    <span className="text-[10px] text-gray-400 px-1">—</span>
                                                ) : (
                                                    <>
                                                        {ameaca.elementos.map((el) => (
                                                            <span
                                                                key={`p-${el}`}
                                                                title={el}
                                                                className={`text-[9px] font-daisy uppercase px-1 py-0 border ${corElemento(el)}`}
                                                            >
                                                                {el.slice(0, 3)}
                                                            </span>
                                                        ))}
                                                        {ameaca.elementosSecundarios.map((el) => (
                                                            <span
                                                                key={`s-${el}`}
                                                                title={`${el} (secundário)`}
                                                                className={`text-[9px] font-daisy uppercase px-1 py-0 border ${corElemento(el)}`}
                                                            >
                                                                {el.slice(0, 3)}
                                                            </span>
                                                        ))}
                                                    </>
                                                )}
                                            </div>

                                            <span className="font-semibold text-[10px] border border-dashed tracking-tight text-gray-600 bg-white/80 border-gray-400/70 px-1 shrink-0">
                                                {ameaca.fonteLivro}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {ameacasOrdenadas.length === 0 && (
                                <div className="p-8 text-center text-gray-500 font-special text-xs">
                                    Nenhuma ameaça atende a estes filtros.
                                </div>
                            )}
                        </PaperDiv>
                    </div>
                </div>

                {/* Ficha completa à direita */}
                <div className="w-full lg:w-2/3 h-[75vh] lg:h-auto max-h-200">
                    {ameacaSelecionada ? (
                        <div className="relative h-full group">
                            <PaperDiv className="flex flex-col h-full w-full">
                                <ThreatSheet ameaca={ameacaSelecionada} />
                            </PaperDiv>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-200/40 border-2 border-dashed border-gray-400 p-10 text-center">
                            <h3 className="font-special text-2xl text-gray-500">Nenhuma Ameaça Selecionada</h3>
                            <p className="text-gray-500 mt-2">
                                Filtre ou selecione um item na lista ao lado para expandir sua ficha.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
