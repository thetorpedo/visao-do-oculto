import Source from "@/components/source";
import SaveButton from "@/components/save-button";
import DocumentReader from "@/components/document-reader";
import ExpandableText from "@/components/expandable-text";
import FilterPanel from "@/components/filter-panel";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { useMemo, useState } from "react";

const CONFIGS_FILTRO: ConfigFiltro[] = [
  {
    id: "pericias",
    label: "Perícias",
    opcoes: [
      "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades",
      "Ciências", "Crime", "Diplomacia", "Enganação", "Fortitude",
      "Furtividade", "Iniciativa", "Intimidação", "Intuição", "Investigação",
      "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem",
      "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência",
      "Tática", "Tecnologia", "Vontade"
    ],
    match: "partial",
  },
  {
    id: "fonteLivro",
    label: "Fontes",
    opcoes: "auto",
  },
];

export default function Origens() {
  const { origens: origensData } = useData();
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
  } = useFiltros(origensData, CONFIGS_FILTRO);

  const origensFiltradasEBusca = useMemo(() => {
    if (!busca) return dadosFiltrados;
    const termo = busca.toLowerCase();
    return dadosFiltrados.filter(
      (o) =>
        o.nome.toLowerCase().includes(termo) ||
        o.descricao.toLowerCase().includes(termo) ||
        o.tecnicaDescricao.toLowerCase().includes(termo)
    );
  }, [dadosFiltrados, busca]);

  const origensOrdenadas = useMemo(() => {
    if (busca.length > 2) return origensFiltradasEBusca;
    return [...origensFiltradasEBusca].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [origensFiltradasEBusca, busca]);

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
        placeholder={`Buscando entre ${origensOrdenadas.length} origens...`}
        opcoesResolvidas={opcoesResolvidas}
        filtrosAtivos={filtrosAtivos}
        operadoresAtivos={operadoresAtivos}
        toggleOperador={toggleOperador}
        toggleFiltro={toggleFiltro}
        temFiltroAtivo={temFiltroAtivo}
        limparFiltros={limparFiltros}
        totalItens={origensOrdenadas.length}
      />

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

              <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between ">
                <Source
                  fonte={origem.fonteLivro}
                  pagina={origem.fontePagina}
                  onOpenReader={() => setLeitorAtivo({ fonte: origem.fonteLivro, pagina: parseInt(String(origem.fontePagina)) })}
                />
                <SaveButton itemId={origem.id} categoria="origens" />
              </div>

            </div>
            <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 -rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
          </div>
        ))}

        {origensOrdenadas.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhuma origem encontrada com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}