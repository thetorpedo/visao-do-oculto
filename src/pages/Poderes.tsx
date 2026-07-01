import Source from "@/components/source";
import DocumentReader from "@/components/document-reader";
import ExpandableText from "@/components/expandable-text";
import FilterPanel from "@/components/filter-panel";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { useMemo, useState } from "react";
import SaveButton from "@/components/save-button";

const CONFIGS_FILTRO: ConfigFiltro[] = [
  {
    id: "tipo",
    label: "Tipos",
    opcoes: ["Geral", "Combatente", "Especialista", "Ocultista", "Paranormal", "Sacrifício"],
  },
  {
    id: "elemento",
    label: "Elementos",
    opcoes: ["Conhecimento", "Energia", "Morte", "Sangue", "Intenção", "Transmissão"],
  },
  {
    id: "preRequisitos",
    label: "Pré-req",
    opcoes: ["Agi", "For", "Int", "Pre", "Vig", "Treinado", "Veterano", "Expert", "NEX"],
    match: "partial",
  },
  {
    id: "fonteLivro",
    label: "Fontes",
    opcoes: "auto",
  },
];

export default function Poderes() {
  const { poderes: poderesData } = useData();
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

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
  } = useFiltros(poderesData, CONFIGS_FILTRO);

  const poderesFiltradosEBusca = useMemo(() => {
    if (!busca) return dadosFiltrados;
    const termo = busca.toLowerCase();
    return dadosFiltrados.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo) ||
        (p.preRequisitos && p.preRequisitos.toLowerCase().includes(termo)) ||
        (p.afinidade && p.afinidade.toLowerCase().includes(termo))
    );
  }, [dadosFiltrados, busca]);

  const poderesOrdenados = useMemo(() => {
    if (busca.length > 2) return poderesFiltradosEBusca;
    return [...poderesFiltradosEBusca].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [poderesFiltradosEBusca, busca]);

  return (
    <div className="space-y-6">
      <DocumentReader
        fonteId={leitorAtivo?.fonte || ""}
        paginaImpressa={leitorAtivo?.pagina || 0}
        isOpen={!!leitorAtivo}
        onClose={() => setLeitorAtivo(null)}
      />

      <FilterPanel
        busca={busca}
        setBusca={setBusca}
        placeholder={`Buscando entre ${poderesOrdenados.length} poderes...`}
        opcoesResolvidas={opcoesResolvidas}
        filtrosAtivos={filtrosAtivos}
        operadoresAtivos={operadoresAtivos}
        toggleOperador={toggleOperador}
        toggleFiltro={toggleFiltro}
        temFiltroAtivo={temFiltroAtivo}
        limparFiltros={limparFiltros}
        totalItens={poderesOrdenados.length}
      />

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


              <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between ">
                <Source
                  fonte={poder.fonteLivro}
                  pagina={poder.fontePagina}
                  onOpenReader={() => setLeitorAtivo({ fonte: poder.fonteLivro, pagina: parseInt(String(poder.fontePagina)) })}
                />
                <SaveButton itemId={poder.id} categoria="poderes" />
              </div>

            </div>
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}

        {poderesOrdenados.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum poder encontrado com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}