import BookReference from "@/components/BookReference";
import DocumentReader from "@/components/DocumentReader";
import ExpandableText from "@/components/ExpandableText";
import FilterButton from "@/components/FilterButton";
import { useData } from "@/context/DataContext";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

export default function Origens() {
  const { origens: origensData } = useData();

  const [busca, setBusca] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("busca") || "";
    }
    return "";
  }); 
  
  const buscaAdiada = useDeferredValue(busca);

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
    return Array.from(new Set(origensData.map(o => o.fonteLivro)));
  }, [origensData]);

  const fuse = useMemo(() => {
    return new Fuse(origensData, {
      keys: ["nome", "descricao", "tecnicaDescricao"], 
      threshold: 0.3, 
      ignoreLocation: true,
    });
  }, [origensData]);

  const origensFiltradas = useMemo(() => {
    const resultadoBusca = buscaAdiada.length > 2 
      ? fuse.search(buscaAdiada).map(r => r.item) 
      : origensData;
  
    return resultadoBusca.filter(origem => {
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(origem.fonteLivro);
      const matchPericia = periciasSelecionadas.length === 0 || periciasSelecionadas.every(p => {
        return origem.pericias.replace(/\./g, "").includes(p);
      });
      return matchFonte && matchPericia;
    });
  }, [buscaAdiada, origensData, fontesSelecionadas, periciasSelecionadas, fuse]);

  const origensOrdenadas = useMemo(() => {
    if (buscaAdiada.length > 2) return origensFiltradas;
    return [...origensFiltradas].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [origensFiltradas, buscaAdiada]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = fontesSelecionadas.length > 0 || periciasSelecionadas.length > 0;

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
                placeholder={`Buscando entre ${origensFiltradas.length} origens...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-18">Perícias:</span>
                {PERICIAS_ORDEM.map(p => (
                  <FilterButton 
                    key={p} 
                    label={p} 
                    isSelected={periciasSelecionadas.includes(p)} 
                    onClick={() => toggleFiltro(setPericiasSelecionadas, p)} 
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-18">Fontes:</span>
                {fontesDisponiveis.map(f => (
                  <FilterButton 
                    key={f} 
                    label={f} 
                    isSelected={fontesSelecionadas.includes(f)} 
                    onClick={() => toggleFiltro(setFontesSelecionadas, f)} 
                  />
                ))}

                {temFiltroAtivo && (
                  <button 
                    onClick={() => { setFontesSelecionadas([]); setPericiasSelecionadas([]); }}
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
        {origensOrdenadas.map((origem) => (
          <div key={origem.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
            
            <div className="grow">
               <h3 className="text-2xl font-special underline mb-2">{origem.nome}</h3>
               
               <div className="text-sm italic mb-4 opacity-90">
                 <ExpandableText text={origem.descricao} limit={400} />
               </div>
               
               <div className="flex mt-4 mb-4 border border-dashed border-gray-400 bg-gray-200">
                <div className="flex items-center px-2 py-0.5 text-base text-white font-special bg-gray-900">
                  <span className="-mb-1 uppercase">Perícias treinadas:</span>
                </div>
                <div className="flex items-center p-1 grow bg-gray-300/50">
                  <div className="text-sm ml-1 font-medium text-gray-800">{origem.pericias}</div>
                </div>
               </div>

               <div className="mt-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                 <span className="font-special pt-1 text-sm tracking-wider mr-1 uppercase text-gray-900 block">{origem.tecnicaNome}:</span>
                 <ExpandableText text={origem.tecnicaDescricao} limit={400} />
               </div>
            </div>
            
            <BookReference 
              fonte={origem.fonteLivro} 
              pagina={origem.fontePagina} 
              onOpenReader={() => setLeitorAtivo({ fonte: origem.fonteLivro, pagina: parseInt(origem.fontePagina) })} 
            />

            </div>
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 -rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
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