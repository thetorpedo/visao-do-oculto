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
      "Acrobacia", "Adestramento", "Artes", "Atletismo", "Atualidades", "Ciências", "Crime",
      "Diplomacia", "Enganação", "Fortitude", "Furtividade", "Iniciativa", "Intimidação",
      "Intuição", "Investigação", "Luta", "Medicina", "Ocultismo", "Percepção", "Pilotagem",
      "Pontaria", "Profissão", "Reflexos", "Religião", "Sobrevivência", "Tática",
      "Tecnologia", "Vontade"
    ],
    match: "partial",
  },
  { id: "fonteLivro", label: "Fontes", opcoes: "auto" },
];

export default function Origens() {
  const { origens } = useData();
  const { abrirCriar } = useUI();

  const filtros = useFiltros(origens, CONFIGS_FILTRO);

  const origensExibidas = useMemo(() => {
    let resultado = filtros.dadosFiltrados;

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter((o) =>
        o.nome.toLowerCase().includes(termo) ||
        o.descricao.toLowerCase().includes(termo) ||
        o.tecnicaDescricao.toLowerCase().includes(termo)
      );
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtros.dadosFiltrados, filtros.busca]);

  return (
    <div className="space-y-6">
      <FilterPanel
        {...filtros}
        placeholder={`Buscando entre ${origensExibidas.length} origens...`}
        totalItens={origensExibidas.length}
        onCriarNovo={() => abrirCriar('origens')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {origensExibidas.map((origem) => (
          <ItemCard key={origem.id} item={origem} categoria="origens" />
        ))}

        {origensExibidas.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhuma origem encontrada com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}