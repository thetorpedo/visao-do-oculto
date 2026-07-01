import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type EstadoFiltro = "neutro" | "incluir" | "excluir";
export type OperadorFiltro = "and" | "or";

export interface ConfigFiltro {
    id: string;           
    label: string;
    opcoes: string[] | "auto"; 
    match?: "exact" | "partial" | "array"; 
}

export interface FiltroAtivo {
    [filtroId: string]: {
        [opcao: string]: EstadoFiltro;
    };
}

export interface OperadoresAtivos {
    [filtroId: string]: OperadorFiltro;
}

function getValorCampo(item: Record<string, unknown>, caminho: string): unknown {
    return caminho.split(".").reduce<unknown>((obj, key) => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
            return (obj as Record<string, unknown>)[key];
        }
        return undefined;
    }, item);
}

function extrairOpcoes(dados: Record<string, unknown>[], caminho: string): string[] {
    const valores = new Set<string>();
    for (const item of dados) {
        const val = getValorCampo(item, caminho);
        if (Array.isArray(val)) {
            val.forEach(v => v && valores.add(String(v)));
        } else if (val !== null && val !== undefined) {
            valores.add(String(val));
        }
    }
    return Array.from(valores).sort();
}

function proximoEstado(atual: EstadoFiltro): EstadoFiltro {
    if (atual === "neutro") return "incluir";
    if (atual === "incluir") return "excluir";
    return "neutro";
}

function serializarFiltros(filtros: FiltroAtivo): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [filtroId, opcoes] of Object.entries(filtros)) {
        const partes: string[] = [];
        for (const [opcao, estado] of Object.entries(opcoes)) {
            if (estado === "incluir") partes.push(`+${opcao}`);
            if (estado === "excluir") partes.push(`-${opcao}`);
        }
        if (partes.length > 0) params[filtroId] = partes.join(",");
    }
    return params;
}

function deserializarFiltros(params: URLSearchParams, configs: ConfigFiltro[]): FiltroAtivo {
    const filtros: FiltroAtivo = {};
    for (const config of configs) {
        const valor = params.get(config.id);
        if (!valor) continue;
        filtros[config.id] = {};
        for (const parte of valor.split(",")) {
            const estado: EstadoFiltro = parte.startsWith("+") ? "incluir" : "excluir";
            const opcao = parte.slice(1);
            if (opcao) filtros[config.id][opcao] = estado;
        }
    }
    return filtros;
}

export function useFiltros<T extends Record<string, unknown>>(
    dados: T[],
    configs: ConfigFiltro[]
) {
    const [searchParams, setSearchParams] = useSearchParams();

    const busca = searchParams.get("busca") ?? "";

    const setBusca = useCallback((valor: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (valor) next.set("busca", valor);
            else next.delete("busca");
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const filtrosAtivos = useMemo(() => {
        return deserializarFiltros(searchParams, configs);
    }, [searchParams, configs]);

    const operadoresAtivos = useMemo<OperadoresAtivos>(() => {
        const ops: OperadoresAtivos = {};
        for (const config of configs) {
            const op = searchParams.get(`_op_${config.id}`);
            ops[config.id] = op === "and" ? "and" : "or";
        }
        return ops;
    }, [searchParams, configs]);

    const toggleOperador = useCallback((filtroId: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const opAtual = prev.get(`_op_${filtroId}`) === "and" ? "and" : "or";
            const novoOp = opAtual === "or" ? "and" : "or";

            if (novoOp === "and") next.set(`_op_${filtroId}`, "and");
            else next.delete(`_op_${filtroId}`);

            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const toggleFiltro = useCallback((filtroId: string, opcao: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const filtrosAtuais = deserializarFiltros(prev, configs);
            const estadoAtual = filtrosAtuais[filtroId]?.[opcao] ?? "neutro";
            const novoEstado = proximoEstado(estadoAtual);

            if (!filtrosAtuais[filtroId]) filtrosAtuais[filtroId] = {};
            filtrosAtuais[filtroId][opcao] = novoEstado;

            const temAtivo = Object.values(filtrosAtuais[filtroId]).some(e => e !== "neutro");
            if (!temAtivo) {
                delete filtrosAtuais[filtroId];
                next.delete(`_op_${filtroId}`); 
            }

            const serializado = serializarFiltros(filtrosAtuais);
            for (const [k, v] of Object.entries(serializado)) next.set(k, v);

            for (const config of configs) {
                if (!serializado[config.id]) next.delete(config.id);
            }

            return next;
        }, { replace: true });
    }, [setSearchParams, configs]);

    const limparFiltros = useCallback(() => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            for (const config of configs) {
                next.delete(config.id);
                next.delete(`_op_${config.id}`);
            }
            return next;
        }, { replace: true });
    }, [setSearchParams, configs]);

    const limparTudo = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    const opcoesResolvidas = useMemo(() => {
        return configs.map(config => ({
            ...config,
            opcoes: config.opcoes === "auto"
                ? extrairOpcoes(dados as Record<string, unknown>[], config.id)
                : config.opcoes,
        }));
    }, [configs, dados]);

    const dadosFiltrados = useMemo(() => {
        return dados.filter(item => {
            for (const config of configs) {
                const estados = filtrosAtivos[config.id];
                if (!estados) continue;

                const val = getValorCampo(item as Record<string, unknown>, config.id);
                const match = config.match ?? "exact";
                const operador = operadoresAtivos[config.id] || "or";

                const condicoesIncluir: boolean[] = [];
                const condicoesExcluir: boolean[] = [];

                for (const [opcao, estado] of Object.entries(estados)) {
                    if (estado === "neutro") continue;

                    let bate = false;
                    if (match === "partial") {
                        bate = typeof val === "string" && val.toLowerCase().includes(opcao.toLowerCase());
                    } else if (match === "array") {
                        bate = Array.isArray(val) && val.includes(opcao);
                    } else {
                        if (Array.isArray(val)) {
                            bate = val.map(String).includes(opcao);
                        } else {
                            bate = String(val ?? "") === opcao;
                        }
                    }

                    if (estado === "incluir") condicoesIncluir.push(bate);
                    if (estado === "excluir") condicoesExcluir.push(bate);
                }

                if (condicoesExcluir.some(bate => bate)) return false;

                if (condicoesIncluir.length > 0) {
                    if (operador === "and") {
                        if (!condicoesIncluir.every(bate => bate)) return false;
                    } else {
                        if (!condicoesIncluir.some(bate => bate)) return false;
                    }
                }
            }
            return true;
        });
    }, [dados, filtrosAtivos, configs, operadoresAtivos]);

    const temFiltroAtivo = useMemo(() => {
        return Object.values(filtrosAtivos).some(opcoes =>
            Object.values(opcoes).some(e => e !== "neutro")
        );
    }, [filtrosAtivos]);

    return {
        busca,
        setBusca,
        filtrosAtivos,
        operadoresAtivos,
        toggleOperador,
        toggleFiltro,
        limparFiltros,
        limparTudo,
        opcoesResolvidas,
        dadosFiltrados,
        temFiltroAtivo,
    };
}