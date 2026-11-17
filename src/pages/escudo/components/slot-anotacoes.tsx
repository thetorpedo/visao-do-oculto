import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DadosAnotacoes {
    texto?: string;
    titulo?: string;
}

const TITULO_PADRAO = "Título da Anotação";

function baixarArquivoTexto(titulo: string, texto: string): void {
    const nome_base =
        titulo.replace(/[^\w\u00C0-\u017F\s-]/g, "").trim().replace(/\s+/g, "_") || "anotacoes";
    const url_arquivo = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
    const elemento_link = document.createElement("a");
    elemento_link.href = url_arquivo;
    elemento_link.download = `${nome_base}.txt`;
    elemento_link.click();
    URL.revokeObjectURL(url_arquivo);
}

interface SlotAnotacoesProps {
    dados?: DadosAnotacoes;
    onChange: (novos: DadosAnotacoes) => void;
}

export default function SlotAnotacoes({ dados, onChange }: SlotAnotacoesProps) {
    const texto_atual = dados?.texto ?? "";
    const titulo_atual = dados?.titulo ?? TITULO_PADRAO;

    const limparAnotacoes = () => {
        if (
            texto_atual.trim() &&
            window.confirm("Deseja realmente limpar todas as anotações desta aba?")
        ) {
            onChange({ ...dados, texto: "" });
        }
    };

    return (
        <div className="flex h-full min-h-0 select-text flex-col p-2.5 text-gray-900 sm:p-3 dark:text-zinc-100">
            <div className="mb-2 flex shrink-0 select-none items-center justify-between gap-2 border-b border-black/15 pb-2 dark:border-zinc-800">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <Input
                        value={titulo_atual}
                        onChange={(e) => onChange({ ...dados, titulo: e.target.value })}
                        onFocus={(e) => {
                            if (titulo_atual === TITULO_PADRAO) {
                                const el = e.currentTarget;
                                el.select();
                                requestAnimationFrame(() => el.select());
                            }
                        }}
                        placeholder="Título das anotações..."
                        className="h-6 px-0! border-transparent bg-transparent font-special text-sm font-bold focus-visible:border-black/30 focus-visible:ring-0 sm:text-base md:text-base dark:bg-transparent dark:focus-visible:border-emerald-500/50"
                    />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        variant="outline"
                        size="xs"
                        title="Baixar anotações como arquivo .txt"
                        onClick={() => baixarArquivoTexto(titulo_atual, texto_atual)}
                    >
                        <Download />
                        Baixar
                    </Button>

                    {texto_atual && (
                        <Button
                            variant="outline"
                            size="icon-xs"
                            title="Limpar texto"
                            onClick={limparAnotacoes}
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            </div>

            <textarea
                value={texto_atual}
                onChange={(e) => onChange({ ...dados, texto: e.target.value })}
                placeholder="Escreva aqui suas pistas, ideias, anotações de combate, segredos da investigação..."
                spellCheck={false}
                className="scrollbar-thin min-h-0 w-full flex-1 resize-none bg-transparent font-base text-xs leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm dark:text-zinc-200 dark:placeholder:text-zinc-600"
            />
        </div>
    );
}
