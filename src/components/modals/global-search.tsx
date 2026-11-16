import { useData } from "@/context/DataContext";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FolderDiv from "../ui/folder-div";
import PaperDiv from "../ui/paper-div";
import { ordenarPorRelevancia } from "@/utils/searchUtils";

function removerMarkdown(texto: string): string {
  if (!texto) return "";
  return texto.replace(/[\*\_#]/g, "");
}

function SafeHTMLText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function GlobalSearch() {
  const { poderes, rituais, equipamentos, origens, trilhas, regras, ameacas } = useData();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const dadosGlobais = useMemo(() => [
    ...origens.map(item => ({ ...item, globalType: "Origem", link: `/origens?busca=${encodeURIComponent(item.nome)}` })),
    ...poderes.map(item => ({ ...item, globalType: "Poder", link: `/poderes?busca=${encodeURIComponent(item.nome)}` })),
    ...trilhas.map(item => ({ ...item, globalType: "Trilha", link: `/trilhas?busca=${encodeURIComponent(item.nome)}` })),
    ...equipamentos.map(item => ({ ...item, globalType: "Equipamento", link: `/equipamentos?busca=${encodeURIComponent(item.nome)}` })),
    ...rituais.map(item => ({ ...item, globalType: "Ritual", link: `/rituais?busca=${encodeURIComponent(item.nome)}` })),
    ...regras.map(item => ({
      ...item,
      descricao: item.descricao,
      globalType: "Regra",
      link: `/regras?busca=${encodeURIComponent(item.nome)}`
    })),
    ...ameacas.map(item => ({
      ...item,
      descricao: [
        `${item.tipo} • ${item.tamanho} (VD ${item.vd})`,
        item.apresentacao ?? "",
        ...(item.blocos ?? []).map(b => `${b.titulo}: ${b.descricao}`),
        item.observacoes ?? "",
      ].filter(Boolean).join(" — "),
      globalType: "Ameaça",
      link: `/ameacas?id=${encodeURIComponent(item.id)}`
    })),
  ], [poderes, rituais, equipamentos, origens, trilhas, regras, ameacas]);

  const dadosHigienizadosParaFuse = useMemo(() => {
    return dadosGlobais.map((item, idx) => ({
      globalIndex: idx,
      nomeLimpo: removerMarkdown(item.nome),
      descricaoLimpa: removerMarkdown(item.descricao || "")
    }));
  }, [dadosGlobais]);

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

  const resultados = useMemo(() => {
    if (!busca || busca.trim().length < 2) {
      return [];
    }

    const termo = busca.trim().toLowerCase();
    const resultadoFuse = fuse.search(termo);
    const indicesExatos = new Set<number>();

    dadosGlobais.forEach((item, idx) => {
      if (item.nome.toLowerCase().includes(termo) || (item.descricao || "").toLowerCase().includes(termo)) {
        indicesExatos.add(idx);
      }
    });

    const resultadosExatos = ordenarPorRelevancia(
      [...indicesExatos].map((idx) => dadosGlobais[idx]),
      termo,
      (item) => [item.nome, item.descricao],
    );
    const resultadosAproximados = resultadoFuse
      .filter((resultado) => !indicesExatos.has(resultado.item.globalIndex))
      .map((resultado) => dadosGlobais[resultado.item.globalIndex]);

    return [...resultadosExatos, ...resultadosAproximados].slice(0, 15);
  }, [busca, fuse, dadosGlobais]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleCustomEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-global-search", handleCustomEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-global-search", handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setBusca("");
      setIndiceSelecionado(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setIndiceSelecionado(0);
  }, [busca]);

  useEffect(() => {
    itemRefs.current[indiceSelecionado]?.scrollIntoView({ block: "nearest" });
  }, [indiceSelecionado]);

  const abrirResultado = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

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
      const itemAtivo = resultados[indiceSelecionado] ?? resultados[0];
      if (itemAtivo) abrirResultado(itemAtivo.link);
    }
  };

  const renderSnippet = (descricaoBruta: string) => {
    const textoLimpo = removerMarkdown(descricaoBruta || "");
    if (!busca || busca.trim().length < 2) {
      return textoLimpo.length > 200 ? `${textoLimpo.slice(0, 200)}...` : textoLimpo;
    }

    const termo = busca.toLowerCase().trim();
    let start = textoLimpo.toLowerCase().indexOf(termo);

    if (start === -1) start = textoLimpo.toLowerCase().indexOf(termo.slice(0, Math.max(3, termo.length - 2)));
    if (start === -1) return textoLimpo.length > 200 ? `${textoLimpo.slice(0, 200)}...` : textoLimpo;

    const end = start + termo.length;
    const margem = 120;
    const pontoInicial = Math.max(0, start - margem);
    const pontoFinal = Math.min(textoLimpo.length, end + margem + 20);

    let snippet = textoLimpo.slice(pontoInicial, pontoFinal);
    const regexSub = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

    let snippetGrifado = snippet.replace(regexSub, `<mark class="bg-yellow-300 text-gray-900 underline px-0.5">$1</mark>`);

    if (pontoInicial > 0) snippetGrifado = `...${snippetGrifado}`;
    if (pontoFinal < textoLimpo.length) snippetGrifado = `${snippetGrifado}...`;

    return <SafeHTMLText html={snippetGrifado} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <FolderDiv className="relative w-full my-auto max-w-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-2 border-2 border-dashed border-black/40 bg-black/5 text-black/90 shrink-0">
          <Search className="size-4 opacity-90 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar origens, poderes, rituais, regras, ameaças..."
            className="grow bg-transparent outline-none font-special text-sm placeholder:text-black/40 text-black/90"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button onClick={() => setIsOpen(false)} className="text-black/90 p-1 cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-100 min-h-[50vh] p-1 scrollbar-thin">
          {busca.length < 2 ? (
            <div className="p-6 text-center text-black/60 font-special text-sm">
              Digite pelo menos 2 caracteres para buscar.
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-6 text-center text-black/60 font-special text-sm">
              Nenhum registro encontrado para "{busca}".
            </div>
          ) : (
            <div className="overflow-y-auto flex flex-col mt-2">
              {resultados.map((item, idx) => {
                const estaSelecionado = idx === indiceSelecionado;
                const termoRaw = busca.trim();
                let termoValido = termoRaw;
                if (item.nome.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 && termoValido.length > 4) {
                  termoValido = termoRaw.slice(0, termoRaw.length - 1);
                }
                const regexNome = new RegExp(`(${termoValido.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
                const nomeFormatado = item.nome.replace(regexNome, `<mark class="bg-yellow-300 text-gray-900 underline px-0.5 ">$1</mark>`);

                return (
                  <a
                    key={idx}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    href={item.link}
                    onMouseEnter={() => setIndiceSelecionado(idx)}
                    onClick={(e) => {
                      e.preventDefault();
                      abrirResultado(item.link);
                    }}
                    className="py-1.5 px-1"
                  >
                    <PaperDiv
                      className={`group flex flex-col py-3 px-3 text-left shadow-none! transition-all ${estaSelecionado
                        ? "bg-[linear-gradient(rgba(253,224,71,0.22),rgba(253,224,71,0.22)),url(/assets/paper.png)]"
                        : ""
                        }`}
                    >
                      <div className="flex justify-between items-center gap-2 w-full min-w-0">
                        <span className="text-sm text-black/90 font-special truncate">
                          <SafeHTMLText html={nomeFormatado} />
                        </span>
                        <span className="text-[10px] uppercase font-daisy bg-black text-white px-2 py-0.5 shrink-0">
                          {item.globalType}
                        </span>
                      </div>

                      <div className="text-[11px] text-black/60 mt-0.5  line-clamp-2 max-w-full">
                        {renderSnippet(item.descricao || '')}
                      </div>
                    </PaperDiv>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-black px-3 py-1.5 flex justify-between items-center text-xs font-daisy text-white shrink-0">
          <span>{resultados.length} resultados</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white text-black px-1 font-mono text-[9px]">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white text-black px-1 font-mono text-[9px]">ENTER</kbd> Abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white text-black px-1 font-mono text-[9px]">ESC</kbd> Fechar
            </span>
          </div>
        </div>
      </FolderDiv>
    </div>
  );
}