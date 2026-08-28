import FilterPanel from "@/components/filter-panel";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { useMemo } from "react";
import ItemCard from "@/components/ui/item-card";
import { useUI } from "@/context/UiContext";

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

  const { abrirCriar } = useUI();

  return (
    <div className="space-y-6">
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
        onCriarNovo={() => abrirCriar('origens')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {origensOrdenadas.map((origem) => (
          <ItemCard key={origem.id} item={origem} categoria="origens" />
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