import Source from "@/components/source";
import DocumentReader from "@/components/document-reader";
import ExpandableText from "@/components/expandable-text";
import FilterPanel from "@/components/filter-panel";
import { corElemento } from "@/utils/badgeUtils";
import { useData } from "@/context/DataContext";
import { useFiltros, type ConfigFiltro } from "@/hooks/useFiltros";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import SaveButton from "@/components/save-button";

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

const capitalizeFirst = (str: string | number | null | undefined) => {
  if (!str) return "";
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const LinhaStatus = ({ label, valor }: { label: string; valor: string | number | null | undefined }) => {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex flex-wrap justify-between items-baseline border-b border-dashed border-gray-300 pb-0.5 gap-x-2 gap-y-0.5">
      <span className="font-special text-xs text-gray-600 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="font-bold text-gray-900 text-sm text-right wrap-break-word">{capitalizeFirst(valor)}</span>
    </div>
  );
};

function AprimoramentoDropdown({ aprimoramento }: { aprimoramento: { nome: string; custo: string; descricao: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!aprimoramento) return null;

  return (
    <div className="mb-2 last:mb-0 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-special text-sm tracking-wider uppercase text-white px-2 py-1 bg-gray-900 shrink-0">
            {aprimoramento.nome} <span className="font-sans font-bold opacity-80 tracking-normal ml-0.5">({aprimoramento.custo})</span>
          </span>
        </div>
        <ChevronDown className={`size-4 mr-2 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="p-3 pt-2 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed animate-in slide-in-from-top-1">
          {capitalizeFirst(aprimoramento.descricao)}
        </div>
      )}
    </div>
  );
}

export default function Rituais() {
  const { rituais: rituaisData } = useData();
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
  } = useFiltros(rituaisData, CONFIGS_FILTRO);

  const rituaisFiltradosEBusca = useMemo(() => {
    if (!busca) return dadosFiltrados;
    const termo = busca.toLowerCase();
    return dadosFiltrados.filter(
      (r) =>
        r.nome.toLowerCase().includes(termo) ||
        r.descricao.toLowerCase().includes(termo) ||
        r.elemento.some((e) => e.toLowerCase().includes(termo)) ||
        (r.aprimoramentos && r.aprimoramentos.some((ap) => ap.descricao.toLowerCase().includes(termo)))
    );
  }, [dadosFiltrados, busca]);

  const rituaisOrdenados = useMemo(() => {
    if (busca.length > 2) return rituaisFiltradosEBusca;
    return [...rituaisFiltradosEBusca].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [rituaisFiltradosEBusca, busca]);

  return (
    <div className="space-y-6 relative">
      <DocumentReader
        fonteId={leitorAtivo?.fonte || ""}
        paginaImpressa={leitorAtivo?.pagina || 0}
        isOpen={!!leitorAtivo}
        onClose={() => setLeitorAtivo(null)}
      />

      <FilterPanel
        busca={busca}
        setBusca={setBusca}
        placeholder={`Buscando entre ${rituaisOrdenados.length} rituais...`}
        opcoesResolvidas={opcoesResolvidas}
        filtrosAtivos={filtrosAtivos}
        operadoresAtivos={operadoresAtivos}
        toggleOperador={toggleOperador}
        toggleFiltro={toggleFiltro}
        temFiltroAtivo={temFiltroAtivo}
        limparFiltros={limparFiltros}
        totalItens={rituaisOrdenados.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rituaisOrdenados.map((ritual) => {
          const statusAtivos = [
            { label: "Execução", valor: ritual.execucao },
            { label: "Alcance", valor: ritual.alcance },
            { label: "Alvo", valor: ritual.alvo },
            { label: "Área", valor: ritual.area },
            { label: "Duração", valor: ritual.duracao },
            { label: "Resistência", valor: ritual.resistencia }
          ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

          let limiteDescricao = 200;
          const temAprimoramentos = ritual.aprimoramentos && ritual.aprimoramentos.length > 0;
          if (!temAprimoramentos) limiteDescricao += 100;
          if (statusAtivos.length === 0) limiteDescricao += 100;

          return (
            <div key={ritual.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

                <div className="grow">
                  <div className="flex justify-between flex-col items-start mb-4">
                    <h3 className="text-2xl font-special underline leading-tight">{ritual.nome}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ritual.elemento.map((e: string) => (
                        <span key={e} className={`text-sm uppercase font-daisy px-2 py-0.5 border ${corElemento(e)} whitespace-nowrap`}>
                          {e} {ritual.circulo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {statusAtivos.length > 0 && (
                    <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusAtivos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {statusAtivos.map((status, index) => (
                        <LinhaStatus key={index} label={status.label} valor={status.valor} />
                      ))}
                    </div>
                  )}

                  <div className="mb-4">
                    <ExpandableText text={ritual.descricao} limit={limiteDescricao} />
                  </div>

                  {temAprimoramentos && (
                    <div className="mt-4 pt-1">
                      {ritual.aprimoramentos!.map((aprimoramento, index) => (
                        <AprimoramentoDropdown key={index} aprimoramento={aprimoramento} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-400 mt-5 pt-3 flex items-center justify-between ">
                  <Source
                    fonte={ritual.fonteLivro}
                    pagina={ritual.fontePagina}
                    onOpenReader={() => setLeitorAtivo({ fonte: ritual.fonteLivro, pagina: parseInt(String(ritual.fontePagina)) })}
                  />

                  <SaveButton itemId={ritual.id} categoria="rituais" />
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {rituaisOrdenados.length === 0 && (
          <div className="col-span-full text-center py-10 text-black/50 font-special text-xl">
            Nenhum ritual encontrado nestas condições.
          </div>
        )}
      </div>
    </div>
  );
}