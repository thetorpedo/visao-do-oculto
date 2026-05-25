import { ArrowRight, Dices } from "lucide-react";
import { useEffect, useState } from "react";

export default function RandomItem({ itens }: { itens: any[] }) {
  const [itemAleatorio, setItemAleatorio] = useState<any>(null);

  const sortearNovoItem = () => {
    const indexSorteado = Math.floor(Math.random() * itens.length);
    setItemAleatorio(itens[indexSorteado]);
  };

  useEffect(() => {
    sortearNovoItem();
  }, []);

  if (!itemAleatorio) return null;

  return (
    <div className="relative p-6 border-2 border-dashed border-gray-800 bg-white/40 hover:bg-white/60 transition-colors group w-full">
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
    </div>
  );
}