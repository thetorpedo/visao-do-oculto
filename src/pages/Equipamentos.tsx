import Source from "@/components/source";
import DocumentReader from "@/components/document-reader";
import ExpandableText from "@/components/expandable-text";
import FilterPanel from "@/components/filter-panel";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { useMemo, useState } from "react";
import SaveButton from "@/components/save-button";
import ModalCriarRegistro from "@/components/modal-create";
import { Pencil } from "lucide-react";

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
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [editando, setEditando] = useState<typeof equipamentosOrdenados[0] | null>(null);


  const dadosAbaAtual = useMemo(() => {
    return equipamentosData.filter(e => {
      const tipos = Array.isArray(e.tipo) ? e.tipo : [e.tipo];
      const isMaldicaoOuMod = tipos.includes("Maldição") || tipos.includes("Modificação");
      return abaAtiva === "equipamentos" ? !isMaldicaoOuMod : isMaldicaoOuMod;
    });
  }, [abaAtiva, equipamentosData]);

  const configsFiltro: ConfigFiltro[] = useMemo(() => {
    return [
      { id: "tipo", label: "Tipos", opcoes: "auto", match: "array" },
      { id: "subtipo", label: "Subtipos", opcoes: "auto" },
      { id: "arma.armaTipo", label: "Uso Arma", opcoes: "auto" },
      { id: "arma.catArma", label: "Cat Arma", opcoes: "auto" },
      { id: "arma.empunhadura", label: "Empunh", opcoes: "auto" },
      { id: "elemento", label: "Elementos", opcoes: "auto" },
      ...(abaAtiva === "equipamentos" ? [{ id: "categoria", label: "Categ", opcoes: "auto" as const }] : []),
      { id: "fonteLivro", label: "Fontes", opcoes: "auto" },
    ];
  }, [abaAtiva]);

  const {
    busca,
    setBusca,
    filtrosAtivos,
    operadoresAtivos,
    toggleOperador,
    toggleFiltro,
    limparFiltros,
    opcoesResolvidas,
    dadosFiltrados,
    temFiltroAtivo,
    limparTudo
  } = useFiltros(dadosAbaAtual, configsFiltro);

  const mudarAba = (novaAba: "equipamentos" | "maldicoes") => {
    setAbaAtiva(novaAba);
    limparTudo();
  };

  const equipamentosFiltradosEBusca = useMemo(() => {
    if (!busca) return dadosFiltrados;
    const termo = busca.toLowerCase();
    return dadosFiltrados.filter(
      (e) =>
        e.nome.toLowerCase().includes(termo) ||
        e.descricao.toLowerCase().includes(termo) ||
        (e.subtipo && e.subtipo.toLowerCase().includes(termo)) ||
        (e.tipoDano && e.tipoDano.toLowerCase().includes(termo)) ||
        (e.elemento && e.elemento.toLowerCase().includes(termo)) ||
        (e.arma?.armaTipo && e.arma.armaTipo.toLowerCase().includes(termo))
    );
  }, [dadosFiltrados, busca]);

  const equipamentosOrdenados = useMemo(() => {
    if (busca.length > 2) return equipamentosFiltradosEBusca;
    return [...equipamentosFiltradosEBusca].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [equipamentosFiltradosEBusca, busca]);

  return (
    <div className="space-y-6">
      {modalCriarAberto && (
        <ModalCriarRegistro
          categoria="equipamentos"
          onClose={() => setModalCriarAberto(false)}
        />
      )}
      {editando && (
        <ModalCriarRegistro
          categoria="equipamentos"
          itemInicial={editando}
          onClose={() => setEditando(null)}
        />
      )}
      <DocumentReader
        fonteId={leitorAtivo?.fonte || ""}
        paginaImpressa={leitorAtivo?.pagina || 0}
        isOpen={!!leitorAtivo}
        onClose={() => setLeitorAtivo(null)}
      />

      <div className="relative -mt-8">
        <div className="relative z-10">
          <div className="flex flex-col gap-5">

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

            <FilterPanel
              busca={busca}
              setBusca={setBusca}
              placeholder={`Buscando entre ${equipamentosOrdenados.length} itens...`}
              opcoesResolvidas={opcoesResolvidas}
              filtrosAtivos={filtrosAtivos}
              operadoresAtivos={operadoresAtivos}
              toggleOperador={toggleOperador}
              toggleFiltro={toggleFiltro}
              temFiltroAtivo={temFiltroAtivo}
              limparFiltros={limparFiltros}
              totalItens={equipamentosOrdenados.length}
              onCriarNovo={() => setModalCriarAberto(true)}
            />

          </div>
        </div>
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


                <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between ">
                  <Source
                    fonte={equip.fonteLivro}
                    pagina={equip.fontePagina}
                    onOpenReader={() => setLeitorAtivo({ fonte: equip.fonteLivro, pagina: parseInt(String(equip.fontePagina)) })}
                  />
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() => setEditando(equip)}
                      className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
                      title="Editar"
                    >
                      <Pencil className="size-5 transition-all text-gray-500 hover:text-gray-900" />
                    </button>
                    <SaveButton itemId={equip.id} categoria="equipamentos" />
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {equipamentosOrdenados.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum item encontrado com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}