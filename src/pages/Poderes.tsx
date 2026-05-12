import DocumentReader from "@/components/DocumentReader";
import poderesData from "@/data/poderes.json";
import Fuse from "fuse.js";
import { BookMarked, Search } from "lucide-react";
import { useMemo, useState } from "react";

// Utilitário para as cores dos elementos paranormais
const corElemento = (elemento: string | null) => {
  switch (elemento) {
    case "Sangue": return "text-white bg-[#aa2321] border-[#aa2321]";
    case "Morte": return "text-white bg-[#000000] border-[#000000]";
    case "Energia": return "text-white bg-[#9a03fa] border-[#9a03fa]";
    case "Conhecimento": return "text-white bg-[#ba921a] border-[#ba921a]";
    case "Medo": return "text-black bg-[#ffffff]";
    default: return "text-gray-800 border border-gray-400 bg-gray-200";
  }
};

export default function Poderes() {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroElemento, setFiltroElemento] = useState("");
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const fuse = useMemo(() => {
    return new Fuse(poderesData, {
      keys: ["nome", "descricao", "preRequisitos", "afinidade"], 
      threshold: 0.3, 
    });
  }, []);

  const poderesFiltrados = useMemo(() => {
    let resultado = poderesData;
  
    // 1. Busca Fuzzy
    if (busca.length > 2) {
      resultado = fuse.search(busca).map(r => r.item);
    }
  
    // 2. Filtro por Tipo (Combatente, Ocultista, etc)
    if (filtroTipo) {
      resultado = resultado.filter(p => p.tipo === filtroTipo);
    }

    // 3. Filtro por Elemento (Só útil se o tipo for Paranormal ou se não tiver tipo filtrado)
    if (filtroElemento) {
      resultado = resultado.filter(p => p.elemento === filtroElemento);
    }
  
    return resultado;
  }, [busca, filtroTipo, filtroElemento, fuse]);

  function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;
    if (text.length <= limit) return <p className="text-sm text-justify text-gray-800">{text}</p>;
  
    return (
      <span className="text-sm text-justify text-gray-800">
          {isExpanded ? text : `${text.substring(0, limit)}...`}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
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
      
      {/* PAINEL DE BUSCA E FILTROS */}
      <div className="relative">
        <div className="relative p-6 z-10 shadow-2xl bg-[url(src/assets/paper.png)] bg-repeat bg-size-[30%]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center border-2 border-gray-800 bg-white/40 px-3 py-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${poderesData.length} poderes...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {/* Dropdown de Tipo */}
              <select
                className="border-2 border-gray-800 bg-white/40 p-2 font-special cursor-pointer"
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  if (e.target.value !== "Paranormal") setFiltroElemento(""); // Reseta o elemento se não for paranormal
                }}
              >
                <option value="">Todos os Tipos</option>
                <option value="Combatente">Combatente</option>
                <option value="Especialista">Especialista</option>
                <option value="Ocultista">Ocultista</option>
                <option value="Geral">Geral</option>
                <option value="Paranormal">Paranormal</option>
              </select>

              {/* Dropdown de Elemento (Aparece mais destacado se Paranormal for selecionado) */}
              {(!filtroTipo || filtroTipo === "Paranormal") && (
                <select
                  className="border-2 border-gray-800 bg-white/40 p-2 font-special cursor-pointer"
                  value={filtroElemento}
                  onChange={(e) => setFiltroElemento(e.target.value)}
                >
                  <option value="">Todos os Elementos</option>
                  <option value="Conhecimento">Conhecimento</option>
                  <option value="Energia">Energia</option>
                  <option value="Morte">Morte</option>
                  <option value="Sangue">Sangue</option>
                  <option value="Medo">Medo</option>
                </select>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      {/* GRID DE PODERES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(poderesFiltrados).sort((a, b) => a.nome.localeCompare(b.nome)).map((poder) => (
          <div key={poder.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
              
              <div>
                {/* Nome e Badge de Tipo/Elemento */}
                <div className="flex justify-between flex-col items-start mb-3">
                  <h3 className="text-xl font-special underline leading-tight">{poder.nome}</h3>
                  
                  <span className={`text-sm uppercase font-daisy px-2 mt-1 ${corElemento(poder.elemento)} whitespace-nowrap`}>
                    {poder.elemento ? `${poder.elemento}` : poder.tipo}
                  </span>
                </div>
                
                {/* Descrição Padrão */}
                <div className="mb-2">
                  <ExpandableText text={poder.descricao} limit={500} />
                </div>
                {/* Pré-requisitos */}
                {poder.preRequisitos && (
                  <div className={`mb-4 pb-2 ${poder.afinidade && 'border-b border-dashed border-gray-400'}`}>
                    <p className="text-sm text-gray-800">
                      <strong className="font-special text-sm mr-1">Pré-requisitos:</strong> 
                      {poder.preRequisitos}
                    </p>
                  </div>
                )}
                {/* Afinidade (Visual Destacado) */}
                {poder.afinidade && (
                  <div className={`mt-3 p-2 border-l-4 ${corElemento(poder.elemento).replace('bg-', 'border-').split(' ')[1]} bg-black/5`}>
                    <strong className="font-special text-sm block">Afinidade:</strong>
                    <ExpandableText text={poder.afinidade} limit={500} />
                  </div>
                )}
                
                
              </div>
              
              {/* Fonte e Document Reader */}
              <div className="text-xs text-gray-500 font-medium mt-4 -mb-1 pt-2">
                <BookMarked className="inline size-4 mr-1 mb-0.5" />
                <span className="font-bold text-gray-600">Fonte: </span>
                <button 
                  onClick={() => setLeitorAtivo({ fonte: poder.fonteLivro, pagina: parseInt(poder.fontePagina) })}
                  className="underline cursor-pointer hover:text-black hover:brightness-120"
                >
                  <span>{poder.fonteLivro}</span>
                  <span> - </span>
                  <span>página {poder.fontePagina}.</span> 
                </button>
              </div>
            </div>
            
            {/* Efeito de Papel de Fundo */}
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