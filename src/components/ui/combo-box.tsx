import { useEffect, useMemo, useRef, useState } from "react";

interface ComboBoxProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    opcoes: string[];
    placeholder?: string;
    className?: string;
}

/**
 * Input de texto livre + dropdown de sugestões vindas dos dados já cadastrados.
 * Permite digitar qualquer valor novo, mas sugere valores já existentes.
 */
export default function ComboBox({
    name,
    value,
    onChange,
    opcoes,
    placeholder,
    className,
}: ComboBoxProps) {
    const [aberto, setAberto] = useState(false);
    const [indiceAtivo, setIndiceAtivo] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const opcoesFiltradas = useMemo(() => {
        const termo = value.trim().toLowerCase();
        const unicas = Array.from(new Set(opcoes.filter(Boolean))).sort((a, b) =>
            a.localeCompare(b)
        );
        if (!termo) return unicas;
        return unicas.filter((o) => o.toLowerCase().includes(termo));
    }, [opcoes, value]);

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setAberto(false);
                setIndiceAtivo(-1);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    const selecionar = (opcao: string) => {
        onChange(name, opcao);
        setAberto(false);
        setIndiceAtivo(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!aberto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setAberto(true);
            return;
        }
        if (!aberto || opcoesFiltradas.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceAtivo((i) => (i + 1) % opcoesFiltradas.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceAtivo((i) => (i <= 0 ? opcoesFiltradas.length - 1 : i - 1));
        } else if (e.key === "Enter") {
            if (indiceAtivo >= 0) {
                e.preventDefault();
                selecionar(opcoesFiltradas[indiceAtivo]);
            } else {
                setAberto(false);
            }
        } else if (e.key === "Escape") {
            setAberto(false);
            setIndiceAtivo(-1);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                name={name}
                value={value}
                autoComplete="off"
                onChange={(e) => {
                    onChange(name, e.target.value);
                    setAberto(true);
                    setIndiceAtivo(-1);
                }}
                onFocus={() => setAberto(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
            />

            {aberto && opcoesFiltradas.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                    {opcoesFiltradas.map((opcao, idx) => (
                        <li key={opcao}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    // onMouseDown (não onClick) para disparar antes do blur/click-fora
                                    e.preventDefault();
                                    selecionar(opcao);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-200 ${idx === indiceAtivo ? "bg-gray-200" : ""
                                    }`}
                            >
                                {opcao}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Variante para campos multi-valor (CSV: "Sangue, Energia")
// Sugere com base no último token que está sendo digitado,
// e ao selecionar completa só esse token, mantendo os anteriores.
// ─────────────────────────────────────────

interface ComboBoxCsvProps {
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    opcoes: string[];
    placeholder?: string;
    className?: string;
}

export function ComboBoxCsv({
    name,
    value,
    onChange,
    opcoes,
    placeholder,
    className,
}: ComboBoxCsvProps) {
    const [aberto, setAberto] = useState(false);
    const [indiceAtivo, setIndiceAtivo] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // separa tudo antes da última vírgula (já "fechado") do token atual sendo digitado
    const tokens = value.split(",");
    const tokenAtual = tokens[tokens.length - 1].trim();
    const prefixoFechado = tokens.slice(0, -1);

    const opcoesFiltradas = useMemo(() => {
        const unicas = Array.from(new Set(opcoes.filter(Boolean))).sort((a, b) =>
            a.localeCompare(b)
        );
        const jaUsadas = new Set(
            prefixoFechado.map((t) => t.trim().toLowerCase()).filter(Boolean)
        );
        const termo = tokenAtual.toLowerCase();
        return unicas.filter(
            (o) => !jaUsadas.has(o.toLowerCase()) && (!termo || o.toLowerCase().includes(termo))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opcoes, tokenAtual, prefixoFechado.join("|")]);

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setAberto(false);
                setIndiceAtivo(-1);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    const selecionar = (opcao: string) => {
        const novoValor = [...prefixoFechado.map((t) => t.trim()), opcao].join(", ") + ", ";
        onChange(name, novoValor);
        setAberto(true); // mantém aberto para permitir continuar adicionando
        setIndiceAtivo(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!aberto || opcoesFiltradas.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceAtivo((i) => (i + 1) % opcoesFiltradas.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceAtivo((i) => (i <= 0 ? opcoesFiltradas.length - 1 : i - 1));
        } else if (e.key === "Enter" && indiceAtivo >= 0) {
            e.preventDefault();
            selecionar(opcoesFiltradas[indiceAtivo]);
        } else if (e.key === "Escape") {
            setAberto(false);
            setIndiceAtivo(-1);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                name={name}
                value={value}
                autoComplete="off"
                onChange={(e) => {
                    onChange(name, e.target.value);
                    setAberto(true);
                    setIndiceAtivo(-1);
                }}
                onFocus={() => setAberto(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
            />

            {aberto && opcoesFiltradas.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border-2 border-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                    {opcoesFiltradas.map((opcao, idx) => (
                        <li key={opcao}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selecionar(opcao);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-200 ${idx === indiceAtivo ? "bg-gray-200" : ""
                                    }`}
                            >
                                {opcao}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <p className="text-[10px] text-gray-500 mt-0.5">
                Separe múltiplos valores por vírgula — o dropdown sugere com base no já cadastrado.
            </p>
        </div>
    );
}