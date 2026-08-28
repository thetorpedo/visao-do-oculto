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
  const { poderes: poderesData } = useData();


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

  const { abrirCriar } = useUI();

  return (
    <div className="space-y-6">
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
        onCriarNovo={() => abrirCriar('poderes')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poderesOrdenados.map((poder) => (
          <ItemCard key={poder.id} item={poder} categoria="poderes" />
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