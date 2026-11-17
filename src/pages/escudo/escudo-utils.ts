import type { FocusEvent } from "react";

export function normalizarTexto(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function removerMarkdown(texto: string): string {
    return texto.replace(/[*_#]/g, "");
}

export function tratarSubstituicaoZero(novo_texto: string, texto_anterior: string): string {
    let valor_formatado = novo_texto.trim();

    if (texto_anterior === "0") {
        if (/^[+-]?[1-9]0$/.test(valor_formatado)) {
            valor_formatado = valor_formatado.slice(0, -1);
        } else if (/^[+-]?0[0-9]+$/.test(valor_formatado)) {
            valor_formatado = valor_formatado.replace(/^([+-]?)0+/, "$1") || "0";
        }
    } else if (/^[+-]?0[0-9]+$/.test(valor_formatado)) {
        valor_formatado = valor_formatado.replace(/^([+-]?)0+/, "$1") || "0";
    }

    return valor_formatado;
}

export function selecionarAoFocar(evento: FocusEvent<HTMLInputElement>): void {
    const elemento = evento.currentTarget;
    elemento.select();
    requestAnimationFrame(() => elemento.select());
}
