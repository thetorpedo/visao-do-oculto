import DocumentReader from "@/components/DocumentReader";
import rituaisData from "@/data/rituais.json";
import Fuse from "fuse.js";
import { BookMarked, ChevronDown, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

const corElemento = (elemento: string) => {
  switch (elemento) {
    case "Sangue": return "text-white bg-[#aa2321] border-[#aa2321]";
    case "Morte": return "text-white bg-[#000000] border-[#000000]";
    case "Energia": return "text-white bg-[#9a03fa] border-[#9a03fa]";
    case "Conhecimento": return "text-white bg-[#ba921a] border-[#ba921a]";
    case "Medo": return "text-black bg-[#ffffff] border-gray-400";
    default: return "text-gray-800 border-gray-400 bg-gray-200";
  }
};

// Utilitário para deixar a primeira letra maiúscula
const capitalizeFirst = (str: string | number | null | undefined) => {
  if (!str) return "";
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-300 pb-0.5 gap-x-2 gap-y-0.5">
      <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="font-bold text-gray-900 text-sm text-right break-words">{capitalizeFirst(valor)}</span>
    </div>
  );
};

function ExpandableText({ text, limit = 250 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const textoExibido = isExpanded ? text : `${text.substring(0, limit)}...`;

  if (text.length <= limit) {
    return <p className="text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed">{capitalizeFirst(text)}</p>;
  }

  return (
    <span className="text-sm text-justify whitespace-pre-wrap text-gray-800 leading-relaxed">
        {capitalizeFirst(textoExibido)}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-xs cursor-pointer whitespace-pre-wrap font-bold text-gray-600 hover:text-black underline uppercase tracking-tighter"
        >
          {isExpanded ? "[ Ler menos ]" : "[ Ler mais ]"}
        </button>
    </span>
  );
}

// Novo componente Dropdown para os Aprimoramentos
function AprimoramentoDropdown({ aprimoramento }: { aprimoramento: any }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!aprimoramento) return null;

  return (
    <div className="mb-2 last:mb-0 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {/* Nome e custo integrados na mesma etiqueta preta */}
          <span className="font-special text-sm tracking-wider uppercase text-white px-2 py-1 bg-gray-900 shrink-0">
            {aprimoramento.nome} <span className="font-sans font-bold opacity-80 tracking-normal ml-0.5">({aprimoramento.custo})</span>
          </span>
        </div>
        <ChevronDown className={`size-4 mr-2 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="p-3 pt-2 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed animate-in slide-in-from-top-1">
          {capitalizeFirst(aprimoramento.descricao)}
        </div>
      )}
    </div>
  );
}

export default function Rituais() {
  const [busca, setBusca] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("busca") || "";
    }
    return "";
  }); 
  
  const buscaAdiada = useDeferredValue(busca);
  
  const [elementosSelecionados, setElementosSelecionados] = useState<string[]>([]);
  const [circulosSelecionados, setCirculosSelecionados] = useState<number[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const ELEMENTOS_DISPONIVEIS = ["Conhecimento", "Energia", "Morte", "Sangue", "Medo"];
  const CIRCULOS_DISPONIVEIS = [1, 2, 3, 4];
  
  const fontesDisponiveis = useMemo(() => {
    const fontes = new Set(rituaisData.map(r => r.fonteLivro));
    return Array.from(fontes).sort();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(rituaisData, {
      keys: ["nome", "descricao", "elemento", "aprimoramentos.descricao"], 
      threshold: 0.3, 
      ignoreLocation: true,
    });
  }, []);

  const rituaisFiltrados = useMemo(() => {
    const resultadoBusca = buscaAdiada.length > 2 
      ? fuse.search(buscaAdiada).map(r => r.item) 
      : rituaisData;
  
    return resultadoBusca.filter(ritual => {
      const matchElemento = elementosSelecionados.length === 0 || 
        ritual.elemento.some(e => elementosSelecionados.includes(e));
        
      const matchCirculo = circulosSelecionados.length === 0 || circulosSelecionados.includes(ritual.circulo);
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(ritual.fonteLivro);

      return matchElemento && matchCirculo && matchFonte;
    });
  }, [buscaAdiada, elementosSelecionados, circulosSelecionados, fontesSelecionadas, fuse]);

  const rituaisOrdenados = useMemo(() => {
    if (buscaAdiada.length > 2) {
      return rituaisFiltrados;
    }
    return [...rituaisFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [rituaisFiltrados, buscaAdiada]);

  const toggleFiltroArray = <T extends string | number>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = elementosSelecionados.length > 0 || circulosSelecionados.length > 0 || fontesSelecionadas.length > 0;

  const limparFiltros = () => {
    setElementosSelecionados([]);
    setCirculosSelecionados([]);
    setFontesSelecionadas([]);
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
                placeholder={`Buscando entre ${rituaisFiltrados.length} rituais...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Elemento:</span>
                {ELEMENTOS_DISPONIVEIS.map(e => (
                  <button
                    key={e}
                    onClick={() => toggleFiltroArray(setElementosSelecionados, e)}
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
                <span className="font-special text-sm self-center mr-2 w-16">Círculo:</span>
                {CIRCULOS_DISPONIVEIS.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleFiltroArray(setCirculosSelecionados, c)}
                    className={`px-4 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      circulosSelecionados.includes(c)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {c}º
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-special text-sm self-center mr-2 w-16">Fontes:</span>
                {fontesDisponiveis.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFiltroArray(setFontesSelecionadas, f)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      fontesSelecionadas.includes(f)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {f}
                  </button>
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
        {rituaisOrdenados.map((ritual) => {
          
          const statusAtivos = [
            { label: "Execução", valor: ritual.execucao },
            { label: "Alcance", valor: ritual.alcance },
            { label: "Alvo", valor: ritual.alvo },
            { label: "Área", valor: ritual.area },
            { label: "Duração", valor: ritual.duracao },
            { label: "Resistência", valor: ritual.resistencia }
          ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

          let limiteDescricao = 200;
          const temAprimoramentos = ritual.aprimoramentos && ritual.aprimoramentos.length > 0;
          
          if (!temAprimoramentos) limiteDescricao += 100;
          if (statusAtivos.length === 0) limiteDescricao += 100;

          return (
            <div key={ritual.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                
                <div className="flex-grow">
                  {/* Nome e Elementos/Círculos */}
                  <div className="flex justify-between flex-col items-start mb-4">
                    <h3 className="text-2xl font-special underline leading-tight">{ritual.nome}</h3>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ritual.elemento.map((e: string) => (
                        <span key={e} className={`text-sm uppercase font-daisy px-2 py-0.5 border ${corElemento(e)} whitespace-nowrap`}>
                          {e} {ritual.circulo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tabela de Status do Ritual */}
                  {statusAtivos.length > 0 && (
                    <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusAtivos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {statusAtivos.map((status, index) => (
                        <LinhaStatus key={index} label={status.label} valor={status.valor} />
                      ))}
                    </div>
                  )}
                  
                  {/* Descrição Principal com Limite Dinâmico */}
                  <div className="mb-4">
                    <ExpandableText text={ritual.descricao} limit={limiteDescricao} />
                  </div>

                  {/* Aprimoramentos - Agora no estilo Dropdown */}
                  {temAprimoramentos && (
                    <div className="mt-4 pt-1">
                      {ritual.aprimoramentos.map((aprimoramento: any, index: number) => (
                        <AprimoramentoDropdown key={index} aprimoramento={aprimoramento} />
                      ))}
                    </div>
                  )}

                </div>
                
                {/* Rodapé (Fonte) */}
                <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-700 font-medium flex items-center">
                    <BookMarked className="size-4 mr-1.5 opacity-80" />
                    <button 
                      onClick={() => setLeitorAtivo({ fonte: ritual.fonteLivro, pagina: parseInt(ritual.fontePagina as any) })}
                      className="hover:text-black underline cursor-pointer transition-colors"
                    >
                      <span className="font-bold decoration-gray-400 underline-offset-2">{ritual.fonteLivro}</span>
                      <span>, pág. {ritual.fontePagina}</span>
                    </button>
                  </div>
                </div>

              </div>
              
              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {rituaisFiltrados.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhum ritual esotérico encontrado nestas condições.
           </div>
        )}
      </div>
    </div>
  );
}