import FilterPanel from "@/components/filter-panel";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import { useMemo } from "react";
import ItemCard from "@/components/ui/item-card";
import { useUI } from "@/context/UiContext";

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


  const { abrirCriar } = useUI();

  return (
    <div className="space-y-6">
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
        onCriarNovo={() => abrirCriar('trilhas')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trilhasOrdenadas.map((trilha) => (
          <ItemCard key={trilha.id} item={trilha} categoria="trilhas" />

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