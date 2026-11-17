import { useCallback, useEffect, useState } from "react";
import type { Categoria } from "@/context/DataContext";

export const SLOTS_POR_PAINEL = 6;
const CHAVE_STORAGE = "vdo-escudo-v2";
const CHAVE_LEGADO = "vdo-escudo-v1";

export type TipoEspecial = "iniciativa" | "dados" | "condicoes" | "anotacoes";

export type ConteudoAba =
    | { tipo: "registro"; categoria: Categoria; itemId: string }
    | { tipo: TipoEspecial; dados?: unknown };

export interface AbaSlot {
    id: string;
    conteudo: ConteudoAba;
}

export interface SlotContainer {
    id: string;
    abaAtivaId: string;
    abas: AbaSlot[];
}

export interface Painel {
    id: string;
    nome: string;
    slots: (SlotContainer | null)[];
}

interface EstadoEscudo {
    paineis: Painel[];
    ativoId: string;
}

export const novoId = () => crypto.randomUUID();

const criarAba = (conteudo: ConteudoAba): AbaSlot => ({ id: novoId(), conteudo });

function criarSlot(aba: AbaSlot): SlotContainer {
    return { id: novoId(), abaAtivaId: aba.id, abas: [aba] };
}

function criarPainel(nome: string): Painel {
    return { id: novoId(), nome, slots: Array(SLOTS_POR_PAINEL).fill(null) };
}

interface SlotSalvo {
    id?: string;
    abaAtivaId?: string;
    abas?: AbaSlot[];
    tipo?: string;
    categoria?: Categoria;
    itemId?: string;
    dados?: unknown;
}

function normalizarSlot(raw: SlotSalvo | null): SlotContainer | null {
    if (!raw) return null;

    if (raw.abas && raw.abas.length > 0) {
        const abaAtivaId = raw.abas.some((a) => a.id === raw.abaAtivaId) ? raw.abaAtivaId! : raw.abas[0].id;
        return { id: raw.id ?? novoId(), abaAtivaId, abas: raw.abas };
    }

    if (raw.tipo) {
        const conteudo = (
            raw.tipo === "registro"
                ? { tipo: "registro", categoria: raw.categoria, itemId: raw.itemId }
                : { tipo: raw.tipo, dados: raw.dados }
        ) as ConteudoAba;
        return criarSlot(criarAba(conteudo));
    }

    return null;
}

function normalizarPainel(p: Painel): Painel {
    const salvos = (Array.isArray(p.slots) ? p.slots.slice(0, SLOTS_POR_PAINEL) : []) as (SlotSalvo | null)[];
    const slots = salvos.map(normalizarSlot);
    while (slots.length < SLOTS_POR_PAINEL) slots.push(null);
    return { id: p.id, nome: p.nome || "Mesa", slots };
}

function carregar(): EstadoEscudo {
    try {
        const raw = localStorage.getItem(CHAVE_STORAGE) ?? localStorage.getItem(CHAVE_LEGADO);
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

type TransformarSlot = (slot: SlotContainer | null) => SlotContainer | null;

export function useEscudo() {
    const [estado, setEstado] = useState<EstadoEscudo>(carregar);

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
    }, [estado]);

    const painelAtivo = estado.paineis.find((p) => p.id === estado.ativoId) ?? estado.paineis[0];

    const atualizarPainel = useCallback((painelId: string, fn: (p: Painel) => Painel) => {
        setEstado((prev) => ({
            ...prev,
            paineis: prev.paineis.map((p) => (p.id === painelId ? fn(p) : p)),
        }));
    }, []);

    const atualizarSlot = useCallback(
        (painelId: string, indice: number, fn: TransformarSlot) =>
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: p.slots.map((s, i) => (i === indice ? fn(s) : s)),
            })),
        [atualizarPainel]
    );

    const setAtivo = useCallback((id: string) => setEstado((prev) => ({ ...prev, ativoId: id })), []);

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
            return { paineis, ativoId: prev.ativoId === id ? paineis[0].id : prev.ativoId };
        });
    }, []);

    const renomearPainel = useCallback(
        (id: string, nome: string) => {
            const limpo = nome.trim();
            if (limpo) atualizarPainel(id, (p) => ({ ...p, nome: limpo }));
        },
        [atualizarPainel]
    );

    const adicionarAba = useCallback(
        (painelId: string, indice: number, conteudo: ConteudoAba) => {
            const aba = criarAba(conteudo);
            atualizarSlot(painelId, indice, (slot) =>
                slot ? { ...slot, abaAtivaId: aba.id, abas: [...slot.abas, aba] } : criarSlot(aba)
            );
        },
        [atualizarSlot]
    );

    const removerAba = useCallback(
        (painelId: string, indice: number, abaId: string) =>
            atualizarSlot(painelId, indice, (slot) => {
                if (!slot) return null;
                const abas = slot.abas.filter((a) => a.id !== abaId);
                if (abas.length === 0) return null;
                return { ...slot, abas, abaAtivaId: slot.abaAtivaId === abaId ? abas[0].id : slot.abaAtivaId };
            }),
        [atualizarSlot]
    );

    const selecionarAba = useCallback(
        (painelId: string, indice: number, abaId: string) =>
            atualizarSlot(painelId, indice, (slot) => slot && { ...slot, abaAtivaId: abaId }),
        [atualizarSlot]
    );

    const atualizarConteudoAba = useCallback(
        (painelId: string, indice: number, abaId: string, fn: (c: ConteudoAba) => ConteudoAba) =>
            atualizarSlot(
                painelId,
                indice,
                (slot) =>
                    slot && {
                        ...slot,
                        abas: slot.abas.map((a) => (a.id === abaId ? { ...a, conteudo: fn(a.conteudo) } : a)),
                    }
            ),
        [atualizarSlot]
    );

    return {
        paineis: estado.paineis,
        painelAtivo,
        setAtivo,
        adicionarPainel,
        removerPainel,
        renomearPainel,
        adicionarAba,
        removerAba,
        selecionarAba,
        atualizarConteudoAba,
    };
}
