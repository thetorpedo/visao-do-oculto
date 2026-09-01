import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";
import FilterPanel from "@/components/filter/filter-panel";
import { useUI } from "@/context/UiContext";
import ItemCard from "@/components/ui/item-card";

const TABS = [
  { id: "equipamentos", label: "Equipamentos" },
  { id: "maldicoes", label: "Modificações & Maldições" },
] as const;

export default function Equipamentos() {
  const { equipamentos } = useData();
  const { abrirCriar } = useUI();

  const [abaAtiva, setTab] = useState<"equipamentos" | "maldicoes">("equipamentos");

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

  const changeTab = (novaAba: "equipamentos" | "maldicoes") => {
    setTab(novaAba);
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
      <div className="relative -mt-2 sm:-mt-6">

        <div className="relative z-0 flex items-end gap-2 pl-2 sm:pl-6 -mb-0.5">
          {TABS.map((tab) => {
            const isActive = abaAtiva === tab.id;
            return (
              <div className="relative h-12 flex items-end -mb-1 shadow-lg">
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`
                   flex cursor-pointer items-start justify-center
                  bg-[url(/assets/paper.png)] bg-blend-overlay bg-size-[300%]
                  px-4 pt-2 sm:px-6 sm:pt-2.5 font-daisy text-xs sm:text-base uppercase transition-all
                  ${isActive
                      ? "z-10 h-11 sm:h-12 bg-yellow-400/50 text-gray-900 shadow-[inset_0_-8px_5px_rgba(0,0,0,0.20)]"
                      : "z-0 h-9 sm:h-10 bg-yellow-400/30 text-gray-900/60 hover:h-10 sm:hover:h-11 hover:bg-yellow-400/50 hover:text-gray-900 shadow-[inset_0_-8px_5px_rgba(0,0,0,0.10)]"
                    }
                `}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          <FilterPanel
            {...filtros}
            placeholder={`Buscando entre ${equipamentosExibidos.length} itens...`}
            totalItens={equipamentosExibidos.length}
            onCriarNovo={() => abrirCriar('equipamentos')}
          />
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