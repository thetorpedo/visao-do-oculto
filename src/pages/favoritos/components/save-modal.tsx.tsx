import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Check } from "lucide-react";
import { useFavoritos } from "@/context/FavoritosContext";
import { Categoria } from "@/context/DataContext";

interface ModalAdicionarFavoritoProps {
  itemId: string;
  categoria: Categoria;
  onClose: () => void;
}

export default function SaveModal({ itemId, categoria, onClose }: ModalAdicionarFavoritoProps) {
  const {
    grupos,
    getFavoritoDeItem,
    adicionarFavorito,
    atualizarGruposFavorito,
    removerFavorito,
    criarGrupo,
  } = useFavoritos();

  const favoritoAtual = getFavoritoDeItem(itemId, categoria);
  const [gruposSelecionados, setGruposSelecionados] = useState<string[]>(
    favoritoAtual ? favoritoAtual.grupoIds : []
  );
  const [novoGrupoNome, setNovoGrupoNome] = useState("");

  const handleToggleGrupo = (grupoId: string) => {
    setGruposSelecionados((prev) =>
      prev.includes(grupoId) ? prev.filter((id) => id !== grupoId) : [...prev, grupoId]
    );
  };

  const handleSalvar = async () => {
    if (favoritoAtual) {
      if (gruposSelecionados.length === 0) {
        await removerFavorito(favoritoAtual.id);
      } else {
        await atualizarGruposFavorito(favoritoAtual.id, gruposSelecionados);
      }
    } else {
      if (gruposSelecionados.length > 0) {
        await adicionarFavorito(itemId, categoria, gruposSelecionados);
      }
    }
    onClose();
  };

  const handleRemover = async () => {
    if (favoritoAtual) {
      await removerFavorito(favoritoAtual.id);
    }
    onClose();
  };

  const handleCriarGrupo = async () => {
    if (!novoGrupoNome.trim()) return;
    const grupo = await criarGrupo(novoGrupoNome.trim());
    setGruposSelecionados((prev) => [...prev, grupo.id]);
    setNovoGrupoNome("");
  };

  return createPortal(
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md p-6 bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] shadow-2xl border border-gray-400">

        <div className="flex items-center justify-between mb-4 border-b border-gray-400 border-dashed pb-2">
          <h3 className="text-xl font-special text-gray-900 uppercase tracking-wider">
            {favoritoAtual ? "Editar Item Salvo" : "Salvar em Coleção"}
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto mb-4 space-y-2 custom-scrollbar pr-2">
          {grupos.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4">Nenhuma coleção criada ainda.</p>
          ) : (
            grupos.map((grupo) => {
              const isSelecionado = gruposSelecionados.includes(grupo.id);
              return (
                <button
                  key={grupo.id}
                  onClick={() => handleToggleGrupo(grupo.id)}
                  className={`w-full flex items-center justify-between p-2 border-2 text-left transition-colors cursor-pointer ${isSelecionado
                    ? "border-gray-900 bg-gray-200"
                    : "border-transparent hover:bg-gray-100"
                    }`}
                >
                  <span className="font-bold text-gray-800 text-sm">{grupo.nome}</span>
                  {isSelecionado && <Check className="size-4 text-gray-900" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Nome da nova coleção..."
            className="flex-1 border-b-2 border-gray-400 bg-transparent px-2 py-1 text-sm outline-none focus:border-gray-900 transition-colors font-medium"
            value={novoGrupoNome}
            onChange={(e) => setNovoGrupoNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
          />
          <button
            onClick={handleCriarGrupo}
            disabled={!novoGrupoNome.trim()}
            className="p-1.5 border-2 border-gray-900 bg-gray-900 text-white disabled:opacity-50 transition-opacity cursor-pointer"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-gray-400 border-dashed">
          <button
            onClick={handleSalvar}
            className="w-full py-2 bg-gray-900 text-white font-special uppercase tracking-wider hover:bg-gray-800 transition-colors cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            Salvar Alterações
          </button>

          {favoritoAtual && (
            <button
              onClick={handleRemover}
              className="w-full py-2 flex items-center justify-center gap-2 text-red-700 font-special uppercase tracking-wider hover:bg-red-50 transition-colors cursor-pointer mt-2"
            >
              <Trash2 className="size-4" /> Remover dos Favoritos
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}