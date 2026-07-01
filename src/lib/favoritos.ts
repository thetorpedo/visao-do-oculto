export interface Grupo {
  id: string;          
  nome: string;
  criadoEm: number;    
}

export type CategoriaFavoritavel = "poderes" | "rituais" | "equipamentos" | "origens" | "trilhas" | "regras";

export interface Favorito {
  id: string;          
  itemId: string;      
  categoria: CategoriaFavoritavel;
  grupoIds: string[];  
  adicionadoEm: number;
}