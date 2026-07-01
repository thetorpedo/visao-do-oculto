import { useData } from "@/context/DataContext";
import { Book, Image as ImageIcon, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Fontes() {
  const { fontes, getBlobUrlFonte } = useData();
  const [fonteAberta, setFonteAberta] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const listaFontes = Object.values(fontes).sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === "dados" ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  useEffect(() => {
    if (!fonteAberta) {
      setMediaUrl("");
      return;
    }

    let urlCriadaNaMemoria: string | null = null;
    setIsLoading(true);

    const carregarFonte = async () => {
      const blobUrl = await getBlobUrlFonte(fonteAberta);

      if (blobUrl) {
        setMediaUrl(blobUrl);
        urlCriadaNaMemoria = blobUrl;
      } else {
        const nomeArquivo = fontes[fonteAberta]?.nomeArquivo ?? `${fonteAberta}.pdf`;
        const urlEstatica = `/files/${nomeArquivo}`;

        try {
          if ('caches' in window) {
            const cache = await caches.open('visao-oculto-pdfs');
            const cached = await cache.match(urlEstatica);
            if (cached) {
              const blob = await cached.blob();
              urlCriadaNaMemoria = URL.createObjectURL(blob);
              setMediaUrl(urlCriadaNaMemoria);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Falha ao ler cache offline", e);
        }

        setMediaUrl(urlEstatica);
      }
      setIsLoading(false);
    };

    carregarFonte();

    return () => {
      if (urlCriadaNaMemoria) URL.revokeObjectURL(urlCriadaNaMemoria);
    };
  }, [fonteAberta, getBlobUrlFonte, fontes]);

  const fonteAtual = fonteAberta ? fontes[fonteAberta] : null;

  return (
    <div className="min-h-[85vh] flex flex-col h-full">

      {!fonteAberta ? (
        <div className="space-y-6 flex-1 pb-10">
          <div className="relative p-6 bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] shadow-lg border border-gray-400">
            <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight mb-2">
              Fontes
            </h2>
            <p className="text-gray-700 max-w-3xl">
              Navegue diretamente pelos arquivos de fonte.<br />Se estiver usando celular, talvez seu navegador não suporte a leitura de PDFs diretamente no site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listaFontes.map((fonte) => (
              <div key={fonte.id} className="relative group cursor-pointer h-full" onClick={() => setFonteAberta(fonte.id)}>
                <div className="relative flex flex-col z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:bg-[linear-gradient(rgba(240,240,240,0.7),rgba(240,240,240,0.7)),url(/assets/paper.png)]">

                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] uppercase font-bold text-white px-2 py-0.5 tracking-wide shadow-sm flex items-center gap-1.5 ${fonte.tipo === "dados" ? "bg-gray-900" : "bg-red-900"
                      }`}>
                      {fonte.tipo === "dados" ? <Book className="size-3" /> : <ImageIcon className="size-3" />}
                      {fonte.tipo === "dados" ? "PDF" : "IMAGEM"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-special underline leading-tight mb-2 text-gray-900">
                    {fonte.label || fonte.id}
                  </h3>

                  <div className="mt-auto pt-4 border-t border-gray-400 border-dashed text-xs text-gray-600 font-mono break-all">
                    {fonte.nomeArquivo || `${fonte.id}.${fonte.tipo === "dados" ? "pdf" : "jpg"}`}
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-2 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%] transition-transform duration-300 group-hover:rotate-3" />
              </div>
            ))}
          </div>
        </div>
      ) : (

        <div className="flex-1 w-full relative min-h-[85vh] flex flex-col mb-10">

          <div className="relative flex flex-col z-10 w-full p-3 sm:p-5 h-full flex-1 shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

            <div className="px-4 py-2 mb-4 border-2 border-gray-400 border-dashed bg-gray-200/50 text-gray-800 uppercase font-daisy tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-4 truncate">
                <button
                  onClick={() => setFonteAberta(null)}
                  className="flex items-center gap-2 px-3 py-1.5 border-2 border-gray-800 bg-white hover:bg-gray-100 transition-colors font-special uppercase text-sm tracking-wide shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="size-4 -mb-0.5" /> <span className="-mb-1">Voltar</span>
                </button>
                <h2 className="font-special text-xl truncate hidden sm:block -mb-1 mt-1 text-gray-900">
                  Lendo: {fonteAtual?.label || fonteAtual?.id}
                </h2>
              </div>
              <div className="text-xs font-mono text-gray-500 bg-gray-300/50 px-2 py-1 border border-gray-400 shrink-0">
                {fonteAtual?.nomeArquivo}
              </div>
            </div>

            <div className="flex-1 w-full relative bg-gray-900/5 border-2 border-gray-400 flex items-center justify-center min-h-[70vh]">

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 z-10 gap-3 bg-gray-200/50 backdrop-blur-sm">
                  <Loader2 className="size-8 animate-spin" />
                  <span className="font-special tracking-widest uppercase">Carregando arquivo...</span>
                </div>
              )}

              {mediaUrl && (
                fonteAtual?.tipo === "visual" ? (
                  <div className="absolute inset-0 overflow-auto flex justify-center custom-scrollbar p-4">
                    <img
                      src={mediaUrl}
                      alt={fonteAtual?.id}
                      className="max-w-full h-auto object-contain shadow-2xl"
                    />
                  </div>
                ) : (
                  <iframe
                    src={mediaUrl}
                    className="absolute inset-0 w-full h-full border-none invert-[0.05] contrast-[1.1] bg-white"
                    title={`Leitor de PDF - ${fonteAtual?.id}`}
                  />
                )
              )}
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
        </div>
      )}
    </div>
  );
}