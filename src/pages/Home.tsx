import Logo from "@/components/logo";
import CacheDownloader from "@/components/cache-downloader";
import InfoPanel from "@/components/info-panel";
import { useData } from "@/context/DataContext";
import { ExternalLink, Search } from "lucide-react";

export default function Home() {
  const { poderes, rituais, equipamentos, origens, trilhas, fontes } = useData();
  const is_private = import.meta.env.VITE_MODO === 'privado';

  const totalItens = poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length;

  const pdfsParaBaixar = Object.values(fontes)
    .filter(f => f.nomeArquivo)
    .map(f => `/files/${f.nomeArquivo}`);

  return (
    <>
      <div className="font-normal bg-white/40 flex flex-col items-center min-h-full w-full p-8 pb-10 space-y-6">

        <div className="w-full mx-auto text-center max-w-6xl mt-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl flex mb-4 justify-center pointer-events-none select-none border-b-2 border-dashed border-gray-800 w-fit mx-auto pb-2">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
              <Logo key={index} char={char} />
            ))}
          </h1>
        </div>

        <div className="w-full max-w-6xl mb-10 mx-auto relative group">
          <button
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="w-full flex items-center justify-between border border-gray-800 bg-white/60 hover:bg-white p-4 transition-all cursor-pointer"
          >
            <div className="flex w-full items-center text-gray-600 group-hover:text-gray-900 transition-colors">
              <Search className="size-6 mr-3" />
              <span className="text-lg font-special tracking-wide">
                Pesquisar entre {totalItens} registros...
              </span>
            </div>
            <div className="flex items-center gap-1 max-sm:hidden">
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">CTRL</kbd>
              <span className="text-gray-400 font-bold">+</span>
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">K</kbd>
            </div>
          </button>
          <p className="max-sm:hidden text-center italic text-black/50 font-blur mt-2">Use o atalho [CTRL] + [K] em qualquer página do site para usar a busca global.</p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {pdfsParaBaixar.length > 0 && (
            <CacheDownloader pdfsParaBaixar={pdfsParaBaixar} />
          )}

          {is_private ? (
            <InfoPanel title="Lista de Atualizações">
              <div className="flex flex-col gap-2">
                <UpdateItem version="v2.0" date="(01/07/26)" text="Muitas melhorias, e versão pública." />
                <UpdateItem version="v1.3" date="(25/06/26)" text="Adicionado conteúdo do AS6; Atualizado conteúdo do AS5 1.1." />
                <UpdateItem version="v1.2" date="(27/05/26)" text="Adicionado conteúdo do AS5." />
                <UpdateItem version="v1.1" date="(19/05/26)" text="Adicionado rituais." />
                <UpdateItem version="v1.0" date="(14/05/26)" text="Primeira versão pública!" />
                <UpdateItem version="v0.1" date="(04/05/26)" text="Comecei a desenvolver." />
              </div>
            </InfoPanel>
          ) : (
            <InfoPanel title="Lista de Atualizações">
              <div className="flex flex-col gap-2">
                <UpdateItem version="v2.0" date="(01/07/26)" text="Primeira versão pública!" />
              </div>
            </InfoPanel>
          )}

          <InfoPanel title="Funcionalidades Planejadas">
            <ul className="space-y-2 text-gray-800 list-disc list-inside marker:text-gray-500">
              <li className="border-b border-dashed border-gray-400/60 pb-1">Ameaças.</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Dark mode?</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Melhorar responsividade.</li>
            </ul>
          </InfoPanel>

        </div>

        <div className="mt-auto pt-10 w-full max-w-6xl mx-auto">
          <p className="text-center p-5 border-2 border-gray-400 border-dashed bg-gray-200/50 text-gray-600 uppercase font-daisy tracking-wider text-xs md:text-sm leading-relaxed">
            Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit.
            <br />O Visão do Oculto foi desenvolvido para servir como um meio de consulta rápida para materiais e produtos que você já possui.
            <br />Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo comercial com a Jambô Editora.
          </p>
          <footer className="text-xs text-center py-4 opacity-60 font-special tracking-wide ">
            <a href="https://github.com/thetorpedo/visao-do-oculto" target="_blank" rel="noopener noreferrer" >
              <ExternalLink className="inline-block mr-2 size-4 -mt-2" />
              [REPOSITÓRIO DO PROJETO NO GITHUB]
            </a>
          </footer>
        </div>

      </div>
    </>
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