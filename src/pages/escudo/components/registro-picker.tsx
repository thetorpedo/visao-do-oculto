import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData, type Categoria } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import FolderDiv from "@/components/ui/folder-div";
import PaperDiv from "@/components/ui/paper-div";

const ROTULO_CATEGORIA: Record<Categoria, string> = {
    poderes: "Poder",
    rituais: "Ritual",
    equipamentos: "Equipamento",
    origens: "Origem",
    trilhas: "Trilha",
    regras: "Regra",
    ameacas: "Ameaça",
};

const ROTULO_PLURAL: Record<Categoria | "todos", string> = {
    todos: "Todos",
    ameacas: "Ameaças",
    poderes: "Poderes",
    rituais: "Rituais",
    equipamentos: "Equipamentos",
    origens: "Origens",
    trilhas: "Trilhas",
    regras: "Regras",
};

const CATEGORIAS: Categoria[] = ["ameacas", "poderes", "rituais", "equipamentos", "origens", "trilhas", "regras"];
const LIMITE_RESULTADOS = 100;

const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const removerMarkdown = (texto: string) => texto.replace(/[*_#]/g, "");

interface Registro {
    id: string;
    nome: string;
    descricao?: string | null;
    fonteLivro?: string;
    vd?: number | string;
    tipo?: string;
    tamanho?: string;
    apresentacao?: string;
    elemento?: string[];
    circulo?: string | number;
}

interface ItemBusca {
    id: string;
    nome: string;
    categoria: Categoria;
    descricao?: string | null;
    fonteLivro?: string;
}

function descricaoDoItem(categoria: Categoria, i: Registro): string | null | undefined {
    if (categoria === "ameacas") {
        return `VD ${i.vd} • ${i.tipo} • ${i.tamanho}${i.apresentacao ? ` — ${i.apresentacao}` : ""}`;
    }
    if (categoria === "rituais") {
        return `${(i.elemento ?? []).join("/")} ${i.circulo ?? ""} • ${i.descricao ?? ""}`;
    }
    return i.descricao;
}

const estiloFiltro = (ativo: boolean) =>
    ativo
        ? "border-black bg-black text-white hover:bg-black dark:border-emerald-500/60 dark:bg-emerald-500/20 dark:text-emerald-300"
        : "border-black/20 bg-white/40 text-black/70 hover:bg-white dark:border-zinc-800 dark:bg-[#121514] dark:text-zinc-400 dark:hover:bg-[#121514]";

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
        const aoPressionar = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", aoPressionar);
        return () => window.removeEventListener("keydown", aoPressionar);
    }, [onClose]);

    const todosItens = useMemo<ItemBusca[]>(() => {
        const listas = { ameacas, poderes, rituais, equipamentos, origens, trilhas, regras } as unknown as Record<
            Categoria,
            Registro[]
        >;
        return CATEGORIAS.flatMap((categoria) =>
            listas[categoria].map((i) => ({
                id: i.id,
                nome: i.nome,
                categoria,
                descricao: descricaoDoItem(categoria, i),
                fonteLivro: i.fonteLivro,
            }))
        );
    }, [poderes, rituais, equipamentos, origens, trilhas, regras, ameacas]);

    const resultados = useMemo(() => {
        const termo = normalizar(busca.trim());
        const lista = todosItens.filter(
            (i) =>
                (categoriaFiltro === "todos" || i.categoria === categoriaFiltro) &&
                (!termo || normalizar(i.nome).includes(termo) || normalizar(i.descricao ?? "").includes(termo))
        );

        return lista.sort((a, b) => {
            if (termo) {
                const aInicio = normalizar(a.nome).startsWith(termo);
                const bInicio = normalizar(b.nome).startsWith(termo);
                if (aInicio !== bInicio) return aInicio ? -1 : 1;
            }
            return a.nome.localeCompare(b.nome);
        });
    }, [todosItens, categoriaFiltro, busca]);

    useEffect(() => {
        itemRefs.current[indiceSelecionado]?.scrollIntoView({ block: "nearest" });
    }, [indiceSelecionado]);

    const alterarBusca = (valor: string) => {
        setBusca(valor);
        setIndiceSelecionado(0);
    };

    const alterarCategoria = (categoria: Categoria | "todos") => {
        setCategoriaFiltro(categoria);
        setIndiceSelecionado(0);
    };

    const aoDigitar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (resultados.length === 0) return;

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const passo = e.key === "ArrowDown" ? 1 : -1;
            setIndiceSelecionado((prev) => (prev + passo + resultados.length) % resultados.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const ativo = resultados[indiceSelecionado] ?? resultados[0];
            onSelect(ativo.categoria, ativo.id);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-70 flex items-start justify-center bg-black/50 px-4 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={onClose} />

            <FolderDiv className="relative my-auto flex max-h-[78vh] w-full max-w-2xl animate-in flex-col overflow-hidden duration-200 fade-in zoom-in-95">
                <div className="flex shrink-0 items-center border-2 border-dashed border-black/40 bg-black/5 px-4 py-2 text-black/90 dark:border-zinc-700 dark:bg-black/30 dark:text-zinc-100">
                    <Search className="mr-2.5 size-4 shrink-0 text-black/70 dark:text-emerald-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Pesquisar registros para o slot do escudo..."
                        className="grow bg-transparent font-special text-sm text-black/90 outline-none placeholder:text-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        value={busca}
                        onChange={(e) => alterarBusca(e.target.value)}
                        onKeyDown={aoDigitar}
                    />
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="hover:text-red-700 dark:text-zinc-400 dark:hover:text-red-400"
                        title="Fechar (Esc)"
                        onClick={onClose}
                    >
                        <X />
                    </Button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1 border-b border-black/15 pb-2 dark:border-zinc-800">
                    {(["todos", ...CATEGORIAS] as const).map((cat) => (
                        <Button
                            key={cat}
                            variant="outline"
                            size="xs"
                            className={cn("border-solid uppercase tracking-wide", estiloFiltro(categoriaFiltro === cat))}
                            onClick={() => alterarCategoria(cat)}
                        >
                            {ROTULO_PLURAL[cat]}
                        </Button>
                    ))}
                </div>

                <div className="scrollbar-thin mt-2 flex max-h-100 min-h-[45vh] flex-col gap-1.5 overflow-y-auto p-1">
                    {resultados.length === 0 ? (
                        <div className="p-8 text-center font-special text-sm text-black/60 dark:text-zinc-400">
                            Nenhum registro encontrado{busca ? ` para "${busca}"` : ""}.
                        </div>
                    ) : (
                        resultados.slice(0, LIMITE_RESULTADOS).map((item, idx) => (
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
                                    className={cn(
                                        "flex flex-col px-3 py-2! mb-1 text-left shadow-none! transition-all",
                                        idx === indiceSelecionado
                                            ? "bg-[linear-gradient(rgba(253,224,71,0.22),rgba(253,224,71,0.22)),url(/assets/paper.png)] dark:border-emerald-400! dark:bg-[linear-gradient(rgba(34,197,94,0.28),rgba(34,197,94,0.28)),url(/assets/paper.png)]"
                                            : "hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex w-full min-w-0 items-center justify-between gap-2">
                                        <span className="truncate font-special text-sm font-bold text-black/90 dark:text-zinc-100">
                                            {item.nome}
                                        </span>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <span className="bg-black px-2 py-0.5 font-daisy text-[11px] uppercase text-white dark:bg-zinc-800 dark:text-zinc-200">
                                                {ROTULO_CATEGORIA[item.categoria]}
                                            </span>
                                            {item.fonteLivro && (
                                                <span className="border border-black/20 px-1.5 py-0.5 font-daisy text-[10px] uppercase text-black/60 dark:border-zinc-700 dark:text-zinc-400">
                                                    {item.fonteLivro}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {item.descricao && (
                                        <p className="mt-1 line-clamp-1 text-xs text-black/70 dark:text-zinc-400">
                                            {removerMarkdown(item.descricao)}
                                        </p>
                                    )}
                                </PaperDiv>
                            </div>
                        ))
                    )}
                </div>
            </FolderDiv>
        </div>,
        document.body
    );
}
