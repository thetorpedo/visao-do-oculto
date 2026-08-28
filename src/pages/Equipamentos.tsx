import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import FilterPanel from "@/components/filter-panel";
import { useUI } from "@/context/UiContext";
import ItemCard from "@/components/ui/item-card";

export default function Equipamentos() {
  const { equipamentos } = useData();
  const { abrirCriar } = useUI();

  const [abaAtiva, setAbaAtiva] = useState<"equipamentos" | "maldicoes">("equipamentos");

  const dadosAbaAtual = useMemo(() => {
    return equipamentos.filter(e => {
      const tipos = Array.isArray(e.tipo) ? e.tipo : [e.tipo];
      const isMaldicaoOuMod = tipos.includes("Maldição") || tipos.includes("Modificação");
      return abaAtiva === "equipamentos" ? !isMaldicaoOuMod : isMaldicaoOuMod;
    });
  }, [abaAtiva, equipamentos]);

  const configsFiltro: ConfigFiltro[] = useMemo(() => {
    return [
      { id: "tipo", label: "Tipos", opcoes: "auto", match: "array" },
      { id: "subtipo", label: "Subtipos", opcoes: "auto" },
      { id: "arma.armaTipo", label: "Uso Arma", opcoes: "auto" },
      { id: "arma.catArma", label: "Cat Arma", opcoes: "auto" },
      { id: "arma.empunhadura", label: "Empunh", opcoes: "auto" },
      { id: "elemento", label: "Elementos", opcoes: "auto" },
      ...(abaAtiva === "equipamentos" ? [{ id: "categoria", label: "Categ", opcoes: "auto" as const }] : []),
      { id: "fonteLivro", label: "Fontes", opcoes: "auto" },
    ];
  }, [abaAtiva]);

  const filtros = useFiltros(dadosAbaAtual, configsFiltro);

  const mudarAba = (novaAba: "equipamentos" | "maldicoes") => {
    setAbaAtiva(novaAba);
    filtros.limparTudo();
  };

  const equipamentosExibidos = useMemo(() => {
    let resultado = filtros.dadosFiltrados;

    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.nome.toLowerCase().includes(termo) ||
          e.descricao.toLowerCase().includes(termo) ||
          (e.subtipo && e.subtipo.toLowerCase().includes(termo)) ||
          (e.tipoDano && e.tipoDano.toLowerCase().includes(termo)) ||
          (e.elemento && e.elemento.toLowerCase().includes(termo)) ||
          (e.arma?.armaTipo && e.arma.armaTipo.toLowerCase().includes(termo))
      );
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [filtros.dadosFiltrados, filtros.busca]);

  return (
    <div className="space-y-6">
      <div className="relative -mt-8">
        <div className="relative z-10">
          <div className="flex flex-col gap-5">

            <div className="flex gap-2 pb-0">
              <button
                onClick={() => mudarAba("equipamentos")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${abaAtiva === "equipamentos" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
              >
                Equipamentos
              </button>
              <button
                onClick={() => mudarAba("maldicoes")}
                className={`px-4 pt-1.5 pb-0.5 text-sm sm:text-base cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${abaAtiva === "maldicoes" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
              >
                Modificações & Maldições
              </button>
            </div>

            <FilterPanel
              {...filtros}
              placeholder={`Buscando entre ${equipamentosExibidos.length} itens...`}
              totalItens={equipamentosExibidos.length}
              onCriarNovo={() => abrirCriar('equipamentos')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentosExibidos.map((equip) => (
          <ItemCard
            key={equip.id}
            item={equip}
            categoria="equipamentos"
          />
        ))}

        {equipamentosExibidos.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum item encontrado com esses termos.
          </div>
        )}
      </div>
    </div>
  );
}