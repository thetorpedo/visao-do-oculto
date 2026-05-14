import origensData from "@/data/origens.json";
import poderesData from "@/data/poderes.json";
import trilhasData from "@/data/trilhas.json";
import equipamentosData from "@/data/equipamentos.json";
import Fuse from "fuse.js";
import { BookOpen, Box, Shield, Sparkles, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

const dadosGlobais = [
  ...origensData.map(item => ({ ...item, globalType: "Origem", icone: BookOpen, link: `/origens?busca=${encodeURIComponent(item.nome)}` })),
  ...poderesData.map(item => ({ ...item, globalType: "Poder", icone: Sparkles, link: `/poderes?busca=${encodeURIComponent(item.nome)}` })),
  ...trilhasData.map(item => ({ ...item, globalType: "Trilha", icone: Shield, link: `/trilhas?busca=${encodeURIComponent(item.nome)}` })),
  ...equipamentosData.map(item => ({ ...item, globalType: "Equipamento", icone: Box, link: `/equipamentos?busca=${encodeURIComponent(item.nome)}` }))
];

// Repare que tiramos as props daqui!
export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Escuta o atalho do teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Escuta o botão que fica lá na Home
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

  const fuse = useMemo(() => {
    return new Fuse(dadosGlobais, {
      keys: ["nome", "descricao", "globalType", "tipo", "subtipo"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, []);

  const resultados = useMemo(() => {
    if (busca.length < 2) return [];
    return fuse.search(busca).slice(0, 15).map(r => r.item); // Limita a 15 resultados para não travar a tela
  }, [busca, fuse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-gray-900/60 backdrop-blur-sm">
      {/* Fundo clicável para fechar */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-[url(src/assets/paper.png)] bg-repeat bg-size-[30%] shadow-[0_0_40px_rgba(0,0,0,0.4)] border-2 border-gray-800 flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Barra de Input */}
        <div className="flex items-center px-4 py-3 border-b-2 border-gray-800 bg-white/50">
          <Search className="size-5 text-gray-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar origens, poderes, itens..."
            className="flex-grow bg-transparent outline-none font-medium text-lg placeholder:text-gray-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-700 transition-colors p-1">
            <X className="size-5" />
          </button>
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto p-2">
          {busca.length < 2 ? (
            <div className="p-6 text-center text-gray-500 font-special tracking-wide">
              Digite pelo menos 2 caracteres para buscar no grimório.
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-6 text-center text-gray-500 font-special tracking-wide">
              Nenhum registro oculto encontrado para "{busca}".
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {resultados.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link} 
                  className="flex flex-col p-3 hover:bg-gray-800 hover:text-white transition-colors border border-transparent hover:border-gray-900 group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg font-special underline group-hover:decoration-white">{item.nome}</span>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-gray-200 text-gray-800 px-2 py-0.5 border border-gray-400">
                      <item.icone className="size-3" />
                      {item.globalType}
                    </div>
                  </div>
                  <span className="text-sm line-clamp-1 opacity-80">
                    {item.descricao}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Rodapé do Modal */}
        <div className="border-t border-gray-800 bg-gray-200/80 px-4 py-2 flex justify-between items-center text-xs font-bold text-gray-500">
          <span>{resultados.length} resultados encontrados</span>
          <span className="flex items-center gap-1"><kbd className="bg-gray-300 px-1 border border-gray-400 rounded-sm font-mono">ESC</kbd> para fechar</span>
        </div>
      </div>
    </div>
  );
}