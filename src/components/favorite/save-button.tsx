import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useFavoritos } from "@/context/FavoritosContext";
import SaveModal from "./save-modal.tsx";
import { Categoria } from "@/context/DataContext.tsx";

interface BotaoFavoritarProps {
  itemId: string;
  categoria: Categoria;
}

export default function SaveButton({ itemId, categoria }: BotaoFavoritarProps) {
  const { isFavoritado } = useFavoritos();
  const [modalAberto, setModalAberto] = useState(false);

  const favoritado = isFavoritado(itemId, categoria);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
        title={favoritado ? "Editar Favorito" : "Adicionar aos Favoritos"}
      >
        <Bookmark
          className={`size-5 transition-all ${favoritado ? "fill-gray-900 text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
        />
      </button>

      {modalAberto && (
        <SaveModal
          itemId={itemId}
          categoria={categoria}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}