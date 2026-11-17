import { BookOpen, Dices, FileText, ListChevronsUpDown, type LucideIcon } from "lucide-react";
import type { TipoEspecial } from "@/hooks/use-escudo";

export interface InfoEspecial {
    tipo: TipoEspecial;
    rotulo: string;
    descricao: string;
    icone: LucideIcon;
    cor: string;
}

export const ESPECIAIS: InfoEspecial[] = [
    {
        tipo: "iniciativa",
        rotulo: "Iniciativa",
        descricao: "Tracker de iniciativa e pontos de vida",
        icone: ListChevronsUpDown,
        cor: "",
    },
    {
        tipo: "dados",
        rotulo: "Dados",
        descricao: "Rolador de dados customizado",
        icone: Dices,
        cor: "",
    },
    {
        tipo: "condicoes",
        rotulo: "Condições",
        descricao: "Glossário rápido de condições",
        icone: BookOpen,
        cor: "",
    },
    {
        tipo: "anotacoes",
        rotulo: "Anotações",
        descricao: "Bloco de anotações com exportação para .txt",
        icone: FileText,
        cor: "",
    },
];
