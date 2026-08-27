import Source from "@/components/source";
import DocumentReader from "@/components/document-reader";
import ExpandableText from "@/components/expandable-text";
import FilterPanel from "@/components/filter-panel";
import { estiloBadgeTipo } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { ChevronDown, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import SaveButton from "@/components/save-button";
import ModalCriarRegistro from "@/components/modal-create";

const CONFIGS_FILTRO: ConfigFiltro[] = [
  {
    id: "tipo",
    label: "Classes",
    opcoes: ["Geral", "Combatente", "Especialista", "Ocultista", "Sobrevivente"],
  },
  {
    id: "fonteLivro",
    label: "Fontes",
    opcoes: "auto",
  },
];

export default function Trilhas() {
  const { trilhas: trilhasData } = useData();
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [editando, setEditando] = useState<typeof trilhasOrdenadas[0] | null>(null);


  const {
    busca,
    setBusca,
    filtrosAtivos,
    toggleFiltro,
    limparFiltros,
    opcoesResolvidas,
    dadosFiltrados,
    temFiltroAtivo,
    operadoresAtivos,
    toggleOperador,
  } = useFiltros(trilhasData, CONFIGS_FILTRO);

  const trilhasFiltradasEBusca = useMemo(() => {
    if (!busca) return dadosFiltrados;
    const termo = busca.toLowerCase();
    return dadosFiltrados.filter(
      (t) =>
        t.nome.toLowerCase().includes(termo) ||
        (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
        (t.especial && t.especial.toLowerCase().includes(termo)) ||
        t.nex10.toLowerCase().includes(termo) ||
        t.nex40.toLowerCase().includes(termo) ||
        (t.nex65 && t.nex65.toLowerCase().includes(termo)) ||
        (t.nex99 && t.nex99.toLowerCase().includes(termo))
    );
  }, [dadosFiltrados, busca]);

  const trilhasOrdenadas = useMemo(() => {
    if (busca.length > 2) return trilhasFiltradasEBusca;
    return [...trilhasFiltradasEBusca].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [trilhasFiltradasEBusca, busca]);

  function NexDropdown({ label, text }: { label: string; text?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    if (!text) return null;

    const indexPonto = text.indexOf(".");
    const titulo = indexPonto !== -1 ? text.substring(0, indexPonto) : "Habilidade";
    const descricao = indexPonto !== -1 ? text.substring(indexPonto + 1).trim() : text;

    return (
      <div className="mb-2 last:mb-0 transition-all">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-special text-sm tracking-wider uppercase text-white px-2 py-1 bg-gray-900 shrink-0">
              {label}
            </span>
            <span className="font-semibold font-blur text-normal text-gray-900 leading-tight">
              {titulo}
            </span>
          </div>
          <ChevronDown
            className={`size-4 mr-2 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <div className="p-3 pt-2 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed animate-in slide-in-from-top-1">
            {descricao}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modalCriarAberto && (
        <ModalCriarRegistro
          categoria="trilhas"
          onClose={() => setModalCriarAberto(false)}
        />
      )}
      {editando && (
        <ModalCriarRegistro
          categoria="trilhas"
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

      <FilterPanel
        busca={busca}
        setBusca={setBusca}
        placeholder={`Buscando entre ${trilhasOrdenadas.length} trilhas...`}
        opcoesResolvidas={opcoesResolvidas}
        filtrosAtivos={filtrosAtivos}
        toggleFiltro={toggleFiltro}
        temFiltroAtivo={temFiltroAtivo}
        limparFiltros={limparFiltros}
        totalItens={trilhasOrdenadas.length}
        operadoresAtivos={operadoresAtivos}
        toggleOperador={toggleOperador}
        onCriarNovo={() => setModalCriarAberto(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trilhasOrdenadas.map((trilha) => (
          <div key={trilha.id} className="relative group">
            <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
              <div className="grow">
                <div className="flex justify-between flex-col items-start mb-3">
                  <h3 className="text-xl font-special underline leading-tight">{trilha.nome}</h3>
                  <span
                    className={`text-sm uppercase font-daisy px-2 mt-1 border ${estiloBadgeTipo(
                      trilha.tipo
                    )} whitespace-nowrap`}
                  >
                    {trilha.tipo}
                  </span>
                </div>

                <div className="mb-4">
                  <ExpandableText text={trilha.descricao ?? ""} limit={400} />
                </div>

                {trilha.especial && (
                  <div className="mb-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                    <p className="text-xs text-gray-800">
                      <span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">
                        Especial:
                      </span>
                      <span className="font-medium text-sm">{trilha.especial}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-1">
                  <NexDropdown
                    label={trilha.tipo === "Sobrevivente" ? "Estágio 2" : "NEX 10%"}
                    text={trilha.nex10}
                  />
                  <NexDropdown
                    label={trilha.tipo === "Sobrevivente" ? "Estágio 4" : "NEX 40%"}
                    text={trilha.nex40}
                  />
                  {trilha.tipo !== "Sobrevivente" && (
                    <>
                      <NexDropdown label="NEX 65%" text={trilha.nex65} />
                      <NexDropdown label="NEX 99%" text={trilha.nex99} />
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between ">
                <Source
                  fonte={trilha.fonteLivro}
                  pagina={trilha.fontePagina}
                  onOpenReader={() =>
                    setLeitorAtivo({
                      fonte: trilha.fonteLivro,
                      pagina: parseInt(String(trilha.fontePagina)),
                    })
                  }
                />
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => setEditando(trilha)}
                    className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
                    title="Editar"
                  >
                    <Pencil className="size-5 transition-all text-gray-500 hover:text-gray-900" />
                  </button>
                  <SaveButton itemId={trilha.id} categoria="trilhas" />
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}

        {trilhasOrdenadas.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
            Nenhuma trilha encontrada com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}