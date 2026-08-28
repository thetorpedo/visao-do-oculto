import CacheDownloader from "@/components/home/cache-downloader";
import GuideDropdown from "@/components/home/guide-dropdown";
import InfoPanel from "@/components/home/info-panel";
import Logo from "@/components/home/logo";
import { useData } from "@/context/DataContext";
import { ExternalLink, Heart, Search, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { poderes, rituais, equipamentos, origens, trilhas, fontes } = useData();
  const isPrivate = import.meta.env.VITE_MODO === 'privado';
  const [showDonate, setShowDonate] = useState(false);

  const totalItems = poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length;

  const pdfsToDownload = Object.values(fontes)
    .filter(f => f.nomeArquivo)
    .map(f => `/files/${f.nomeArquivo}`);

  return (
    <div className="font-normal bg-white/40 flex flex-col items-center min-h-full w-full">
      <div className="w-full max-w-6xl mx-auto px-8 pt-10 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl flex mb-2 justify-center pointer-events-none select-none border-b-2 border-dashed border-gray-800 w-fit mx-auto pb-2">
          {'VISÃO DO OCULTO'.split("").map((char, index) => (
            <Logo key={index} char={char} />
          ))}
        </h1>

        <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
          <a
            href="https://github.com/thetorpedo/visao-do-oculto"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-black/80 hover:text-gray-800 transition-colors font-special tracking-wide flex items-center gap-1"
          >
            <ExternalLink className="size-3" />
            Repositório no GitHub
          </a>

          <span className="text-gray-300">|</span>

          <button
            onClick={() => setShowDonate(true)}
            className="text-sm text-black/80 hover:text-red-600 transition-colors cursor-pointer font-special tracking-wide flex items-center gap-1"
          >
            <Heart className="size-3" />
            Apoiar o projeto
          </button>
        </div>

        <button
          onClick={() => window.dispatchEvent(new Event("open-global-search"))}
          className="w-full flex items-center justify-between border border-gray-800 bg-white/60 hover:bg-white p-4 transition-all cursor-pointer group"
        >
          <div className="flex w-full items-center text-gray-600 group-hover:text-gray-900 transition-colors">
            <Search className="size-5 mr-3 shrink-0" />
            <span className="text-lg font-special tracking-wide">
              Pesquisar entre {totalItems} registros...
            </span>
          </div>
          <div className="flex items-center gap-1 max-sm:hidden shrink-0">
            <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">CTRL</kbd>
            <span className="text-gray-400 font-bold">+</span>
            <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">K</kbd>
          </div>
        </button>

        <p className="max-sm:hidden text-center italic text-black/40 font-blur mt-2 text-sm">
          Use o atalho [CTRL] + [K] em qualquer página do site para usar a busca global.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto px-8 pb-10 flex flex-col gap-6">
        <GuideDropdown />

        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-6">
          <InfoPanel title="Lista de Atualizações">
            <div className="flex flex-col gap-2">
              {isPrivate ? (
                <>
                  <UpdateItem version="v2.0" date="(01/07/26)" text="Muitas melhorias e versão pública." />
                  <UpdateItem version="v1.3" date="(25/06/26)" text="Adicionado conteúdo do AS6; Atualizado conteúdo do AS5 1.1." />
                  <UpdateItem version="v1.2" date="(27/05/26)" text="Adicionado conteúdo do AS5." />
                  <UpdateItem version="v1.1" date="(19/05/26)" text="Adicionado rituais." />
                  <UpdateItem version="v1.0" date="(14/05/26)" text="Primeira versão pública!" />
                  <UpdateItem version="v0.1" date="(04/05/26)" text="Comecei a desenvolver." />
                </>
              ) : (
                <UpdateItem version="v2.0" date="(01/07/26)" text="Primeira versão pública!" />
              )}
            </div>
          </InfoPanel>

          <InfoPanel title="Funcionalidades Planejadas">
            <ul className="space-y-2 text-gray-800 list-disc list-inside marker:text-gray-500">
              <li className="border-b border-dashed border-gray-400/60 pb-1">Ameaças.</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Dark mode?</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Melhorar responsividade.</li>
            </ul>
          </InfoPanel>

          {pdfsToDownload.length > 0 && isPrivate && (
            <div className="md:col-span-2">
              <CacheDownloader pdfsParaBaixar={pdfsToDownload} />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <p className="text-center p-5 border-2 border-gray-400 border-dashed bg-gray-200/50 text-gray-600 uppercase font-daisy tracking-wider text-xs md:text-sm leading-relaxed">
            Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit.
            <br />O Visão do Oculto foi desenvolvido para servir como um meio de consulta rápida para materiais e produtos que você já possui.
            <br />Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo comercial com a Jambô Editora.
          </p>
        </div>
      </div>

      {showDonate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDonate(false)}
        >
          <div
            className="relative bg-white border-2 border-gray-800 p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDonate(false)}
              className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-gray-800 transition-colors"
            >
              <X className="size-4" />
            </button>

            <h2 className="font-special uppercase text-xl text-gray-900 text-center">
              Faz um pix?
            </h2>

            <p className="text-sm text-gray-600 text-center font-sans leading-relaxed">
              Se o site foi útil pras suas mesas, considere apoiar o desenvolvimento.
            </p>

            <img
              src="/assets/qrcode-pix.png"
              alt="QR Code PIX"
              className="w-48 h-48 border border-gray-300"
            />

            <p className="text-xs text-gray-400 font-daisy tracking-wider text-center">
              ecc154c8-61ba-46ee-8f47-cd9d52df8a33
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UpdateItem({ version, date, text }: { version: string; date: string; text: string }) {
  return (
    <p className="border-b border-dashed border-gray-400/60 pb-2 text-gray-800">
      <span className="font-bold text-gray-900 bg-gray-200 px-1 border border-gray-300 mr-2">{version}</span>
      <span className="text-gray-500 font-mono text-xs mr-2">{date}</span>
      {text}
    </p>
  );
}