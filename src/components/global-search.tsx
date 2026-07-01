import { useData } from "@/context/DataContext";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function removerMarkdown(texto: string): string {
  if (!texto) return "";
  return texto.replace(/[\*\_#]/g, "");
}

function SafeHTMLText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function GlobalSearch() {
  const { poderes, rituais, equipamentos, origens, trilhas, regras } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
  ], [poderes, rituais, equipamentos, origens, trilhas, regras]);

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

    const termo = busca.toLowerCase().trim();
    const resultadoFuse = fuse.search(busca);
    const indicesEncontradosPeloFuse = new Set(resultadoFuse.map(res => res.item.globalIndex));
    const candidatos = resultadoFuse.map(res => dadosGlobais[res.item.globalIndex]);

    dadosGlobais.forEach((item, idx) => {
      if (!indicesEncontradosPeloFuse.has(idx)) {
        const nomeContem = item.nome.toLowerCase().includes(termo);
        const descContem = (item.descricao || "").toLowerCase().includes(termo);

        if (nomeContem || descContem) {
          candidatos.push(item);
        }
      }
    });

    return candidatos.sort((a, b) => {
      const descA = (a.descricao || "").toLowerCase();
      const descB = (b.descricao || "").toLowerCase();
      const temExatoA = descA.includes(termo) || a.nome.toLowerCase().includes(termo);
      const temExatoB = descB.includes(termo) || b.nome.toLowerCase().includes(termo);

      if (temExatoA && !temExatoB) return -1;
      if (!temExatoA && temExatoB) return 1;

      return a.nome.localeCompare(b.nome);
    }).slice(0, 15);
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
    }
  }, [isOpen]);

  const renderSnippet = (descricaoBruta: string) => {
    const textoLimpo = removerMarkdown(descricaoBruta || "");
    if (!busca || busca.trim().length < 2) {
      return textoLimpo.length > 60 ? `${textoLimpo.slice(0, 60)}...` : textoLimpo;
    }

    const termo = busca.toLowerCase().trim();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <div className="relative w-full max-w-2xl bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-gray-300 flex flex-col max-h-[75vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center px-4 py-2 border-b border-gray-300 bg-white text-gray-600 shadow-sm shrink-0">
          <Search className="size-4 opacity-70 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar origens, poderes, rituais, regras..."
            className="flex-grow bg-transparent outline-none font-medium text-sm placeholder:text-gray-500 text-black"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-red-400 transition-colors p-1 cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-1 bg-white/50 scrollbar-thin scrollbar-thumb-slate-900/60">
          {busca.length < 2 ? (
            <div className="p-6 text-center text-gray-500 font-special text-xs tracking-wide">
              Digite pelo menos 2 caracteres para buscar.
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-6 text-center text-gray-500 font-special text-xs tracking-wide">
              Nenhum registro encontrado para "{busca}".
            </div>
          ) : (
            <div className="flex flex-col border-t border-gray-200">
              {resultados.map((item, idx) => {
                const termoRaw = busca.trim();
                let termoValido = termoRaw;
                if (item.nome.toLowerCase().indexOf(termoValido.toLowerCase()) === -1 && termoValido.length > 4) {
                  termoValido = termoRaw.slice(0, termoRaw.length - 1);
                }
                const regexNome = new RegExp(`(${termoValido.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
                const nomeFormatado = item.nome.replace(regexNome, `<mark class="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded-sm">$1</mark>`);

                return (
                  <a
                    key={idx}
                    href={item.link}
                    className="group flex flex-col py-1.5 px-2 text-left transition-all border-b border-gray-200 hover:bg-gray-100/80 text-gray-700 relative"
                  >
                    <div className="flex justify-between items-center gap-2 w-full min-w-0">
                      <span className="text-xs font-bold text-gray-900 tracking-wide truncate">
                        <SafeHTMLText html={nomeFormatado} />
                      </span>
                      <span className="font-special text-[9px] tracking-tight uppercase font-bold text-gray-500 bg-white/80 border border-gray-300 px-1 rounded-xs shrink-0">
                        {item.globalType}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 font-normal leading-normal mt-0.5 border-l-2 border-gray-400/30 pl-1.5 truncate max-w-full">
                      {renderSnippet(item.descricao || '')}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 bg-gray-200/80 px-3 py-1.5 flex justify-between items-center text-[11px] font-bold text-gray-500 shrink-0">
          <span>{resultados.length} resultados</span>
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-300/80 px-1 border border-gray-400 font-mono text-[9px]">ESC</kbd> fechar
          </span>
        </div>
      </div>
    </div>
  );
}