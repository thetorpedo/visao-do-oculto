import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Check, Save } from "lucide-react";
import { useFavoritos } from "@/context/FavoritosContext";
import { Categoria } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import FolderDiv from "@/components/ui/folder-div";

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
    <div onClick={onClose} className="fixed inset-0 z-49 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <FolderDiv className="relative w-full max-w-md p-6 ">
        <div className="">

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
                    className={`w-full flex items-center justify-between font-daisy p-2 border-2 text-left transition-colors cursor-pointer ${isSelecionado
                      ? "border-gray-900 bg-black/5"
                      : "border-transparent hover:bg-black/5"
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
              className="flex-1 border-b border-gray-400 bg-transparent px-2 font-special py-1 text-sm outline-none focus:border-gray-900 transition-colors font-medium"
              value={novoGrupoNome}
              onChange={(e) => setNovoGrupoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
            />
            <Button
              onClick={handleCriarGrupo}
              disabled={!novoGrupoNome.trim()}
              variant='default'         >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-gray-400 border-dashed">
            <Button
              onClick={handleSalvar}
              variant='default'
            >
              <Save className="size-4" />
              Salvar Alterações
            </Button>

            {favoritoAtual && (
              <Button
                onClick={handleRemover}
                variant='destructive'
              >
                <Trash2 className="size-4" /> Remover dos Favoritos
              </Button>
            )}
          </div>

        </div>
      </FolderDiv>

    </div>,
    document.body
  );
}