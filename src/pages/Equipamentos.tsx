import BookReference from "@/components/BookReference";
import DocumentReader from "@/components/DocumentReader";
import ExpandableText from "@/components/ExpandableText";
import FilterButton from "@/components/FilterButton";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-300 pb-0.5 gap-x-2 gap-y-0.5">
      <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="font-bold text-gray-900 text-sm text-right wrap-break-word">{valor}</span>
    </div>
  );
};

const formatarDescricao = (nome: string, descricao: string) => {
  if (!descricao) return "";
  const nomeEscapado = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${nomeEscapado}[\\.\\-\\:\\s]*`, 'i');
  const textoLimpo = descricao.replace(regex, '').trim();
  if (!textoLimpo) return "";
  return textoLimpo.charAt(0).toUpperCase() + textoLimpo.slice(1);
};

export default function Equipamentos() {
  const { equipamentos: equipamentosData } = useData();

  const [abaAtiva, setAbaAtiva] = useState<"equipamentos" | "maldicoes">("equipamentos");
  const [busca, setBusca] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("busca") || "";
    }
    return "";
  });

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

  const dadosAbaAtual = useMemo(() => {
    return equipamentosData.filter(e => {
      const tipos = Array.isArray(e.tipo) ? e.tipo : [e.tipo];
      const isMaldicaoOuMod = tipos.includes("Maldição") || tipos.includes("Modificação");
      return abaAtiva === "equipamentos" ? !isMaldicaoOuMod : isMaldicaoOuMod;
    });
  }, [abaAtiva, equipamentosData]);

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
      const tiposArr = Array.isArray(e.tipo) ? e.tipo : [e.tipo];
      tiposArr.forEach(t => t && tipos.add(t));
      if (e.subtipo) subtipos.add(e.subtipo);
      if (e.arma?.armaTipo) armaTipos.add(e.arma.armaTipo);
      if (e.arma?.catArma) catArmas.add(e.arma.catArma);
      if (e.arma?.empunhadura) empunhaduras.add(e.arma.empunhadura);
      if (e.elemento) elementos.add(e.elemento);
      if (e.categoria) categorias.add(e.categoria);
      if (e.fonteLivro) fontes.add(e.fonteLivro);
    });

    return {
      tipos: Array.from(tipos).sort(),
      subtipos: Array.from(subtipos).sort(),
      armaTipos: Array.from(armaTipos).sort(),
      catArmas: Array.from(catArmas).sort(),
      empunhaduras: Array.from(empunhaduras).sort(),
      elementos: Array.from(elementos).sort(),
      categorias: Array.from(categorias).sort(),
      fontes: Array.from(fontes).sort(),
    };
  }, [dadosAbaAtual]);

  const fuse = useMemo(() => {
    return new Fuse(dadosAbaAtual, {
      keys: ["nome", "descricao", "tipo", "subtipo", "tipoDano", "arma.armaTipo", "arma.catArma", "arma.empunhadura", "elemento"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [dadosAbaAtual]);

  const equipamentosFiltrados = useMemo(() => {
    const resultadoBusca = buscaAdiada.length > 2
      ? fuse.search(buscaAdiada).map(r => r.item)
      : dadosAbaAtual;

    return resultadoBusca.filter(equip => {
      const tipos = Array.isArray(equip.tipo) ? equip.tipo : [equip.tipo];
      const matchTipo = tiposSelecionados.length === 0 || tiposSelecionados.some(t => tipos.includes(t));
      const matchSubtipo = subtiposSelecionados.length === 0 || (equip.subtipo && subtiposSelecionados.includes(equip.subtipo));
      const matchArmaTipo = armaTiposSelecionados.length === 0 || (equip.arma?.armaTipo && armaTiposSelecionados.includes(equip.arma.armaTipo));
      const matchCatArma = catArmasSelecionadas.length === 0 || (equip.arma?.catArma && catArmasSelecionadas.includes(equip.arma.catArma));
      const matchEmpunhadura = empunhadurasSelecionadas.length === 0 || (equip.arma?.empunhadura && empunhadurasSelecionadas.includes(equip.arma.empunhadura));
      const matchElemento = elementosSelecionados.length === 0 || (equip.elemento && elementosSelecionados.includes(equip.elemento));
      const matchCategoria = categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(equip.categoria ?? '');
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

  const equipamentosOrdenados = useMemo(() => {
    if (buscaAdiada.length > 2) return equipamentosFiltrados;
    return [...equipamentosFiltrados].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [equipamentosFiltrados, buscaAdiada]);

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
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex gap-2 pb-0">
              <button
                onClick={() => mudarAba("equipamentos")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${abaAtiva === "equipamentos" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
              >
                Equipamentos
              </button>
              <button
                onClick={() => mudarAba("maldicoes")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${abaAtiva === "maldicoes" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
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
              {filtrosUI.map((filtro) => {
                if (filtro.opcoes.length === 0) return null;
                return (
                  <div key={filtro.label} className="flex flex-wrap gap-2">
                    <span className="font-special text-sm self-center mr-2 w-19">{filtro.label}</span>
                    {filtro.opcoes.map(opcao => (
                      <FilterButton
                        key={opcao}
                        label={opcao}
                        isSelected={filtro.estado.includes(opcao)}
                        onClick={() => toggleFiltro(filtro.setter, opcao)}
                      />
                    ))}
                  </div>
                );
              })}

              {temFiltroAtivo && (
                <div className="flex mt-1">
                  <span className="w-19 mr-2"></span>
                  <button
                    onClick={limparFiltros}
                    className="text-red-700 text-xs font-bold flex items-center underline"
                  >
                    <X className="size-3 mr-1" /> Limpar Todos os Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentosOrdenados.map((equip) => {
          const tipos = Array.isArray(equip.tipo) ? equip.tipo : [equip.tipo];
          const isArma = tipos.includes("Arma");
          const isAmaldicoado = tipos.includes("Item Amaldiçoado");
          const hideSubtipo = isAmaldicoado && !isArma;

          const statusAtivos = [
            { label: "Proficiência", valor: equip.arma?.armaTipo },
            { label: "Empunhadura", valor: equip.arma?.empunhadura },
            { label: "Categoria", valor: equip.arma?.catArma },
            { label: "Munição", valor: equip.arma?.municao },
            { label: "Dano", valor: equip.dano },
            { label: "Crítico", valor: equip.critico },
            { label: "Alcance", valor: equip.alcance },
            { label: "Tipo Dano", valor: equip.tipoDano },
          ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

          return (
            <div key={equip.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

                <div className="grow">
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="text-2xl font-special underline leading-tight mb-1">{equip.nome}</h3>

                    {(equip.categoria || (equip.espaco !== undefined && equip.espaco !== null)) && !tipos.includes('Modificação') && !tipos.includes('Maldição') && (
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

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tipos.map(t => (
                      <span key={t} className={`text-sm uppercase font-daisy px-2.5 py-1 border ${estiloBadgeTipo(t)}`}>
                        {t}
                      </span>
                    ))}
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

                  {(isArma || tipos.includes("Proteção")) && statusAtivos.length > 0 && (
                    <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusAtivos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {statusAtivos.map((status, index) => (
                        <LinhaStatus key={index} label={status.label} valor={status.valor} />
                      ))}
                    </div>
                  )}

                  <div className="mb-2">
                    <ExpandableText text={formatarDescricao(equip.nome, equip.descricao)} limit={isArma ? 250 : 500} />
                  </div>
                </div>

                <BookReference
                  fonte={equip.fonteLivro}
                  pagina={equip.fontePagina}
                  onOpenReader={() => setLeitorAtivo({ fonte: equip.fonteLivro, pagina: parseInt(equip.fontePagina) })}
                />
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