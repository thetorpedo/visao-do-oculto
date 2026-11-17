import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData, type Categoria } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import FolderDiv from "@/components/ui/folder-div";
import PaperDiv from "@/components/ui/paper-div";
import { normalizarTexto, removerMarkdown } from "../escudo-utils";

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

const CATEGORIAS: Categoria[] = [
    "ameacas",
    "poderes",
    "rituais",
    "equipamentos",
    "origens",
    "trilhas",
    "regras",
];

const LIMITE_RESULTADOS = 100;

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
    nomeNormalizado: string;
    categoria: Categoria;
    descricao?: string | null;
    descricaoNormalizada: string;
    fonteLivro?: string;
}

function descricaoDoItem(categoria: Categoria, item_registro: Registro): string | null | undefined {
    if (categoria === "ameacas") {
        return `VD ${item_registro.vd} • ${item_registro.tipo} • ${item_registro.tamanho}${item_registro.apresentacao ? ` — ${item_registro.apresentacao}` : ""}`;
    }
    if (categoria === "rituais") {
        return `${(item_registro.elemento ?? []).join("/")} ${item_registro.circulo ?? ""} • ${item_registro.descricao ?? ""}`;
    }
    return item_registro.descricao;
}

function obterEstiloFiltro(is_ativo: boolean): string {
    return is_ativo
        ? "border-black bg-black text-white hover:bg-black dark:border-emerald-500/60 dark:bg-emerald-500/20 dark:text-emerald-300"
        : "border-black/20 bg-white/40 text-black/70 hover:bg-white dark:border-zinc-800 dark:bg-[#121514] dark:text-zinc-400 dark:hover:bg-[#121514]";
}

interface RegistroPickerProps {
    onSelect: (categoria: Categoria, itemId: string) => void;
    onClose: () => void;
}

export default function RegistroPicker({ onSelect, onClose }: RegistroPickerProps) {
    const { poderes, rituais, equipamentos, origens, trilhas, regras, ameacas } = useData();
    const [categoria_filtro, setCategoriaFiltro] = useState<Categoria | "todos">("todos");
    const [busca, setBusca] = useState("");
    const [indice_selecionado, setIndiceSelecionado] = useState(0);
    const input_ref = useRef<HTMLInputElement>(null);
    const item_refs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        input_ref.current?.focus();
    }, []);

    useEffect(() => {
        const aoPressionarTecla = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", aoPressionarTecla);
        return () => window.removeEventListener("keydown", aoPressionarTecla);
    }, [onClose]);

    const todos_itens = useMemo<ItemBusca[]>(() => {
        const dados_listas = {
            ameacas,
            poderes,
            rituais,
            equipamentos,
            origens,
            trilhas,
            regras,
        } as unknown as Record<Categoria, Registro[]>;

        return CATEGORIAS.flatMap((categoria) =>
            dados_listas[categoria].map((item_registro) => {
                const desc = descricaoDoItem(categoria, item_registro);
                return {
                    id: item_registro.id,
                    nome: item_registro.nome,
                    nomeNormalizado: normalizarTexto(item_registro.nome),
                    categoria,
                    descricao: desc,
                    descricaoNormalizada: normalizarTexto(desc ?? ""),
                    fonteLivro: item_registro.fonteLivro,
                };
            })
        );
    }, [poderes, rituais, equipamentos, origens, trilhas, regras, ameacas]);

    const resultados = useMemo(() => {
        const termo_busca = normalizarTexto(busca.trim());

        const lista_filtrada = todos_itens.filter((item) => {
            const corresponde_categoria =
                categoria_filtro === "todos" || item.categoria === categoria_filtro;
            if (!corresponde_categoria) return false;

            if (!termo_busca) return true;
            return (
                item.nomeNormalizado.includes(termo_busca) ||
                item.descricaoNormalizada.includes(termo_busca)
            );
        });

        return lista_filtrada.sort((a, b) => {
            if (termo_busca) {
                const a_inicia = a.nomeNormalizado.startsWith(termo_busca);
                const b_inicia = b.nomeNormalizado.startsWith(termo_busca);
                if (a_inicia !== b_inicia) return a_inicia ? -1 : 1;
            }
            return a.nome.localeCompare(b.nome);
        });
    }, [todos_itens, categoria_filtro, busca]);

    useEffect(() => {
        item_refs.current[indice_selecionado]?.scrollIntoView({ block: "nearest" });
    }, [indice_selecionado]);

    const alterarBusca = (novo_termo: string) => {
        setBusca(novo_termo);
        setIndiceSelecionado(0);
    };

    const alterarCategoria = (nova_categoria: Categoria | "todos") => {
        setCategoriaFiltro(nova_categoria);
        setIndiceSelecionado(0);
    };

    const tratarTeclado = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (resultados.length === 0) return;

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const passo = e.key === "ArrowDown" ? 1 : -1;
            setIndiceSelecionado((prev) => (prev + passo + resultados.length) % resultados.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const item_ativo = resultados[indice_selecionado] ?? resultados[0];
            onSelect(item_ativo.categoria, item_ativo.id);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-70 flex items-start justify-center bg-black/50 px-4 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={onClose} />

            <FolderDiv className="relative my-auto flex max-h-[78vh] w-full max-w-2xl animate-in flex-col overflow-hidden duration-200 fade-in zoom-in-95">
                <div className="flex shrink-0 items-center border-2 border-dashed border-black/40 bg-black/5 px-4 py-2 text-black/90 dark:border-zinc-700 dark:bg-black/30 dark:text-zinc-100">
                    <Search className="mr-2.5 size-4 shrink-0 text-black/70 dark:text-emerald-400" />
                    <input
                        ref={input_ref}
                        type="text"
                        placeholder="Pesquisar registros para o slot do escudo..."
                        className="grow bg-transparent font-special text-sm text-black/90 outline-none placeholder:text-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        value={busca}
                        onChange={(e) => alterarBusca(e.target.value)}
                        onKeyDown={tratarTeclado}
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
                            className={cn(
                                "border-solid uppercase tracking-wide",
                                obterEstiloFiltro(categoria_filtro === cat)
                            )}
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
                                    item_refs.current[idx] = el;
                                }}
                                onMouseEnter={() => setIndiceSelecionado(idx)}
                                onClick={() => onSelect(item.categoria, item.id)}
                                className="cursor-pointer"
                            >
                                <PaperDiv
                                    className={cn(
                                        "mb-1 flex flex-col px-3 py-2! text-left shadow-none! transition-all",
                                        idx === indice_selecionado
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
