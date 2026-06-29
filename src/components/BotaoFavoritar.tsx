import { Bookmark, Star } from "lucide-react";
import { useState } from "react";
import { useFavoritos } from "@/context/FavoritosContext";
import { CategoriaFavoritavel } from "@/lib/favoritos";
import ModalAdicionarFavorito from "./ModalAdicionarFavorito";

interface BotaoFavoritarProps {
  itemId: string;
  categoria: CategoriaFavoritavel;
}

export default function BotaoFavoritar({ itemId, categoria }: BotaoFavoritarProps) {
  const { isFavoritado } = useFavoritos();
  const [modalAberto, setModalAberto] = useState(false);

  // Verifica se este item específico está favoritado[cite: 4]
  const favoritado = isFavoritado(itemId, categoria);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex items-center justify-center p-1.5 transition-colors hover:bg-gray-200 cursor-pointer rounded"
        title={favoritado ? "Editar Favorito" : "Adicionar aos Favoritos"}
      >
        <Bookmark
          className={`size-5 transition-all ${
            favoritado ? "fill-gray-900 text-gray-900" : "text-gray-500 hover:text-gray-900"
          }`}
        />
      </button>

      {/* O modal só é renderizado quando o botão é clicado */}
      {modalAberto && (
        <ModalAdicionarFavorito
          itemId={itemId}
          categoria={categoria}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}