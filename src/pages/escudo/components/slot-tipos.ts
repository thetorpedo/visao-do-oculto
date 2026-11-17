import { Activity, BookOpen, Dices, FileText, type LucideIcon } from "lucide-react";
import type { TipoEspecial } from "@/hooks/useEscudo";

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
        icone: Activity,
        cor: "text-rose-600 dark:text-rose-400",
    },
    {
        tipo: "dados",
        rotulo: "Dados",
        descricao: "Rolador de dados customizado",
        icone: Dices,
        cor: "text-sky-600 dark:text-sky-400",
    },
    {
        tipo: "condicoes",
        rotulo: "Condições",
        descricao: "Glossário rápido de condições",
        icone: BookOpen,
        cor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        tipo: "anotacoes",
        rotulo: "Anotações",
        descricao: "Bloco de anotações com exportação para .txt",
        icone: FileText,
        cor: "text-amber-600 dark:text-amber-400",
    },
];
