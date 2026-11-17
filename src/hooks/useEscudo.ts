import { useCallback, useEffect, useState } from "react";
import type { Categoria } from "@/context/DataContext";

export const GRID_COLS = 3;
export const GRID_ROWS = 2;
export const TOTAL_CELULAS = GRID_COLS * GRID_ROWS;
export const SLOTS_POR_PAINEL = TOTAL_CELULAS;

const CHAVE_STORAGE = "vdo-escudo-v2";
const CHAVE_LEGADO = "vdo-escudo-v1";

export type TipoEspecial = "iniciativa" | "dados" | "condicoes" | "anotacoes";
export type DirecaoMesclagem = "baixo" | "cima" | "direita" | "esquerda";

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

export interface SlotItem {
    id: string;
    col: number;      // 0, 1, 2
    row: number;      // 0, 1
    colSpan: number;  // 1, 2, 3
    rowSpan: number;  // 1, 2
    conteudo: SlotContainer | null;
}

export interface Painel {
    id: string;
    nome: string;
    slots: SlotItem[];
}

export interface OpcaoMesclagem {
    direcao: DirecaoMesclagem;
    rotulo: string;
    tamanhoFinal: string;
}

interface EstadoEscudo {
    paineis: Painel[];
    ativoId: string;
}

export const novoId = () => crypto.randomUUID();

export const criarAba = (conteudo: ConteudoAba): AbaSlot => ({ id: novoId(), conteudo });

export function criarSlot(aba: AbaSlot): SlotContainer {
    return { id: novoId(), abaAtivaId: aba.id, abas: [aba] };
}

export function criarSlotItem(
    col: number,
    row: number,
    colSpan = 1,
    rowSpan = 1,
    conteudo: SlotContainer | null = null
): SlotItem {
    return { id: novoId(), col, row, colSpan, rowSpan, conteudo };
}

function criarSlotsIniciais(): SlotItem[] {
    const slots: SlotItem[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            slots.push(criarSlotItem(c, r, 1, 1, null));
        }
    }
    return slots;
}

function criarPainel(nome: string): Painel {
    return { id: novoId(), nome, slots: criarSlotsIniciais() };
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

function normalizarSlot(raw: SlotSalvo | SlotContainer | null | undefined): SlotContainer | null {
    if (!raw) return null;

    if ("abas" in raw && Array.isArray(raw.abas) && raw.abas.length > 0) {
        const abaAtivaId = raw.abas.some((a) => a.id === raw.abaAtivaId) ? raw.abaAtivaId! : raw.abas[0].id;
        return { id: raw.id ?? novoId(), abaAtivaId, abas: raw.abas };
    }

    if ("tipo" in raw && raw.tipo) {
        const conteudo = (
            raw.tipo === "registro"
                ? { tipo: "registro", categoria: raw.categoria, itemId: raw.itemId }
                : { tipo: raw.tipo, dados: raw.dados }
        ) as ConteudoAba;
        return criarSlot(criarAba(conteudo));
    }

    return null;
}

export function encontrarSlotNaCelula(slots: SlotItem[], r: number, c: number): SlotItem | undefined {
    return slots.find(
        (s) => c >= s.col && c < s.col + s.colSpan && r >= s.row && r < s.row + s.rowSpan
    );
}

export function podeSeparar(slot: SlotItem): boolean {
    return slot.colSpan > 1 || slot.rowSpan > 1;
}

export function obterOpcoesMesclagem(slot: SlotItem, todosSlots: SlotItem[]): OpcaoMesclagem[] {
    const opcoes: OpcaoMesclagem[] = [];

    // 1. Baixo
    if (slot.row === 0 && slot.rowSpan === 1) {
        let valido = true;
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(todosSlots, 1, c);
            if (!vizinho || vizinho.conteudo !== null || vizinho.row !== 1 || vizinho.rowSpan !== 1) {
                valido = false;
                break;
            }
        }
        if (valido) {
            const finalW = slot.colSpan;
            const finalH = 2;
            opcoes.push({
                direcao: "baixo",
                rotulo: `Mesclar para baixo`,
                tamanhoFinal: `${finalW}x${finalH}`,
            });
        }
    }

    // 2. Cima
    if (slot.row === 1 && slot.rowSpan === 1) {
        let valido = true;
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(todosSlots, 0, c);
            if (!vizinho || vizinho.conteudo !== null || vizinho.row !== 0 || vizinho.rowSpan !== 1) {
                valido = false;
                break;
            }
        }
        if (valido) {
            const finalW = slot.colSpan;
            const finalH = 2;
            opcoes.push({
                direcao: "cima",
                rotulo: `Mesclar para cima`,
                tamanhoFinal: `${finalW}x${finalH}`,
            });
        }
    }

    // 3. Direita
    if (slot.col + slot.colSpan < GRID_COLS) {
        const cTarget = slot.col + slot.colSpan;
        let valido = true;
        const vizinhosEncontrados = new Set<SlotItem>();
        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(todosSlots, r, cTarget);
            if (!vizinho || vizinho.conteudo !== null) {
                valido = false;
                break;
            }
            vizinhosEncontrados.add(vizinho);
        }
        if (valido) {
            for (const v of vizinhosEncontrados) {
                if (v.col !== cTarget || v.colSpan !== 1 || v.row < slot.row || v.row + v.rowSpan > slot.row + slot.rowSpan) {
                    valido = false;
                    break;
                }
            }
        }
        if (valido) {
            const finalW = slot.colSpan + 1;
            const finalH = slot.rowSpan;
            opcoes.push({
                direcao: "direita",
                rotulo: `Mesclar para a direita`,
                tamanhoFinal: `${finalW}x${finalH}`,
            });
        }
    }

    // 4. Esquerda
    if (slot.col > 0) {
        const cTarget = slot.col - 1;
        let valido = true;
        const vizinhosEncontrados = new Set<SlotItem>();
        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(todosSlots, r, cTarget);
            if (!vizinho || vizinho.conteudo !== null) {
                valido = false;
                break;
            }
            vizinhosEncontrados.add(vizinho);
        }
        if (valido) {
            for (const v of vizinhosEncontrados) {
                if (v.col !== cTarget || v.colSpan !== 1 || v.row < slot.row || v.row + v.rowSpan > slot.row + slot.rowSpan) {
                    valido = false;
                    break;
                }
            }
        }
        if (valido) {
            const finalW = slot.colSpan + 1;
            const finalH = slot.rowSpan;
            opcoes.push({
                direcao: "esquerda",
                rotulo: `Mesclar para a esquerda`,
                tamanhoFinal: `${finalW}x${finalH}`,
            });
        }
    }

    return opcoes;
}

function aplicarMesclagem(slots: SlotItem[], slotId: string, direcao: DirecaoMesclagem): SlotItem[] {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return slots;

    if (direcao === "baixo" && slot.row === 0 && slot.rowSpan === 1) {
        const slotsRemover = new Set<string>();
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const v = encontrarSlotNaCelula(slots, 1, c);
            if (!v || v.conteudo !== null) return slots;
            slotsRemover.add(v.id);
        }
        return slots
            .filter((s) => !slotsRemover.has(s.id))
            .map((s) => (s.id === slotId ? { ...s, rowSpan: 2 } : s));
    }

    if (direcao === "cima" && slot.row === 1 && slot.rowSpan === 1) {
        const slotsRemover = new Set<string>();
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const v = encontrarSlotNaCelula(slots, 0, c);
            if (!v || v.conteudo !== null) return slots;
            slotsRemover.add(v.id);
        }
        return slots
            .filter((s) => !slotsRemover.has(s.id))
            .map((s) => (s.id === slotId ? { ...s, row: 0, rowSpan: 2 } : s));
    }

    if (direcao === "direita" && slot.col + slot.colSpan < GRID_COLS) {
        const cTarget = slot.col + slot.colSpan;
        const slotsRemover = new Set<string>();
        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const v = encontrarSlotNaCelula(slots, r, cTarget);
            if (!v || v.conteudo !== null) return slots;
            slotsRemover.add(v.id);
        }
        return slots
            .filter((s) => !slotsRemover.has(s.id))
            .map((s) => (s.id === slotId ? { ...s, colSpan: s.colSpan + 1 } : s));
    }

    if (direcao === "esquerda" && slot.col > 0) {
        const cTarget = slot.col - 1;
        const slotsRemover = new Set<string>();
        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const v = encontrarSlotNaCelula(slots, r, cTarget);
            if (!v || v.conteudo !== null) return slots;
            slotsRemover.add(v.id);
        }
        return slots
            .filter((s) => !slotsRemover.has(s.id))
            .map((s) => (s.id === slotId ? { ...s, col: s.col - 1, colSpan: s.colSpan + 1 } : s));
    }

    return slots;
}

function aplicarSeparacao(slots: SlotItem[], slotId: string): SlotItem[] {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || (slot.colSpan === 1 && slot.rowSpan === 1)) return slots;

    const novosSlots: SlotItem[] = [];
    for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            if (r === slot.row && c === slot.col) {
                novosSlots.push({
                    ...slot,
                    col: c,
                    row: r,
                    colSpan: 1,
                    rowSpan: 1,
                });
            } else {
                novosSlots.push(criarSlotItem(c, r, 1, 1, null));
            }
        }
    }

    return slots.flatMap((s) => (s.id === slotId ? novosSlots : [s]));
}

function aplicarReorganizacao(slots: SlotItem[], origemId: string, destinoId: string): SlotItem[] {
    const origem = slots.find((s) => s.id === origemId);
    const destino = slots.find((s) => s.id === destinoId);
    if (!origem || !destino || origem.id === destino.id) return slots;

    // Caso 1: Mesmas dimensões -> troca de conteúdo
    if (origem.colSpan === destino.colSpan && origem.rowSpan === destino.rowSpan) {
        return slots.map((s) => {
            if (s.id === origem.id) return { ...s, conteudo: destino.conteudo };
            if (s.id === destino.id) return { ...s, conteudo: origem.conteudo };
            return s;
        });
    }

    // Caso 2: Origem é mesclado e pode mover sua forma para região vazia
    if (podeSeparar(origem)) {
        if (
            destino.col + origem.colSpan <= GRID_COLS &&
            destino.row + origem.rowSpan <= GRID_ROWS
        ) {
            let todasCelulasLivres = true;
            const slotsSubstituidos = new Set<string>();

            for (let r = destino.row; r < destino.row + origem.rowSpan; r++) {
                for (let c = destino.col; c < destino.col + origem.colSpan; c++) {
                    const celulaSlot = encontrarSlotNaCelula(slots, r, c);
                    if (!celulaSlot) {
                        todasCelulasLivres = false;
                        break;
                    }
                    if (celulaSlot.id !== origem.id) {
                        if (celulaSlot.conteudo !== null) {
                            todasCelulasLivres = false;
                            break;
                        }
                        slotsSubstituidos.add(celulaSlot.id);
                    }
                }
                if (!todasCelulasLivres) break;
            }

            if (todasCelulasLivres) {
                const celulasAntigas: SlotItem[] = [];
                for (let r = origem.row; r < origem.row + origem.rowSpan; r++) {
                    for (let c = origem.col; c < origem.col + origem.colSpan; c++) {
                        const estaNaNovaPosicao =
                            c >= destino.col &&
                            c < destino.col + origem.colSpan &&
                            r >= destino.row &&
                            r < destino.row + origem.rowSpan;
                        if (!estaNaNovaPosicao) {
                            celulasAntigas.push(criarSlotItem(c, r, 1, 1, null));
                        }
                    }
                }

                const slotsFiltrados = slots.filter(
                    (s) => s.id !== origem.id && !slotsSubstituidos.has(s.id)
                );

                const origemMovida: SlotItem = {
                    ...origem,
                    col: destino.col,
                    row: destino.row,
                };

                return [...slotsFiltrados, origemMovida, ...celulasAntigas];
            }
        }
    }

    // Caso 3: Troca de conteúdo entre slots de tamanhos diferentes
    return slots.map((s) => {
        if (s.id === origem.id) return { ...s, conteudo: destino.conteudo };
        if (s.id === destino.id) return { ...s, conteudo: origem.conteudo };
        return s;
    });
}

function normalizarPainel(p: Painel): Painel {
    if (!p || typeof p !== "object") return criarPainel("Mesa 1");

    const nome = typeof p.nome === "string" && p.nome.trim() ? p.nome.trim() : "Mesa";
    const id = typeof p.id === "string" ? p.id : novoId();

    if (Array.isArray(p.slots)) {
        const todosTemCoordenadas = p.slots.every(
            (s) =>
                s &&
                typeof s.col === "number" &&
                typeof s.row === "number" &&
                typeof s.colSpan === "number" &&
                typeof s.rowSpan === "number"
        );

        if (todosTemCoordenadas) {
            const areaTotal = p.slots.reduce((acc, s) => acc + s.colSpan * s.rowSpan, 0);
            if (areaTotal === TOTAL_CELULAS) {
                const slotsNormalizados = p.slots.map((s) => ({
                    id: s.id ?? novoId(),
                    col: s.col,
                    row: s.row,
                    colSpan: s.colSpan,
                    rowSpan: s.rowSpan,
                    conteudo: normalizarSlot(s.conteudo ?? (s as unknown as SlotSalvo)),
                }));
                return { id, nome, slots: slotsNormalizados };
            }
        }

        const slotsIniciais = criarSlotsIniciais();
        p.slots.slice(0, 6).forEach((rawSlot, i) => {
            if (rawSlot) {
                const slotContainer = normalizarSlot(
                    (rawSlot as SlotItem).conteudo !== undefined
                        ? (rawSlot as SlotItem).conteudo
                        : (rawSlot as unknown as SlotSalvo)
                );
                if (slotContainer) {
                    slotsIniciais[i].conteudo = slotContainer;
                }
            }
        });
        return { id, nome, slots: slotsIniciais };
    }

    return criarPainel(nome);
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
        (painelId: string, slotId: string, conteudo: ConteudoAba) => {
            const aba = criarAba(conteudo);
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slotId) return slot;
                    if (!slot.conteudo) {
                        return { ...slot, conteudo: criarSlot(aba) };
                    }
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abaAtivaId: aba.id,
                            abas: [...slot.conteudo.abas, aba],
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const removerAba = useCallback(
        (painelId: string, slotId: string, abaId: string) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slotId || !slot.conteudo) return slot;
                    const abas = slot.conteudo.abas.filter((a) => a.id !== abaId);
                    if (abas.length === 0) {
                        return { ...slot, conteudo: null };
                    }
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abas,
                            abaAtivaId: slot.conteudo.abaAtivaId === abaId ? abas[0].id : slot.conteudo.abaAtivaId,
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const selecionarAba = useCallback(
        (painelId: string, slotId: string, abaId: string) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slotId || !slot.conteudo) return slot;
                    return {
                        ...slot,
                        conteudo: { ...slot.conteudo, abaAtivaId: abaId },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const atualizarConteudoAba = useCallback(
        (painelId: string, slotId: string, abaId: string, fn: (c: ConteudoAba) => ConteudoAba) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slotId || !slot.conteudo) return slot;
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abas: slot.conteudo.abas.map((a) =>
                                a.id === abaId ? { ...a, conteudo: fn(a.conteudo) } : a
                            ),
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const mesclarSlot = useCallback(
        (painelId: string, slotId: string, direcao: DirecaoMesclagem) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: aplicarMesclagem(p.slots, slotId, direcao),
            }));
        },
        [atualizarPainel]
    );

    const separarSlot = useCallback(
        (painelId: string, slotId: string) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: aplicarSeparacao(p.slots, slotId),
            }));
        },
        [atualizarPainel]
    );

    const reorganizarSlots = useCallback(
        (painelId: string, origemId: string, destinoId: string) => {
            atualizarPainel(painelId, (p) => ({
                ...p,
                slots: aplicarReorganizacao(p.slots, origemId, destinoId),
            }));
        },
        [atualizarPainel]
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
        mesclarSlot,
        separarSlot,
        reorganizarSlots,
    };
}
