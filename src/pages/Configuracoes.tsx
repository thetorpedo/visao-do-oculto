import { useData, type Categoria, type FonteConfig } from "@/context/DataContext";
import { baixarTemplate } from "@/lib/templates";
import { Download, FileJson, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const CATEGORIAS: { id: Categoria; label: string }[] = [
    { id: "poderes", label: "Poderes" },
    { id: "rituais", label: "Rituais" },
    { id: "equipamentos", label: "Equipamentos" },
    { id: "origens", label: "Origens" },
    { id: "trilhas", label: "Trilhas" },
    { id: "regras", label: "Regras" },
];

function SecaoJsons() {
    const { arquivosImportados, importarJson, removerArquivo, limparCategoria, exportarArquivo, exportarCategoria } = useData();
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [carregando, setCarregando] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    const handleImportar = async (categoria: Categoria, arquivos: File | File[]) => {
        setCarregando(categoria);
        const resultado = await importarJson(categoria, arquivos);
        setFeedback(prev => ({
            ...prev,
            [categoria]: resultado.ok
                ? `✓ ${resultado.itens} itens importados${resultado.erros > 0 ? ` (${resultado.erros} com erro)` : ""}`
                : "Erro ao importar arquivo."
        }));
        setCarregando(null);
    };

    return (
        <div className="space-y-4">
            {CATEGORIAS.map(cat => {
                const arquivos = arquivosImportados.filter(a => a.categoria === cat.id);

                return (
                    <div key={cat.id} className="relative">
                        <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
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
                                            const arquivos = Array.from(e.target.files ?? []);
                                            if (arquivos.length > 0) handleImportar(cat.id, arquivos);
                                            e.target.value = "";
                                        }}
                                    />
                                    <button
                                        onClick={() => inputRefs.current[cat.id]?.click()}
                                        disabled={carregando === cat.id}
                                        className="flex items-center cursor-pointer gap-1.5 px-2 py-1 text-xs font-special uppercase border border-gray-800 bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        <Plus className="size-3" />
                                        Adicionar JSON
                                    </button>
                                    <button onClick={() => exportarCategoria(cat.id)}
                                        className="flex items-center cursor-pointer gap-1.5 px-2 py-1 text-xs font-special uppercase border border-gray-600 text-gray-600 hover:bg-gray-100">
                                        <Download className="size-3" /> Exportar
                                    </button>
                                    <button onClick={() => baixarTemplate(cat.id)}
                                        className="flex items-center cursor-pointer gap-1.5 px-2 py-1 text-xs font-special uppercase border border-gray-600 text-gray-600 hover:bg-gray-100">
                                        <FileJson className="size-3" /> Template
                                    </button>
                                    {arquivos.length > 0 && (
                                        <button
                                            onClick={() => limparCategoria(cat.id)}
                                            className="flex items-center cursor-pointer gap-1.5 px-2 py-1 text-xs font-special uppercase border border-red-700 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="size-3" />
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {feedback[cat.id] && (
                                <p className="text-xs text-green-700 font-bold mb-2">{feedback[cat.id]}</p>
                            )}

                            {arquivos.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Nenhum arquivo importado.</p>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {arquivos.map(arquivo => (
                                        <div key={arquivo.nome} className="flex items-center justify-between bg-white/60 border border-gray-300 px-3 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <FileJson className="size-3.5 text-gray-500 shrink-0" />
                                                <span className="text-sm font-medium text-gray-800">{arquivo.nome}</span>
                                                <span className="text-xs text-gray-400">({arquivo.itens} itens)</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={() => exportarArquivo(arquivo.nome, arquivo.categoria)}
                                                    className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                                    title="Baixar este arquivo"
                                                >
                                                    <Download className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => removerArquivo(arquivo.nome, arquivo.categoria)}
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
                        </div>
                        <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.25deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
                    </div>
                );
            })}
        </div>
    );
}

function SecaoFontes() {
    const { fontes, salvarFonte, removerFonte } = useData();
    const [novaFonte, setNovaFonte] = useState<Partial<FonteConfig>>({});
    const [editando, setEditando] = useState<string | null>(null);
    const [editOffset, setEditOffset] = useState<number>(0);
    const inputPdfRef = useRef<HTMLInputElement | null>(null);
    const inputPdfEditRef = useRef<Record<string, HTMLInputElement | null>>({});

    const handleSalvarNova = async () => {
        if (!novaFonte.id) return;
        const arquivo = inputPdfRef.current?.files?.[0];
        const tipo: "dados" | "visual" = arquivo?.name.match(/\.(png|jpg|jpeg)$/i) ? "visual" : "dados";
        await salvarFonte(
            { id: novaFonte.id, offset: novaFonte.offset ?? 0, tipo, nomeArquivo: arquivo?.name },
            arquivo
        );
        setNovaFonte({});
        if (inputPdfRef.current) inputPdfRef.current.value = "";
    };

    const handleSalvarEdicao = async (id: string) => {
        const arquivo = inputPdfEditRef.current[id]?.files?.[0];
        await salvarFonte(
            { ...fontes[id], offset: editOffset, nomeArquivo: arquivo?.name ?? fontes[id].nomeArquivo },
            arquivo
        );
        setEditando(null);
    };

    const handleBaixarFonte = async (fonte: FonteConfig) => {
        if (!fonte.nomeArquivo) return;
        const a = document.createElement("a");
        a.href = `/files/${fonte.nomeArquivo}`;
        a.download = fonte.nomeArquivo;
        a.click();
    };

    const fontesOrdenadas = Object.values(fontes).sort((a, b) => a.id.localeCompare(b.id));
    const fontesPdf = fontesOrdenadas.filter(f => f.tipo === "dados");
    const fontesImagem = fontesOrdenadas.filter(f => f.tipo === "visual");

    const renderFonte = (fonte: FonteConfig) => (
        <div key={fonte.id} className="border border-gray-300 bg-white/40 px-4 py-3">
            {editando === fonte.id ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fonte.tipo === "dados" && (
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
                                ref={el => { inputPdfEditRef.current[fonte.id] = el; }}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:border file:border-gray-400 file:bg-gray-100 file:text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSalvarEdicao(fonte.id)}
                            className="px-3 cursor-pointer py-1 text-xs font-special uppercase border border-gray-800 bg-gray-800 text-white hover:bg-gray-700">
                            Salvar
                        </button>
                        <button onClick={() => setEditando(null)}
                            className="px-3 cursor-pointer py-1 text-xs font-special uppercase border border-gray-400 text-gray-600 hover:bg-gray-100">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-4 text-gray-500 shrink-0" />
                        <span className="font-special font-bold text-gray-900 shrink-0">
                            {fonte.label ?? fonte.id}
                        </span>
                        {fonte.tipo === "dados" && (
                            <span className="text-xs text-gray-400">offset: {fonte.offset}</span>
                        )}
                        {fonte.nomeArquivo ? (
                            <span className="text-xs text-gray-500 truncate">{fonte.nomeArquivo}</span>
                        ) : (
                            <span className="text-xs text-amber-600 italic">sem arquivo</span>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">

                        <button
                            onClick={() => { setEditando(fonte.id); setEditOffset(fonte.offset); }}
                            className="text-xs font-special uppercase cursor-pointer text-gray-600 hover:text-gray-900 border border-gray-300 px-2 py-0.5 hover:border-gray-600"
                        >
                            Editar
                        </button>
                        {fonte.nomeArquivo && (
                            <button
                                onClick={() => handleBaixarFonte(fonte)}
                                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                title="Baixar arquivo"
                            >
                                <Download className="size-4" />
                            </button>
                        )}
                        <button
                            onClick={() => removerFonte(fonte.id)}
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
        <div className="space-y-4">
            <div className="relative">
                <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                    <h3 className="font-special uppercase tracking-wide text-gray-900 mb-3 flex items-center gap-2">
                        <Plus className="size-4" /> Adicionar Fonte
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-special uppercase text-gray-600 block mb-1">ID da Fonte</label>
                            <input
                                type="text"
                                placeholder="Ex: AS7"
                                value={novaFonte.id ?? ""}
                                onChange={e => setNovaFonte(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                                className="w-full border border-gray-400 bg-white/60 px-2 py-1.5 text-sm outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-special uppercase text-gray-600 block mb-1">Offset de Páginas <span className="normal-case text-gray-400">(só PDFs)</span></label>
                            <input
                                type="number"
                                placeholder="0"
                                value={novaFonte.offset ?? ""}
                                onChange={e => setNovaFonte(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
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
                    <button
                        onClick={handleSalvarNova}
                        disabled={!novaFonte.id}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 w-fit cursor-pointer text-xs font-special uppercase border border-gray-800 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-20"
                    >
                        <Upload className="size-3" /> Salvar Fonte
                    </button>
                </div>
                <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.25deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>

            {fontesOrdenadas.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma fonte configurada.</p>
            ) : (
                <div className="relative">
                    <div className="relative flex flex-col z-10 w-full p-5 gap-2 shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                        {fontesPdf.length > 0 && (
                            <>
                                <p className="font-special text-xs uppercase text-gray-500 tracking-wider mb-1">PDFs</p>
                                {fontesPdf.map(renderFonte)}
                            </>
                        )}
                        {fontesImagem.length > 0 && (
                            <>
                                <p className={`font-special text-xs uppercase text-gray-500 tracking-wider mb-1 ${fontesPdf.length > 0 ? "mt-3" : ""}`}>Imagens</p>
                                {fontesImagem.map(renderFonte)}
                            </>
                        )}
                    </div>
                    <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.25deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
                </div>
            )}
        </div>
    );
}

export default function Configuracoes() {
    const { limparTudo, exportarPacote, poderes, rituais, equipamentos, origens, trilhas, importarJson } = useData();
    const [aba, setAba] = useState<"jsons" | "fontes">("jsons");
    const [confirmarLimpar, setConfirmarLimpar] = useState(false);

    const totalItens = poderes.length + rituais.length + equipamentos.length + origens.length + trilhas.length;

    return (
        <div className="space-y-6 mx-auto">
            <div className="relative">
                <div className="relative z-10 p-6 shadow-2xl bg-[url(/assets/paper.png)] bg-repeat bg-size-[30%]">
                    <h2 className="font-special text-2xl uppercase tracking-wider text-gray-900 mb-1">Configurações</h2>
                    <p className="text-sm text-gray-600">{totalItens} registros carregados no total.</p>
                </div>
                <div className="absolute top-1/2 left-1/2 z-0! h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[-0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setAba("jsons")}
                    className={`px-4 pt-1.5 pb-0.5 text-sm cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${aba === "jsons" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
                >
                    Dados JSON
                </button>
                <button
                    onClick={() => setAba("fontes")}
                    className={`px-4 pt-1.5 pb-0.5 text-sm cursor-pointer font-special uppercase tracking-wider transition-colors border-2 border-gray-800 ${aba === "fontes" ? "bg-gray-800 text-white" : "bg-white/40 text-gray-800 hover:bg-white/80"}`}
                >
                    Fontes & PDFs
                </button>
            </div>

            {aba === "jsons" ? <SecaoJsons /> : <SecaoFontes />}

            <div className="pt-2 flex flex-wrap gap-3">
                <label className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-special uppercase tracking-wide border-2 border-gray-800 bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
                    <Upload className="size-4" />
                    Importar JSON geral
                    <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={async e => {
                            const arquivo = e.target.files?.[0];
                            if (arquivo) {
                                await importarJson(null, arquivo);
                                alert("Pacote importado com sucesso!");
                            }
                            e.target.value = '';
                        }}
                    />
                </label>
                <button
                    onClick={exportarPacote}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-special uppercase tracking-wide border-2 border-gray-800 bg-white text-gray-800 hover:bg-gray-100"
                >
                    <Download className="size-4" />
                    Exportar tudo
                </button>

                {!confirmarLimpar ? (
                    <button
                        onClick={() => setConfirmarLimpar(true)}
                        className="flex items-center gap-2 cursor-pointer bg-gray-900 text-white border-white px-4 py-2 text-sm font-special uppercase tracking-wide border-2 hover:bg-red-900"
                    >
                        <Trash2 className="size-4" />
                        Limpar tudo
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-red-700 font-special">Tem certeza?</span>
                        <button
                            onClick={async () => { await limparTudo(); setConfirmarLimpar(false); }}
                            className="px-3 py-1.5 text-sm font-special uppercase border-2 border-red-700 bg-red-700 text-white hover:bg-red-800"
                        >
                            Sim, limpar
                        </button>
                        <button
                            onClick={() => setConfirmarLimpar(false)}
                            className="px-3 py-1.5 text-sm font-special uppercase border-2 border-gray-400 text-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}