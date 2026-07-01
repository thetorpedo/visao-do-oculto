import { CheckCircle, Download, Loader2, FileDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function CacheDownloader({ pdfsParaBaixar }: { pdfsParaBaixar: string[] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: "" });

  useEffect(() => {
    if ('caches' in window) {
      caches.open('visao-oculto-pdfs').then(async (cache) => {
        const cachedRequests = await cache.keys();
        const cachedUrls = cachedRequests.map(req => req.url);

        const allPresent = pdfsParaBaixar.length > 0 && pdfsParaBaixar.every(pdf =>
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
    setProgress({ current: 0, total: pdfsParaBaixar.length, fileName: "Iniciando..." });

    try {
      const cache = await caches.open('visao-oculto-pdfs');

      for (let i = 0; i < pdfsParaBaixar.length; i++) {
        const fileUrl = pdfsParaBaixar[i];
        const fileName = fileUrl.split('/').pop() || `Arquivo ${i + 1}`;

        setProgress({ current: i, total: pdfsParaBaixar.length, fileName });

        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Falha ao baixar ${fileName}`);

        await cache.put(fileUrl, response);
      }

      setProgress({ current: pdfsParaBaixar.length, total: pdfsParaBaixar.length, fileName: "Concluído" });
      setIsCached(true);

    } catch (error) {
      console.error("Erro ao fazer o cache:", error);
      alert("Ocorreu um erro ao atualizar os arquivos. Verifique sua conexão e tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const progressPercentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="relative p-6 mt-4 border border-gray-800/60 bg-amber-100/30 md:col-span-2 flex flex-col items-center justify-between gap-6">

      {isDownloading && (
        <div
          className="absolute inset-y-0 left-0 bg-amber-200/50 z-0 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      )}

      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-sm uppercase tracking-widest flex items-center z-10">
        CACHE DE FONTES
      </div>

      <div className="flex flex-col md:flex-row w-full items-center justify-between gap-6 z-10 relative">
        <div className="flex-1 mt-2 md:mt-0 text-center md:text-left">
          <h4 className="font-special text-xl text-gray-900 max-sm:mb-8 mb-4 lg:mb-1 flex items-center justify-center md:justify-start gap-2">
            {isDownloading ? (
              <>Baixando Fontes...</>
            ) : isCached ? (
              "Fontes salvas em Cache"
            ) : (
              "Baixar fontes em Cache"
            )}
          </h4>

          <p className="text-sm text-gray-700 font-medium h-10 max-sm:mb-5 flex items-center justify-center md:justify-start">
            {isDownloading ? (
              <span className="flex items-center gap-2 animate-pulse">
                <FileDown className="size-4 text-gray-900" />
                Transferindo: <strong className="text-gray-900 font-mono ">{progress.fileName}</strong> ({progress.current + 1}/{progress.total})
              </span>
            ) : isCached ? (
              "Todos os arquivos estão salvos em cache no seu dispositivo. A leitura não consumirá internet."
            ) : (
              "Detectamos arquivos novos ou faltantes. Para que os arquivos das fontes carreguem mais rápido, clique em baixar para salvar os arquivos localmente."
            )}
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
          {isDownloading ? (
            <button disabled className="flex items-center gap-2 bg-gray-900 text-white border-2 border-gray-900 px-6 py-3 font-special uppercase tracking-wider cursor-wait min-w-[200px] justify-center shadow-sm">
              <Loader2 className="size-5 animate-spin" /> {progressPercentage}%
            </button>
          ) : isCached ? (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 border-2 border-green-800 px-6 py-3 font-special uppercase tracking-wider min-w-[200px] justify-center shadow-sm">
              <CheckCircle className="size-5" /> ARQUIVOS SALVOS
            </div>
          ) : (
            <button
              onClick={handleCachePDFs}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-900 hover:text-white border-2 border-gray-900 px-6 py-3 font-special uppercase tracking-wider transition-all cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 min-w-[200px]"
            >
              <Download className="size-5" /> BAIXAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}