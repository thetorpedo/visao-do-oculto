import DocumentReader from "@/components/DocumentReader";
import equipamentosData from "@/data/equipamentos.json";
import Fuse from "fuse.js";
import { BookMarked, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

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
    case "Maldição": return "text-fuchsia-900 border-dashed border-fuchsia-400 bg-fuchsia-200/30";
    case "Modificação": return "text-slate-900 border-dashed border-slate-400 bg-slate-200/30";
    default: return "text-gray-800 border-dashed border-gray-400 bg-gray-300/30"; 
  }
};

const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-300 pb-0.5 gap-x-2 gap-y-0.5">
      <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="font-bold text-gray-900 text-sm text-right break-words">{valor}</span>
    </div>
  );
};

// Função para remover o nome do item do início da descrição
const formatarDescricao = (nome: string, descricao: string) => {
  if (!descricao) return "";
  
  // Escapa caracteres especiais do nome para evitar erro no Regex
  const nomeEscapado = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Procura o nome exato no começo da string, seguido opcionalmente por ponto, traço, dois-pontos ou espaços
  const regex = new RegExp(`^${nomeEscapado}[\\.\\-\\:\\s]*`, 'i');
  
  const textoLimpo = descricao.replace(regex, '').trim();
  if (!textoLimpo) return "";
  
  // Retorna com a primeira letra maiúscula
  return textoLimpo.charAt(0).toUpperCase() + textoLimpo.slice(1);
};

// Movido para fora para evitar recriação a cada render
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

export default function Equipamentos() {
  const [abaAtiva, setAbaAtiva] = useState<"equipamentos" | "maldicoes">("equipamentos");
  
  const [busca, setBusca] = useState(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    return params.get("busca") || "";
  }
  return "";
});
  // OTIMIZAÇÃO: Adia a filtragem pesada para não travar a digitação
  const buscaAdiada = useDeferredValue(busca);

  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);
  const [subtiposSelecionados, setSubtiposSelecionados] = useState<string[]>([]);
  const [armaTiposSelecionados, setArmaTiposSelecionados] = useState<string[]>([]);
  const [catArmasSelecionadas, setCatArmasSelecionadas] = useState<string[]>([]);
  const [empunhadurasSelecionadas, setEmpunhadurasSelecionadas] = useState<string[]>([]);
  const [elementosSelecionados, setElementosSelecionados] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);
  // const [showDebug, setShowDebug] = useState(false);

  // 1. Isola os dados baseados na aba ativa
  const dadosAbaAtual = useMemo(() => {
    return equipamentosData.filter(e => {
      const isMaldicaoOuMod = e.tipo === "Maldição" || e.tipo === "Modificação" || e.tipo2 === "Maldição" || e.tipo2 === "Modificação";
      return abaAtiva === "equipamentos" ? !isMaldicaoOuMod : isMaldicaoOuMod;
    });
  }, [abaAtiva]);

  // OTIMIZAÇÃO: Loop Único. Extrai todos os filtros varrendo o array apenas UMA vez!
  const opcoesDisponiveis = useMemo(() => {
    const tipos = new Set<string>();
    const subtipos = new Set<string>();
    const armaTipos = new Set<string>();
    const catArmas = new Set<string>();
    const empunhaduras = new Set<string>();
    const elementos = new Set<string>();
    const categorias = new Set<string>();
    const fontes = new Set<string>();

    dadosAbaAtual.forEach(e => {
      if (e.tipo) tipos.add(String(e.tipo));
      if (e.tipo2) tipos.add(String(e.tipo2));
      if (e.subtipo) subtipos.add(String(e.subtipo));
      if (e.armaTipo) armaTipos.add(String(e.armaTipo));
      if (e.catArma) catArmas.add(String(e.catArma));
      if (e.empunhadura) empunhaduras.add(String(e.empunhadura));
      if (e.elemento) elementos.add(String(e.elemento));
      if (e.categoria) categorias.add(String(e.categoria));
      if (e.fonteLivro) fontes.add(String(e.fonteLivro));
    });

    return {
      tipos: Array.from(tipos).sort(),
      subtipos: Array.from(subtipos).sort(),
      armaTipos: Array.from(armaTipos).sort(),
      catArmas: Array.from(catArmas).sort(),
      empunhaduras: Array.from(empunhaduras).sort(),
      elementos: Array.from(elementos).sort(),
      categorias: Array.from(categorias).sort(),
      fontes: Array.from(fontes).sort()
    };
  }, [dadosAbaAtual]);

  const fuse = useMemo(() => {
    return new Fuse(dadosAbaAtual, {
      keys: ["nome", "descricao", "tipo", "tipo2", "subtipo", "tipoDano", "armaTipo", "catArma", "empunhadura", "elemento"], 
      threshold: 0.3, 
      ignoreLocation: true, 
    });
  }, [dadosAbaAtual]);

  const equipamentosFiltrados = useMemo(() => {
    // Usa a buscaAdiada em vez da busca direta
    const resultadoBusca = buscaAdiada.length > 2 
      ? fuse.search(buscaAdiada).map(r => r.item) 
      : dadosAbaAtual; 
  
    return resultadoBusca.filter(equip => {
      const matchTipo = tiposSelecionados.length === 0 || tiposSelecionados.includes(equip.tipo) || (equip.tipo2 && tiposSelecionados.includes(equip.tipo2));
      const matchSubtipo = subtiposSelecionados.length === 0 || (equip.subtipo && subtiposSelecionados.includes(equip.subtipo));
      const matchArmaTipo = armaTiposSelecionados.length === 0 || (equip.armaTipo && armaTiposSelecionados.includes(equip.armaTipo));
      const matchCatArma = catArmasSelecionadas.length === 0 || (equip.catArma && catArmasSelecionadas.includes(equip.catArma));
      const matchEmpunhadura = empunhadurasSelecionadas.length === 0 || (equip.empunhadura && empunhadurasSelecionadas.includes(equip.empunhadura));
      const matchElemento = elementosSelecionados.length === 0 || (equip.elemento && elementosSelecionados.includes(equip.elemento));
      const matchCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(equip.categoria ? equip.categoria : '');
      const matchFonte = fontesSelecionadas.length === 0 || fontesSelecionadas.includes(equip.fonteLivro);

      return matchTipo && matchSubtipo && matchArmaTipo && matchCatArma && matchEmpunhadura && matchElemento && matchCategoria && matchFonte;
    });
  }, [buscaAdiada, dadosAbaAtual, tiposSelecionados, subtiposSelecionados, armaTiposSelecionados, catArmasSelecionadas, empunhadurasSelecionadas, elementosSelecionados, categoriasSelecionadas, fontesSelecionadas, fuse]);

  const toggleFiltro = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const limparFiltros = () => {
    setTiposSelecionados([]);
    setSubtiposSelecionados([]);
    setArmaTiposSelecionados([]);
    setCatArmasSelecionadas([]);
    setEmpunhadurasSelecionadas([]);
    setElementosSelecionados([]);
    setCategoriasSelecionadas([]);
    setFontesSelecionadas([]);
  };

  const mudarAba = (novaAba: "equipamentos" | "maldicoes") => {
    setAbaAtiva(novaAba);
    limparFiltros(); 
  };

  // OTIMIZAÇÃO: Memoiza o array do UI de filtros para não recriar os botões desnecessariamente
  const filtrosUI = useMemo(() => [
    { label: "Tipos:", opcoes: opcoesDisponiveis.tipos, estado: tiposSelecionados, setter: setTiposSelecionados },
    { label: "Subtipos:", opcoes: opcoesDisponiveis.subtipos, estado: subtiposSelecionados, setter: setSubtiposSelecionados },
    { label: "Uso Arma:", opcoes: opcoesDisponiveis.armaTipos, estado: armaTiposSelecionados, setter: setArmaTiposSelecionados },
    { label: "Cat Arma:", opcoes: opcoesDisponiveis.catArmas, estado: catArmasSelecionadas, setter: setCatArmasSelecionadas },
    { label: "Empunh:", opcoes: opcoesDisponiveis.empunhaduras, estado: empunhadurasSelecionadas, setter: setEmpunhadurasSelecionadas },
    { label: "Elementos:", opcoes: opcoesDisponiveis.elementos, estado: elementosSelecionados, setter: setElementosSelecionados },
    ...(abaAtiva === "equipamentos" ? [{ label: "Categ:", opcoes: opcoesDisponiveis.categorias, estado: categoriasSelecionadas, setter: setCategoriasSelecionadas }] : []), 
    { label: "Fontes:", opcoes: opcoesDisponiveis.fontes, estado: fontesSelecionadas, setter: setFontesSelecionadas },
  ], [opcoesDisponiveis, tiposSelecionados, subtiposSelecionados, armaTiposSelecionados, catArmasSelecionadas, empunhadurasSelecionadas, elementosSelecionados, categoriasSelecionadas, fontesSelecionadas, abaAtiva]);

  const temFiltroAtivo = filtrosUI.some(f => f.estado.length > 0);

  // const debugData = useMemo(() => {
  //   const valoresUnicos: Record<string, Set<any>> = {};
  //   const chavesIgnoradas = ["id", "nome", "descricao", "defesa"];

  //   equipamentosData.forEach(item => {
  //     Object.entries(item).forEach(([chave, valor]) => {
  //       if (chavesIgnoradas.includes(chave)) return;
  //       if (valor === null || valor === undefined || valor === "") return;

  //       if (!valoresUnicos[chave]) {
  //         valoresUnicos[chave] = new Set();
  //       }
  //       valoresUnicos[chave].add(valor);
  //     });
  //   });

  //   const resultado: Record<string, any[]> = {};
  //   Object.keys(valoresUnicos).sort().forEach(chave => {
  //     resultado[chave] = Array.from(valoresUnicos[chave]).sort();
  //   });

  //   return resultado;
  // }, []);

  const equipamentosOrdenados = useMemo(() => {
    if (buscaAdiada.length > 2) {
      return equipamentosFiltrados;
    }
    return [...equipamentosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [equipamentosFiltrados, buscaAdiada]);

  useMemo(() => {
    const ids = equipamentosData.map(e => e.id).sort((a, b) => a - b);
    const faltantes = [];
    for (let i = 1; i <= ids[ids.length - 1]; i++) {
      if (!ids.includes(i)) faltantes.push(i);
    }
    console.log("🎯 Total de itens:", equipamentosData.length);
    console.log("🔍 IDs faltando:", faltantes);
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
        <div className="relative p-6 z-10 shadow-2xl bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%]">
          
          {/* <button 
            onClick={() => setShowDebug(!showDebug)}
            className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-widest bg-gray-900 text-white px-2 py-1 shadow cursor-pointer hover:bg-gray-700"
          >
            {showDebug ? "Fechar Debug" : "Debug JSON"}
          </button> */}

          <div className="flex flex-col gap-5 pt-2">
            
            {/* SUB-ABAS (Equipamentos / Maldições) */}
            <div className="flex gap-2 pb-0">
              <button
                onClick={() => mudarAba("equipamentos")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${
                  abaAtiva === "equipamentos" 
                  ? "bg-gray-800 text-white" 
                  : "bg-white/40 text-gray-800 hover:bg-white/80"
                }`}
              >
                Equipamentos
              </button>
              <button
                onClick={() => mudarAba("maldicoes")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${
                  abaAtiva === "maldicoes" 
                  ? "bg-gray-800 text-white" 
                  : "bg-white/40 text-gray-800 hover:bg-white/80"
                }`}
              >
                Modificações & Maldições
              </button>
            </div>

            <div className="flex items-center border border-gray-600 bg-white/40 px-3 py-2 -mt-2">
              <Search className="size-5 mr-2" />
              <input
                type="text"
                placeholder={`Buscando entre ${equipamentosFiltrados.length} itens...`}
                className="w-full bg-transparent outline-none font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Renderização Dinâmica dos Filtros */}
              {filtrosUI.map((filtro) => {
                if (filtro.opcoes.length === 0) return null;

                return (
                  <div key={filtro.label} className="flex flex-wrap gap-2">
                    <span className="font-special text-sm self-center mr-2 w-[76px]">{filtro.label}</span>
                    {filtro.opcoes.map(opcao => (
                      <button
                        key={opcao}
                        onClick={() => toggleFiltro(filtro.setter, opcao)}
                        className={`px-3 py-1 text-xs font-bold transition-colors border cursor-pointer ${
                          filtro.estado.includes(opcao)
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-gray-200/50 text-gray-700 border-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>
                );
              })}

              {temFiltroAtivo && (
                <div className="flex mt-1">
                  <span className="w-[76px] mr-2"></span> {/* Espaçador para alinhar */}
                  <button 
                    onClick={limparFiltros}
                    className="text-red-700 text-xs font-bold flex items-center underline"
                  >
                    <X className="size-3 mr-1" /> Limpar Todos os Filtros
                  </button>
                </div>
              )}
            </div>

            {/* PAINEL DE DEBUG */}
            {/* {showDebug && (
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
            )} */}
            
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />  
      </div>

      {/* GRID DE EQUIPAMENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentosOrdenados.map((equip: any) => {
          
          const isArma = equip.tipo === "Arma" || equip.tipo2 === "Arma";
          const isAmaldicoado = equip.tipo === "Item Amaldiçoado" || equip.tipo2 === "Item Amaldiçoado";
          const hideSubtipo = isAmaldicoado && !isArma;

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
            // { label: "Defesa", valor: equip.defesa },
            { label: "Penalidade", valor: equip.penalidade }
          ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

          return (
            <div key={equip.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                
                <div className="flex-grow">
                  {/* Cabeçalho */}
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="text-2xl font-special underline leading-tight mb-1">{equip.nome}</h3>
                    
                    {/* Categoria e Espaço Super Destacados */}
                    {(equip.categoria || (equip.espaco !== undefined && equip.espaco !== null)) && (equip.tipo !== 'Modificação' && equip.tipo !== 'Maldição') && (
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        {equip.categoria && (
                          <div className="flex items-center justify-center align-middle border border-dashed border-gray-900 bg-white overflow-hidden">
                            <span className="bg-gray-900 text-white font-special text-[10px] sm:text-xs px-2 h-full pt-1 align-middle uppercase">Cat</span>
                            <span className="font-bold text-gray-900 px-2 h-full text-xs sm:text-sm">{equip.categoria}</span>
                          </div>
                        )}
                        {equip.espaco !== undefined && equip.espaco !== null && (
                          <div className="flex items-center border border-dashed border-gray-900 bg-white overflow-hidden">
                            <span className="bg-gray-900 text-white font-special text-[10px] sm:text-xs px-2 h-full pt-1 text-center align-middle uppercase">Esp</span>
                            <span className="font-bold text-gray-900 px-2 h-full text-xs sm:text-sm">{equip.espaco}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Badges unificados: Tipo, Tipo2, Subtipo e Elemento */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-sm uppercase font-daisy px-2.5 py-1 border ${estiloBadgeTipo(equip.tipo)}`}>
                      {equip.tipo}
                    </span>
                    {equip.tipo2 && (
                      <span className={`text-sm uppercase font-daisy px-2.5 py-1 border ${estiloBadgeTipo(equip.tipo2)}`}>
                        {equip.tipo2}
                      </span>
                    )}
                    {equip.subtipo && !hideSubtipo && (
                      <span className="text-sm uppercase font-daisy px-2.5 py-1 border border-dashed border-gray-400 bg-gray-200/50 text-gray-700">
                        {equip.subtipo}
                      </span>
                    )}
                    {equip.elemento && (
                      <span className={`text-sm uppercase font-daisy px-2.5 py-1 border ${corElemento(equip.elemento)}`}>
                        {equip.elemento}
                      </span>
                    )}
                  </div>
                  
                  {/* Tabela de Status Dinâmica (Só aparece se for Arma e tiver itens ativos) */}
                  {(isArma || equip.tipo === "Proteção") && statusAtivos.length > 0 && (
                    <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusAtivos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {statusAtivos.map((status, index) => (
                        <LinhaStatus key={index} label={status.label} valor={status.valor} />
                      ))}
                    </div>
                  )}
                  
                  {/* Descrição Limpa */}
                  <div className="mb-2">
                    <ExpandableText text={formatarDescricao(equip.nome, equip.descricao)} limit={equip.tipo === 'Arma' || equip.tipo2 === 'Arma' ? 250 : 500} />
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
              
              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {equipamentosFiltrados.length === 0 && (
           <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
             Nenhum item encontrado com esses termos.
           </div>
        )}
      </div>
    </div>
  );
}