import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { useData, type Categoria } from "@/context/DataContext";
import FolderDiv from "@/components/ui/folder-div";
import PaperDiv from "@/components/ui/paper-div";

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
    poderes: "Poder",
    rituais: "Ritual",
    equipamentos: "Equipamento",
    origens: "Origem",
    trilhas: "Trilha",
    regras: "Regra",
    ameacas: "Ameaça",
};

const CATEGORIAS: Categoria[] = [
    "ameacas",
    "poderes",
    "rituais",
    "equipamentos",
    "origens",
    "trilhas",
    "regras",
];

const normalizar = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function removerMarkdown(texto: string): string {
    if (!texto) return "";
    return texto.replace(/[\*\_#]/g, "");
}

interface ItemBusca {
    id: string;
    nome: string;
    categoria: Categoria;
    descricao?: string | null;
    fonteLivro?: string;
}

export default function RegistroPicker({
    onSelect,
    onClose,
}: {
    onSelect: (categoria: Categoria, itemId: string) => void;
    onClose: () => void;
}) {
    const { poderes, rituais, equipamentos, origens, trilhas, regras, ameacas } = useData();
    const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | "todos">("todos");
    const [busca, setBusca] = useState("");
    const [indiceSelecionado, setIndiceSelecionado] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Monta todos os registros estruturados
    const todosItens = useMemo<ItemBusca[]>(() => [
        ...ameacas.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "ameacas" as Categoria,
            descricao: `VD ${i.vd} • ${i.tipo} • ${i.tamanho}${i.apresentacao ? ` — ${i.apresentacao}` : ""}`,
            fonteLivro: i.fonteLivro,
        })),
        ...poderes.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "poderes" as Categoria,
            descricao: i.descricao,
            fonteLivro: i.fonteLivro,
        })),
        ...rituais.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "rituais" as Categoria,
            descricao: `${(i.elemento ?? []).join("/")} ${i.circulo ?? ""} • ${i.descricao ?? ""}`,
            fonteLivro: i.fonteLivro,
        })),
        ...equipamentos.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "equipamentos" as Categoria,
            descricao: i.descricao,
            fonteLivro: i.fonteLivro,
        })),
        ...origens.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "origens" as Categoria,
            descricao: i.descricao,
            fonteLivro: i.fonteLivro,
        })),
        ...trilhas.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "trilhas" as Categoria,
            descricao: i.descricao,
            fonteLivro: i.fonteLivro,
        })),
        ...regras.map((i) => ({
            id: i.id,
            nome: i.nome,
            categoria: "regras" as Categoria,
            descricao: i.descricao,
            fonteLivro: i.fonteLivro,
        })),
    ], [poderes, rituais, equipamentos, origens, trilhas, regras, ameacas]);

    // Filtragem e busca
    const resultados = useMemo(() => {
        let lista = todosItens;
        if (categoriaFiltro !== "todos") {
            lista = lista.filter((i) => i.categoria === categoriaFiltro);
        }

        const termo = normalizar(busca.trim());
        if (termo) {
            lista = lista.filter(
                (i) =>
                    normalizar(i.nome).includes(termo) ||
                    normalizar(i.descricao ?? "").includes(termo)
            );
        }

        return lista.sort((a, b) => {
            if (termo) {
                const aNomeExato = normalizar(a.nome).startsWith(termo);
                const bNomeExato = normalizar(b.nome).startsWith(termo);
                if (aNomeExato && !bNomeExato) return -1;
                if (!aNomeExato && bNomeExato) return 1;
            }
            return a.nome.localeCompare(b.nome);
        });
    }, [todosItens, categoriaFiltro, busca]);

    useEffect(() => {
        setIndiceSelecionado(0);
    }, [categoriaFiltro, busca]);

    useEffect(() => {
        itemRefs.current[indiceSelecionado]?.scrollIntoView({ block: "nearest" });
    }, [indiceSelecionado]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (resultados.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceSelecionado((prev) => (prev + 1) % resultados.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceSelecionado((prev) => (prev - 1 + resultados.length) % resultados.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const ativo = resultados[indiceSelecionado] ?? resultados[0];
            if (ativo) onSelect(ativo.categoria, ativo.id);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-70 flex items-start justify-center px-4 bg-black/50 backdrop-blur-xs">
            {/* Overlay para fechar ao clicar fora */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal FolderDiv idêntico ao GlobalSearch */}
            <FolderDiv className="relative w-full my-auto max-w-2xl flex flex-col max-h-[78vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Barra de Pesquisa */}
                <div className="flex items-center px-4 py-2 border-2 border-dashed border-black/40 dark:border-zinc-700 bg-black/5 dark:bg-black/30 text-black/90 dark:text-zinc-100 shrink-0">
                    <Search className="size-4 opacity-90 mr-2.5 shrink-0 text-black/70 dark:text-emerald-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Pesquisar registros para o slot do escudo..."
                        className="grow bg-transparent outline-none font-special text-sm placeholder:text-black/40 dark:placeholder:text-zinc-500 text-black/90 dark:text-zinc-100"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-black/90 dark:text-zinc-400 hover:text-red-700 dark:hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Fechar (Esc)"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Filtros de Categoria em linha estilo marcadores */}
                <div className="flex flex-wrap items-center gap-1 mt-2.5 pb-2 border-b border-black/15 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setCategoriaFiltro("todos")}
                        className={`cursor-pointer px-2 py-0.5 font-special text-xs uppercase tracking-wide transition-all border ${
                            categoriaFiltro === "todos"
                                ? "bg-black text-white dark:bg-emerald-500/20 dark:border-emerald-500/60 dark:text-emerald-300 border-black"
                                : "border-black/20 dark:border-zinc-800 bg-white/40 dark:bg-[#121514] text-black/70 dark:text-zinc-400 hover:bg-white"
                        }`}
                    >
                        Todos
                    </button>
                    {CATEGORIAS.map((cat) => {
                        const ativa = categoriaFiltro === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategoriaFiltro(cat)}
                                className={`cursor-pointer px-2 py-0.5 font-special text-xs uppercase tracking-wide transition-all border ${
                                    ativa
                                        ? "bg-black text-white dark:bg-emerald-500/20 dark:border-emerald-500/60 dark:text-emerald-300 border-black"
                                        : "border-black/20 dark:border-zinc-800 bg-white/40 dark:bg-[#121514] text-black/70 dark:text-zinc-400 hover:bg-white"
                                }`}
                            >
                                {ROTULO_CATEGORIA[cat]}s
                            </button>
                        );
                    })}
                </div>

                {/* Lista de Resultados estilo PaperDiv */}
                <div className="overflow-y-auto max-h-100 min-h-[45vh] p-1 scrollbar-thin flex flex-col gap-1.5 mt-2">
                    {resultados.length === 0 ? (
                        <div className="p-8 text-center text-black/60 dark:text-zinc-400 font-special text-sm">
                            Nenhum registro encontrado{busca ? ` para "${busca}"` : ""}.
                        </div>
                    ) : (
                        resultados.slice(0, 100).map((item, idx) => {
                            const estaSelecionado = idx === indiceSelecionado;
                            return (
                                <div
                                    key={`${item.categoria}-${item.id}`}
                                    ref={(el) => {
                                        itemRefs.current[idx] = el;
                                    }}
                                    onMouseEnter={() => setIndiceSelecionado(idx)}
                                    onClick={() => onSelect(item.categoria, item.id)}
                                    className="cursor-pointer"
                                >
                                    <PaperDiv
                                        className={`group flex flex-col py-2.5 px-3 text-left shadow-none! transition-all ${
                                            estaSelecionado
                                                ? "bg-[linear-gradient(rgba(253,224,71,0.22),rgba(253,224,71,0.22)),url(/assets/paper.png)] dark:bg-[linear-gradient(rgba(34,197,94,0.28),rgba(34,197,94,0.28)),url(/assets/paper.png)] dark:border-emerald-400!"
                                                : "hover:bg-black/5 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center gap-2 w-full min-w-0">
                                            <span className="text-sm text-black/90 dark:text-zinc-100 font-special truncate font-bold">
                                                {item.nome}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[11px] uppercase font-daisy bg-black dark:bg-zinc-800 text-white dark:text-zinc-200 px-2 py-0.5">
                                                    {ROTULO_CATEGORIA[item.categoria] ?? item.categoria}
                                                </span>
                                                {item.fonteLivro && (
                                                    <span className="text-[10px] uppercase font-daisy text-black/60 dark:text-zinc-400 border border-black/20 dark:border-zinc-700 px-1.5 py-0.2">
                                                        {item.fonteLivro}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {item.descricao && (
                                            <p className="text-xs text-black/70 dark:text-zinc-400 font-daisy line-clamp-1 mt-1">
                                                {removerMarkdown(item.descricao)}
                                            </p>
                                        )}
                                    </PaperDiv>
                                </div>
                            );
                        })
                    )}
                </div>
            </FolderDiv>
        </div>,
        document.body
    );
}
