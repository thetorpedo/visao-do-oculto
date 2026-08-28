import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import { useMemo } from "react";
import ItemCard from "@/components/ui/item-card";
import { useUI } from "@/context/UiContext";
import FilterPanel from "@/components/filter/filter-panel";

const CONFIGS_FILTRO: ConfigFiltro[] = [
  {
    id: "elemento",
    label: "Elemento",
    opcoes: ["Conhecimento", "Energia", "Morte", "Sangue", "Medo"],
    match: "array",
  },
  {
    id: "circulo",
    label: "Círculo",
    opcoes: ["1", "2", "3", "4"],
  },
  {
    id: "fonteLivro",
    label: "Fontes",
    opcoes: "auto",
  },
];

export default function Rituais() {
  const { rituais } = useData();
  const { abrirCriar } = useUI();

  const filtros = useFiltros(rituais, CONFIGS_FILTRO);

  const rituaisExibidos = useMemo(() => {
    let resultado = filtros.dadosFiltrados;

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (r) =>
          r.nome.toLowerCase().includes(termo) ||
          r.descricao.toLowerCase().includes(termo) ||
          r.elemento.some((e) => e.toLowerCase().includes(termo)) ||
          (r.aprimoramentos && r.aprimoramentos.some((ap) => ap.descricao.toLowerCase().includes(termo)))
      );
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtros.dadosFiltrados, filtros.busca]);

  return (
    <div className="space-y-6 relative">
      <FilterPanel
        {...filtros}
        placeholder={`Buscando entre ${rituaisExibidos.length} rituais...`}
        totalItens={rituaisExibidos.length}
        onCriarNovo={() => abrirCriar('rituais')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rituaisExibidos.map((ritual) => (
          <ItemCard
            key={ritual.id}
            item={ritual}
            categoria="rituais"
          />
        ))}

        {rituaisExibidos.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum ritual encontrado nestas condições.
          </div>
        )}
      </div>
    </div>
  );
}