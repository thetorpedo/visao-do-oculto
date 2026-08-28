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
  const { trilhas } = useData();
  const { abrirCriar } = useUI();

  const filtros = useFiltros(trilhas, CONFIGS_FILTRO);

  const trilhasExibidas = useMemo(() => {
    let resultado = filtros.dadosFiltrados;

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.nome.toLowerCase().includes(termo) ||
          (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
          (t.especial && t.especial.toLowerCase().includes(termo)) ||
          (t.nex10 && t.nex10.toLowerCase().includes(termo)) ||
          (t.nex40 && t.nex40.toLowerCase().includes(termo)) ||
          (t.nex65 && t.nex65.toLowerCase().includes(termo)) ||
          (t.nex99 && t.nex99.toLowerCase().includes(termo))
      );
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtros.dadosFiltrados, filtros.busca]);

  return (
    <div className="space-y-6">
      <FilterPanel
        {...filtros}
        placeholder={`Buscando entre ${trilhasExibidas.length} trilhas...`}
        totalItens={trilhasExibidas.length}
        onCriarNovo={() => abrirCriar('trilhas')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trilhasExibidas.map((trilha) => (
          <ItemCard key={trilha.id} item={trilha} categoria="trilhas" />
        ))}

        {trilhasExibidas.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-600 font-special text-xl">
            Nenhuma trilha encontrada com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}