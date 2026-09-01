import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

import { useData } from '@/context/DataContext';
import FolderDiv from '../ui/folder-div';
import { Button } from '../ui/button';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState(850);
  const { fontes, getBlobUrlFonte } = useData();

  const fonte = fontes[fonteId];
  const isImage = paginaImpressa === '~' || fonte?.tipo === "visual";
  console.log("DocumentReader: fonteId", fonteId, "paginaImpressa", paginaImpressa, "isImage", isImage, "fonte?.tipo", fonte?.tipo);
  const offsetFonte = fonte?.offset ?? 0;
  const paginaReal = !isImage ? Number(paginaImpressa) + offsetFonte : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Em telas pequenas usa quase toda a largura disponível, sem exagerar o padding
        const isMobile = window.innerWidth < 640;
        setPdfWidth(Math.min(containerWidth - (isMobile ? 8 : 0), 850));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen, viewMode]);

  useEffect(() => {
    let urlCriadaNaMemoria: string | null = null;

    if (!isOpen) return;

    const carregar = async () => {

      const blobUrl = await getBlobUrlFonte(fonteId);
      if (blobUrl) {
        setPdfSource(blobUrl);
        setIframeUrl(blobUrl);
        urlCriadaNaMemoria = blobUrl;
        return;
      }

      const urlEstatica = `/files/${fontes[fonteId]?.nomeArquivo ?? fonteId + ".pdf"}`;
      console.log("DocumentReader: carregando urlEstatica", urlEstatica);
      try {
        if ('caches' in window) {
          const cache = await caches.open('visao-oculto-pdfs');
          const cached = await cache.match(urlEstatica);
          if (cached) {
            const blob = await cached.blob();
            urlCriadaNaMemoria = URL.createObjectURL(blob);
            setPdfSource(blob);
            setIframeUrl(urlCriadaNaMemoria);
            return;
          }
        }
      } catch (e) {
        console.warn("Falha ao ler cache", e);
      }

      setPdfSource(urlEstatica);
      setIframeUrl(urlEstatica);
    };

    carregar();

    return () => {
      if (urlCriadaNaMemoria) URL.revokeObjectURL(urlCriadaNaMemoria);
    };
  }, [isOpen, fonteId, fontes, getBlobUrlFonte]);

  const handleClose = () => {
    setViewMode('single');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-49 flex items-center justify-center bg-black/50 backdrop-blur-md p-0 sm:p-4 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>

      <FolderDiv className="max-w-5xl max-lg:mt-15 h-[85vh] lg:h-[90vh] rounded-none sm:rounded-md">
        <div className="text-center px-2 py-2 mb-2 sm:mb-3 border-b-2 border-black/40 border-dashed text-black/90 uppercase font-daisy tracking-wider text-xs md:text-sm leading-relaxed flex flex-row items-center justify-between gap-2">
          <div className="flex gap-2 items-center truncate min-w-0">
            <span className="font-special text-sm sm:text-lg mt-0.5 truncate">
              {isImage
                ? `IMAGEM // ${fonteId}`
                : viewMode === 'single'
                  ? `${fonteId} - Pág. ${paginaImpressa}`
                  : `${fonteId} - Completo`}
            </span>
          </div>

          <div className='flex flex-row gap-1.5 sm:gap-2 shrink-0'>
            {!isImage && (
              <Button
                onClick={() => setViewMode(viewMode === 'single' ? 'full' : 'single')}
                variant='outline'
                size="sm"
                className='uppercase px-2! sm:px-3!'
                title={viewMode === 'single' ? 'Ver arquivo completo' : 'Voltar'}
              >
                {viewMode === 'single' ? (
                  <>
                    <Maximize2 className="size-3.5 sm:hidden" />
                    <span className="hidden sm:inline shrink-0">Ver arquivo completo</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="size-3.5 sm:hidden" />
                    <span className="hidden sm:inline shrink-0">Voltar</span>
                  </>
                )}
              </Button>
            )}

            <Button onClick={handleClose} size="sm" className="px-2! sm:px-3!">
              <span className="hidden sm:inline">FECHAR</span>
              <span><X className="size-3.5" /></span>
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-auto w-full mx-auto shadow-sm flex bg-black/80 border-gray-800 border justify-center scrollbar-thumb-white relative"
        >
          {isOpen && pdfSource && (
            <div className="p-0 animate-in fade-in zoom-in-95 h-full duration-300 w-full flex justify-center">
              {isImage ? (
                <img
                  src={pdfSource as string}
                  alt={fonteId}
                  className="max-w-full h-full object-contain w-full border border-white/5"
                />
              ) : viewMode === 'single' ? (
                <Document
                  file={pdfSource}
                  loading={<div className="font-special animate-pulse w-full h-full pt-20 text-center text-white text-sm px-4">Carregando Fonte...</div>}
                >
                  <Page
                    pageNumber={paginaReal}
                    width={pdfWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white mx-auto"
                  />
                </Document>
              ) : (
                <iframe
                  src={`${iframeUrl}#page=${paginaReal}`}
                  className="w-full h-full border-none invert-[0.05] contrast-[1.1]"
                  title="Leitor Completo"
                />
              )}
            </div>
          )}
        </div>
      </FolderDiv>

      <div className="absolute inset-0 -z-10 cursor-default" onClick={handleClose}></div>
    </div>,
    document.body
  );
}