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
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
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

interface SlotSalvo {
    id?: string;
    abaAtivaId?: string;
    abas?: AbaSlot[];
    tipo?: string;
    categoria?: Categoria;
    itemId?: string;
    dados?: unknown;
}

export const novoId = (): string => crypto.randomUUID();

export const criarAba = (conteudo: ConteudoAba): AbaSlot => ({
    id: novoId(),
    conteudo,
});

export function criarSlot(aba: AbaSlot): SlotContainer {
    return {
        id: novoId(),
        abaAtivaId: aba.id,
        abas: [aba],
    };
}

export function criarSlotItem(
    col: number,
    row: number,
    col_span = 1,
    row_span = 1,
    conteudo: SlotContainer | null = null
): SlotItem {
    return {
        id: novoId(),
        col,
        row,
        colSpan: col_span,
        rowSpan: row_span,
        conteudo,
    };
}

function criarSlotsIniciais(): SlotItem[] {
    const slots_iniciais: SlotItem[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            slots_iniciais.push(criarSlotItem(c, r, 1, 1, null));
        }
    }
    return slots_iniciais;
}

function criarPainel(nome_painel: string): Painel {
    return {
        id: novoId(),
        nome: nome_painel,
        slots: criarSlotsIniciais(),
    };
}

function normalizarSlot(dados_brutos: SlotSalvo | SlotContainer | null | undefined): SlotContainer | null {
    if (!dados_brutos) return null;

    if ("abas" in dados_brutos && Array.isArray(dados_brutos.abas) && dados_brutos.abas.length > 0) {
        const aba_ativa_id = dados_brutos.abas.some((a) => a.id === dados_brutos.abaAtivaId)
            ? dados_brutos.abaAtivaId!
            : dados_brutos.abas[0].id;
        return {
            id: dados_brutos.id ?? novoId(),
            abaAtivaId: aba_ativa_id,
            abas: dados_brutos.abas,
        };
    }

    if ("tipo" in dados_brutos && dados_brutos.tipo) {
        const conteudo = (
            dados_brutos.tipo === "registro"
                ? { tipo: "registro", categoria: dados_brutos.categoria, itemId: dados_brutos.itemId }
                : { tipo: dados_brutos.tipo, dados: dados_brutos.dados }
        ) as ConteudoAba;
        return criarSlot(criarAba(conteudo));
    }

    return null;
}

export function encontrarSlotNaCelula(slots: SlotItem[], row: number, col: number): SlotItem | undefined {
    return slots.find(
        (s) => col >= s.col && col < s.col + s.colSpan && row >= s.row && row < s.row + s.rowSpan
    );
}

export function podeSeparar(slot: SlotItem): boolean {
    return slot.colSpan > 1 || slot.rowSpan > 1;
}

export function obterOpcoesMesclagem(slot: SlotItem, todos_slots: SlotItem[]): OpcaoMesclagem[] {
    const opcoes: OpcaoMesclagem[] = [];

    if (slot.row === 0 && slot.rowSpan === 1) {
        let is_valido = true;
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(todos_slots, 1, c);
            if (!vizinho || vizinho.conteudo !== null || vizinho.row !== 1 || vizinho.rowSpan !== 1) {
                is_valido = false;
                break;
            }
        }
        if (is_valido) {
            opcoes.push({
                direcao: "baixo",
                rotulo: "Mesclar para baixo",
                tamanhoFinal: `${slot.colSpan}x2`,
            });
        }
    }

    if (slot.row === 1 && slot.rowSpan === 1) {
        let is_valido = true;
        for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(todos_slots, 0, c);
            if (!vizinho || vizinho.conteudo !== null || vizinho.row !== 0 || vizinho.rowSpan !== 1) {
                is_valido = false;
                break;
            }
        }
        if (is_valido) {
            opcoes.push({
                direcao: "cima",
                rotulo: "Mesclar para cima",
                tamanhoFinal: `${slot.colSpan}x2`,
            });
        }
    }

    if (slot.col + slot.colSpan < GRID_COLS) {
        const col_alvo = slot.col + slot.colSpan;
        let is_valido = true;
        const vizinhos_encontrados = new Set<SlotItem>();

        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(todos_slots, r, col_alvo);
            if (!vizinho || vizinho.conteudo !== null) {
                is_valido = false;
                break;
            }
            vizinhos_encontrados.add(vizinho);
        }

        if (is_valido) {
            for (const v of vizinhos_encontrados) {
                if (
                    v.col !== col_alvo ||
                    v.colSpan !== 1 ||
                    v.row < slot.row ||
                    v.row + v.rowSpan > slot.row + slot.rowSpan
                ) {
                    is_valido = false;
                    break;
                }
            }
        }

        if (is_valido) {
            opcoes.push({
                direcao: "direita",
                rotulo: "Mesclar para a direita",
                tamanhoFinal: `${slot.colSpan + 1}x${slot.rowSpan}`,
            });
        }
    }

    if (slot.col > 0) {
        const col_alvo = slot.col - 1;
        let is_valido = true;
        const vizinhos_encontrados = new Set<SlotItem>();

        for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(todos_slots, r, col_alvo);
            if (!vizinho || vizinho.conteudo !== null) {
                is_valido = false;
                break;
            }
            vizinhos_encontrados.add(vizinho);
        }

        if (is_valido) {
            for (const v of vizinhos_encontrados) {
                if (
                    v.col !== col_alvo ||
                    v.colSpan !== 1 ||
                    v.row < slot.row ||
                    v.row + v.rowSpan > slot.row + slot.rowSpan
                ) {
                    is_valido = false;
                    break;
                }
            }
        }

        if (is_valido) {
            opcoes.push({
                direcao: "esquerda",
                rotulo: "Mesclar para a esquerda",
                tamanhoFinal: `${slot.colSpan + 1}x${slot.rowSpan}`,
            });
        }
    }

    return opcoes;
}

function aplicarMesclagem(slots: SlotItem[], slot_id: string, direcao: DirecaoMesclagem): SlotItem[] {
    const slot_origem = slots.find((s) => s.id === slot_id);
    if (!slot_origem) return slots;

    if (direcao === "baixo" && slot_origem.row === 0 && slot_origem.rowSpan === 1) {
        const ids_remover = new Set<string>();
        for (let c = slot_origem.col; c < slot_origem.col + slot_origem.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(slots, 1, c);
            if (!vizinho || vizinho.conteudo !== null) return slots;
            ids_remover.add(vizinho.id);
        }
        return slots
            .filter((s) => !ids_remover.has(s.id))
            .map((s) => (s.id === slot_id ? { ...s, rowSpan: 2 } : s));
    }

    if (direcao === "cima" && slot_origem.row === 1 && slot_origem.rowSpan === 1) {
        const ids_remover = new Set<string>();
        for (let c = slot_origem.col; c < slot_origem.col + slot_origem.colSpan; c++) {
            const vizinho = encontrarSlotNaCelula(slots, 0, c);
            if (!vizinho || vizinho.conteudo !== null) return slots;
            ids_remover.add(vizinho.id);
        }
        return slots
            .filter((s) => !ids_remover.has(s.id))
            .map((s) => (s.id === slot_id ? { ...s, row: 0, rowSpan: 2 } : s));
    }

    if (direcao === "direita" && slot_origem.col + slot_origem.colSpan < GRID_COLS) {
        const col_alvo = slot_origem.col + slot_origem.colSpan;
        const ids_remover = new Set<string>();
        for (let r = slot_origem.row; r < slot_origem.row + slot_origem.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(slots, r, col_alvo);
            if (!vizinho || vizinho.conteudo !== null) return slots;
            ids_remover.add(vizinho.id);
        }
        return slots
            .filter((s) => !ids_remover.has(s.id))
            .map((s) => (s.id === slot_id ? { ...s, colSpan: s.colSpan + 1 } : s));
    }

    if (direcao === "esquerda" && slot_origem.col > 0) {
        const col_alvo = slot_origem.col - 1;
        const ids_remover = new Set<string>();
        for (let r = slot_origem.row; r < slot_origem.row + slot_origem.rowSpan; r++) {
            const vizinho = encontrarSlotNaCelula(slots, r, col_alvo);
            if (!vizinho || vizinho.conteudo !== null) return slots;
            ids_remover.add(vizinho.id);
        }
        return slots
            .filter((s) => !ids_remover.has(s.id))
            .map((s) => (s.id === slot_id ? { ...s, col: s.col - 1, colSpan: s.colSpan + 1 } : s));
    }

    return slots;
}

function aplicarSeparacao(slots: SlotItem[], slot_id: string): SlotItem[] {
    const slot_origem = slots.find((s) => s.id === slot_id);
    if (!slot_origem || (slot_origem.colSpan === 1 && slot_origem.rowSpan === 1)) return slots;

    const novos_slots: SlotItem[] = [];
    for (let r = slot_origem.row; r < slot_origem.row + slot_origem.rowSpan; r++) {
        for (let c = slot_origem.col; c < slot_origem.col + slot_origem.colSpan; c++) {
            if (r === slot_origem.row && c === slot_origem.col) {
                novos_slots.push({
                    ...slot_origem,
                    col: c,
                    row: r,
                    colSpan: 1,
                    rowSpan: 1,
                });
            } else {
                novos_slots.push(criarSlotItem(c, r, 1, 1, null));
            }
        }
    }

    return slots.flatMap((s) => (s.id === slot_id ? novos_slots : [s]));
}

function aplicarReorganizacao(slots: SlotItem[], origem_id: string, destino_id: string): SlotItem[] {
    const slot_origem = slots.find((s) => s.id === origem_id);
    const slot_destino = slots.find((s) => s.id === destino_id);
    if (!slot_origem || !slot_destino || slot_origem.id === slot_destino.id) return slots;

    if (slot_origem.colSpan === slot_destino.colSpan && slot_origem.rowSpan === slot_destino.rowSpan) {
        return slots.map((s) => {
            if (s.id === slot_origem.id) return { ...s, conteudo: slot_destino.conteudo };
            if (s.id === slot_destino.id) return { ...s, conteudo: slot_origem.conteudo };
            return s;
        });
    }

    if (podeSeparar(slot_origem)) {
        const cabe_no_destino =
            slot_destino.col + slot_origem.colSpan <= GRID_COLS &&
            slot_destino.row + slot_origem.rowSpan <= GRID_ROWS;

        if (cabe_no_destino) {
            let celulas_disponiveis = true;
            const ids_substituidos = new Set<string>();

            for (let r = slot_destino.row; r < slot_destino.row + slot_origem.rowSpan; r++) {
                for (let c = slot_destino.col; c < slot_destino.col + slot_origem.colSpan; c++) {
                    const celula = encontrarSlotNaCelula(slots, r, c);
                    if (!celula) {
                        celulas_disponiveis = false;
                        break;
                    }
                    if (celula.id !== slot_origem.id) {
                        if (celula.conteudo !== null) {
                            celulas_disponiveis = false;
                            break;
                        }
                        ids_substituidos.add(celula.id);
                    }
                }
                if (!celulas_disponiveis) break;
            }

            if (celulas_disponiveis) {
                const celulas_liberadas: SlotItem[] = [];
                for (let r = slot_origem.row; r < slot_origem.row + slot_origem.rowSpan; r++) {
                    for (let c = slot_origem.col; c < slot_origem.col + slot_origem.colSpan; c++) {
                        const esta_na_nova_area =
                            c >= slot_destino.col &&
                            c < slot_destino.col + slot_origem.colSpan &&
                            r >= slot_destino.row &&
                            r < slot_destino.row + slot_origem.rowSpan;
                        if (!esta_na_nova_area) {
                            celulas_liberadas.push(criarSlotItem(c, r, 1, 1, null));
                        }
                    }
                }

                const slots_preservados = slots.filter(
                    (s) => s.id !== slot_origem.id && !ids_substituidos.has(s.id)
                );

                const slot_movido: SlotItem = {
                    ...slot_origem,
                    col: slot_destino.col,
                    row: slot_destino.row,
                };

                return [...slots_preservados, slot_movido, ...celulas_liberadas];
            }
        }
    }

    return slots.map((s) => {
        if (s.id === slot_origem.id) return { ...s, conteudo: slot_destino.conteudo };
        if (s.id === slot_destino.id) return { ...s, conteudo: slot_origem.conteudo };
        return s;
    });
}

function normalizarPainel(painel_bruto: Painel): Painel {
    if (!painel_bruto || typeof painel_bruto !== "object") return criarPainel("Mesa 1");

    const nome_normalizado =
        typeof painel_bruto.nome === "string" && painel_bruto.nome.trim() ? painel_bruto.nome.trim() : "Mesa";
    const painel_id = typeof painel_bruto.id === "string" ? painel_bruto.id : novoId();

    if (Array.isArray(painel_bruto.slots)) {
        const coordenadas_validas = painel_bruto.slots.every(
            (s) =>
                s &&
                typeof s.col === "number" &&
                typeof s.row === "number" &&
                typeof s.colSpan === "number" &&
                typeof s.rowSpan === "number"
        );

        if (coordenadas_validas) {
            const area_total = painel_bruto.slots.reduce((acc, s) => acc + s.colSpan * s.rowSpan, 0);
            if (area_total === TOTAL_CELULAS) {
                const slots_formatados = painel_bruto.slots.map((s) => ({
                    id: s.id ?? novoId(),
                    col: s.col,
                    row: s.row,
                    colSpan: s.colSpan,
                    rowSpan: s.rowSpan,
                    conteudo: normalizarSlot(s.conteudo ?? (s as unknown as SlotSalvo)),
                }));
                return { id: painel_id, nome: nome_normalizado, slots: slots_formatados };
            }
        }

        const slots_iniciais = criarSlotsIniciais();
        painel_bruto.slots.slice(0, 6).forEach((slot_bruto, idx) => {
            if (slot_bruto) {
                const container_normalizado = normalizarSlot(
                    (slot_bruto as SlotItem).conteudo !== undefined
                        ? (slot_bruto as SlotItem).conteudo
                        : (slot_bruto as unknown as SlotSalvo)
                );
                if (container_normalizado) {
                    slots_iniciais[idx].conteudo = container_normalizado;
                }
            }
        });
        return { id: painel_id, nome: nome_normalizado, slots: slots_iniciais };
    }

    return criarPainel(nome_normalizado);
}

function carregarEstadoInicial(): EstadoEscudo {
    try {
        const serializado = localStorage.getItem(CHAVE_STORAGE) ?? localStorage.getItem(CHAVE_LEGADO);
        if (serializado) {
            const decodificado = JSON.parse(serializado);
            if (Array.isArray(decodificado?.paineis) && decodificado.paineis.length > 0) {
                const paineis: Painel[] = decodificado.paineis.map(normalizarPainel);
                const ativo_id = paineis.some((p) => p.id === decodificado.ativoId)
                    ? decodificado.ativoId
                    : paineis[0].id;
                return { paineis, ativoId: ativo_id };
            }
        }
    } catch {
        // Inicializa novo estado em caso de falha de leitura
    }
    const painel_padrao = criarPainel("Mesa 1");
    return { paineis: [painel_padrao], ativoId: painel_padrao.id };
}

export function useEscudo() {
    const [estado, setEstado] = useState<EstadoEscudo>(carregarEstadoInicial);

    useEffect(() => {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
    }, [estado]);

    const painel_ativo = estado.paineis.find((p) => p.id === estado.ativoId) ?? estado.paineis[0];

    const atualizarPainel = useCallback((painel_id: string, atualizador: (p: Painel) => Painel) => {
        setEstado((anterior) => ({
            ...anterior,
            paineis: anterior.paineis.map((p) => (p.id === painel_id ? atualizador(p) : p)),
        }));
    }, []);

    const setAtivo = useCallback((novo_id: string) => {
        setEstado((anterior) => ({ ...anterior, ativoId: novo_id }));
    }, []);

    const adicionarPainel = useCallback(() => {
        setEstado((anterior) => {
            const novo_painel = criarPainel(`Mesa ${anterior.paineis.length + 1}`);
            return { paineis: [...anterior.paineis, novo_painel], ativoId: novo_painel.id };
        });
    }, []);

    const removerPainel = useCallback((painel_id: string) => {
        setEstado((anterior) => {
            if (anterior.paineis.length <= 1) return anterior;
            const paineis_restantes = anterior.paineis.filter((p) => p.id !== painel_id);
            return {
                paineis: paineis_restantes,
                ativoId: anterior.ativoId === painel_id ? paineis_restantes[0].id : anterior.ativoId,
            };
        });
    }, []);

    const renomearPainel = useCallback(
        (painel_id: string, novo_nome: string) => {
            const nome_limpo = novo_nome.trim();
            if (nome_limpo) {
                atualizarPainel(painel_id, (p) => ({ ...p, nome: nome_limpo }));
            }
        },
        [atualizarPainel]
    );

    const adicionarAba = useCallback(
        (painel_id: string, slot_id: string, conteudo: ConteudoAba) => {
            const nova_aba = criarAba(conteudo);
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slot_id) return slot;
                    if (!slot.conteudo) {
                        return { ...slot, conteudo: criarSlot(nova_aba) };
                    }
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abaAtivaId: nova_aba.id,
                            abas: [...slot.conteudo.abas, nova_aba],
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const removerAba = useCallback(
        (painel_id: string, slot_id: string, aba_id: string) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slot_id || !slot.conteudo) return slot;
                    const abas_restantes = slot.conteudo.abas.filter((a) => a.id !== aba_id);
                    if (abas_restantes.length === 0) {
                        return { ...slot, conteudo: null };
                    }
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abas: abas_restantes,
                            abaAtivaId: slot.conteudo.abaAtivaId === aba_id ? abas_restantes[0].id : slot.conteudo.abaAtivaId,
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const selecionarAba = useCallback(
        (painel_id: string, slot_id: string, aba_id: string) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slot_id || !slot.conteudo) return slot;
                    return {
                        ...slot,
                        conteudo: { ...slot.conteudo, abaAtivaId: aba_id },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const atualizarConteudoAba = useCallback(
        (
            painel_id: string,
            slot_id: string,
            aba_id: string,
            transformador: (c: ConteudoAba) => ConteudoAba
        ) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: p.slots.map((slot) => {
                    if (slot.id !== slot_id || !slot.conteudo) return slot;
                    return {
                        ...slot,
                        conteudo: {
                            ...slot.conteudo,
                            abas: slot.conteudo.abas.map((a) =>
                                a.id === aba_id ? { ...a, conteudo: transformador(a.conteudo) } : a
                            ),
                        },
                    };
                }),
            }));
        },
        [atualizarPainel]
    );

    const mesclarSlot = useCallback(
        (painel_id: string, slot_id: string, direcao: DirecaoMesclagem) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: aplicarMesclagem(p.slots, slot_id, direcao),
            }));
        },
        [atualizarPainel]
    );

    const separarSlot = useCallback(
        (painel_id: string, slot_id: string) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: aplicarSeparacao(p.slots, slot_id),
            }));
        },
        [atualizarPainel]
    );

    const reorganizarSlots = useCallback(
        (painel_id: string, origem_id: string, destino_id: string) => {
            atualizarPainel(painel_id, (p) => ({
                ...p,
                slots: aplicarReorganizacao(p.slots, origem_id, destino_id),
            }));
        },
        [atualizarPainel]
    );

    return {
        paineis: estado.paineis,
        painelAtivo: painel_ativo,
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
