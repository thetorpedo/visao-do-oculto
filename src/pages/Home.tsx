import Logo from "@/components/logo";
import OfflineDownloader from "@/components/OfflineDownloader";
import { Search } from "lucide-react";

import equipamentosData from "@/data/equipamentos.json";
import origensData from "@/data/origens.json";
import poderesData from "@/data/poderes.json";
import rituaisData from "@/data/rituais.json";
import trilhasData from "@/data/trilhas.json";

const todosOsItens = [
  ...origensData.map(item => ({ ...item, globalType: "Origens", link: "/origens" })),
  ...poderesData.map(item => ({ ...item, globalType: "Poderes", link: "/poderes", badge: item.elemento || item.tipo })),
  ...trilhasData.map(item => ({ ...item, globalType: "Trilhas", link: "/trilhas", badge: item.tipo })),
  ...equipamentosData.map(item => ({ ...item, globalType: "Equipamentos", link: "/equipamentos", badge: item.tipo })),
  ...rituaisData.map(item => ({ ...item, globalType: "Rituais", link: "/rituais", badge: item.elemento }))
];

const pdfsParaBaixar = [
  "/files/OPRPG.pdf",
  "/files/OPRPGLUXO.pdf",
  "/files/SAH.pdf",
  "/files/AS1.pdf",
  "/files/AS2.pdf",
  "/files/AS3.pdf",
  "/files/AS4.pdf",
  "/files/OSNF1.png",
  "/files/OSNF2.png",
  "/files/INICIACAO.png",
  "/files/OJDA.png",
];

export default function Home() {
  return (
    <>
      <div className="font-normal flex flex-col items-center min-h-full w-full p-8 pb-10 space-y-6">
        
        {/* Cabeçalho */}
        <div className="w-full mx-auto text-center max-w-6xl mt-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none border-b-4 border-dashed border-gray-800 w-fit mx-auto pb-2">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
              <Logo key={index} char={char}/>
            ))}
          </h1>
          {/* <p className="text-center font-special text-gray-800 mt-6 ">
            Visão do Oculto é um projeto pessoal meu, com o objetivo de unificar todo o material de Ordem Paranormal em um local só.<br/>
            Pra que habilidades do livro base, suplemento, revista ou marcador de página sejam encontrados sem abrir 3 drives, 20 pastas, e 14 pdfs.<br/><br/>
            São muitos registros importados semi-automaticamente, e embora eu tenha tentado tirar todos os erros, pode ter algum que passou batido - principalmente em formatação de texto para registros maiores (olhando pra você, sobrevivendo ao horror).<br/> Qualquer erro ou bug que achar, por favor, me avisa!<br/>
            Se você tá aqui e não sabe quem eu sou, provavelmente não deveria estar acessando isso.
          </p>   */}
        </div>

        {/* Barra de Pesquisa Global (Gatilho) */}
        <div className="w-full max-w-5xl mx-auto relative group">
          <button 
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="w-full flex items-center justify-between border-2 border-gray-800 bg-white/60 hover:bg-white p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
              <Search className="size-6 mr-3" />
              <span className="text-lg font-special tracking-wide">
                Pesquisar entre {todosOsItens.length} registros...
              </span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">CTRL</kbd>
              <span className="text-gray-400 font-bold">+</span>
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">K</kbd>
            </div>
          </button>
        </div>

        {/* Display Aleatório */}
        {/* <div className="w-full max-w-5xl mx-auto">
          <RandomItem itens={todosOsItens} />
        </div> */}

        {/* Grid de Informações */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <OfflineDownloader pdfsParaBaixar={pdfsParaBaixar} />

          {/* Atualizações */}
          <div className="relative p-6 border border-gray-400 bg-gray-300/30 ">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center ">
              Lista de Atualizações
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <p className="border-b border-dashed border-gray-400/60 pb-2 text-gray-800">
                <span className="font-bold text-gray-900 bg-gray-200 px-1 border border-gray-300 mr-2">v1.1</span> 
                <span className="text-gray-500 font-mono text-xs mr-2">(19/05/26)</span> 
                Adicionado rituais.
              </p>
              <p className="border-b border-dashed border-gray-400/60 pb-2 text-gray-800">
                <span className="font-bold text-gray-900 bg-gray-200 px-1 border border-gray-300 mr-2">v1.0</span> 
                <span className="text-gray-500 font-mono text-xs mr-2">(14/05/26)</span> 
                Primeira versão pública!
              </p>
              <p className="border-b border-dashed border-gray-400/60 pb-2 text-gray-800">
                <span className="font-bold text-gray-900 bg-gray-200 px-1 border border-gray-300 mr-2">v0.1</span> 
                <span className="text-gray-500 font-mono text-xs mr-2">(04/05/26)</span> 
                Comecei a desenvolver.
              </p>
            </div>
          </div>

          {/* Planejamento */}
          <div className="relative p-6 border border-gray-400 bg-gray-300/30">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center">
              Funcionalidades Planejadas
            </div>
            <ul className="mt-3 space-y-2 text-gray-800 list-disc list-inside marker:text-gray-500">
              <li className="border-b border-dashed border-gray-400/60 pb-1">Bestiário.</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Dark mode?</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Implementar sistema de favoritos.</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Buscar pelas regras e livros.</li>
            </ul>
          </div>
          
        </div>
        
        {/* Footer / Disclaimer */}
        <div className="mt-auto pt-10 w-full max-w-6xl mx-auto">
          <p className="text-center p-5 border-2 border-gray-400 border-dashed bg-gray-200/50 text-gray-600 uppercase font-daisy tracking-wider text-xs md:text-sm leading-relaxed">
            Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit. <br/>
            O Visão do Oculto foi desenvolvido para servir como uma referência digital de consulta rápida para materiais e produtos que você já possui.
            Este projeto não substitui a compra dos livros oficiais e não tem qualquer vínculo comercial com a Jambô Editora.
          </p>
        </div>

      </div>
    </>
  );
}