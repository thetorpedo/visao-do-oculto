import { useState, useMemo } from "react";
import { useFavoritos } from "@/context/FavoritosContext";
import { Categoria, useData } from "@/context/DataContext";
import { Plus, X, Trash2, Meh } from "lucide-react";
import ItemCard from "@/components/ui/item-card";
import { Button } from "@/components/ui/button";

export default function Favoritos() {
  const { grupos, favoritos, criarGrupo, removerGrupo, removerFavorito } = useFavoritos();
  const data = useData();

  const [grupoAtivo, setGrupoAtivo] = useState<string>("todos");
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [criandoGrupo, setCriandoGrupo] = useState(false);

  const favoritosFiltrados = useMemo(() => {
    if (grupoAtivo === "todos") return favoritos;
    return favoritos.filter(f => f.grupoIds.includes(grupoAtivo));
  }, [favoritos, grupoAtivo]);

  const handleCriarGrupo = async () => {
    if (!novoGrupoNome.trim()) return;
    const grupo = await criarGrupo(novoGrupoNome.trim());
    setGrupoAtivo(grupo.id);
    setNovoGrupoNome("");
    setCriandoGrupo(false);
  };

  const handleRemoverGrupo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja apagar este grupo? Os itens não serão excluídos, apenas removidos desta pasta.")) {
      await removerGrupo(id);
      if (grupoAtivo === id) setGrupoAtivo("todos");
    }
  };

  const getItemData = (itemId: string, categoria: Categoria) => {
    if (!data || !categoria) return null;
    const lista = (data[categoria] as any[]) || [];
    return lista.find((item: any) => item?.id === itemId) || null;
  };

  return (
    <div className="space-y-6 min-h-[85vh]">

      <div className="relative p-6 bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%] shadow-lg border border-gray-400">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-3xl sm:text-4xl font-special text-gray-900 leading-tight">Minhas Coleções</h2>

          {criandoGrupo ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text" autoFocus placeholder="Nome do grupo..."
                className="border-b-2 border-gray-600 bg-transparent px-2 py-1 text-sm outline-none focus:border-gray-900 w-full sm:w-48 font-medium"
                value={novoGrupoNome} onChange={(e) => setNovoGrupoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
              />
              <Button size='sm' onClick={handleCriarGrupo}><Plus className="size-4" /></Button>
              <Button size='sm' variant='destructive' onClick={() => setCriandoGrupo(false)}><X className="size-4" /></Button>
            </div>
          ) : (
            <Button
              onClick={() => setCriandoGrupo(true)}
            >
              <Plus className="size-4" />
              <div>Nova Coleção</div>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-400 border-dashed pt-4">
          <Button
            onClick={() => setGrupoAtivo("todos")}
            variant={grupoAtivo === "todos" ? 'default' : 'outline'}
            className={`font-sans`}
          >
            Todos
          </Button>

          {grupos.map((grupo) => (
            <Button
              key={grupo.id} onClick={() => setGrupoAtivo(grupo.id)}
              variant={grupoAtivo === grupo.id ? 'default' : 'outline'}
              className={`font-sans`}
            >
              {grupo.nome}
              <span
                onClick={(e) => handleRemoverGrupo(grupo.id, e)}
                className={`p-0.5 rounded-full hover:bg-red-200/30 hover:text-white ${grupoAtivo === grupo.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                title="Excluir grupo"
              >
                <X className="size-3" />
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoritosFiltrados.map((favorito) => {
          const item = getItemData(favorito.itemId, favorito.categoria);

          if (!item) {
            return (
              <div key={favorito.id} className="relative p-6 bg-[url(/assets/paper.png)] border border-red-300 shadow-md flex flex-col justify-between items-center text-center gap-4">
                <Trash2 className="size-10 text-red-300 mb-2" />
                <p className="font-special text-red-600 uppercase">Item não encontrado ou removido ({favorito.categoria})</p>
                <button onClick={() => removerFavorito(favorito.id)} className="text-sm underline text-red-800 font-bold cursor-pointer">Remover este item</button>
              </div>
            );
          }

          return (
            <ItemCard item={item} categoria={favorito.categoria} showCategory />
          );
        })}

        {favoritosFiltrados.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
            <Meh className="size-16 mb-4" />
            <p className="font-special text-2xl text-black">Nada por aqui (ainda).</p>
            <p className="font-special text-black mt-2 text-center">Clique no marca página ao lado dos itens<br />para salvá-los nesta pasta.</p>
          </div>
        )}
      </div>
    </div>
  );
}