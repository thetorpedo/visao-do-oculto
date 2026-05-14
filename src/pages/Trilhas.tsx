import DocumentReader from "@/components/DocumentReader";
import trilhasData from "@/data/trilhas.json";
import Fuse from "fuse.js";
import { BookMarked, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const estiloBadgeTipo = (tipo: string) => {
  switch (tipo) {
    case "Combatente": return "text-red-900 border-dashed border-red-300 bg-red-200/30";
    case "Especialista": return "text-blue-900 border-dashed border-blue-300 bg-blue-200/30";
    case "Ocultista": return "text-purple-900 border-dashed border-purple-300 bg-purple-200/30";
    case "Sobrevivente": return "text-orange-900 border-dashed border-orange-300 bg-orange-200/30";
    default: return "text-gray-800 border-dashed border-gray-400 bg-gray-300/30";
  }
};

export default function Trilhas() {
const [busca, setBusca] = useState(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("busca") || "";
  }
  return "";
});  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const TIPOS_DISPONIVEIS = ["Geral", "Combatente", "Especialista", "Ocultista", "Sobrevivente"];
  
  const fontesDisponiveis = useMemo(() => {
    const fontes = new Set(trilhasData.map(t => t.fonteLivro));
    return Array.from(fontes).sort();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(trilhasData, {
      keys: ["nome", "descricao", "especial", "nex10", "nex40", "nex65", "nex99"], 
      threshold: 0.3, 
      ignoreLocation: true, 
    });
  }, []);

  const trilhasFiltradas = useMemo(() => {
    const resultadoBusca = busca.length > 2 
      ? fuse.search(busca).map(r => r.item) 
      : trilhasData;
  
    return resultadoBusca.filter(trilha => {
      const matchTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(trilha.tipo);
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(trilha.fonteLivro);

      return matchTipo && matchFonte;
    });
  }, [busca, tiposSelecionados, fontesSelecionadas, fuse]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = tiposSelecionados.length > 0 || fontesSelecionadas.length > 0;

  const limparFiltros = () => {
    setTiposSelecionados([]);
    setFontesSelecionadas([]);
  };

  function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;

    const textoExibido = isExpanded ? text : `${text.substring(0, limit)}...`;

    if (text.length <= limit) {
      return <p className="text-sm whitespace-pre-wrap first-letter:uppercase text-justify text-gray-800 leading-relaxed">{text}</p>;
    }
  
    return (
      <span className="text-sm text-justify whitespace-pre-wrap text-gray-800 leading-relaxed">
          {textoExibido}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs cursor-pointer whitespace-pre-wrap font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
          >
            {isExpanded ? "[ Ler menos ]" : "[ Ler mais ]"}
          </button>
      </span>
    );
  }

  // Componente Dropdown para as habilidades
  function NexDropdown({ label, text }: { label: string; text?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    if (!text) return null;

    // Isola o título (antes do primeiro ponto) da descrição
    const indexPonto = text.indexOf('.');
    const titulo = indexPonto !== -1 ? text.substring(0, indexPonto) : "Habilidade";
    const descricao = indexPonto !== -1 ? text.substring(indexPonto + 1).trim() : text;

    return (
      <div className=" mb-2 last:mb-0 transition-all">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-special text-sm tracking-wider uppercase text-white px-2 py-1 bg-gray-900 shrink-0">
              {label}
            </span>
            <span className="font-semibold font-blur text-normal text-gray-900 leading-tight">
              {titulo}
            </span>
          </div>
          <ChevronDown className={`size-4 mr-2 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isOpen && (
          <div className="p-3 pt-2 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed animate-in slide-in-from-top-1">
            {descricao}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentReader 
        fonteId={leitorAtivo?.fonte || ""} 
        paginaImpressa={leitorAtivo?.pagina || 0} 
        isOpen={!!leitorAtivo}
        onClose={() => setLeitorAtivo(null)} 
      />
      
      <div className="relative">
        <div className="relative p-6 z-10 shadow-2xl bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%]">
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${trilhasFiltradas.length} trilhas...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Classes:</span>
                {TIPOS_DISPONIVEIS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleFiltro(setTiposSelecionados, t)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      tiposSelecionados.includes(t)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Fontes:</span>
                {fontesDisponiveis.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFiltro(setFontesSelecionadas, f)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      fontesSelecionadas.includes(f)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}

                {temFiltroAtivo && (
                  <button 
                    onClick={limparFiltros}
                    className="text-red-700 text-xs font-bold flex items-center ml-2 underline"
                  >
                    <X className="size-3 mr-1" /> Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(trilhasFiltradas).sort((a, b) => a.nome.localeCompare(b.nome)).map((trilha) => (
          <div key={trilha.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
              
              <div className="flex-grow">
                <div className="flex justify-between flex-col items-start mb-3">
                  <h3 className="text-xl font-special underline leading-tight">{trilha.nome}</h3>
                  
                  <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${estiloBadgeTipo(trilha.tipo)} whitespace-nowrap`}>
                    {trilha.tipo}
                  </span>
                </div>
                
                <div className="mb-4">
                  <ExpandableText text={trilha.descricao ? trilha.descricao : ''} limit={400} />
                </div>

                {/* Caixa de Regra Especial (Ex: Médico de Campo) */}
                {trilha.especial && (
                  <div className="mb-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                    <p className="text-xs text-gray-800">
                      <span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">Especial:</span> 
                      <span className="font-medium text-sm">{trilha.especial}</span>
                    </p>
                  </div>
                )}

                {/* Habilidades de NEX em formato Dropdown */}
                <div className="mt-4 pt-1">
                  <NexDropdown label={trilha.tipo === 'Sobrevivente' ? 'Estágio 2' : 'NEX 10%'} text={trilha.nex10} />
                  <NexDropdown label={trilha.tipo === 'Sobrevivente' ? 'Estágio 4' : 'NEX 40%'} text={trilha.nex40} />
                  
                  {trilha.tipo !== 'Sobrevivente' && (
                    <>
                      <NexDropdown label="NEX 65%" text={trilha.nex65 ? trilha.nex65 : ''} />
                      <NexDropdown label="NEX 99%" text={trilha.nex99 ? trilha.nex99 : ''} />
                    </>
                  )}
                </div>

              </div>
              
              {/* Rodapé (Fonte) */}
              <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between">
                <div className="text-xs text-gray-700 font-medium flex items-center">
                  <BookMarked className="size-4 mr-1.5 opacity-80" />
                  <button 
                    onClick={() => setLeitorAtivo({ fonte: trilha.fonteLivro, pagina: parseInt(trilha.fontePagina) })}
                    className="hover:text-black underline cursor-pointer transition-colors decoration-gray-400 underline-offset-2"
                  >
                    <span className="font-bold">{trilha.fonteLivro}</span>
                    <span>, pág. {trilha.fontePagina}</span>
                  </button>
                </div>
              </div>

            </div>
            
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}

        {trilhasFiltradas.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhuma trilha encontrada com esses termos.
           </div>
        )}
      </div>
    </div>
  );
}