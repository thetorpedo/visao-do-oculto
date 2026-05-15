import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// OTIMIZAÇÃO: Força o Vite a tratar o worker como um arquivo estático e gera a URL correta
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const FONTES_CONFIG: Record<string, { url: string; offset: number }> = {
  "OPRPG": { url: "/files/OPRPG.pdf", offset: 10 },
  "SAH": { url: "/files/SAH.pdf", offset: 1 },
  "HQ Iniciação": { url: "/files/INICIACAO.png", offset: 2 },
  "HQ OSNF-1": { url: "/files/OSNF1.png", offset: 2 },
  "HQ OSNF-2": { url: "/files/OSNF2.png", offset: 2 },
  "AS1": { url: "/files/AS1.pdf", offset: 0 },
  "AS2": { url: "/files/AS2.pdf", offset: 0 },
  "AS3": { url: "/files/AS3.pdf", offset: 0 },
  "AS4": { url: "/files/AS4.pdf", offset: 0 },
};

interface DocumentReaderProps {
  fonteId: string;
  paginaImpressa: string | number;
  onClose: () => void;
  isOpen: boolean;
}

export default function DocumentReader({ fonteId, paginaImpressa, isOpen, onClose }: DocumentReaderProps) {
  const [viewMode, setViewMode] = useState<'single' | 'full'>('single');
  
  // OTIMIZAÇÃO 2: Estado para segurar o arquivo puro (Blob) ou a URL
  const [pdfSource, setPdfSource] = useState<string | Blob>("");
  
  const config = FONTES_CONFIG[fonteId];
  const urlFinal = config ? config.url : "";
  const isImage = paginaImpressa === '~' || urlFinal.toLowerCase().endsWith('.png') || urlFinal.toLowerCase().endsWith('.jpg');
  const paginaReal = !isImage ? Number(paginaImpressa) + (config?.offset || 0) : 0;
  const [iframeUrl, setIframeUrl] = useState<string>("");

  // OTIMIZAÇÃO 3: Força a leitura direta do Cache Storage do navegador
  useEffect(() => {
    let urlCriadaNaMemoria: string | null = null;

    if (!urlFinal || isImage) {
      setPdfSource(urlFinal);
      setIframeUrl(urlFinal);
      return;
    }

    const loadDirectlyFromCache = async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open('visao-oculto-pdfs');
          const cachedResponse = await cache.match(urlFinal);
          
          if (cachedResponse) {
            console.log("🔥 CACHE HIT! Gerando link local...");
            const blob = await cachedResponse.blob();
            
            // Transforma o Blob do cache em um link fictício que o Iframe entende
            urlCriadaNaMemoria = URL.createObjectURL(blob);
            
            setPdfSource(blob);
            setIframeUrl(urlCriadaNaMemoria);
            return;
          }
        }
      } catch (error) {
        console.warn("Falha ao ler cache", error);
      }
      
      setPdfSource(urlFinal);
      setIframeUrl(urlFinal);
    };

    loadDirectlyFromCache();

    // Limpeza crucial: Evita que a RAM do pc estoure ao fechar o leitor
    return () => {
      if (urlCriadaNaMemoria) {
        URL.revokeObjectURL(urlCriadaNaMemoria);
      }
    };
  }, [urlFinal, isImage]);

  const handleClose = () => {
    setViewMode('single');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] h-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300 ${
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    }`}>
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#1a1a1a] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-3 bg-gray-900 border-b border-red-900/30 shadow-md">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2 px-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full -mt-0.5 h-3 w-3 bg-red-600 shadow-[0_0_10px_#ff0000]"></span>
              </div>
              <span className="font-special text-sm text-red-500 tracking-[0.2em] uppercase mt-0.5">
                {isImage 
                  ? `ARQUIVO_VISUAL // ${fonteId}` 
                  : viewMode === 'single' 
                    ? `ACESSO_REMOTO // PÁG_${paginaImpressa}` 
                    : "ACESSO_TOTAL_RESERVADO"}
              </span>
            </div>
          </div>

          <div className='flex flex-row gap-4'>
            {!isImage && (
              <button 
                onClick={() => setViewMode(viewMode === 'single' ? 'full' : 'single')}
                className="group flex items-center gap-2 text-sm font-daisy text-white bg-white/30 hover:bg-white/50 px-3 py-1.5 border border-white/50 transition-all cursor-pointer uppercase"
              >
                {viewMode === 'single' ? ">> ABRIR_LIVRO_COMPLETO" : "<< VOLTAR_PARA_PÁGINA"}
              </button>
            )}

            <button 
              onClick={handleClose} 
              className="group flex items-center gap-2 px-4 py-1.5 border-red-600/70 bg-red-600/20 hover:bg-red-600/40 border transition-all cursor-pointer"
            >
              <span className="text-red-600 group-hover:text-red-500 font-special -mb-1 text-sm tracking-widest uppercase">
                [ ENCERRAR_SESSÃO ]
              </span>
              <span className="text-red-600 font-bold">×</span>
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-auto bg-[#0a0a0a] flex justify-center custom-scrollbar relative">
          {isOpen && pdfSource && (
            <div className="p-8 animate-in fade-in zoom-in-95 duration-300 w-full flex justify-center">
              {isImage ? (
                <img 
                  src={urlFinal} 
                  alt={fonteId} 
                  className="max-w-full max-h-[75vh] object-contain shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5"
                />
              ) : viewMode === 'single' ? (
                <Document 
                  file={pdfSource} 
                  loading={<div className="text-red-500 font-special animate-pulse pt-20">DESCRIPTOGRAFANDO_DADOS...</div>}
                >
                  <Page 
                    pageNumber={paginaReal} 
                    width={850}
                    renderTextLayer={false} 
                    renderAnnotationLayer={false} 
                    className="shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                  />
                </Document>
              ) : (
                <iframe 
                  src={`${iframeUrl}#page=${paginaReal}`} 
                  className="w-full h-full min-h-[75vh] border-none invert-[0.05] contrast-[1.1]"
                  title="Leitor Completo"
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10 cursor-default" onClick={handleClose}></div>
    </div>
  );
}