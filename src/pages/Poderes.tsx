import FilterPanel from "@/components/filter-panel";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import { useMemo } from "react";
import ItemCard from "@/components/ui/item-card";
import { useUI } from "@/context/UiContext";

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
  const { poderes } = useData();
  const { abrirCriar } = useUI();

  const filtros = useFiltros(poderes, CONFIGS_FILTRO);

  const poderesExibidos = useMemo(() => {
    let resultado = filtros.dadosFiltrados;

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo) ||
          (p.preRequisitos && p.preRequisitos.toLowerCase().includes(termo)) ||
          (p.afinidade && p.afinidade.toLowerCase().includes(termo))
      );
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtros.dadosFiltrados, filtros.busca]);

  return (
    <div className="space-y-6">
      <FilterPanel
        {...filtros}
        placeholder={`Buscando entre ${poderesExibidos.length} poderes...`}
        totalItens={poderesExibidos.length}
        onCriarNovo={() => abrirCriar('poderes')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poderesExibidos.map((poder) => (
          <ItemCard key={poder.id} item={poder} categoria="poderes" />
        ))}

        {poderesExibidos.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum poder encontrado com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}