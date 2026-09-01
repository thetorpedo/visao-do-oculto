import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { dbDelete, dbGet, dbGetAllKeys, dbSet } from "@/lib/db";
import { Favorito, Grupo } from "@/lib/favoritos";
import { Categoria } from "./DataContext";

interface FavoritosContextValue {
    grupos: Grupo[];
    favoritos: Favorito[];

    criarGrupo: (nome: string) => Promise<Grupo>;
    renomearGrupo: (id: string, novoNome: string) => Promise<void>;
    removerGrupo: (id: string) => Promise<void>;

    adicionarFavorito: (itemId: string, categoria: Categoria, grupoIds: string[]) => Promise<void>;
    removerFavorito: (favoritoId: string) => Promise<void>;
    atualizarGruposFavorito: (favoritoId: string, grupoIds: string[]) => Promise<void>;

    isFavoritado: (itemId: string, categoria: Categoria) => boolean;
    getFavoritoDeItem: (itemId: string, categoria: Categoria) => Favorito | null;
    getItensDosGrupo: (grupoId: string) => Favorito[];
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);

    const carregarDados = useCallback(async () => {
        const chavesGrupos = await dbGetAllKeys("grupos");
        const gruposCarregados = await Promise.all(chavesGrupos.map(key => dbGet<Grupo>("grupos", key)));

        const chavesFavoritos = await dbGetAllKeys("favoritos");
        const favoritosCarregados = await Promise.all(chavesFavoritos.map(key => dbGet<Favorito>("favoritos", key)));

        setGrupos(gruposCarregados.filter((g): g is Grupo => !!g).sort((a, b) => a.criadoEm - b.criadoEm));
        setFavoritos(favoritosCarregados.filter((f): f is Favorito => !!f).sort((a, b) => b.adicionadoEm - a.adicionadoEm));
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const criarGrupo = async (nome: string) => {
        const novoGrupo: Grupo = { id: crypto.randomUUID(), nome, criadoEm: Date.now() };
        await dbSet("grupos", novoGrupo.id, novoGrupo);
        setGrupos(prev => [...prev, novoGrupo]);
        return novoGrupo;
    };

    const renomearGrupo = async (id: string, novoNome: string) => {
        const grupo = grupos.find(g => g.id === id);
        if (!grupo) return;
        const grupoAtualizado = { ...grupo, nome: novoNome };
        await dbSet("grupos", id, grupoAtualizado);
        setGrupos(prev => prev.map(g => g.id === id ? grupoAtualizado : g));
    };

    const removerGrupo = async (id: string) => {
        await dbDelete("grupos", id);
        setGrupos(prev => prev.filter(g => g.id !== id));

        const favoritosAfetados = favoritos.filter(f => f.grupoIds.includes(id));
        for (const f of favoritosAfetados) {
            const novosGrupoIds = f.grupoIds.filter(gid => gid !== id);
            await atualizarGruposFavorito(f.id, novosGrupoIds);
        }
    };

    const adicionarFavorito = async (itemId: string, categoria: Categoria, grupoIds: string[]) => {
        const novoFavorito: Favorito = { id: crypto.randomUUID(), itemId, categoria, grupoIds, adicionadoEm: Date.now() };
        await dbSet("favoritos", novoFavorito.id, novoFavorito);
        setFavoritos(prev => [novoFavorito, ...prev]);
    };

    const removerFavorito = async (favoritoId: string) => {
        await dbDelete("favoritos", favoritoId);
        setFavoritos(prev => prev.filter(f => f.id !== favoritoId));
    };

    const atualizarGruposFavorito = async (favoritoId: string, grupoIds: string[]) => {
        const favorito = favoritos.find(f => f.id === favoritoId);
        if (!favorito) return;
        const favoritoAtualizado = { ...favorito, grupoIds };
        await dbSet("favoritos", favoritoId, favoritoAtualizado);
        setFavoritos(prev => prev.map(f => f.id === favoritoId ? favoritoAtualizado : f));
    };

    const isFavoritado = (itemId: string, categoria: Categoria) => {
        return favoritos.some(f => f.itemId === itemId && f.categoria === categoria);
    };

    const getFavoritoDeItem = (itemId: string, categoria: Categoria) => {
        return favoritos.find(f => f.itemId === itemId && f.categoria === categoria) || null;
    };

    const getItensDosGrupo = (grupoId: string) => {
        return favoritos.filter(f => f.grupoIds.includes(grupoId));
    };

    return (
        <FavoritosContext.Provider value={{
            grupos, favoritos, criarGrupo, renomearGrupo, removerGrupo,
            adicionarFavorito, removerFavorito, atualizarGruposFavorito,
            isFavoritado, getFavoritoDeItem, getItensDosGrupo
        }}>
            {children}
        </FavoritosContext.Provider>
    );
}

export function useFavoritos() {
    const context = useContext(FavoritosContext);
    if (!context) throw new Error("useFavoritos deve ser usado dentro de FavoritosProvider");
    return context;
}