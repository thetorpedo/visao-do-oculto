import { Download, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DadosAnotacoes {
    texto?: string;
    titulo?: string;
}

const TITULO_PADRAO = "Anotações da Mesa";

function baixarTxt(titulo: string, texto: string) {
    const base = titulo.replace(/[^\w\u00C0-\u017F\s-]/g, "").trim().replace(/\s+/g, "_") || "anotacoes";
    const url = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${base}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

export default function SlotAnotacoes({
    dados,
    onChange,
}: {
    dados?: DadosAnotacoes;
    onChange: (novos: DadosAnotacoes) => void;
}) {
    const texto = dados?.texto ?? "";
    const titulo = dados?.titulo ?? TITULO_PADRAO;
    const linhas = texto ? texto.split("\n").length : 0;

    const limpar = () => {
        if (texto.trim() && window.confirm("Deseja realmente limpar todas as anotações desta aba?")) {
            onChange({ ...dados, texto: "" });
        }
    };

    return (
        <div className="flex h-full min-h-0 select-text flex-col p-2.5 text-gray-900 sm:p-3 dark:text-zinc-100">
            <div className="mb-2 flex shrink-0 select-none items-center justify-between gap-2 border-b border-black/15 pb-2 dark:border-zinc-800">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <FileText className="size-4 shrink-0 text-amber-700 dark:text-emerald-400" />
                    <Input
                        value={titulo}
                        onChange={(e) => onChange({ ...dados, titulo: e.target.value })}
                        placeholder="Título das anotações..."
                        className="h-6 border-transparent bg-transparent px-1 font-special text-xs font-bold uppercase tracking-wider focus-visible:border-black/30 focus-visible:ring-0 sm:text-sm dark:bg-transparent dark:focus-visible:border-emerald-500/50"
                    />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        variant="outline"
                        size="xs"
                        className="border-solid border-black/30 bg-white/70 uppercase tracking-wider hover:bg-white dark:border-emerald-500/60 dark:bg-[#181d1a] dark:text-emerald-300 dark:hover:bg-[#202723]"
                        title="Baixar anotações como arquivo .txt"
                        onClick={() => baixarTxt(titulo, texto)}
                    >
                        <Download />
                        Baixar .TXT
                    </Button>

                    {texto && (
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hover:text-red-700 dark:hover:text-red-400"
                            title="Limpar texto"
                            onClick={limpar}
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            </div>

            <textarea
                value={texto}
                onChange={(e) => onChange({ ...dados, texto: e.target.value })}
                placeholder="Escreva aqui suas pistas, ideias, anotações de combate, segredos da investigação..."
                spellCheck={false}
                className="scrollbar-thin min-h-0 w-full flex-1 resize-none bg-transparent font-daisy text-xs leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm dark:text-zinc-200 dark:placeholder:text-zinc-600"
            />

            <div className="mt-1 flex shrink-0 select-none items-center justify-between border-t border-black/10 pt-1.5 font-mono text-[10px] text-gray-500 dark:text-zinc-500">
                <span>Auto-salvo na mesa</span>
                <span>
                    {linhas} {linhas === 1 ? "linha" : "linhas"} • {texto.length} carac.
                </span>
            </div>
        </div>
    );
}
