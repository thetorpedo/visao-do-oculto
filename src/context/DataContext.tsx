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
    type Equipamento,
    type Origem,
    type Poder,
    type Ritual,
    type Trilha,
} from "@/lib/schemas";
import { z } from "zod";

// ─────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────

export type Categoria = "poderes" | "rituais" | "equipamentos" | "origens" | "trilhas";

export interface FonteConfig {
    id: string;
    offset: number;
    arquivo?: Blob;
    nomeArquivo?: string;
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
    fontes: Record<string, FonteConfig>;
    arquivosImportados: ArquivoImportado[];
}

interface DataContextValue extends DataState {
    status: "loading" | "empty" | "ready";
    importarJson: (categoria: Categoria, arquivo: File) => Promise<{ ok: boolean; itens: number; erros: number }>;
    removerArquivo: (nomeArquivo: string, categoria: Categoria) => Promise<void>;
    limparCategoria: (categoria: Categoria) => Promise<void>;
    salvarFonte: (config: FonteConfig, arquivo?: File) => Promise<void>;
    removerFonte: (id: string) => Promise<void>;
    getBlobUrlFonte: (id: string) => Promise<string | null>;
    limparTudo: () => Promise<void>;
    exportarPacote: () => Promise<void>;
}

// ─────────────────────────────────────────
// IndexedDB
// ─────────────────────────────────────────

const DB_NAME = "visao-do-oculto";
const DB_VERSION = 1;

function abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains("dados")) db.createObjectStore("dados");
            if (!db.objectStoreNames.contains("fontes")) db.createObjectStore("fontes");
            if (!db.objectStoreNames.contains("pdfs")) db.createObjectStore("pdfs");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbGet<T>(store: string, key: string): Promise<T | undefined> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
    });
}

async function dbSet(store: string, key: string, value: unknown): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function dbDelete(store: string, key: string): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function dbGetAllKeys(store: string): Promise<string[]> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAllKeys();
        req.onsuccess = () => resolve(req.result as string[]);
        req.onerror = () => reject(req.error);
    });
}

async function dbClear(store: string): Promise<void> {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
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
};

const CATEGORIAS: Categoria[] = ["poderes", "rituais", "equipamentos", "origens", "trilhas"];

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
        poderes: [], rituais: [], equipamentos: [], origens: [], trilhas: [],
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
        fontes: {},
        arquivosImportados: [],
    });

    const carregarTudo = useCallback(async () => {
        setStatus("loading");

        const novoState: DataState = {
            poderes: [],
            rituais: [],
            equipamentos: [],
            origens: [],
            trilhas: [],
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

        // 4. Configs padrão de fontes conhecidas (só preenche se ainda não existir)
        const FONTES_DEFAULT: Record<string, number> = {
            OPRPG: 10, SAH: 1, AS1: 0, AS2: 0, AS3: 0, AS4: 0, AS5: 0, AS6: 0,
        };
        for (const [id, offset] of Object.entries(FONTES_DEFAULT)) {
            if (!novoState.fontes[id]) {
                novoState.fontes[id] = { id, offset };
            }
        }

        const temDados = CATEGORIAS.some((c) => (novoState[c] as unknown[]).length > 0);
        setState(novoState);
        setStatus(temDados ? "ready" : "empty");
    }, []);

    useEffect(() => {
        carregarTudo();
    }, [carregarTudo]);

    // ── Importar JSON ──
    const importarJson = useCallback(async (
        categoria: Categoria,
        arquivo: File
    ): Promise<{ ok: boolean; itens: number; erros: number }> => {
        const texto = await arquivo.text();
        const json = JSON.parse(texto);
        const array = Array.isArray(json) ? json : Object.values(json).find(Array.isArray);
        if (!array) return { ok: false, itens: 0, erros: 0 };

        const schema = SCHEMAS[categoria];
        const validos: unknown[] = [];
        let erros = 0;

        for (const item of array as unknown[]) {
            const result = schema.safeParse(item);
            if (result.success) {
                validos.push(result.data);
            } else {
                erros++;
                console.warn(`Item inválido em ${categoria}:`, result.error.flatten());
            }
        }

        const key = `${categoria}:${arquivo.name}`;
        await dbSet("dados", key, validos);

        setState((prev) => {
            const jaExiste = prev.arquivosImportados.find(
                (a) => a.nome === arquivo.name && a.categoria === categoria
            );
            return {
                ...prev,
                [categoria]: [...(prev[categoria] as unknown[]), ...validos],
                arquivosImportados: jaExiste
                    ? prev.arquivosImportados.map((a) =>
                        a.nome === arquivo.name && a.categoria === categoria
                            ? { ...a, itens: validos.length }
                            : a
                    )
                    : [...prev.arquivosImportados, { nome: arquivo.name, categoria, itens: validos.length }],
            };
        });

        if (status === "empty" && validos.length > 0) setStatus("ready");
        return { ok: true, itens: validos.length, erros };
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
        // O DocumentReader tenta /files/ diretamente como fallback
        return null;
    }, []);

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

    return (
        <DataContext.Provider
            value={{
                ...state,
                status,
                importarJson,
                removerArquivo,
                limparCategoria,
                salvarFonte,
                removerFonte,
                getBlobUrlFonte,
                limparTudo,
                exportarPacote,
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