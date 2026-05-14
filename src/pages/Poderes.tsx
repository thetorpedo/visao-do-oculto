import DocumentReader from "@/components/DocumentReader";
import poderesData from "@/data/poderes.json";
import Fuse from "fuse.js";
import { BookMarked, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const corElemento = (elemento: string | null) => {
  switch (elemento) {
    case "Sangue": return "text-white bg-[#aa2321] border-[#aa2321]";
    case "Morte": return "text-white bg-[#000000] border-[#000000]";
    case "Energia": return "text-white bg-[#9a03fa] border-[#9a03fa]";
    case "Conhecimento": return "text-white bg-[#ba921a] border-[#ba921a]";
    case "Medo": return "text-black bg-[#ffffff] border-gray-400";
    case "Intenção": return "text-white bg-orange-700/90 border-orange-700/90";
    default: return "text-gray-800 border-gray-400 bg-gray-200";
  }
};

const estiloBadgeTipo = (tipo: string) => {
  switch (tipo) {
    case "Combatente": return "text-red-900 border-dashed border-red-300 bg-red-200/30";
    case "Especialista": return "text-blue-900 border-dashed border-blue-300 bg-blue-200/30";
    case "Ocultista": return "text-purple-900 border-dashed border-purple-300 bg-purple-200/30";
    case "Sacrifício": return "text-rose-900 border-dashed border-rose-300 bg-rose-200/30";
    default: return "text-gray-800 border-dashed border-gray-400 bg-gray-300/30";
  }
};

export default function Poderes() {
const [busca, setBusca] = useState(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("busca") || "";
  }
  return "";
});  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [elementosSelecionados, setElementosSelecionados] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [preReqSelecionados, setPreReqSelecionados] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const TIPOS_DISPONIVEIS = ["Geral", "Combatente", "Especialista", "Ocultista", "Paranormal", "Sacrifício"];
  const ELEMENTOS_DISPONIVEIS = ["Conhecimento", "Energia", "Morte", "Sangue", "Intenção"];
  const PREREQ_DISPONIVEIS = ["Agi", "For", "Int", "Pre", "Vig", "Treinado", "Veterano", "Expert", "NEX"];
  
  const fontesDisponiveis = useMemo(() => {
    const fontes = new Set(poderesData.map(p => p.fonteLivro));
    return Array.from(fontes);
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(poderesData, {
      keys: ["nome", "descricao", "preRequisitos", "afinidade"], 
      threshold: 0.3, 
      ignoreLocation: true,
    });
  }, []);

  const poderesFiltrados = useMemo(() => {
    const resultadoBusca = busca.length > 2 
      ? fuse.search(busca).map(r => r.item) 
      : poderesData;
  
    return resultadoBusca.filter(poder => {
      const matchTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(poder.tipo);
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(poder.fonteLivro);
      const matchElemento = elementosSelecionados.length === 0 || 
        (poder.elemento && elementosSelecionados.includes(poder.elemento));
      const matchPreReq = preReqSelecionados.length === 0 || 
        preReqSelecionados.some(pr => poder.preRequisitos?.toLowerCase().includes(pr.toLowerCase()));

      return matchTipo && matchFonte && matchElemento && matchPreReq;
    });
  }, [busca, tiposSelecionados, elementosSelecionados, fontesSelecionadas, preReqSelecionados, fuse]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = tiposSelecionados.length > 0 || elementosSelecionados.length > 0 || fontesSelecionadas.length > 0 || preReqSelecionados.length > 0;

  const limparFiltros = () => {
    setTiposSelecionados([]);
    setElementosSelecionados([]);
    setFontesSelecionadas([]);
    setPreReqSelecionados([]);
  };

  function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;
    if (text.length <= limit) return <p className="text-sm whitespace-pre-wrap first-letter:uppercase text-justify text-gray-800 leading-relaxed">{text}</p>;
  
    return (
      <span className="text-sm text-justify whitespace-pre-wrap text-gray-800 leading-relaxed">
          {isExpanded ? text : `${text.substring(0, limit)}...`}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs cursor-pointer whitespace-pre-wrap font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
          >
            {isExpanded ? "[ Ler menos ]" : "[ Ler mais ]"}
          </button>
      </span>
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
        <div className="relative p-6 z-10 shadow-2xl bg-[url(src/assets/paper.png)] bg-repeat bg-size-[30%]">
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${poderesFiltrados.length} poderes...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Tipos:</span>
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
                <span className="font-special text-sm self-center mr-2 w-16">Elementos:</span>
                {ELEMENTOS_DISPONIVEIS.map(e => (
                  <button
                    key={e}
                    onClick={() => toggleFiltro(setElementosSelecionados, e)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      elementosSelecionados.includes(e)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Pré-req:</span>
                {PREREQ_DISPONIVEIS.map(pr => (
                  <button
                    key={pr}
                    onClick={() => toggleFiltro(setPreReqSelecionados, pr)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      preReqSelecionados.includes(pr)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {pr}
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
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(poderesFiltrados).sort((a, b) => a.nome.localeCompare(b.nome)).map((poder) => (
          <div key={poder.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
              
              <div className="flex-grow">
                {/* Nome e Badge Dinâmico de Tipo/Elemento */}
                <div className="flex justify-between flex-col items-start mb-3">
                  <h3 className="text-xl font-special underline leading-tight">{poder.nome}</h3>
                  
                  <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${
                    poder.elemento ? corElemento(poder.elemento) : estiloBadgeTipo(poder.tipo)
                  } whitespace-nowrap`}>
                    {poder.elemento ? `${poder.elemento}` : poder.tipo}
                  </span>
                </div>
                
                {/* Descrição Principal */}
                <div className="mb-4">
                  <ExpandableText text={poder.descricao} limit={220} />
                </div>

                {/* Caixa de Pré-requisitos */}
                {poder.preRequisitos && (
                  <div className="mt-3 bg-gray-400/20 border border-gray-400/50 px-3 py-1">
                    <p className="text-xs -mb-1 text-gray-800">
                      <span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">Pré-requisitos:</span> 
                      <span className="font-medium text-sm">{poder.preRequisitos}</span>
                    </p>
                  </div>
                )}

                {/* Caixa de Afinidade */}
                {poder.afinidade && (
                  <div className={`mt-3 p-3 border-l-4 ${corElemento(poder.elemento).replace('bg-', 'border-').split(' ')[1]} bg-gray-300/30`}>
                    <span className="font-special text-sm tracking-wider block uppercase text-gray-900 mb-1">Afinidade:</span>
                    <ExpandableText text={poder.afinidade} limit={200} />
                  </div>
                )}
              </div>
              
              {/* Rodapé (Fonte) */}
              <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between">
                <div className="text-xs text-gray-700 font-medium flex items-center">
                  <BookMarked className="size-4 mr-1.5 opacity-80" />
                  <button 
                    onClick={() => setLeitorAtivo({ fonte: poder.fonteLivro, pagina: parseInt(poder.fontePagina) })}
                    className="hover:text-black underline cursor-pointer transition-colors"
                  >
                    <span className="font-bold  decoration-gray-400 underline-offset-2">{poder.fonteLivro}</span>
                    <span>, pág. {poder.fontePagina}</span>
                  </button>
                </div>
              </div>

            </div>
            
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}

        {poderesFiltrados.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhum poder paranormal ou mundano encontrado com esses termos.
           </div>
        )}
      </div>
    </div>
  );
}