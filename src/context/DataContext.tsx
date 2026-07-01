import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    EquipamentoSchema,
    OrigemSchema,
    PoderSchema,
    RitualSchema,
    TrilhaSchema,
    RegraSchema,
    type Regra,
    type Equipamento,
    type Origem,
    type Poder,
    type Ritual,
    type Trilha,
} from "@/lib/schemas";
import { z } from "zod";

import { dbGet, dbSet, dbDelete, dbGetAllKeys, dbClear } from "@/lib/db";

// ─────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────

export type Categoria = "poderes" | "rituais" | "equipamentos" | "origens" | "trilhas" | "regras";

export interface FonteConfig {
    id: string;
    offset: number;
    tipo: "dados" | "visual";
    arquivo?: Blob;
    nomeArquivo?: string;
    label?: string;
}

export interface ArquivoImportado {
    nome: string;
    categoria: Categoria;
    itens: number;
}

interface DataState {
    poderes: Poder[];
    rituais: Ritual[];
    equipamentos: Equipamento[];
    origens: Origem[];
    trilhas: Trilha[];
    regras: Regra[];
    fontes: Record<string, FonteConfig>;
    arquivosImportados: ArquivoImportado[];
}

interface DataContextValue extends DataState {
    status: "loading" | "empty" | "ready";
    importarJson: (categoria: Categoria | null, arquivos: File | File[]) => Promise<{ ok: boolean; itens: number; erros: number }>;
    removerArquivo: (nomeArquivo: string, categoria: Categoria) => Promise<void>;
    limparCategoria: (categoria: Categoria) => Promise<void>;
    salvarFonte: (config: FonteConfig, arquivo?: File) => Promise<void>;
    removerFonte: (id: string) => Promise<void>;
    getBlobUrlFonte: (id: string) => Promise<string | null>;
    limparTudo: () => Promise<void>;
    exportarPacote: () => Promise<void>;
    exportarCategoria: (categoria: Categoria) => void;
    exportarArquivo: (nomeArquivo: string, categoria: Categoria) => Promise<void>;
    entrarSemDados: () => void;
}

// ─────────────────────────────────────────
// Schemas por categoria
// ─────────────────────────────────────────

const SCHEMAS: Record<Categoria, z.ZodTypeAny> = {
    poderes: PoderSchema,
    rituais: RitualSchema,
    equipamentos: EquipamentoSchema,
    origens: OrigemSchema,
    trilhas: TrilhaSchema,
    regras: RegraSchema,
};

const CATEGORIAS: Categoria[] = ["poderes", "rituais", "equipamentos", "origens", "trilhas", "regras"];

// ─────────────────────────────────────────
// Carregamento estático (deploy privado)
// ─────────────────────────────────────────

/**
 * Lê /data/index.json e retorna o mapa categoria → lista de caminhos.
 * Retorna null se o arquivo não existir (deploy público).
 */
async function lerIndex(): Promise<Record<Categoria, string[]> | null> {
    try {
        const res = await fetch("/data/index.json");
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Busca um único arquivo JSON de /data/ e retorna o array de itens.
 * Retorna [] em caso de falha.
 */
async function fetchJson(caminho: string): Promise<unknown[]> {
    try {
        const res = await fetch(`/data/${caminho}`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

/**
 * Carrega todos os dados estáticos a partir do index.json.
 * Retorna null se não houver index (deploy público).
 */
async function carregarEstatico(): Promise<{
    dados: Record<Categoria, unknown[]>;
    arquivos: ArquivoImportado[];
} | null> {
    const index = await lerIndex();
    if (!index) return null;

    const dados: Record<Categoria, unknown[]> = {
        poderes: [], rituais: [], equipamentos: [], origens: [], trilhas: [], regras: []
    };
    const arquivos: ArquivoImportado[] = [];

    for (const categoria of CATEGORIAS) {
        const caminhos = index[categoria] ?? [];

        // Busca todos os arquivos da categoria em paralelo
        const resultados = await Promise.all(caminhos.map(fetchJson));

        for (let i = 0; i < caminhos.length; i++) {
            const itens = resultados[i];
            if (itens.length === 0) continue;

            dados[categoria].push(...itens);

            // Nome amigável: só o filename, ex: "poderes-as5.json"
            const nomeArquivo = caminhos[i].split("/").pop() ?? caminhos[i];
            arquivos.push({ nome: nomeArquivo, categoria, itens: itens.length });
        }
    }

    return { dados, arquivos };
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<"loading" | "empty" | "ready">("loading");
    const [state, setState] = useState<DataState>({
        poderes: [],
        rituais: [],
        equipamentos: [],
        origens: [],
        trilhas: [],
        regras: [],
        fontes: {},
        arquivosImportados: [],
    });

    const entrarSemDados = useCallback(() => {
        setStatus("ready");
    }, []);

    const carregarTudo = useCallback(async () => {
        setStatus("loading");

        const novoState: DataState = {
            poderes: [],
            rituais: [],
            equipamentos: [],
            origens: [],
            trilhas: [],
            regras: [],
            fontes: {},
            arquivosImportados: [],
        };

        // 1. Tenta carregar estático via index.json (deploy privado)
        const estatico = await carregarEstatico();
        if (estatico) {
            for (const categoria of CATEGORIAS) {
                (novoState[categoria] as unknown[]).push(...estatico.dados[categoria]);
            }
            novoState.arquivosImportados.push(...estatico.arquivos);
        }

        // 2. Carrega do IndexedDB (concatena por cima do estático)
        const keys = await dbGetAllKeys("dados");
        for (const key of keys) {
            const [categoria, nomeArquivo] = key.split(":") as [Categoria, string];
            const itens = await dbGet<unknown[]>("dados", key);
            if (!itens || itens.length === 0) continue;

            (novoState[categoria] as unknown[]).push(...itens);
            novoState.arquivosImportados.push({ nome: nomeArquivo, categoria, itens: itens.length });
        }

        // 3. Carrega configs de fontes do IndexedDB
        const fonteKeys = await dbGetAllKeys("fontes");
        for (const key of fonteKeys) {
            const config = await dbGet<FonteConfig>("fontes", key);
            if (config) novoState.fontes[key] = config;
        }

        // Fontes com arquivo físico em /files/ — só existem no deploy privado.
        // No deploy público o usuário cadastra as fontes manualmente em Configurações.
        if (estatico !== null) {
            const FONTES_DEFAULT: Record<string, Omit<FonteConfig, "id">> = {
                OPRPG: { tipo: "dados", offset: 10, nomeArquivo: "OPRPG.pdf" },
                SAH: { tipo: "dados", offset: 1, nomeArquivo: "SAH.pdf" },
                AS1: { tipo: "dados", offset: 0, nomeArquivo: "AS1.pdf" },
                AS2: { tipo: "dados", offset: 0, nomeArquivo: "AS2.pdf" },
                AS3: { tipo: "dados", offset: 0, nomeArquivo: "AS3.pdf" },
                AS4: { tipo: "dados", offset: 0, nomeArquivo: "AS4.pdf" },
                AS5: { tipo: "dados", offset: 0, nomeArquivo: "AS5.pdf" },
                AS6: { tipo: "dados", offset: 0, nomeArquivo: "AS6.pdf" },
                OPRPGLUXO: { tipo: "visual", offset: 0, nomeArquivo: "OPRPGLUXO.jpg", label: "OPRPG Luxo" },
                INICIACAO: { tipo: "visual", offset: 0, nomeArquivo: "INICIACAO.png", label: "HQ Iniciação" },
                OSNF1: { tipo: "visual", offset: 0, nomeArquivo: "OSNF1.png", label: "HQ OSNF-1" },
                OSNF2: { tipo: "visual", offset: 0, nomeArquivo: "OSNF2.png", label: "HQ OSNF-2" },
                DESCONJ1: { tipo: "visual", offset: 0, nomeArquivo: "DESCONJ1.png", label: "HQ DESCONJ-1" },
                OJDA: { tipo: "visual", offset: 0, nomeArquivo: "OJDA.png", label: "HQ OJDA" },
            };
            for (const [id, config] of Object.entries(FONTES_DEFAULT)) {
                if (!novoState.fontes[id]) {
                    novoState.fontes[id] = { id, ...config };
                }
            }
        }

        const temDados = CATEGORIAS.some((c) => (novoState[c] as unknown[]).length > 0);
        setState(novoState);
        setStatus(temDados ? "ready" : "empty");
    }, []);

    useEffect(() => {
        carregarTudo();
    }, [carregarTudo]);

    const _importarArray = async (
        categoria: Categoria,
        array: unknown[],
        nomeArquivo: string
    ): Promise<{ itens: number; erros: number }> => {
        const schema = SCHEMAS[categoria];
        const validos: unknown[] = [];
        let erros = 0;

        for (const item of array) {
            const result = schema.safeParse(item);
            if (result.success) validos.push(result.data);
            else { erros++; console.warn(`Item inválido em ${categoria}:`, result.error.flatten()); }
        }

        const key = `${categoria}:${nomeArquivo}`;
        await dbSet("dados", key, validos);

        setState((prev) => {
            const jaExiste = prev.arquivosImportados.find(
                (a) => a.nome === nomeArquivo && a.categoria === categoria
            );
            return {
                ...prev,
                [categoria]: [...(prev[categoria] as unknown[]), ...validos],
                arquivosImportados: jaExiste
                    ? prev.arquivosImportados.map((a) =>
                        a.nome === nomeArquivo && a.categoria === categoria
                            ? { ...a, itens: validos.length } : a)
                    : [...prev.arquivosImportados, { nome: nomeArquivo, categoria, itens: validos.length }],
            };
        });

        return { itens: validos.length, erros };
    };

    // ── Importar JSON ──
    const importarJson = useCallback(async (
        categoria: Categoria | null, // null = detectar do arquivo
        arquivos: File | File[]
    ): Promise<{ ok: boolean; itens: number; erros: number }> => {
        const lista = Array.isArray(arquivos) ? arquivos : [arquivos];
        let totalItens = 0;
        let totalErros = 0;

        for (const arquivo of lista) {
            const texto = await arquivo.text();
            let json: unknown;
            try { json = JSON.parse(texto); } catch { totalErros++; continue; }

            // Detecta se é multi-categoria (objeto com chaves de categoria)
            const isMulti = !Array.isArray(json) && typeof json === "object" && json !== null &&
                CATEGORIAS.some(c => c in (json as Record<string, unknown>));

            if (isMulti) {
                const obj = json as Record<string, unknown>;
                for (const cat of CATEGORIAS) {
                    const array = Array.isArray(obj[cat]) ? obj[cat] as unknown[] : null;
                    if (!array || array.length === 0) continue;
                    const { itens, erros } = await _importarArray(cat, array, arquivo.name);
                    totalItens += itens;
                    totalErros += erros;
                }
            } else {
                const cat = categoria!;
                const array = Array.isArray(json) ? json :
                    (typeof json === "object" && json !== null
                        ? (Object.values(json as Record<string, unknown>).find(Array.isArray) as unknown[] | undefined)
                        : undefined);
                if (!array) { totalErros++; continue; }
                const { itens, erros } = await _importarArray(cat, array, arquivo.name);
                totalItens += itens;
                totalErros += erros;
            }
        }

        if (status === "empty" && totalItens > 0) setStatus("ready");
        return { ok: totalItens > 0, itens: totalItens, erros: totalErros };
    }, [status]);

    // ── Remover arquivo específico ──
    const removerArquivo = useCallback(async (nomeArquivo: string, categoria: Categoria) => {
        await dbDelete("dados", `${categoria}:${nomeArquivo}`);
        await carregarTudo();
    }, [carregarTudo]);

    // ── Limpar categoria ──
    const limparCategoria = useCallback(async (categoria: Categoria) => {
        const keys = await dbGetAllKeys("dados");
        for (const key of keys) {
            if (key.startsWith(`${categoria}:`)) await dbDelete("dados", key);
        }
        await carregarTudo();
    }, [carregarTudo]);

    // ── Salvar fonte/PDF ──
    const salvarFonte = useCallback(async (config: FonteConfig, arquivo?: File) => {
        const { arquivo: _blob, ...configSemBlob } = config;
        await dbSet("fontes", config.id, configSemBlob);

        if (arquivo) {
            const blob = new Blob([await arquivo.arrayBuffer()], { type: arquivo.type });
            await dbSet("pdfs", config.id, blob);
        }

        setState((prev) => ({
            ...prev,
            fontes: { ...prev.fontes, [config.id]: config },
        }));
    }, []);

    // ── Remover fonte ──
    const removerFonte = useCallback(async (id: string) => {
        await dbDelete("fontes", id);
        await dbDelete("pdfs", id);
        setState((prev) => {
            const novasFontes = { ...prev.fontes };
            delete novasFontes[id];
            return { ...prev, fontes: novasFontes };
        });
    }, []);

    // ── Gerar blob URL de PDF/imagem de uma fonte ──
    const getBlobUrlFonte = useCallback(async (id: string): Promise<string | null> => {
        const blob = await dbGet<Blob>("pdfs", id);
        if (blob) return URL.createObjectURL(blob);

        const nomeArquivo = state.fontes[id]?.nomeArquivo;
        if (!nomeArquivo) return null;

        const urlEstatica = `/files/${nomeArquivo}`;

        if ('caches' in window) {
            try {
                const cache = await caches.open('visao-oculto-pdfs');
                const cached = await cache.match(urlEstatica);
                if (cached) {
                    const blobCache = await cached.blob();
                    return URL.createObjectURL(blobCache);
                }
            } catch {
            }
        }

        return urlEstatica;
    }, [state.fontes]);

    // ── Limpar tudo ──
    const limparTudo = useCallback(async () => {
        await dbClear("dados");
        await dbClear("fontes");
        await dbClear("pdfs");
        await carregarTudo();
    }, [carregarTudo]);

    // ── Exportar pacote ──
    const exportarPacote = useCallback(async () => {
        const pacote: Record<string, unknown> = {};
        for (const categoria of CATEGORIAS) pacote[categoria] = state[categoria];
        pacote.fontes = Object.entries(state.fontes).map(([id, f]) => ({ id, offset: f.offset }));

        const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "visao-do-oculto-dados.json";
        a.click();
        URL.revokeObjectURL(url);
    }, [state]);

    const exportarCategoria = useCallback((categoria: Categoria) => {
        const dados = state[categoria];
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${categoria}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [state]);

    const exportarArquivo = useCallback(async (nomeArquivo: string, categoria: Categoria) => {
        const key = `${categoria}:${nomeArquivo}`;
        const itens = await dbGet<unknown[]>("dados", key);
        if (!itens) return;
        const blob = new Blob([JSON.stringify(itens, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nomeArquivo;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return (
        <DataContext.Provider
            value={{
                ...state,
                entrarSemDados,
                status,
                importarJson,
                removerArquivo,
                limparCategoria,
                salvarFonte,
                removerFonte,
                getBlobUrlFonte,
                limparTudo,
                exportarPacote,
                exportarCategoria,
                exportarArquivo
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
    return ctx;
}