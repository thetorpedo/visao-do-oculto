import DocumentReader from "@/components/DocumentReader";
import equipamentosData from "@/data/equipamentos.json";
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
    default: return "text-gray-800 border-dashed border-gray-400 bg-gray-200";
  }
};

const estiloBadgeTipo = (tipo: string) => {
  switch (tipo) {
    case "Arma": return "text-red-900 border-dashed border-red-300 bg-red-200/30";
    case "Proteção": return "text-blue-900 border-dashed border-blue-300 bg-blue-200/30";
    case "Item Amaldiçoado": return "text-purple-900 border-dashed border-purple-300 bg-purple-200/30";
    case "Explosivo": return "text-orange-900 border-dashed border-orange-300 bg-orange-200/30";
    default: return "text-gray-800 border-dashed border-gray-400 bg-gray-300/30"; 
  }
};

// Subcomponente com flex-wrap: Se a tela ficar apertada ou o texto for longo, o valor desce para a próxima linha
const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-300 pb-0.5 gap-x-2 gap-y-0.5">
      <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="font-bold text-gray-900 text-sm text-right break-words">{valor}</span>
    </div>
  );
};

export default function Equipamentos() {
  const [busca, setBusca] = useState("");
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);
  
  // Estado para controlar a exibição do painel de Debug
  const [showDebug, setShowDebug] = useState(false);

  const TIPOS_DISPONIVEIS = ["Arma", "Proteção", "Equipamento Geral", "Acessório", "Item Amaldiçoado", "Explosivo"];
  const CATEGORIAS_DISPONIVEIS = ["0", "I", "II", "III", "IV"];
  
  const fontesDisponiveis = useMemo(() => {
    const fontes = new Set(equipamentosData.map(e => e.fonteLivro));
    return Array.from(fontes).sort();
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(equipamentosData, {
      keys: ["nome", "descricao", "tipo", "subtipo", "tipoDano", "armaTipo"], 
      threshold: 0.3, 
      ignoreLocation: true, 
    });
  }, []);

  const equipamentosFiltrados = useMemo(() => {
    const resultadoBusca = busca.length > 2 
      ? fuse.search(busca).map(r => r.item) 
      : equipamentosData;
  
    return resultadoBusca.filter(equip => {
      const matchTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(equip.tipo);
      const matchCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(equip.categoria);
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(equip.fonteLivro);

      return matchTipo && matchCategoria && matchFonte;
    });
  }, [busca, tiposSelecionados, categoriasSelecionadas, fontesSelecionadas, fuse]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const temFiltroAtivo = tiposSelecionados.length > 0 || categoriasSelecionadas.length > 0 || fontesSelecionadas.length > 0;

  const limparFiltros = () => {
    setTiposSelecionados([]);
    setCategoriasSelecionadas([]);
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

  // LÓGICA DE DEBUG: Extrai valores únicos de todos os campos
  const debugData = useMemo(() => {
    const valoresUnicos: Record<string, Set<any>> = {};
    const chavesIgnoradas = ["id", "nome", "descricao", "defesa"];

    equipamentosData.forEach(item => {
      Object.entries(item).forEach(([chave, valor]) => {
        if (chavesIgnoradas.includes(chave)) return;
        if (valor === null || valor === undefined || valor === "") return;

        if (!valoresUnicos[chave]) {
          valoresUnicos[chave] = new Set();
        }
        valoresUnicos[chave].add(valor);
      });
    });

    const resultado: Record<string, any[]> = {};
    Object.keys(valoresUnicos).sort().forEach(chave => {
      resultado[chave] = Array.from(valoresUnicos[chave]).sort();
    });

    return resultado;
  }, []);

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
          
          {/* Botão de Toggle do Debug */}
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-widest bg-gray-900 text-white px-2 py-1 shadow cursor-pointer hover:bg-gray-700"
          >
            {showDebug ? "Fechar Debug" : "Debug JSON"}
          </button>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${equipamentosFiltrados.length} equipamentos...`}
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
                <span className="font-special text-sm self-center mr-2 w-16">Categ:</span>
                {CATEGORIAS_DISPONIVEIS.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleFiltro(setCategoriasSelecionadas, c)}
                    className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                      categoriasSelecionadas.includes(c)
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    {c}
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

            {/* PAINEL DE DEBUG (Condicional) */}
            {showDebug && (
              <div className="mt-2 p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-auto max-h-64 border border-green-500 shadow-inner">
                <div className="text-white font-bold mb-3 uppercase tracking-wider border-b border-gray-700 pb-1">
                  Valores Únicos por Campo
                </div>
                {Object.entries(debugData).map(([chave, valores]) => (
                  <div key={chave} className="mb-3">
                    <span className="text-yellow-300 font-bold">{chave}:</span> 
                    <span className="ml-2 text-gray-300">
                      {valores.map((v, i) => (
                        <span key={i}>
                          <span className="text-green-300">"{v}"</span>
                          {i < valores.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      {/* GRID DE EQUIPAMENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from(equipamentosFiltrados).sort((a, b) => a.nome.localeCompare(b.nome)).map((equip: any) => {
          
          // Mapeamento dinâmico para contar quantas estatísticas o item tem.
          // NOTA: Removido o campo 'defesa' conforme solicitado.
          const statusAtivos = [
            { label: "Proficiência", valor: equip.proficiencia },
            { label: "Tipo", valor: equip.armaTipo },
            { label: "Empunhadura", valor: equip.empunhadura },
            { label: "Categoria", valor: equip.catArma },
            { label: "Munição", valor: equip.municao },
            { label: "Dano", valor: equip.dano },
            { label: "Crítico", valor: equip.critico },
            { label: "Alcance", valor: equip.alcance },
            { label: "Tipo Dano", valor: equip.tipoDano },
            { label: "Penalidade", valor: equip.penalidade }
          ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

          return (
            <div key={equip.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(src/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                
                <div className="flex-grow">
                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="text-2xl font-special underline leading-tight mb-1">{equip.nome}</h3>
                    
                    {/* Categoria e Espaço Super Destacados (Estilo Ficha) */}
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <div className="flex items-center justify-center align-middle border border-dashed border-gray-900 bg-white overflow-hidden">
                        <span className="bg-gray-900 text-white font-special text-[10px] sm:text-xs px-2 h-full pt-1 align-middle uppercase">Cat</span>
                        <span className="font-bold text-gray-900 px-2 h-full text-xs sm:text-sm">{equip.categoria}</span>
                      </div>
                      <div className="flex items-center border border-dashed border-gray-900 bg-white overflow-hidden">
                        <span className="bg-gray-900 text-white font-special text-[10px] sm:text-xs px-2 h-full pt-1 text-center align-middle uppercase">Esp</span>
                        <span className="font-bold text-gray-900 px-2 h-full text-xs sm:text-sm">{equip.espaco}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges unificados: Tipo, Subtipo e Elemento */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs uppercase font-daisy px-2.5 py-1 border ${estiloBadgeTipo(equip.tipo)}`}>
                      {equip.tipo}
                    </span>
                    {equip.subtipo && (
                      <span className="text-xs uppercase font-daisy px-2.5 py-1 border border-dashed border-gray-400 bg-gray-200/50 text-gray-700">
                        {equip.subtipo}
                      </span>
                    )}
                    {equip.elemento && (
                      <span className={`text-xs uppercase font-daisy px-2.5 py-1 border ${corElemento(equip.elemento)}`}>
                        {equip.elemento}
                      </span>
                    )}
                  </div>
                  
                  {/* Tabela de Status Dinâmica (Ocupa 1 coluna inteira se tiver apenas 1 item) */}
                  {statusAtivos.length > 0 && (
                    <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusAtivos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {statusAtivos.map((status, index) => (
                        <LinhaStatus key={index} label={status.label} valor={status.valor} />
                      ))}
                    </div>
                  )}
                  
                  {/* Descrição */}
                  <div className="mb-2">
                    <ExpandableText text={equip.descricao} limit={250} />
                  </div>

                </div>
                
                {/* Rodapé (Fonte) */}
                <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-700 font-medium flex items-center">
                    <BookMarked className="size-4 mr-1.5 opacity-80" />
                    <button 
                      onClick={() => setLeitorAtivo({ fonte: equip.fonteLivro, pagina: parseInt(equip.fontePagina) })}
                      className="hover:text-black underline cursor-pointer transition-colors decoration-gray-400 underline-offset-2"
                    >
                      <span className="font-bold">{equip.fonteLivro}</span>
                      <span>, pág. {equip.fontePagina}</span>
                    </button>
                  </div>
                </div>

              </div>
              
              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(src/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {equipamentosFiltrados.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhum equipamento encontrado com esses termos.
           </div>
        )}
      </div>
    </div>
  );
}