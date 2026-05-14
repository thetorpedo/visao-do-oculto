import Logo from "@/components/logo";
import { useEffect, useState } from "react";
import { Search, Dices, ArrowRight } from "lucide-react";

// Importa os dados para o sorteio
import origensData from "@/data/origens.json";
import poderesData from "@/data/poderes.json";
import trilhasData from "@/data/trilhas.json";
import equipamentosData from "@/data/equipamentos.json";

// Junta tudo numa array só com uma tag de onde vieram
const todosOsItens = [
  ...origensData.map(item => ({ ...item, globalType: "Origens", link: "/origens" })),
  ...poderesData.map(item => ({ ...item, globalType: "Poderes", link: "/poderes", badge: item.elemento || item.tipo })),
  ...trilhasData.map(item => ({ ...item, globalType: "Trilhas", link: "/trilhas", badge: item.tipo })),
  ...equipamentosData.map(item => ({ ...item, globalType: "Equipamentos", link: "/equipamentos", badge: item.tipo }))
];

export default function Home() {
  const [itemAleatorio, setItemAleatorio] = useState<any>(null);

  // Função para sortear um item aleatório
  const sortearNovoItem = () => {
    const indexSorteado = Math.floor(Math.random() * todosOsItens.length);
    setItemAleatorio(todosOsItens[indexSorteado]);
  };

  // Sorteia o primeiro item assim que a tela carrega
  useEffect(() => {
    sortearNovoItem();
  }, []);

  return (
    <>
      <div className="font-[400] flex flex-col items-center min-h-full w-full p-8 pb-10 space-y-6">
        
        {/* Cabeçalho */}
        <div className="w-full max-w-6xl mx-auto text-center mt-6">
          <h1 className="text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none border-b-4 border-dashed border-gray-800 w-fit mx-auto pb-2">
            {'VISÃO DO OCULTO'.split("").map((char, index) => (
              <Logo key={index} char={char}/>
            ))}
          </h1>
          <p className="text-center font-special text-gray-800 mt-6 ">
            Visão do Oculto é um projeto pessoal meu, com o objetivo de unificar todo o material de Ordem Paranormal em um local só.<br/>
            Pra que habilidades do livro base, suplemento, revista ou marcador de página sejam encontrados sem abrir 3 drives, 20 pastas, e 14 pdfs.<br/><br/>
            
            São muitos registros importados semi-automaticamente, e embora eu tenha tentado tirar todos os erros, pode ter algum que passou batido - principalmente em formatação de texto para registros maiores (olhando pra você, sobrevivendo ao horror).<br/> Qualquer erro ou bug que achar, por-favor me avisa!<br/>
            Se você tá aqui e não sabe quem eu sou, provavelmente não deveria estar acessando isso.
          </p>  
        </div>

        {/* Barra de Pesquisa Global (Gatilho) */}
        <div className="w-full max-w-6xl mx-auto relative group">
          <button 
            onClick={() => window.dispatchEvent(new Event("open-global-search"))}
            className="w-full flex items-center justify-between border-2 border-gray-800 bg-white/60 hover:bg-white p-4 transition-all cursor-pointer"
          >
            <div className="flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
              <Search className="size-6 mr-3" />
              <span className="text-lg font-special tracking-wide">Pesquisar entre {todosOsItens.length} registros...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">CTRL</kbd>
              <span className="text-gray-400 font-bold">+</span>
              <kbd className="font-mono bg-gray-200 border border-gray-400 px-2 py-1 text-sm font-bold text-gray-700 shadow-sm">K</kbd>
            </div>
          </button>
        </div>

        {/* Display Aleatório (Substituindo os Links Rápidos) */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative p-6 border-2 border-dashed border-gray-800 bg-white/40 hover:bg-white/60 transition-colors group">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center">
              Registro Aleatório
            </div>
            
            {/* Botão de Roletar */}
            <button 
              onClick={sortearNovoItem}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-transform hover:rotate-180 cursor-pointer"
              title="Sortear outro"
            >
              <Dices className="size-5" />
            </button>

            {itemAleatorio && (
              <div className="flex flex-col h-full mt-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-special underline leading-tight mb-2 pr-8 text-gray-900">
                      {itemAleatorio.nome}
                    </h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-200 border border-gray-400 px-2 py-0.5 text-gray-700 shadow-sm">
                        {itemAleatorio.globalType}
                      </span>
                      {itemAleatorio.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-200 border border-gray-400 px-2 py-0.5 text-gray-700 shadow-sm">
                          {itemAleatorio.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-800 leading-relaxed line-clamp-3 mb-4 italic opacity-90 text-justify">
                  {itemAleatorio.descricao}
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-gray-400/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {itemAleatorio.fonteLivro}, pág. {itemAleatorio.fontePagina}
                  </span>
                  
                  <a 
                    href={itemAleatorio.link} 
                    className="flex items-center gap-1 text-xs font-bold text-gray-900 uppercase hover:underline"
                  >
                    Acessar {itemAleatorio.globalType} <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Atualizações */}
          <div className="relative p-6 border border-gray-400 bg-gray-300/30 ">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center ">
              Lista de Atualizações
            </div>
            <div className="mt-3 flex flex-col gap-2">
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
              <li className="border-b border-dashed border-gray-400/60 pb-1">Rituais - paciência, tem muitos e são muito chatos de importar.</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Dark mode?</li>
              <li className="border-b border-dashed border-gray-400/60 pb-1">Melhorar essa responsividade tenebrosa...</li>
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