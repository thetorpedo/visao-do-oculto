import { useCallback, useEffect, useState } from "react";
import type { Categoria } from "@/context/DataContext";

export const SLOTS_POR_PAINEL = 6;
const CHAVE_STORAGE = "vdo-escudo-v1";

export type TipoEspecial = "iniciativa" | "dados" | "condicoes";

export type Slot =
    | { id: string; tipo: "registro"; categoria: Categoria; itemId: string }
    | { id: string; tipo: TipoEspecial; dados?: unknown };

export interface Painel {
    id: string;
    nome: string;
    slots: (Slot | null)[];
}

interface EstadoEscudo {
    paineis: Painel[];
    ativoId: string;
}

export const novoId = () => crypto.randomUUID();

function criarPainel(nome: string): Painel {
    return { id: novoId(), nome, slots: Array(SLOTS_POR_PAINEL).fill(null) };
}

function normalizarPainel(p: Painel): Painel {
    const slots = Array.isArray(p.slots) ? p.slots.slice(0, SLOTS_POR_PAINEL) : [];
    while (slots.length < SLOTS_POR_PAINEL) slots.push(null);
    return { id: p.id, nome: p.nome || "Mesa", slots };
}

function carregar(): EstadoEscudo {
    try {
        const raw = localStorage.getItem(CHAVE_STORAGE);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.paineis) && parsed.paineis.length > 0) {
                const paineis: Painel[] = parsed.paineis.map(normalizarPainel);
                const ativoId = paineis.some((p) => p.id === parsed.ativoId) ? parsed.ativoId : paineis[0].id;
                return { paineis, ativoId };
            }
        }
    } catch {
        // dados corrompidos: começa do zero
    }
    const inicial = criarPainel("Mesa 1");
    return { paineis: [inicial], ativoId: inicial.id };
}

export function useEscudo() {
    const [estado, setEstado] = useState<EstadoEscudo>(carregar);

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
    }, [estado]);

    const painelAtivo = estado.paineis.find((p) => p.id === estado.ativoId) ?? estado.paineis[0];

    const setAtivo = useCallback((id: string) => {
        setEstado((prev) => ({ ...prev, ativoId: id }));
    }, []);

    const adicionarPainel = useCallback(() => {
        setEstado((prev) => {
            const novo = criarPainel(`Mesa ${prev.paineis.length + 1}`);
            return { paineis: [...prev.paineis, novo], ativoId: novo.id };
        });
    }, []);

    const removerPainel = useCallback((id: string) => {
        setEstado((prev) => {
            if (prev.paineis.length <= 1) return prev;
            const paineis = prev.paineis.filter((p) => p.id !== id);
            const ativoId = prev.ativoId === id ? paineis[0].id : prev.ativoId;
            return { paineis, ativoId };
        });
    }, []);

    const renomearPainel = useCallback((id: string, nome: string) => {
        const limpo = nome.trim();
        if (!limpo) return;
        setEstado((prev) => ({
            ...prev,
            paineis: prev.paineis.map((p) => (p.id === id ? { ...p, nome: limpo } : p)),
        }));
    }, []);

    const definirSlot = useCallback((painelId: string, indice: number, slot: Slot | null) => {
        setEstado((prev) => ({
            ...prev,
            paineis: prev.paineis.map((p) =>
                p.id === painelId ? { ...p, slots: p.slots.map((s, i) => (i === indice ? slot : s)) } : p
            ),
        }));
    }, []);

    const atualizarDados = useCallback((painelId: string, slotId: string, dados: unknown) => {
        setEstado((prev) => ({
            ...prev,
            paineis: prev.paineis.map((p) =>
                p.id === painelId
                    ? {
                        ...p,
                        slots: p.slots.map((s) =>
                            s && s.id === slotId && s.tipo !== "registro" ? { ...s, dados } : s
                        ),
                    }
                    : p
            ),
        }));
    }, []);

    return {
        paineis: estado.paineis,
        painelAtivo,
        setAtivo,
        adicionarPainel,
        removerPainel,
        renomearPainel,
        definirSlot,
        atualizarDados,
    };
}
