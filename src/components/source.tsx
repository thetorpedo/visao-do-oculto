import { BookMarked } from "lucide-react";

interface BookReferenceProps {
  fonte: string;
  pagina: string | number;
  onOpenReader: () => void;
}

export default function Source({ fonte, pagina, onOpenReader }: BookReferenceProps) {
  return (
    <div className=" flex items-center justify-between">
      <div className="text-xs text-gray-700 font-medium flex items-center">
        <BookMarked className="size-4 mr-1.5 opacity-80" />
        <button
          onClick={onOpenReader}
          className="hover:text-black underline cursor-pointer transition-colors decoration-gray-400 underline-offset-2"
        >
          <span className="font-bold">{fonte}</span>
          <span>, pág. {pagina}</span>
        </button>
      </div>
    </div>
  );
}