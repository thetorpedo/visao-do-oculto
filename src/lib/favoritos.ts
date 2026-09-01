import { Categoria } from "@/context/DataContext";

export interface Grupo {
  id: string;          
  nome: string;
  criadoEm: number;    
}


export interface Favorito {
  id: string;          
  itemId: string;      
  categoria: Categoria;
  grupoIds: string[];  
  adicionadoEm: number;
}