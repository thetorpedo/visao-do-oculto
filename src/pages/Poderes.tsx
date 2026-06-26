import BookReference from "@/components/BookReference";
import DocumentReader from "@/components/DocumentReader";
import ExpandableText from "@/components/ExpandableText";
import FilterButton from "@/components/FilterButton";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

export default function Poderes() {
  const { poderes: poderesData } = useData();

  const [busca, setBusca] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("busca") || "";
    }
    return "";
  }); 
  
  const buscaAdiada = useDeferredValue(busca);
  
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [elementosSelecionados, setElementosSelecionados] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [preReqSelecionados, setPreReqSelecionados] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const TIPOS_DISPONIVEIS = ["Geral", "Combatente", "Especialista", "Ocultista", "Paranormal", "Sacrifício"];
  const ELEMENTOS_DISPONIVEIS = ["Conhecimento", "Energia", "Morte", "Sangue", "Intenção", "Transmissão"];
  const PREREQ_DISPONIVEIS = ["Agi", "For", "Int", "Pre", "Vig", "Treinado", "Veterano", "Expert", "NEX"];
  
  const fontesDisponiveis = useMemo(() => {
    return Array.from(new Set(poderesData.map(p => p.fonteLivro)));
  }, [poderesData]);

  const fuse = useMemo(() => {
    return new Fuse(poderesData, {
      keys: ["nome", "descricao", "preRequisitos", "afinidade"], 
      threshold: 0.3, 
      ignoreLocation: true,
    });
  }, [poderesData]);

  const poderesFiltrados = useMemo(() => {
    const resultadoBusca = buscaAdiada.length > 2 
      ? fuse.search(buscaAdiada).map(r => r.item) 
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
  }, [buscaAdiada, poderesData, tiposSelecionados, elementosSelecionados, fontesSelecionadas, preReqSelecionados, fuse]);

  const poderesOrdenados = useMemo(() => {
    if (buscaAdiada.length > 2) return poderesFiltrados;
    return [...poderesFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [poderesFiltrados, buscaAdiada]);

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
                  <FilterButton key={t} label={t} isSelected={tiposSelecionados.includes(t)} onClick={() => toggleFiltro(setTiposSelecionados, t)} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Elementos:</span>
                {ELEMENTOS_DISPONIVEIS.map(e => (
                  <FilterButton key={e} label={e} isSelected={elementosSelecionados.includes(e)} onClick={() => toggleFiltro(setElementosSelecionados, e)} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Pré-req:</span>
                {PREREQ_DISPONIVEIS.map(pr => (
                  <FilterButton key={pr} label={pr} isSelected={preReqSelecionados.includes(pr)} onClick={() => toggleFiltro(setPreReqSelecionados, pr)} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Fontes:</span>
                {fontesDisponiveis.map(f => (
                  <FilterButton key={f} label={f} isSelected={fontesSelecionadas.includes(f)} onClick={() => toggleFiltro(setFontesSelecionadas, f)} />
                ))}
              </div>
              
              {temFiltroAtivo && (
                <button 
                  onClick={limparFiltros}
                  className="text-red-700 text-xs font-bold flex items-center underline mt-2"
                >
                  <X className="size-3 mr-1" /> Limpar Todos os Filtros
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poderesOrdenados.map((poder) => (
          <div key={poder.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
              
              <div className="grow">
                <div className="flex justify-between flex-col items-start mb-3">
                  <h3 className="text-xl font-special underline leading-tight">{poder.nome}</h3>
                  
                  <span className="flex flex-row flex-wrap gap-2">
                    <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${estiloBadgeTipo(poder.tipo)} whitespace-nowrap`}>
                      {poder.tipo}
                    </span>
                    {poder.elemento && (
                      <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${corElemento(poder.elemento)} whitespace-nowrap`}>
                        {poder.elemento}
                      </span>  
                    )}
                  </span>
                </div>
                
                <div className="mb-4">
                  <ExpandableText text={poder.descricao} limit={220} />
                </div>

                {poder.preRequisitos && (
                  <div className="mt-3 bg-gray-400/20 border border-gray-400/50 px-3 py-1">
                    <p className="text-xs -mb-1 text-gray-800">
                      <span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">Pré-requisitos:</span> 
                      <span className="font-medium text-sm">{poder.preRequisitos}</span>
                    </p>
                  </div>
                )}

                {poder.afinidade && (
                  <div className={`mt-3 p-3 border-l-4 ${corElemento(poder.elemento).replace('bg-', 'border-').split(' ')[1]} bg-gray-300/30`}>
                    <span className="font-special text-sm tracking-wider block uppercase text-gray-900 mb-1">Afinidade:</span>
                    <ExpandableText text={poder.afinidade} limit={200} />
                  </div>
                )}
              </div>
              
              <BookReference 
                fonte={poder.fonteLivro} 
                pagina={poder.fontePagina} 
                onOpenReader={() => setLeitorAtivo({ fonte: poder.fonteLivro, pagina: parseInt(poder.fontePagina as unknown as string) })} 
              />

            </div>
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
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