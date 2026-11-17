import CacheDownloader from "@/pages/home/components/cache-downloader";
import GuideDropdown from "@/pages/home/components/guide-dropdown";
import GlitchTitle from "@/pages/home/components/glitch-title";
import InfoPanel from "@/pages/home/components/info-panel";
import ItemCard from "@/components/ui/item-card";
import { useData, type Categoria } from "@/context/DataContext";
import { ExternalLink, Heart, Search, Shield, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DonateModal from "@/pages/home/components/donate-modal";
import ChangelogList from "@/pages/home/components/changelog-panel";
import { UPDATES_PRIVATE, UPDATES_PUBLIC } from "@/pages/home/components/changelog";

const REPO_URL = "https://github.com/thetorpedo/visao-do-oculto";

const ROTULO_CATEGORIA: Record<string, string> = {
  poderes: "Poder",
  rituais: "Ritual",
  equipamentos: "Equipamento",
  origens: "Origem",
  trilhas: "Trilha",
  ameacas: "Ameaça",
};

function sortear<T>(lista: T[]): T | null {
  if (lista.length === 0) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

export default function Home() {
  const { poderes, rituais, equipamentos, origens, trilhas, regras, ameacas, fontes } = useData();
  const isPrivate = import.meta.env.VITE_MODO === "privado";
  const [showDonate, setShowDonate] = useState(false);
  const [semente, setSemente] = useState(0);

  const totalItems =
    poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length + regras.length + ameacas.length;

  const pdfsToDownload = Object.values(fontes)
    .filter((f) => f.nomeArquivo)
    .map((f) => `/files/${f.nomeArquivo}`);

  const registroSorteado = useMemo(() => {
    const todos: { categoria: Categoria; item: any }[] = [
      ...poderes.map((item) => ({ categoria: "poderes" as Categoria, item })),
      ...rituais.map((item) => ({ categoria: "rituais" as Categoria, item })),
      ...equipamentos.map((item) => ({ categoria: "equipamentos" as Categoria, item })),
      ...origens.map((item) => ({ categoria: "origens" as Categoria, item })),
      ...trilhas.map((item) => ({ categoria: "trilhas" as Categoria, item })),
      ...ameacas.map((item) => ({ categoria: "ameacas" as Categoria, item })),
    ];
    return sortear(todos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, semente]);

  return (
    <div className="flex min-h-full w-full flex-col gap-8 p-4 sm:p-8">
      <header className="mx-auto w-full max-w-5xl text-center mt-2 mb-6">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border-b border-dashed border-gray-400 font-special text-sm tracking-wide text-black/80 transition-colors hover:text-gray-800"
          >
            <ExternalLink className="size-3" />
            Repositório no GitHub
          </a>
          <button
            onClick={() => setShowDonate(true)}
            className="flex items-center gap-1 border-b border-dashed border-gray-400 font-special text-sm tracking-wide text-black/80 transition-colors hover:text-red-600"
          >
            <Heart className="size-3" />
            Apoiar o projeto
          </button>
        </div>
        <GlitchTitle text="VISÃO DO OCULTO" />

        <button
          onClick={() => window.dispatchEvent(new Event("open-global-search"))}
          className="group mt-2 flex h-14 w-full cursor-pointer items-center justify-between border border-gray-800 dark:border-zinc-700 bg-white/70 dark:bg-[#131615] px-4 shadow-sm transition-all hover:bg-white dark:hover:border-emerald-500/60"
        >
          <div className="flex w-full items-center text-gray-600 transition-colors group-hover:text-gray-900 dark:group-hover:text-zinc-100">
            <Search className="mr-3 size-5 shrink-0 dark:text-emerald-400" />
            <span className="truncate font-special text-sm tracking-wide sm:text-lg">
              Pesquisar entre {totalItems} registros...
            </span>
          </div>
          <div className="ml-3 hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="border-2 border-dashed border-gray-700 px-1 py-0.5 font-daisy text-sm font-bold text-gray-700">
              CTRL
            </kbd>
            <span className="font-bold text-gray-700">+</span>
            <kbd className="border-2 border-dashed border-gray-700 px-1.5 py-0.5 font-daisy text-sm font-bold text-gray-700">
              K
            </kbd>
          </div>
        </button>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 md:grid-cols-2">
        {registroSorteado && (
          <div className="relative border border-black/40 bg-black/5 p-4 pt-6 sm:p-6 sm:pt-7">
            <div className="absolute top-0 left-4 flex -translate-y-1/2 items-center bg-gray-900 px-2 py-0.5 font-special text-xs tracking-widest text-white uppercase sm:text-sm">
              Registro aleatório • {ROTULO_CATEGORIA[registroSorteado.categoria]}
            </div>

            <button
              onClick={() => setSemente((s) => s + 1)}
              className="absolute top-0 right-4 flex -translate-y-1/2 cursor-pointer items-center gap-1.5 border border-black/40 bg-[#e6dfcf] dark:bg-[#1e2220] px-2 py-0.5 font-special text-xs uppercase tracking-wider text-black/80 transition-colors hover:bg-white dark:hover:border-emerald-500/60 sm:text-sm"
              title="Sortear outro registro"
            >
              <Shuffle className="size-3.5" />
              Outro
            </button>

            <ItemCard
              key={`${registroSorteado.categoria}-${registroSorteado.item.id}`}
              item={registroSorteado.item}
              categoria={registroSorteado.categoria}
            />
          </div>
        )}

        <InfoPanel title="Lista de Atualizações">
          <ChangelogList entries={isPrivate ? UPDATES_PRIVATE : UPDATES_PUBLIC} />
        </InfoPanel>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-8">
        {isPrivate && pdfsToDownload.length > 0 && <CacheDownloader pdfsParaBaixar={pdfsToDownload} />}

        <GuideDropdown />

        <p className="border-2 border-dashed border-black/40 bg-black/5 p-5 text-center font-daisy text-xs leading-relaxed tracking-wider text-black/70 uppercase md:text-sm">
          Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit.
          <br />
          O Visão do Oculto foi desenvolvido para servir como um meio de consulta rápida para materiais e produtos que você já possui.
          <br />
          Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo comercial com a Jambô Editora.
        </p>
      </div>

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
}
