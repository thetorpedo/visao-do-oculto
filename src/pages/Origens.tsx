import DocumentReader from "@/components/DocumentReader";
import origensData from "@/data/origens.json";
import Fuse from "fuse.js";
import { BookMarked, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function Origens() {
  const [busca, setBusca] = useState("");
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
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

  const fontesDisponiveis = useMemo(() => {
    const fontes = new Set(origensData.map(o => o.fonteLivro));
    return Array.from(fontes);
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(origensData, {
      keys: ["nome", "descricao", "tecnicaDescricao"], 
      threshold: 0.3, 
      ignoreLocation: true,
    });
  }, []);

  const origensFiltradas = useMemo(() => {
    const resultadoBusca = busca.length > 2 
      ? fuse.search(busca).map(r => r.item) 
      : origensData;
  
    return resultadoBusca.filter(origem => {
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(origem.fonteLivro);
      
      const matchPericia = periciasSelecionadas.length === 0 || periciasSelecionadas.every(p => {
        const textoLimpoJson = origem.pericias.replace(/\./g, "");
        return textoLimpoJson.includes(p);
      });

      return matchFonte && matchPericia;
    });
  }, [busca, fontesSelecionadas, periciasSelecionadas, fuse]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = fontesSelecionadas.length > 0 || periciasSelecionadas.length > 0;

  const limparFiltros = () => {
    setFontesSelecionadas([]);
    setPericiasSelecionadas([]);
  };

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
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${origensFiltradas.length} origens...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-[72px]">Perícias:</span>
                {PERICIAS_ORDEM.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleFiltro(setPericiasSelecionadas, p)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      periciasSelecionadas.includes(p)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-[72px]">Fontes:</span>
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
        {Array.from(origensFiltradas).sort((a, b) => a.nome.localeCompare(b.nome)).map((origem) => (
          <div key={origem.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
            
            <div className="flex-grow">
               <h3 className="text-2xl font-special underline mb-2">{origem.nome}</h3>
               
               <div className="text-sm italic mb-4 opacity-90"><ExpandableText text={origem.descricao} limit={400} /></div>
               
               <div className="flex mt-4 mb-4 border border-dashed border-gray-400 bg-gray-200">
                <div className="flex items-center px-2 py-0.5 text-base text-white font-special bg-gray-900">
                  <span className="-mb-1 uppercase">Perícias treinadas:</span>
                </div>
                <div className="flex items-center p-1 grow bg-gray-300/50">
                  <div className="text-sm ml-1 font-medium text-gray-800">{origem.pericias}</div>
                </div>
               </div>

               <div className="mt-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                 <span className="font-special pt-1 text-sm tracking-wider mr-1 uppercase text-gray-900 block ">{origem.tecnicaNome}:</span>
                 <ExpandableText text={origem.tecnicaDescricao} limit={400} />
               </div>
            </div>
            
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
        {origensFiltradas.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhuma origem encontrada com esses termos.
           </div>
        )}
      </div>
    </div>
  );
}