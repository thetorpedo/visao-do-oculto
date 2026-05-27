import { CheckCircle, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineDownloader({ pdfsParaBaixar }: { pdfsParaBaixar: string[] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if ('caches' in window) {
      caches.open('visao-oculto-pdfs').then(async (cache) => {
        const cachedRequests = await cache.keys();
        const cachedUrls = cachedRequests.map(req => req.url);
        
        const allPresent = pdfsParaBaixar.every(pdf => 
          cachedUrls.some(url => url.endsWith(pdf))
        );
        
        setIsCached(allPresent);
      });
    }
  }, [pdfsParaBaixar]);

  const handleCachePDFs = async () => {
    if (!('caches' in window)) {
      alert("Seu navegador não suporta downloads offline.");
      return;
    }

    setIsDownloading(true);
    try {
      const cache = await caches.open('visao-oculto-pdfs');
      await cache.addAll(pdfsParaBaixar);
      setIsCached(true);
    } catch (error) {
      console.error("Erro ao fazer o cache:", error);
      alert("Ocorreu um erro ao atualizar os arquivos. Verifique sua conexão.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative p-6 border border-gray-800 bg-amber-100/30 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center">
        Leitura Rápida / Offline
      </div>
      
      <div className="flex-1 mt-2 md:mt-0 text-center md:text-left">
        <h4 className="font-special text-xl text-gray-900 mb-1">
          {isCached ? "Fontes salvas em Cache" : "Baixar fontes em Cache"}
        </h4>
        <p className="text-sm text-gray-700 font-medium">
          {isCached 
            ? "Todos os arquivos estão salvos em cache no seu dispositivo." 
            : "Detectamos arquivos novos ou faltantes. Clique em baixar para salvar o material offline. O site salva os PDFs no seu dispositivo. O primeiro download pode demorar, mas depois disso os livros abrirão bem mais rápido e não gastarão sua internet nas próximas visitas."}
        </p>
      </div>

      <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
        {isDownloading ? (
          <button disabled className="flex items-center gap-2 bg-gray-200 text-gray-600 border-2 border-gray-400 px-6 py-3 font-special uppercase tracking-wider cursor-wait">
            <Loader2 className="size-5 animate-spin" /> Processando...
          </button>
        ) : isCached ? (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 border-2 border-green-800 px-6 py-3 font-special uppercase tracking-wider">
            <CheckCircle className="size-5" /> ARQUIVOS SALVOS
          </div>
        ) : (
          <button 
            onClick={handleCachePDFs}
            className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-900 hover:text-white border-2 border-gray-900 px-6 py-3 font-special uppercase tracking-wider transition-all cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            <Download className="size-5" /> BAIXAR (~200MB)
          </button>
        )}
      </div>
    </div>
  );
}