export function DocumentReader({ url, onClose }: { url: string; onClose: () => void }) {
    const isPdf = url.toLowerCase().endsWith(".pdf");
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-5xl h-[90vh] bg-[#222] shadow-2xl flex flex-col">
          {/* Barra de Topo do Reader */}
          <div className="flex justify-between items-center p-3 bg-gray-900 text-white border-b border-gray-700">
            <span className="font-special text-sm">ARQUIVO_CONFIDENCIAL.dat</span>
            <button 
              onClick={onClose}
              className="bg-red-700 hover:bg-red-600 px-4 py-1 text-xs font-bold uppercase transition-colors"
            >
              Fechar [X]
            </button>
          </div>
  
          {/* Conteúdo do Leitor */}
          <div className="flex-1 overflow-auto bg-[#1a1a1a] flex justify-center">
            {isPdf ? (
              <iframe src={url} className="w-full h-full" title="Leitor de PDF" />
            ) : (
              <img src={url} alt="Fonte" className="object-contain max-h-full" />
            )}
          </div>
        </div>
        
        {/* Clique fora para fechar */}
        <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      </div>
    );
  }