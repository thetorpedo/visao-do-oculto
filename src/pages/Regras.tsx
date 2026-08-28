import Source from "@/components/source";
import SaveButton from "@/components/save-button";
import FilterPanel from "@/components/filter-panel";
import RulesRenderer from "@/components/rules-renderer";
import PaperDiv from "@/components/ui/paper-div";
import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UiContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { badgeClass } from "@/components/ui/item-card";
import { estiloBadgeTipo } from "@/utils/badgeUtils";

const CONFIGS_FILTRO: ConfigFiltro[] = [
    {
        id: "categoria",
        label: "Categorias",
        opcoes: "auto",
        match: "array",
    },
    {
        id: "fonteLivro",
        label: "Fonte",
        opcoes: "auto",
        match: "partial",
    }
];

function removerMarkdown(texto: string): string {
    if (!texto) return "";
    return texto.replace(/[\*\_#]/g, "");
}

function SafeHTMLText({ html }: { html: string }) {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Regras() {
    const { regras } = useData();
    const { abrirCriar, abrirEditar, abrirLeitor } = useUI();
    const [regraSelecionada, setRegraSelecionada] = useState<any | null>(null);

    const filtros = useFiltros(regras, CONFIGS_FILTRO);

    const dadosHigienizadosParaFuse = useMemo(() => {
        return regras.map(r => ({
            id: r.id,
            nomeLimpo: removerMarkdown(r.nome),
            descricaoLimpa: removerMarkdown(r.descricao)
        }));
    }, [regras]);

    const fuse = useMemo(() => {
        return new Fuse(dadosHigienizadosParaFuse, {
            keys: [
                { name: "nomeLimpo", weight: 3.0 },
                { name: "descricaoLimpa", weight: 1.0 }
            ],
            threshold: 0.35,
            location: 0,
            distance: 40,
            findAllMatches: false,
            includeMatches: true,
            ignoreLocation: true,
        });
    }, [dadosHigienizadosParaFuse]);

    const regrasOrdenadas = useMemo(() => {
        if (!filtros.busca || filtros.busca.trim().length < 2) {
            return [...filtros.dadosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
        }

        const resultadoFuse = fuse.search(filtros.busca);
        const idsFiltrados = new Set(filtros.dadosFiltrados.map((d) => d.id));
        const termo = filtros.busca.toLowerCase().trim();

        const filtrados = resultadoFuse
            .filter((res) => idsFiltrados.has(res.item.id))
            .map(res => regras.find(r => r.id === res.item.id)!);

        return filtrados.sort((a, b) => {
            const temExatoA = a.descricao.toLowerCase().includes(termo) || a.nome.toLowerCase().includes(termo);
            const temExatoB = b.descricao.toLowerCase().includes(termo) || b.nome.toLowerCase().includes(termo);
            if (temExatoA && !temExatoB) return -1;
            if (!temExatoA && temExatoB) return 1;
            return 0;
        });
    }, [filtros.dadosFiltrados, filtros.busca, fuse, regras]);

    useEffect(() => {
        if (regrasOrdenadas.length > 0 && !regrasOrdenadas.find((r) => r.id === regraSelecionada?.id)) {
            setRegraSelecionada(regrasOrdenadas[0]);
        } else if (regrasOrdenadas.length === 0) {
            setRegraSelecionada(null);
        }
    }, [regrasOrdenadas, regraSelecionada]);

    const renderSnippet = (descricaoBruta: string) => {
        const textoLimpo = removerMarkdown(descricaoBruta);
        if (!filtros.busca || filtros.busca.trim().length < 2) {
            return textoLimpo.length > 60 ? `${textoLimpo.slice(0, 60)}...` : textoLimpo;
        }

        const termo = filtros.busca.toLowerCase().trim();
        let start = textoLimpo.toLowerCase().indexOf(termo);

        if (start === -1) start = textoLimpo.toLowerCase().indexOf(termo.slice(0, Math.max(3, termo.length - 2)));
        if (start === -1) return textoLimpo.length > 60 ? `${textoLimpo.slice(0, 60)}...` : textoLimpo;

        const end = start + termo.length;
        const margem = 15;
        const pontoInicial = Math.max(0, start - margem);
        const pontoFinal = Math.min(textoLimpo.length, end + margem + 20);

        let snippet = textoLimpo.slice(pontoInicial, pontoFinal);
        const regexSub = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

        let snippetGrifado = snippet.replace(regexSub, `<mark class="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded-sm">$1</mark>`);

        if (pontoInicial > 0) snippetGrifado = `...${snippetGrifado}`;
        if (pontoFinal < textoLimpo.length) snippetGrifado = `${snippetGrifado}...`;

        return <SafeHTMLText html={snippetGrifado} />;
    };

    const descricaoComDestaquesMarkdown = useMemo(() => {
        if (!regraSelecionada) return "";
        if (!filtros.busca || filtros.busca.trim().length < 2) return regraSelecionada.descricao;

        const termoRaw = filtros.busca.trim();
        const textoOriginal = regraSelecionada.descricao;

        let termoValido = termoRaw;
        if (textoOriginal.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 && termoValido.length > 4) {
            termoValido = termoRaw.slice(0, termoRaw.length - 1);
        }
        if (textoOriginal.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 && termoValido.length > 4) {
            termoValido = termoRaw.slice(0, termoRaw.length - 2);
        }

        const termoEscapado = termoValido.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${termoEscapado})`, 'gi');

        return textoOriginal.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded-sm font-semibold">$1</mark>');
    }, [regraSelecionada, filtros.busca]);

    return (
        <div className="flex flex-col gap-6 h-full min-h-[85vh]">
            <FilterPanel
                {...filtros}
                placeholder={`Procurar nas ${regrasOrdenadas.length} regras...`}
                totalItens={regrasOrdenadas.length}
                onCriarNovo={() => abrirCriar('regras')}
            />

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[85vh]">

                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="relative h-full flex flex-col grow group">
                        <PaperDiv className="flex-1 flex flex-col w-full h-full p-1! max-h-60 sm:max-h-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-500/10">

                            <div className="flex flex-col border-t border-gray-200">
                                {regrasOrdenadas.map((regra) => {
                                    const estaSelecionado = regraSelecionada?.id === regra.id;
                                    const termoRaw = filtros.busca.trim();

                                    let termoValido = termoRaw;
                                    if (regra.nome.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 && termoValido.length > 4) {
                                        termoValido = termoRaw.slice(0, termoRaw.length - 1);
                                    }
                                    const regexNome = new RegExp(`(${termoValido.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
                                    const nomeFormatado = filtros.busca && filtros.busca.trim().length >= 2
                                        ? regra.nome.replace(regexNome, `<mark class="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded-sm">$1</mark>`)
                                        : regra.nome;

                                    return (
                                        <div
                                            key={regra.id}
                                            onClick={() => setRegraSelecionada(regra)}
                                            className={`group flex flex-col py-1 px-2 text-left transition-all border-b border-gray-200 cursor-pointer select-none relative ${estaSelecionado ? "bg-gray-300/70 text-gray-900 shadow-sm" : "hover:bg-gray-100/80 text-gray-700"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center gap-2 w-full min-w-0">
                                                <span className={`text-xs tracking-wide truncate leading-relaxed ${estaSelecionado ? "font-bold" : "font-medium"}`}>
                                                    <SafeHTMLText html={nomeFormatado} />
                                                </span>

                                                <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                                                    <div className="hidden sm:flex gap-0.5 max-w-40 overflow-hidden truncate whitespace-nowrap">
                                                        {regra.categoria.slice(0, 2).map((cat: string) => (
                                                            <span key={cat} className="text-[10px] max-w-20 font-semibold truncate uppercase tracking-tight text-gray-600 bg-gray-400/10 border border-gray-400/50 px-1 py-0">
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="font-semibold text-[10px] tracking-tight text-gray-600 bg-white/80 border border-gray-300 px-1">
                                                        {regra.fonteLivro}
                                                    </span>
                                                </div>
                                            </div>

                                            {filtros.busca && filtros.busca.trim().length >= 2 && (
                                                <div className="text-[11px] text-gray-500 font-normal leading-normal mt-0.5 mb-0.5 border-l-2 border-gray-400/30 pl-1.5 truncate max-w-full">
                                                    {renderSnippet(regra.descricao)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {regrasOrdenadas.length === 0 && (
                                <div className="p-8 text-center text-gray-500 font-special text-xs">
                                    Nenhuma regra atende a estes filtros.
                                </div>
                            )}
                        </PaperDiv>
                    </div>
                </div>

                <div className="w-full lg:w-2/3 h-[75vh] lg:h-auto max-h-200">
                    {regraSelecionada ? (
                        <div className="relative h-full group">
                            <PaperDiv className="flex flex-col h-full w-full">
                                <div className="mb-4 border-b border-gray-400 border-dashed pb-4">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight">
                                            {regraSelecionada.nome}
                                        </h2>

                                        <div className="flex flex-row gap-2 shrink-0">
                                            <button
                                                onClick={() => abrirEditar("regras", regraSelecionada)}
                                                className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
                                                title="Editar"
                                            >
                                                <Pencil className="size-5 transition-all text-gray-500 hover:text-gray-900" />
                                            </button>
                                            <SaveButton itemId={regraSelecionada.id} categoria="regras" />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center justify-between">
                                        <div className="flex gap-2">
                                            {regraSelecionada.categoria.map((cat: string) => (
                                                <span key={cat} className={`${badgeClass} ${estiloBadgeTipo('default')}`}>{cat}</span>
                                            ))}
                                        </div>
                                        <div className="shrink-0 [&>div]:mt-0 [&>div]:pt-0 [&>div]:border-none">
                                            <Source
                                                fonte={regraSelecionada.fonteLivro}
                                                pagina={regraSelecionada.fontePagina}
                                                onOpenReader={() => abrirLeitor(regraSelecionada.fonteLivro, parseInt(String(regraSelecionada.fontePagina)))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 mb-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-500/10">
                                    <RulesRenderer content={descricaoComDestaquesMarkdown} />
                                </div>
                            </PaperDiv>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-200/40 border-2 border-dashed border-gray-400 p-10 text-center">
                            <h3 className="font-special text-2xl text-gray-500">Nenhuma Regra Selecionada</h3>
                            <p className="text-gray-500 mt-2">Filtre ou selecione um item na lista ao lado para expandir seu conteúdo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}