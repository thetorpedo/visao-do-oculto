import { useState, useMemo } from "react";
import { useFavoritos } from "@/context/FavoritosContext";
import { useData } from "@/context/DataContext";
import { Plus, X, Trash2, Meh, ChevronDown } from "lucide-react";
import Source from "@/components/source";
import ExpandableText from "@/components/expandable-text";
import SaveButton from "@/components/save-button";
import DocumentReader from "@/components/document-reader";
import RulesRenderer from "@/components/rules-renderer";
import { CategoriaFavoritavel } from "@/lib/favoritos";
import { corElemento, estiloBadgeTipo } from "@/utils/badgeUtils";


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
      <button onClick={() => setIsOpen(!isOpen)} className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left">
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

function NexDropdown({ label, text }: { label: string; text?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!text) return null;
  const indexPonto = text.indexOf(".");
  const titulo = indexPonto !== -1 ? text.substring(0, indexPonto) : "Habilidade";
  const descricao = indexPonto !== -1 ? text.substring(indexPonto + 1).trim() : text;
  return (
    <div className="mb-2 last:mb-0 transition-all">
      <button onClick={() => setIsOpen(!isOpen)} className="border border-dashed border-gray-400 bg-gray-200 cursor-pointer w-full flex items-center justify-between hover:bg-gray-200/50 transition-colors text-left">
        <div className="flex items-center gap-2">
          <span className="font-special text-sm tracking-wider uppercase text-white px-2 py-1 bg-gray-900 shrink-0">{label}</span>
          <span className="font-semibold font-blur text-normal text-gray-900 leading-tight">{titulo}</span>
        </div>
        <ChevronDown className={`size-4 mr-2 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="p-3 pt-2 border border-t-0 border-dashed border-gray-400 bg-gray-200 text-sm whitespace-pre-wrap text-justify text-gray-800 leading-relaxed animate-in slide-in-from-top-1">
          {descricao}
        </div>
      )}
    </div>
  );
}

function RegraExpandivel({ content }: { content: string }) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${expandido ? "max-h-none" : "max-h-[250px] overflow-hidden"}`}>
        <RulesRenderer content={content} />
      </div>
      <button
        onClick={() => setExpandido(!expandido)}
        className="mt-2 text-xs font-bold uppercase underline py-1 text-gray-600 cursor-pointer"
      >
        {expandido ? "[Ler menos]" : "[Ler mais...]"}
      </button>
    </div>
  );
}


export default function Favoritos() {
  const { grupos, favoritos, criarGrupo, removerGrupo, removerFavorito } = useFavoritos();
  const data = useData();

  const [grupoAtivo, setGrupoAtivo] = useState<string>("todos");
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [criandoGrupo, setCriandoGrupo] = useState(false);
  const [leitorAtivo, setLeitorAtivo] = useState<{ fonte: string; pagina: number } | null>(null);

  const favoritosFiltrados = useMemo(() => {
    if (grupoAtivo === "todos") return favoritos;
    return favoritos.filter(f => f.grupoIds.includes(grupoAtivo));
  }, [favoritos, grupoAtivo]);

  const handleCriarGrupo = async () => {
    if (!novoGrupoNome.trim()) return;
    const grupo = await criarGrupo(novoGrupoNome.trim());
    setGrupoAtivo(grupo.id);
    setNovoGrupoNome("");
    setCriandoGrupo(false);
  };

  const handleRemoverGrupo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja apagar este grupo? Os itens não serão excluídos, apenas removidos desta pasta.")) {
      await removerGrupo(id);
      if (grupoAtivo === id) setGrupoAtivo("todos");
    }
  };

  const getItemData = (itemId: string, categoria: CategoriaFavoritavel) => {
    const lista = data[categoria] as any[];
    return lista.find((item: any) => item.id === itemId) || null;
  };

  const renderCardBody = (item: any, categoria: string) => {
    switch (categoria) {
      case "poderes":
        return (
          <>
            <div className="flex flex-row flex-wrap gap-2 mb-3 -mt-2">
              <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${estiloBadgeTipo(item.tipo)} whitespace-nowrap`}>{item.tipo}</span>
              {item.elemento && <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${corElemento(item.elemento)} whitespace-nowrap`}>{item.elemento}</span>}
            </div>
            <div className="mb-4"><ExpandableText text={item.descricao} limit={220} /></div>
            {item.preRequisitos && (
              <div className="mt-3 bg-gray-400/20 border border-gray-400/50 px-3 py-1">
                <p className="text-xs -mb-1 text-gray-800"><span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">Pré-requisitos:</span><span className="font-medium text-sm">{item.preRequisitos}</span></p>
              </div>
            )}
            {item.afinidade && (
              <div className={`mt-3 p-3 border-l-4 ${corElemento(item.elemento).replace('bg-', 'border-').split(' ')[1]} bg-gray-300/30`}>
                <span className="font-special text-sm tracking-wider block uppercase text-gray-900 mb-1">Afinidade:</span>
                <ExpandableText text={item.afinidade} limit={200} />
              </div>
            )}
          </>
        );

      case "rituais":
        const statusRituais = [
          { label: "Execução", valor: item.execucao }, { label: "Alcance", valor: item.alcance },
          { label: "Alvo", valor: item.alvo }, { label: "Área", valor: item.area },
          { label: "Duração", valor: item.duracao }, { label: "Resistência", valor: item.resistencia }
        ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");
        return (
          <>
            <div className="flex flex-wrap gap-1 mt-2 mb-4 -mt-2">
              {item.elemento.map((e: string) => (
                <span key={e} className={`text-sm uppercase font-daisy px-2 py-0.5 border ${corElemento(e)} whitespace-nowrap`}>{e} {item.circulo}</span>
              ))}
            </div>
            {statusRituais.length > 0 && (
              <div className={`mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 ${statusRituais.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {statusRituais.map((status, index) => <LinhaStatus key={index} label={status.label} valor={status.valor} />)}
              </div>
            )}
            <div className="mb-4"><ExpandableText text={item.descricao} limit={200} /></div>
            {item.aprimoramentos && item.aprimoramentos.length > 0 && (
              <div className="mt-4 pt-1">
                {item.aprimoramentos.map((ap: any, index: number) => <AprimoramentoDropdown key={index} aprimoramento={ap} />)}
              </div>
            )}
          </>
        );

      case "origens":
        return (
          <>
            <div className="text-sm italic mb-4 opacity-90"><ExpandableText text={item.descricao} limit={400} /></div>
            <div className="flex mt-4 mb-4 border border-dashed border-gray-400 bg-gray-200">
              <div className="flex items-center px-2 py-0.5 text-base text-white font-special bg-gray-900"><span className="-mb-1 uppercase">Perícias treinadas:</span></div>
              <div className="flex items-center p-1 grow bg-gray-300/50"><div className="text-sm ml-1 font-medium text-gray-800">{item.pericias}</div></div>
            </div>
            <div className="mt-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
              <span className="font-special pt-1 text-sm tracking-wider mr-1 uppercase text-gray-900 block">{item.tecnicaNome}:</span>
              <ExpandableText text={item.tecnicaDescricao} limit={400} />
            </div>
          </>
        );

      case "trilhas":
        return (
          <>
            <div className="flex justify-between flex-col items-start mb-3 -mt-2">
              <span className={`text-sm uppercase font-daisy px-2 mt-1 border ${estiloBadgeTipo(item.tipo)} whitespace-nowrap`}>{item.tipo}</span>
            </div>
            <div className="mb-4"><ExpandableText text={item.descricao ?? ""} limit={400} /></div>
            {item.especial && (
              <div className="mb-4 bg-gray-400/20 border border-gray-400/50 px-3 py-2">
                <p className="text-xs text-gray-800"><span className="font-special text-sm tracking-wider mr-1 uppercase text-gray-900">Especial:</span><span className="font-medium text-sm">{item.especial}</span></p>
              </div>
            )}
            <div className="mt-4 pt-1">
              <NexDropdown label={item.tipo === "Sobrevivente" ? "Estágio 2" : "NEX 10%"} text={item.nex10} />
              <NexDropdown label={item.tipo === "Sobrevivente" ? "Estágio 4" : "NEX 40%"} text={item.nex40} />
              {item.tipo !== "Sobrevivente" && (
                <><NexDropdown label="NEX 65%" text={item.nex65} /><NexDropdown label="NEX 99%" text={item.nex99} /></>
              )}
            </div>
          </>
        );

      case "regras":
        return (
          <>
            <div className="flex gap-2 mb-4 -mt-2">
              {item.categoria.map((cat: string) => (
                <span key={cat} className="text-sm uppercase font-bold bg-gray-800 text-white px-2 py-0.5">{cat}</span>
              ))}
            </div>
            <RegraExpandivel content={item.descricao} />
          </>
        );

      case "equipamentos":
        const statusEquip = [
          { label: "Proficiência", valor: item.arma?.armaTipo },
          { label: "Empunhadura", valor: item.arma?.empunhadura },
          { label: "Categoria", valor: item.arma?.catArma },
          { label: "Munição", valor: item.arma?.municao },
          { label: "Dano", valor: item.dano },
          { label: "Crítico", valor: item.critico },
          { label: "Alcance", valor: item.alcance },
          { label: "Tipo Dano", valor: item.tipoDano },
        ].filter(s => s.valor !== null && s.valor !== undefined && s.valor !== "");

        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {(Array.isArray(item.tipo) ? item.tipo : [item.tipo]).map((t: string) => (
                <span key={t} className={`text-sm uppercase font-daisy px-2 py-0.5 border ${estiloBadgeTipo(t)}`}>{t}</span>
              ))}
              {item.elemento && <span className={`text-sm uppercase font-daisy px-2 py-0.5 border ${corElemento(item.elemento)}`}>{item.elemento}</span>}
            </div>

            {statusEquip.length > 0 && (
              <div className="mb-4 bg-gray-100/90 border border-gray-400/50 p-3 grid gap-x-6 gap-y-1.5 grid-cols-1 sm:grid-cols-2">
                {statusEquip.map((s, i) => <LinhaStatus key={i} label={s.label} valor={s.valor} />)}
              </div>
            )}

            <div className="text-sm text-gray-800 leading-relaxed">
              <ExpandableText text={item.descricao || ""} limit={300} />
            </div>
          </>
        );

      default:
        return (
          <>
            {item.elemento && (
              <div className="flex gap-1 mb-3 -mt-2">
                {Array.isArray(item.elemento) ? item.elemento.map((e: string) => (
                  <span key={e} className="text-sm uppercase font-daisy px-1.5 py-0.5 border border-gray-800">{e} {item.circulo}</span>
                )) : (
                  <span className="text-sm uppercase font-daisy px-1.5 py-0.5 border border-gray-800">{item.elemento}</span>
                )}
              </div>
            )}
            <ExpandableText text={item.descricao || ""} limit={300} />
          </>
        );
    }
  };

  return (
    <div className="space-y-6 min-h-[85vh]">
      <DocumentReader
        fonteId={leitorAtivo?.fonte || ""}
        paginaImpressa={leitorAtivo?.pagina || 0}
        isOpen={!!leitorAtivo}
        onClose={() => setLeitorAtivo(null)}
      />

      <div className="relative p-6 bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] shadow-lg border border-gray-400">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight">Minhas Coleções</h2>

          {criandoGrupo ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text" autoFocus placeholder="Nome do grupo..."
                className="border-b-2 border-gray-600 bg-transparent px-2 py-1 text-sm outline-none focus:border-gray-900 w-full sm:w-48 font-medium"
                value={novoGrupoNome} onChange={(e) => setNovoGrupoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
              />
              <button onClick={handleCriarGrupo} className="p-1.5 bg-gray-900 text-white cursor-pointer hover:bg-gray-800"><Plus className="size-4" /></button>
              <button onClick={() => setCriandoGrupo(false)} className="p-1.5 text-gray-600 hover:text-red-700 cursor-pointer"><X className="size-4" /></button>
            </div>
          ) : (
            <button
              onClick={() => setCriandoGrupo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-special uppercase text-sm tracking-wide hover:bg-black/70 transition-all cursor-pointer"
            >
              <Plus className="size-4" /> Nova Coleção
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-400 border-dashed pt-4">
          <button
            onClick={() => setGrupoAtivo("todos")}
            className={`px-4 py-1.5 font-bold text-sm uppercase tracking-wider cursor-pointer border-2 transition-colors ${grupoAtivo === "todos" ? "border-gray-900 bg-gray-200 text-gray-900" : "border-transparent text-gray-600 hover:bg-gray-100"}`}
          >
            Todos
          </button>

          {grupos.map((grupo) => (
            <button
              key={grupo.id} onClick={() => setGrupoAtivo(grupo.id)}
              className={`group flex items-center gap-2 px-4 py-1.5 font-bold text-sm uppercase tracking-wider cursor-pointer border-2 transition-colors ${grupoAtivo === grupo.id ? "border-gray-900 bg-gray-200 text-gray-900" : "border-1! border-dashed text-gray-600 hover:bg-gray-100"}`}
            >
              {grupo.nome}
              <span
                onClick={(e) => handleRemoverGrupo(grupo.id, e)}
                className={`p-0.5 rounded-full hover:bg-red-200 hover:text-red-700 transition-colors ${grupoAtivo === grupo.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                title="Excluir grupo"
              >
                <X className="size-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoritosFiltrados.map((favorito) => {
          const item = getItemData(favorito.itemId, favorito.categoria);

          if (!item) {
            return (
              <div key={favorito.id} className="relative p-6 bg-[url(/assets/paper.png)] border border-red-300 shadow-md flex flex-col justify-between items-center text-center gap-4">
                <Trash2 className="size-10 text-red-300 mb-2" />
                <p className="font-special text-red-600 uppercase">Item não encontrado ou removido ({favorito.categoria})</p>
                <button onClick={() => removerFavorito(favorito.id)} className="text-sm underline text-red-800 font-bold cursor-pointer">Remover este item</button>
              </div>
            );
          }

          return (
            <div key={favorito.id} className="relative group">
              <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

                <div className="grow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-2xl font-special underline leading-tight break-words">{item.nome}</h3>
                    <span className="text-xs uppercase font-bold bg-black/50 text-white px-2 py-0.5 shrink-0 opacity-70">
                      {favorito.categoria}
                    </span>
                  </div>

                  {renderCardBody(item, favorito.categoria)}

                </div>

                <div className="flex items-center justify-between pt-2 mt-4 border-t border-dashed border-gray-400">
                  <Source
                    fonte={item.fonteLivro || item.fonte}
                    pagina={item.fontePagina || item.pag}
                    onOpenReader={() => setLeitorAtivo({ fonte: item.fonteLivro || item.fonte, pagina: parseInt(String(item.fontePagina || item.pag)) })}
                  />
                  <SaveButton itemId={item.id} categoria={favorito.categoria} />
                </div>

              </div>
              <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>
          );
        })}

        {favoritosFiltrados.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <Meh className="size-16 mb-4" />
            <p className="font-special text-2xl text-black">Nada por aqui (ainda).</p>
            <p className="font-special text-black mt-2 text-center">Clique no marca página ao lado dos itens<br />para salvá-los nesta pasta.</p>
          </div>
        )}
      </div>
    </div>
  );
}