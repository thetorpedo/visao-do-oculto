import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Força o Vite a tratar o worker como um arquivo estático e gera a URL correta
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const FONTES_CONFIG: Record<string, { url: string; offset: number }> = {
  "OPRPG": { url: "/files/OPRPG.pdf", offset: 10 },
  "OPRPG LUXO": { url: "/files/OPRPGLUXO.jpg", offset: 0 },
  "SAH": { url: "/files/SAH.pdf", offset: 1 },
  "HQ Iniciação": { url: "/files/INICIACAO.png", offset: 2 },
  "HQ OSNF-1": { url: "/files/OSNF1.png", offset: 2 },
  "HQ OSNF-2": { url: "/files/OSNF2.png", offset: 2 },
  "HQ DESCONJ-1": { url: "/files/DESCONJ1.png", offset: 2 },
  "AS1": { url: "/files/AS1.pdf", offset: 0 },
  "AS2": { url: "/files/AS2.pdf", offset: 0 },
  "AS3": { url: "/files/AS3.pdf", offset: 0 },
  "AS4": { url: "/files/AS4.pdf", offset: 0 },
  "AS5": { url: "/files/AS5.pdf", offset: 0 },
  "AS6": { url: "/files/AS6.pdf", offset: 0 },
};

interface DocumentReaderProps {
  fonteId: string;
  paginaImpressa: string | number;
  onClose: () => void;
  isOpen: boolean;
}

export default function DocumentReader({ fonteId, paginaImpressa, isOpen, onClose }: DocumentReaderProps) {
  const [viewMode, setViewMode] = useState<'single' | 'full'>('single');
  const [pdfSource, setPdfSource] = useState<string | Blob>("");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  
  // Ref para calcular a largura disponível da tela
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState(850);
  
  const config = FONTES_CONFIG[fonteId];
  const urlFinal = config ? config.url : "";
  const isImage = paginaImpressa === '~' || urlFinal.toLowerCase().endsWith('.png') || urlFinal.toLowerCase().endsWith('.jpg');
  const paginaReal = !isImage ? Number(paginaImpressa) + (config?.offset || 0) : 0;

  // Garante que o Portal só renderize no lado do cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trava o scroll do fundo quando o leitor está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Lógica de Responsividade do PDF
  useEffect(() => {
    if (!isOpen) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // No mobile usa a largura total, no desktop trava em 850px
        setPdfWidth(Math.min(containerWidth, 850)); 
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen, viewMode]);

  // Lógica de Cache
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

  // Se não estiver montado (Server Side), não tenta renderizar o Portal
  if (!mounted) return null;

  // CREATE PORTAL: Joga o modal pro fim do HTML, burlando qualquer Z-index da aplicação!
  return createPortal(
    <div className={`fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 transition-all duration-300 ${
      isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
    }`}>
      <div className="relative w-full max-w-5xl h-dvh sm:h-[95vh] bg-[#1a1a1a] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:border border-white/10 sm:rounded-lg overflow-hidden">
        
        {/* HEADER RESPONSIVO 1 LINHA */}
        <div className="flex flex-row justify-between items-center p-2 sm:p-3 bg-gray-900 border-b border-red-900/30 shadow-md">
          
          {/* Lado Esquerdo (Status) */}
          <div className="flex gap-2 items-center truncate">
            <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-600 shadow-[0_0_10px_#ff0000]"></span>
            </div>
            <span className="font-special text-xs sm:text-sm text-red-500 tracking-wider sm:tracking-[0.2em] uppercase mt-0.5 truncate">
              {isImage 
                ? `VISUAL // ${fonteId}` 
                : viewMode === 'single' 
                  ? `PÁG_${paginaImpressa}` 
                  : "LIVRO_COMPLETO"}
            </span>
          </div>

          {/* Lado Direito (Botões) */}
          <div className='flex flex-row gap-2 sm:gap-4 shrink-0'>
            {!isImage && (
              <button 
                onClick={() => setViewMode(viewMode === 'single' ? 'full' : 'single')}
                className="group flex items-center justify-center gap-1.5 text-xs sm:text-sm font-daisy text-white bg-white/30 hover:bg-white/50 px-2 sm:px-3 py-1.5 border border-white/50 transition-all cursor-pointer uppercase"
              >
                {viewMode === 'single' ? (
                  <><span className="shrink-0">{">>"}</span> <span className="hidden sm:inline">ABRIR_</span>LIVRO</>
                ) : (
                  <><span className="shrink-0">{"<<"}</span> VOLTAR</>
                )}
              </button>
            )}

            <button 
              onClick={handleClose} 
              className="group flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 border-red-600/70 bg-red-600/20 hover:bg-red-600/40 border transition-all cursor-pointer"
            >
              <span className="hidden sm:inline text-red-600 group-hover:text-red-500 font-special -mb-1 text-sm tracking-widest uppercase">
                [ ENCERRAR ]
              </span>
              <span className="text-red-600 font-bold text-lg sm:text-base leading-none">×</span>
            </button>
          </div>
        </div>

        {/* CONTEÚDO RESPONSIVO */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-auto bg-[#0a0a0a] flex justify-center custom-scrollbar relative"
        >
          {isOpen && pdfSource && (
            <div className="p-0 sm:p-8 animate-in fade-in zoom-in-95 duration-300 w-full flex justify-center h-max">
              {isImage ? (
                <img 
                  src={urlFinal} 
                  alt={fonteId} 
                  className="max-w-full max-h-[85vh] sm:max-h-[75vh] object-contain shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5"
                />
              ) : viewMode === 'single' ? (
                <Document 
                  file={pdfSource} 
                  loading={<div className="text-red-500 font-special animate-pulse pt-20 text-center">DESCRIPTOGRAFANDO_DADOS...</div>}
                >
                  <Page 
                    pageNumber={paginaReal} 
                    width={pdfWidth} // LARGURA DINÂMICA
                    renderTextLayer={false} 
                    renderAnnotationLayer={false} 
                    className="shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-white mx-auto"
                  />
                </Document>
              ) : (
                <iframe 
                  src={`${iframeUrl}#page=${paginaReal}`} 
                  className="w-full h-full min-h-[90vh] sm:min-h-[75vh] border-none invert-[0.05] contrast-[1.1]"
                  title="Leitor Completo"
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Click fora para fechar (no mobile não tem muito espaço fora, mas mantém a funcionalidade) */}
      <div className="absolute inset-0 -z-10 cursor-default" onClick={handleClose}></div>
    </div>,
    document.body // TELETRANSPORTE PRO FINAL DO HTML
  );
}