import CacheDownloader from "@/pages/home/components/cache-downloader";
import GuideDropdown from "@/pages/home/components/guide-dropdown";
import GlitchTitle from "@/pages/home/components/glitch-title";
import InfoPanel from "@/pages/home/components/info-panel";
import { useData } from "@/context/DataContext";
import { ExternalLink, Heart, Search } from "lucide-react";
import { useState } from "react";
import DonateModal from "@/pages/home/components/donate-modal";
import ChangelogList from "@/pages/home/components/changelog-panel";
import { PLANNED_FEATURES, UPDATES_PRIVATE, UPDATES_PUBLIC } from "@/pages/home/components/changelog";

const REPO_URL = "https://github.com/thetorpedo/visao-do-oculto";

export default function Home() {
  const { poderes, rituais, equipamentos, origens, trilhas, fontes } = useData();
  const isPrivate = import.meta.env.VITE_MODO === "privado";
  const [showDonate, setShowDonate] = useState(false);

  const totalItems =
    poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length;

  const pdfsToDownload = Object.values(fontes)
    .filter((f) => f.nomeArquivo)
    .map((f) => `/files/${f.nomeArquivo}`);

  return (
    <div className="flex min-h-full w-full flex-col gap-8 p-4 sm:p-8 md:grid md:grid-cols-2">
      <header className="mx-auto w-full max-w-6xl text-center">
        <GlitchTitle text="VISÃO DO OCULTO" />

        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 border-b border-dashed border-gray-400 font-special text-sm tracking-wide text-black/80 transition-colors hover:text-gray-800"
          >
            <ExternalLink className="size-3" />
            Repositório no GitHub
          </a>

          <span className="hidden text-gray-300 sm:inline">|</span>

          <button
            onClick={() => setShowDonate(true)}
            className="flex items-center gap-1 border-b border-dashed border-gray-400 font-special text-sm tracking-wide text-black/80 transition-colors hover:text-red-600"
          >
            <Heart className="size-3" />
            Apoiar o projeto
          </button>
        </div>

        <p className="my-2 hidden text-center text-sm text-black/60 italic sm:block">
          Use o atalho <span className="font-daisy">[CTRL] + [K]</span> em qualquer página do site para usar a busca global.
        </p>

        <button
          onClick={() => window.dispatchEvent(new Event("open-global-search"))}
          className="group flex h-14 w-full items-center justify-between border border-gray-800 bg-white/60 px-4 transition-all"
        >
          <div className="flex w-full items-center text-gray-600">
            <Search className="mr-3 size-5 shrink-0" />
            <span className="font-special text-base tracking-wide sm:text-lg">
              Pesquisar entre {totalItems} registros...
            </span>
          </div>
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="border-2 border-dashed border-gray-700 px-1 py-0.5 font-daisy text-sm font-bold text-gray-700">
              CTRL
            </kbd>
            <span className="font-bold text-gray-700">+</span>
            <kbd className="border-2 border-dashed border-gray-700 px-1.5 py-0.5 font-daisy text-sm font-bold text-gray-700">
              K
            </kbd>
          </div>
        </button>
      </header >

      <section className="mx-auto flex h-full w-full max-w-6xl flex-col gap-8">
        <div className="grid h-full grid-cols-1 gap-8 mt-2 sm:grid-cols-2">
          <InfoPanel title="Lista de Atualizações">
            <ChangelogList entries={isPrivate ? UPDATES_PRIVATE : UPDATES_PUBLIC} />
          </InfoPanel>

          <InfoPanel title="Funcionalidades Planejadas">
            <ul className="list-inside list-disc space-y-2 text-gray-800 marker:text-gray-500">
              {PLANNED_FEATURES.map((feature) => (
                <li key={feature} className="border-b border-dashed border-gray-400/60 pb-1">
                  {feature}
                </li>
              ))}
            </ul>
          </InfoPanel>

          {isPrivate && pdfsToDownload.length > 0 && (
            <div className="sm:col-span-2">
              <CacheDownloader pdfsParaBaixar={pdfsToDownload} />
            </div>
          )}
        </div>
      </section>

      <footer className="col-span-2 flex flex-col gap-8">
        <GuideDropdown />
        <p className="border-2 border-dashed border-black/40 bg-black/5 p-5 text-center font-daisy text-xs leading-relaxed tracking-wider text-black/70 uppercase md:text-sm">
          Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit.
          <br />
          O Visão do Oculto foi desenvolvido para servir como um meio de consulta rápida para materiais e produtos que você já possui.
          <br />
          Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo comercial com a Jambô Editora.
        </p>
      </footer>

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
}