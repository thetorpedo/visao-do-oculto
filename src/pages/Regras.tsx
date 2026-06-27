import BookReference from "@/components/BookReference";
import DocumentReader from "@/components/DocumentReader";
import FilterButton from "@/components/FilterButton";
import RegraRenderer from "@/components/RegraRenderer";
import { useData } from "@/context/DataContext";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

export default function Regras() {
    const { regras: regrasData } = useData();
    const [busca, setBusca] = useState("");
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
    const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

    // Novo estado para controlar qual regra está sendo exibida no painel de leitura
    const [regraSelecionada, setRegraSelecionada] = useState<any | null>(null);

    const buscaAdiada = useDeferredValue(busca);

    // Extrai todas as categorias únicas de todos os arrays 'categoria'
    const todasCategorias = useMemo(() => {
        const cats = new Set<string>();
        regrasData.forEach(r => r.categoria.forEach((c: string) => cats.add(c)));
        return Array.from(cats).sort();
    }, [regrasData]);

    const fuse = useMemo(() => {
        return new Fuse(regrasData, {
            keys: ["nome", "descricao", "categoria"],
            threshold: 0.3,
        });
    }, [regrasData]);

    const regrasFiltradas = useMemo(() => {
        const resultadoBusca = buscaAdiada.length > 2
            ? fuse.search(buscaAdiada).map(r => r.item)
            : regrasData;

        return resultadoBusca.filter(regra => {
            return categoriasSelecionadas.length === 0 ||
                regra.categoria.some((c: string) => categoriasSelecionadas.includes(c));
        });
    }, [buscaAdiada, regrasData, categoriasSelecionadas, fuse]);

    // Ordena pelo 'codigo' definido no seu Schema
    const regrasOrdenadas = useMemo(() => {
        return [...regrasFiltradas].sort((a, b) => a.codigo - b.codigo);
    }, [regrasFiltradas]);

    // Seleciona a primeira regra automaticamente ao carregar ou filtrar
    useEffect(() => {
        if (regrasOrdenadas.length > 0 && !regrasOrdenadas.find(r => r.id === regraSelecionada?.id)) {
            setRegraSelecionada(regrasOrdenadas[0]);
        } else if (regrasOrdenadas.length === 0) {
            setRegraSelecionada(null);
        }
    }, [regrasOrdenadas]);

    const toggleFiltro = (item: string) => {
        setCategoriasSelecionadas(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[85vh]">
            <DocumentReader
                fonteId={leitorAtivo?.fonte || ""}
                paginaImpressa={leitorAtivo?.pagina || 0}
                isOpen={!!leitorAtivo}
                onClose={() => setLeitorAtivo(null)}
            />

            {/* ─── PAINEL ESQUERDO: LISTA E FILTROS ─── */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">

                {/* Filtros */}
                <div className="relative">
                    <div className="p-5 relative flex flex-col justify-between z-10 w-full h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                        <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2 mb-4">
                            <Search className="size-5 mr-2 text-gray-600" />
                            <input
                                type="text"
                                placeholder={`Procurar nas ${regrasFiltradas.length} regras...`}
                                className="w-full bg-transparent outline-none font-medium"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="font-special text-xs mr-1 text-gray-700">Categorias:</span>
                            {todasCategorias.map(c => (
                                <FilterButton key={c} label={c} isSelected={categoriasSelecionadas.includes(c)} onClick={() => toggleFiltro(c)} />
                            ))}
                            {categoriasSelecionadas.length > 0 && (
                                <button onClick={() => setCategoriasSelecionadas([])} className="text-red-700 text-xs font-bold flex items-center underline ml-1">
                                    <X className="size-3 mr-0.5" /> Limpar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.3),rgba(139,139,139,0.1)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.1)] bg-repeat bg-size-[30%]" />
                </div>

                {/* Tabela de Regras (Estilo 5eTools) */}
                <div className="relative h-full">
                    <div className="flex-1 p-1 relative flex flex-col justify-between z-10 w-full h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300 max-h-200 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900/60 scrollbar-track-slate-500/10">
                        <table className="w-full text-left border-collapse text-sm ">
                            <thead className="bg-gray-900 text-white font-special text-xs sticky top-0 z-10 shadow-sm uppercase tracking-wider">
                                <tr>
                                    <th className="p-2 px-3 border-b border-gray-700 font-normal">Nome da Regra</th>
                                    <th className="p-2 px-3 border-b border-gray-700 font-normal hidden sm:table-cell">Categoria</th>
                                    <th className="p-2 px-3 border-b border-gray-700 font-normal hidden md:table-cell text-right">Fonte</th>
                                </tr>
                            </thead>
                            <tbody >
                                {regrasOrdenadas.map(regra => (
                                    <tr
                                        key={regra.id}
                                        onClick={() => setRegraSelecionada(regra)}
                                        className={`cursor-pointer border-b border-gray-200 transition-colors ${regraSelecionada?.id === regra.id
                                            ? "bg-gray-300 text-gray-900 font-bold border-l-gray-800"
                                            : "hover:bg-gray-100 text-gray-700 border-l-transparent"
                                            }`}
                                    >
                                        <td className="p-2 px-3 truncate min-w-0 max-w-0">{regra.nome}</td>
                                        <td className="p-2 px-3 hidden sm:table-cell text-xs opacity-75 truncate max-w-30">
                                            {regra.categoria.join(", ")}
                                        </td>
                                        <td className="p-2 px-3 hidden md:table-cell text-xs opacity-75 text-right whitespace-nowrap">
                                            {regra.fonteLivro}
                                        </td>
                                    </tr>
                                ))}
                                {regrasFiltradas.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-6 text-center text-gray-500 font-special">
                                            Nenhuma regra atende a estes filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.3),rgba(139,139,139,0.1)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.1)] bg-repeat bg-size-[30%]" />
                </div>

            </div>

            {/* ─── PAINEL DIREITO: LEITURA ─── */}
            <div className="w-full lg:w-2/3 h-[75vh] lg:h-auto">
                {regraSelecionada ? (
                    <div className="relative h-full">
                        <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

                            {/* Cabeçalho do Leitor */}
                            <div className="mb-6 border-b border-gray-400 border-dashed pb-4">
                                <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight mb-3">
                                    {regraSelecionada.nome}
                                </h2>

                                <div className="flex flex-wrap gap-4 items-center justify-between">
                                    {/* Tags na Esquerda */}
                                    <div className="flex gap-2">
                                        {regraSelecionada.categoria.map((cat: string) => (
                                            <span key={cat} className="text-xs uppercase font-bold bg-gray-800 text-white px-2 py-0.5 tracking-wide shadow-sm">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    {/* BookReference na Direita (Limpando margens/bordas padrão do componente pai) */}
                                    <div className="shrink-0 [&>div]:mt-0 [&>div]:pt-0 [&>div]:border-none">
                                        <BookReference
                                            fonte={regraSelecionada.fonteLivro}
                                            pagina={regraSelecionada.fontePagina}
                                            onOpenReader={() => setLeitorAtivo({
                                                fonte: regraSelecionada.fonteLivro,
                                                pagina: parseInt(String(regraSelecionada.fontePagina))
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo Renderizado (Markdown) */}
                            <div className="flex-1 mb-8">
                                <RegraRenderer content={regraSelecionada.descricao} />
                            </div>

                        </div>

                        {/* Sombreamento/Textura */}
                        <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 -rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.3),rgba(139,139,139,0.1)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.1)] bg-repeat bg-size-[30%]" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-200/40 border-2 border-dashed border-gray-400 p-10 text-center">
                        <Search className="size-12 text-gray-400 mb-4 opacity-50" />
                        <h3 className="font-special text-2xl text-gray-500">Nenhuma Regra Selecionada</h3>
                        <p className="text-gray-500 mt-2">Filtre ou selecione um item na lista ao lado para expandir seu conteúdo.</p>
                    </div>
                )}
            </div>

        </div>
    );
}