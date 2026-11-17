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
    <div className="relative p-5 sm:p-6 mt-2 border border-black/40 bg-amber-100/30 dark:bg-[#131615] flex flex-col items-center justify-between gap-6">

      {isDownloading && (
        <div
          className="absolute inset-y-0 left-0 bg-amber-200/50 dark:bg-emerald-950/60 z-0 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      )}

      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-gray-900 text-white font-special text-xs sm:text-sm uppercase tracking-widest flex items-center z-10">
        CACHE DE FONTES
      </div>

      <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4 sm:gap-6 z-10 relative pt-2 sm:pt-1">
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-special text-lg sm:text-xl text-gray-900 mb-1.5 flex items-center justify-center md:justify-start gap-2">
            {isDownloading ? (
              <>Baixando Fontes...</>
            ) : isCached ? (
              "Fontes salvas em Cache"
            ) : (
              "Baixar fontes em Cache"
            )}
          </h4>

          <p className="text-sm text-gray-700 font-medium flex items-center justify-center md:justify-start">
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
            <button disabled className="flex items-center gap-2 bg-gray-900 text-white border border-gray-900 px-5 py-2.5 font-special text-sm uppercase tracking-wider cursor-wait min-w-44 justify-center shadow-sm">
              <Loader2 className="size-4 animate-spin" /> {progressPercentage}%
            </button>
          ) : isCached ? (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-800 dark:border-emerald-500/60 px-5 py-2.5 font-special text-sm uppercase tracking-wider min-w-44 justify-center">
              <CheckCircle className="size-4" /> ARQUIVOS SALVOS
            </div>
          ) : (
            <button
              onClick={handleCachePDFs}
              className="flex items-center justify-center gap-2 bg-white dark:bg-[#1e2220] text-gray-900 hover:bg-gray-900 hover:text-white border border-gray-900 px-5 py-2.5 font-special text-sm uppercase tracking-wider transition-all cursor-pointer min-w-44"
            >
              <Download className="size-4" /> BAIXAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}