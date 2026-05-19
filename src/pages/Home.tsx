import Logo from "@/components/logo";
import { useEffect, useState } from "react";
import { Search, Dices, ArrowRight, Download, Loader2, CheckCircle } from "lucide-react"; // <- Adicionei ícones novos aqui

// Importa os dados para o sorteio
import origensData from "@/data/origens.json";
import poderesData from "@/data/poderes.json";
import trilhasData from "@/data/trilhas.json";
import equipamentosData from "@/data/equipamentos.json";
import rituaisData from "@/data/rituais.json";

// Junta tudo numa array só com uma tag de onde vieram
const todosOsItens = [
  ...origensData.map(item => ({ ...item, globalType: "Origens", link: "/origens" })),
  ...poderesData.map(item => ({ ...item, globalType: "Poderes", link: "/poderes", badge: item.elemento || item.tipo })),
  ...trilhasData.map(item => ({ ...item, globalType: "Trilhas", link: "/trilhas", badge: item.tipo })),
  ...equipamentosData.map(item => ({ ...item, globalType: "Equipamentos", link: "/equipamentos", badge: item.tipo })),
  ...rituaisData.map(item => ({ ...item, globalType: "Rituais", link: "/rituais", badge: item.elemento }))
];

export default function Home() {
  const [itemAleatorio, setItemAleatorio] = useState<any>(null);
  
  // Estados para o Cache Offline
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // 1. Array com os caminhos exatos dos seus PDFs (AJUSTE OS NOMES AQUI!)
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

  // Verifica se já está no cache quando a página carrega
  useEffect(() => {
    if ('caches' in window) {
      caches.open('visao-oculto-pdfs').then(cache => {
        cache.match(pdfsParaBaixar[0]).then(response => {
          if (response) setIsCached(true);
        });
      });
    }
  }, []);

  const sortearNovoItem = () => {
    const indexSorteado = Math.floor(Math.random() * todosOsItens.length);
    setItemAleatorio(todosOsItens[indexSorteado]);
  };

  useEffect(() => {
    sortearNovoItem();
  }, []);

  // 2. Função que faz o download e salva no Cofre do navegador
  const handleCachePDFs = async () => {
    if (!('caches' in window)) {
      alert("Seu navegador não suporta downloads offline.");
      return;
    }

    setIsDownloading(true);
    try {
      const cache = await caches.open('visao-oculto-pdfs');
      
      // Baixa e adiciona todos os arquivos no cache
      await cache.addAll(pdfsParaBaixar);
      setIsCached(true);
    } catch (error) {
      console.error("Erro ao fazer o cache:", error);
      alert("Ocorreu um erro no download. Tente novamente ou verifique sua conexão.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="font-[400] flex flex-col items-center min-h-full w-full p-8 pb-10 space-y-6">
        
        {/* Cabeçalho */}
        <div className="w-full mx-auto text-center mt-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl flex flex-wrap mb-4 justify-center pointer-events-none select-none border-b-4 border-dashed border-gray-800 w-fit mx-auto pb-2">
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
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative p-6 border-2 border-dashed border-gray-800 bg-white/40 hover:bg-white/60 transition-colors group">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center">
              Registro Aleatório
            </div>
            
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
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* PAINEL DE DOWNLOAD OFFLINE (Ocupa as duas colunas em telas grandes) */}
          <div className="relative p-6 border border-gray-800 bg-amber-100/30 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center ">
              Leitura Rápida / Offline
            </div>
            
            <div className="flex-1 mt-2 md:mt-0 text-center md:text-left">
              <h4 className="font-special text-xl text-gray-900 mb-1">Baixar fontes em Cache</h4>
              <p className="text-sm text-gray-700 font-medium">
                O site salva os PDFs no seu dispositivo. O primeiro download pode demorar, mas depois disso os livros abrirão bem mais rápido e não gastarão sua internet nas próximas visitas.
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
              {isCached ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 border-2 border-green-800 px-6 py-3 font-special uppercase tracking-wider">
                  <CheckCircle className="size-5" /> Arquivos Salvos
                </div>
              ) : isDownloading ? (
                <button disabled className="flex items-center gap-2 bg-gray-200 text-gray-600 border-2 border-gray-400 px-6 py-3 font-special uppercase tracking-wider cursor-wait">
                  <Loader2 className="size-5 animate-spin" /> Baixando (~200MB)
                </button>
              ) : (
                <button 
                  onClick={handleCachePDFs}
                  className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-900 hover:text-white border-2 border-gray-900 px-6 py-3 font-special uppercase tracking-wider transition-colors cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <Download className="size-5" /> Iniciar Download (~200MB)
                </button>
              )}
            </div>
          </div>

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