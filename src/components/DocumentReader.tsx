import { X } from 'lucide-react';
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
    <div className={`fixed inset-0 z-99999 flex items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}>
      <div className="relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-lg max-w-5xl h-dvh sm:h-[95vh] w-full">
        <div className='relative h-full w-full'>
          <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">

            {/* HEADER RESPONSIVO 1 LINHA */}
            <div className="flex flex-row justify-between items-center p-2 sm:p-3">

              {/* Lado Esquerdo (Status) */}
              <div className="flex gap-2 items-center truncate ">
                <span className="font-special underline text-base sm:text-lg  mt-0.5 truncate">
                  {isImage
                    ? `VISUAL // ${fonteId}`
                    : viewMode === 'single'
                      ? `${fonteId} - Página ${paginaImpressa}`
                      : `${fonteId} - Completo`}
                </span>
              </div>

              {/* Lado Direito (Botões) */}
              <div className='flex flex-row gap-2 sm:gap-4 shrink-0'>
                {!isImage && (
                  <button
                    onClick={() => setViewMode(viewMode === 'single' ? 'full' : 'single')}
                    className="flex items-center group cursor-pointer gap-2 px-4 py-2 text-sm font-special uppercase tracking-wide border-2 border-gray-800 bg-white text-gray-800 hover:bg-gray-100"
                  >
                    {viewMode === 'single' ? (
                      <><span className="shrink-0 -mb-1">Abrir o PDF</span></>
                    ) : (
                      <><span className="shrink-0 -mb-1">Voltar</span> </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="flex items-center gap-2  cursor-pointer bg-gray-900 text-white border-white px-4 py-2 text-sm font-special uppercase tracking-wide border-2 hover:bg-red-900">
                  <span className="-mb-1">
                    FECHAR
                  </span>
                  <span ><X className="size-3.5" /></span>
                </button>
              </div>
            </div>

            {/* CONTEÚDO RESPONSIVO */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto w-full mx-auto shadow-sm flex justify-center custom-scrollbar relative"
            >
              {isOpen && pdfSource && (
                <div className="p-0 animate-in fade-in zoom-in-95 bg-black/80 h-full duration-300 w-full flex justify-center">
                  {isImage ? (
                    <img
                      src={urlFinal}
                      alt={fonteId}
                      className="max-w-full max-h-[85vh] sm:max-h-[75vh] object-contain w-full border border-white/5"
                    />
                  ) : viewMode === 'single' ? (
                    <Document
                      file={pdfSource}
                      loading={<div className="font-special animate-pulse w-full h-full pt-20 text-center">Carregando Fonte...</div>}
                    >
                      <Page
                        pageNumber={paginaReal}
                        width={pdfWidth} // LARGURA DINÂMICA
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className=" bg-white mx-auto"
                      />
                    </Document>
                  ) : (
                    <iframe
                      src={`${iframeUrl}#page=${paginaReal}`}
                      className="w-full! h-full min-h-[90vh] sm:min-h-[75vh] border-none invert-[0.05] contrast-[1.1]"
                      title="Leitor Completo"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[1deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
        </div>

      </div>
      {/* Click fora para fechar (no mobile não tem muito espaço fora, mas mantém a funcionalidade) */}
      <div className="absolute inset-0 -z-10 cursor-default" onClick={handleClose}></div>
    </div>,
    document.body // TELETRANSPORTE PRO FINAL DO HTML
  );
}