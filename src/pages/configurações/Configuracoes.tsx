import { useRef, useState } from "react";
import { Download, FileJson, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { useData, type Categoria, type FonteConfig } from "@/context/DataContext";
import { baixarTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import PaperDiv from "@/components/ui/paper-div";

const CATEGORIES: { id: Categoria; label: string }[] = [
    { id: "poderes", label: "Poderes" },
    { id: "rituais", label: "Rituais" },
    { id: "equipamentos", label: "Equipamentos" },
    { id: "origens", label: "Origens" },
    { id: "trilhas", label: "Trilhas" },
    { id: "regras", label: "Regras" },
];

function JsonSection() {
    const { arquivosImportados, importarJson, removerArquivo, limparCategoria, exportarArquivo, exportarCategoria } = useData();
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    const handleImport = async (category: Categoria, files: File | File[]) => {
        setIsLoading(category);
        const result = await importarJson(category, files);

        setFeedback(prev => ({
            ...prev,
            [category]: result.ok
                ? `✓ ${result.itens} itens importados${result.erros > 0 ? ` (${result.erros} com erro)` : ""}`
                : "Erro ao importar arquivo."
        }));
        setIsLoading(null);
    };

    return (
        <div className="space-y-8">
            {CATEGORIES.map(cat => {
                const files = arquivosImportados.filter(a => a.categoria === cat.id);

                return (
                    <PaperDiv key={cat.id}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-special uppercase tracking-wide text-gray-900">{cat.label}</h3>
                            <div className="flex gap-2 flex-wrap justify-end">
                                <input
                                    ref={el => { inputRefs.current[cat.id] = el; }}
                                    type="file"
                                    accept=".json"
                                    multiple
                                    className="hidden"
                                    onChange={e => {
                                        const selectedFiles = Array.from(e.target.files ?? []);
                                        if (selectedFiles.length > 0) handleImport(cat.id, selectedFiles);
                                        e.target.value = "";
                                    }}
                                />
                                <Button
                                    onClick={() => inputRefs.current[cat.id]?.click()}
                                    disabled={isLoading === cat.id}
                                    variant='default'
                                    size='sm'
                                >
                                    <Plus className="size-3" />
                                    Adicionar JSON
                                </Button>
                                <Button
                                    onClick={() => exportarCategoria(cat.id)}
                                    variant='outline'
                                    size='sm'
                                >
                                    <Download className="size-3" /> Exportar
                                </Button>
                                <Button
                                    onClick={() => baixarTemplate(cat.id)}
                                    variant='outline'
                                    size='sm'
                                >
                                    <FileJson className="size-3" /> Template
                                </Button>

                                {files.length > 0 && (
                                    <Button
                                        onClick={() => limparCategoria(cat.id)}
                                        variant='destructive'
                                        size='sm'
                                    >
                                        <Trash2 className="size-3" />
                                        Limpar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {feedback[cat.id] && (
                            <p className="text-xs text-green-700 font-bold mb-2">{feedback[cat.id]}</p>
                        )}

                        {files.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Nenhum arquivo importado.</p>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {files.map(file => (
                                    <div key={file.nome} className="flex items-center justify-between bg-white/60 border border-gray-300 px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <FileJson className="size-3.5 text-gray-500 shrink-0" />
                                            <span className="text-sm font-medium text-gray-800">{file.nome}</span>
                                            <span className="text-xs text-gray-400">({file.itens} itens)</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button
                                                onClick={() => exportarArquivo(file.nome, file.categoria)}
                                                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                                title="Baixar este arquivo"
                                            >
                                                <Download className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => removerArquivo(file.nome, file.categoria)}
                                                className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors"
                                                title="Remover"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </PaperDiv>
                );
            })}
        </div>
    );
}

function SourcesSection() {
    const { fontes, salvarFonte, removerFonte } = useData();
    const [newSource, setNewSource] = useState<Partial<FonteConfig>>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editOffset, setEditOffset] = useState<number>(0);

    const inputPdfRef = useRef<HTMLInputElement | null>(null);
    const inputPdfEditRef = useRef<Record<string, HTMLInputElement | null>>({});

    const handleSaveNew = async () => {
        if (!newSource.id) return;
        const file = inputPdfRef.current?.files?.[0];
        const type: "dados" | "visual" = file?.name.match(/\.(png|jpg|jpeg)$/i) ? "visual" : "dados";

        await salvarFonte(
            { id: newSource.id, offset: newSource.offset ?? 0, tipo: type, nomeArquivo: file?.name },
            file
        );

        setNewSource({});
        if (inputPdfRef.current) inputPdfRef.current.value = "";
    };

    const handleSaveEdit = async (id: string) => {
        const file = inputPdfEditRef.current[id]?.files?.[0];
        await salvarFonte(
            { ...fontes[id], offset: editOffset, nomeArquivo: file?.name ?? fontes[id].nomeArquivo },
            file
        );
        setEditingId(null);
    };

    const handleDownloadSource = async (source: FonteConfig) => {
        if (!source.nomeArquivo) return;
        const a = document.createElement("a");
        a.href = `/files/${source.nomeArquivo}`;
        a.download = source.nomeArquivo;
        a.click();
    };

    const sortedSources = Object.values(fontes).sort((a, b) => a.id.localeCompare(b.id));
    const pdfSources = sortedSources.filter(f => f.tipo === "dados");
    const imageSources = sortedSources.filter(f => f.tipo === "visual");

    const renderSource = (source: FonteConfig) => (
        <div key={source.id} className="border border-gray-300 bg-white/40 px-4 py-3 mb-2">
            {editingId === source.id ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {source.tipo === "dados" && (
                            <div>
                                <label className="text-xs font-special uppercase text-gray-600 block mb-1">Offset de Páginas</label>
                                <input
                                    type="number"
                                    value={editOffset}
                                    onChange={e => setEditOffset(parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-400 bg-white/60 px-2 py-1.5 text-sm outline-none"
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-special uppercase text-gray-600 block mb-1">
                                Novo arquivo (opcional)
                            </label>
                            <input
                                ref={el => { inputPdfEditRef.current[source.id] = el; }}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:border file:border-gray-400 file:bg-gray-100 file:text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit(source.id)} size="sm">
                            Salvar
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                            Cancelar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-4 text-gray-500 shrink-0" />
                        <span className="font-special font-bold text-gray-900 shrink-0">
                            {source.label ?? source.id}
                        </span>
                        {source.tipo === "dados" && (
                            <span className="text-xs text-gray-400">offset: {source.offset}</span>
                        )}
                        {source.nomeArquivo ? (
                            <span className="text-xs text-gray-500 truncate">{source.nomeArquivo}</span>
                        ) : (
                            <span className="text-xs text-amber-600 italic">sem arquivo</span>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => { setEditingId(source.id); setEditOffset(source.offset); }}
                            className="text-xs font-special uppercase cursor-pointer text-gray-600 hover:text-gray-900 border border-gray-300 px-2 py-0.5 hover:border-gray-600"
                        >
                            Editar
                        </button>
                        {source.nomeArquivo && (
                            <button
                                onClick={() => handleDownloadSource(source)}
                                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                title="Baixar arquivo"
                            >
                                <Download className="size-4" />
                            </button>
                        )}
                        <button
                            onClick={() => removerFonte(source.id)}
                            className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <PaperDiv>
                <h3 className="font-special uppercase tracking-wide text-gray-900 mb-3 flex items-center gap-2">
                    <Plus className="size-4" /> Adicionar Fonte
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-special uppercase text-gray-600 block mb-1">ID da Fonte</label>
                        <input
                            type="text"
                            placeholder="Ex: AS7"
                            value={newSource.id ?? ""}
                            onChange={e => setNewSource(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                            className="w-full border border-gray-400 bg-white/60 px-2 py-1.5 text-sm outline-none font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-special uppercase text-gray-600 block mb-1">Offset de Páginas <span className="normal-case text-gray-400">(só PDFs)</span></label>
                        <input
                            type="number"
                            placeholder="0"
                            value={newSource.offset ?? ""}
                            onChange={e => setNewSource(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
                            className="w-full border border-gray-400 bg-white/60 px-2 py-1.5 text-sm outline-none font-medium"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-xs font-special uppercase text-gray-600 block mb-1">
                            Arquivo <span className="normal-case text-gray-400">(PDF ou imagem — detectado automaticamente)</span>
                        </label>
                        <input
                            ref={inputPdfRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:border file:border-gray-400 file:bg-gray-100 file:text-xs file:font-special file:uppercase"
                        />
                    </div>
                </div>
                <Button
                    onClick={handleSaveNew}
                    disabled={!newSource.id}
                    size='sm'
                    className="mt-3 w-fit"
                >
                    <Upload className="size-3 mr-2" /> Salvar Fonte
                </Button>
            </PaperDiv>

            {sortedSources.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma fonte configurada.</p>
            ) : (
                <PaperDiv>
                    {pdfSources.length > 0 && (
                        <>
                            <p className="font-special text-xs uppercase text-gray-500 tracking-wider mb-1">PDFs</p>
                            {pdfSources.map(renderSource)}
                        </>
                    )}
                    {imageSources.length > 0 && (
                        <>
                            <p className={`font-special text-xs uppercase text-gray-500 tracking-wider mb-1 ${pdfSources.length > 0 ? "mt-3" : ""}`}>Imagens</p>
                            {imageSources.map(renderSource)}
                        </>
                    )}
                </PaperDiv>
            )}
        </div>
    );
}

export default function Configuracoes() {
    const { limparTudo, exportarPacote, poderes, rituais, equipamentos, origens, trilhas, importarJson } = useData();
    const [activeTab, setActiveTab] = useState<"jsons" | "fontes">("jsons");
    const [confirmClear, setConfirmClear] = useState(false);

    const totalItems = poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length;

    return (
        <div className="space-y-6 mx-auto">
            <PaperDiv className="p-6!">
                <h2 className="font-special text-2xl uppercase tracking-wider text-gray-900 mb-1">Configurações</h2>
                <p className="text-sm text-gray-600">{totalItems} registros carregados no total.</p>
            </PaperDiv>

            <div className="flex flex-row justify-between">
                <div className="flex gap-2">
                    <Button
                        onClick={() => setActiveTab("jsons")}
                        variant={activeTab === "jsons" ? 'default' : 'secondary'}
                    >
                        Dados JSON
                    </Button>
                    <Button
                        onClick={() => setActiveTab("fontes")}
                        variant={activeTab === "fontes" ? 'default' : 'secondary'}
                    >
                        Fontes & PDFs
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant='default' className="uppercase relative">
                        <Upload className="size-4 mr-2" />
                        Importar JSON geral
                        <input
                            type="file"
                            accept=".json"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={async e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    await importarJson(null, file);
                                    alert("Pacote importado com sucesso!");
                                }
                                e.target.value = '';
                            }}
                        />
                    </Button>

                    <Button onClick={exportarPacote} variant='secondary' className="uppercase">
                        <Download className="size-4 mr-2" />
                        Exportar tudo
                    </Button>

                    {!confirmClear ? (
                        <Button onClick={() => setConfirmClear(true)} variant='destructive' className="uppercase">
                            <Trash2 className="size-4 mr-2" />
                            Limpar tudo
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-red-700 font-special">Tem certeza?</span>
                            <Button
                                onClick={async () => { await limparTudo(); setConfirmClear(false); }}
                                variant="destructive"
                            >
                                Sim, limpar
                            </Button>
                            <Button
                                onClick={() => setConfirmClear(false)}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {activeTab === "jsons" ? <JsonSection /> : <SourcesSection />}
        </div>
    );
}