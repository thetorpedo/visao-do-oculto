import DocumentReader from "@/components/DocumentReader";
import origensData from "@/data/origens.json";
import Fuse from "fuse.js"; // Importa o Fuse.js
import { BookMarked, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function Origens() {
  const [busca, setBusca] = useState("");
  const [filtroFonte, setFiltroFonte] = useState("");
  const [periciasSelecionadas, setPericiasSelecionadas] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const PERICIAS_ORDEM = [
    "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", 
    "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude", 
    "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação", 
    "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem", 
    "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", 
    "Tática", "Tecnologia", "Vontade"
  ];

  const fuse = useMemo(() => {
    return new Fuse(origensData, {
      keys: ["nome", "descricao", "tecnicaDescricao"], 
      threshold: 0.3, 
    });
  }, []);

  const botoesPericias = useMemo(() => {
    return PERICIAS_ORDEM;
  }, []);

  const origensFiltradas = useMemo(() => {
    let resultado = origensData;
  
    if (busca.length > 2) {
      resultado = fuse.search(busca).map(r => r.item);
    }
  
    if (filtroFonte) {
      resultado = resultado.filter(o => o.fonteLivro === filtroFonte);
    }

    if (periciasSelecionadas.length > 0) {
      resultado = resultado.filter(o => {
        const textoLimpoJson = o.pericias.replace(/\./g, "");
        return periciasSelecionadas.every(p => textoLimpoJson.includes(p));
      });
    }
  
    return resultado;
  }, [busca, filtroFonte, periciasSelecionadas, fuse]);

  const togglePericia = (pericia: string) => {
    setPericiasSelecionadas(prev => 
      prev.includes(pericia) ? prev.filter(p => p !== pericia) : [...prev, pericia]
    );
  };

  // ExpandableText atualizado com whitespace-pre-wrap para quebrar linha com \n
  function ExpandableText({ text, limit = 400 }: { text: string; limit?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;
  
    if (text.length <= limit) return <p className="text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed">{text}</p>;
  
    return (
      <span className="text-sm text-justify whitespace-pre-wrap text-gray-800 leading-relaxed">
          {isExpanded ? text : `${text.substring(0, limit)}...`}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs cursor-pointer font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex items-center border-2 border-gray-800 bg-white/40 px-3 py-2">
            <Search className="size-5 mr-2" />
            <input
              type="text"
              placeholder={`Buscando entre ${filtroFonte ? origensData.filter(o => o.fonteLivro === filtroFonte).length : origensData.length} origens... `}
              className="w-full bg-transparent outline-none font-medium"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <select
            className="border-2 border-gray-800 bg-white/40 p-2 font-special"
            value={filtroFonte}
            onChange={(e) => setFiltroFonte(e.target.value)}
          >
            <option value="">Todos os Livros</option>
            <option value="OPRPG">Livro Base</option>
            <option value="SAH">Sobrevivendo ao Horror</option>
            <option value="HQ Iniciação">HQ Iniciação</option>
            <option value="HQ OSNF-1">HQ OSNF Pt.1</option>
            <option value="HQ OSNF-2">HQ OSNF Pt.2</option>
            <option value="AS1">Arquivos Secretos 01</option>
            <option value="AS4">Arquivos Secretos 04</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
            <span className="font-special text-sm self-center mr-2">Filtrar Perícias:</span>
            
            {botoesPericias.map(p => (
              <button
                key={p}
                onClick={() => togglePericia(p)}
                className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                  periciasSelecionadas.includes(p)
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}

            {periciasSelecionadas.length > 0 && (
              <button 
                onClick={() => setPericiasSelecionadas([])}
                className="text-red-700 text-xs font-bold flex items-center ml-2 underline"
              >
                <X className="size-3 mr-1" /> Limpar
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>
      
        

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(origensFiltradas).sort((a, b) => a.nome.localeCompare(b.nome)).map((origem) => (
          <div key={origem.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
            
            <div className="flex-grow">
               {/* Título inalterado */}
               <h3 className="text-2xl font-special underline mb-2">{origem.nome}</h3>
               
               {/* Descrição */}
               <div className="text-sm italic mb-4 opacity-90"><ExpandableText text={origem.descricao} limit={400} /></div>
               
               {/* Perícias Treinadas */}
               <div className="flex mt-4 mb-4 border border-gray-900 shadow-sm">
                <div className="flex items-center px-2 py-0.5 text-base text-white font-special bg-gray-900">
                  <span className="-mb-1">Perícias treinadas:</span>
                </div>
                <div className="flex items-center p-1 grow bg-gray-300/50">
                  <div className="text-sm ml-1 font-medium text-gray-800">{origem.pericias}</div>
                </div>
               </div>

               {/* Técnica de Origem */}
               <div className="mt-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                 <span className="font-special pt-1 text-sm tracking-wider mr-1 uppercase text-gray-900 block ">{origem.tecnicaNome}:</span>
                 <ExpandableText text={origem.tecnicaDescricao} limit={400} />
               </div>
            </div>
            
               {/* Rodapé (Fonte) */}
               <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-700 font-medium flex items-center">
                    <BookMarked className="size-4 mr-1.5 opacity-80" />
                    <button 
                      onClick={() => setLeitorAtivo({ fonte: origem.fonteLivro, pagina: parseInt(origem.fontePagina) })}
                      className="hover:text-black underline cursor-pointer transition-colors decoration-gray-400 underline-offset-2"
                    >
                      <span className="font-bold">{origem.fonteLivro}</span>
                      <span>, pág. {origem.fontePagina}</span>
                    </button>
                  </div>
                </div>

            </div>
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 -rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}
      </div>
    </div>
  );
}