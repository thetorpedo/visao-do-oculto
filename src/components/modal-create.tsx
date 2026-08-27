import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { useData, type Categoria } from "@/context/DataContext";
import ComboBox, { ComboBoxCsv } from "@/components/combo-box";

// ─────────────────────────────────────────
// Helpers de normalização
// ─────────────────────────────────────────

// "" -> null, senão mantém a string (usado em campos nullable do schema)
const vazioParaNull = (v: string) => (v.trim() === "" ? null : v);

// "a, b, c" -> ["a", "b", "c"] (usado em campos array de string do schema)
const csvParaArray = (v: string) =>
    v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

type Aprimoramento = { nome: string; custo: string; descricao: string };

// Estado inicial por categoria — só os campos que aquele schema realmente tem
function estadoInicial(categoria: Categoria): any {
    const base = { nome: "", descricao: "", fonteLivro: "Homebrew", fontePagina: "1" };

    switch (categoria) {
        case "poderes":
            return {
                ...base,
                tipo: "Geral",
                elemento: "",
                preRequisitos: "",
                afinidade: "",
            };
        case "equipamentos":
            return {
                ...base,
                tipo: "", // csv -> array
                subtipo: "",
                categoria: "",
                espaco: "",
                elemento: "",
                dano: "",
                critico: "",
                alcance: "",
                tipoDano: "",
                temArma: false,
                armaTipo: "",
                empunhadura: "",
                catArma: "",
                municao: "",
            };
        case "origens":
            return {
                ...base,
                pericias: "",
                tecnicaNome: "",
                tecnicaDescricao: "",
            };
        case "rituais":
            return {
                ...base,
                elemento: "", // csv -> array (min 1)
                circulo: "1",
                execucao: "",
                alcance: "",
                alvo: "",
                area: "",
                duracao: "",
                resistencia: "",
                aprimoramentos: [] as Aprimoramento[],
            };
        case "trilhas":
            return {
                ...base,
                tipo: "",
                especial: "",
                nex10: "",
                nex40: "",
                nex65: "",
                nex99: "",
            };
        case "regras":
            return {
                ...base,
                categoria: "", // csv -> array (min 1)
            };
    }
}

// Monta o objeto final no formato exato que cada Zod schema espera
function montarPayload(categoria: Categoria, f: any) {
    const comum = {
        nome: f.nome,
        descricao: f.descricao,
        fonteLivro: f.fonteLivro || "Homebrew",
        fontePagina: f.fontePagina || "1",
    };

    switch (categoria) {
        case "poderes":
            return {
                ...comum,
                tipo: f.tipo,
                elemento: vazioParaNull(f.elemento),
                preRequisitos: vazioParaNull(f.preRequisitos),
                afinidade: vazioParaNull(f.afinidade),
            };

        case "equipamentos":
            return {
                ...comum,
                tipo: csvParaArray(f.tipo),
                subtipo: vazioParaNull(f.subtipo),
                categoria: vazioParaNull(f.categoria),
                espaco: f.espaco === "" ? null : Number(f.espaco),
                elemento: vazioParaNull(f.elemento),
                dano: vazioParaNull(f.dano),
                critico: vazioParaNull(f.critico),
                alcance: vazioParaNull(f.alcance),
                tipoDano: vazioParaNull(f.tipoDano),
                arma: f.temArma
                    ? {
                        armaTipo: f.armaTipo,
                        empunhadura: vazioParaNull(f.empunhadura),
                        catArma: vazioParaNull(f.catArma),
                        municao: vazioParaNull(f.municao),
                    }
                    : null,
            };

        case "origens":
            return {
                ...comum,
                pericias: f.pericias,
                tecnicaNome: f.tecnicaNome,
                tecnicaDescricao: f.tecnicaDescricao,
            };

        case "rituais":
            return {
                ...comum,
                elemento: csvParaArray(f.elemento),
                circulo: Number(f.circulo),
                execucao: f.execucao,
                alcance: f.alcance,
                alvo: vazioParaNull(f.alvo),
                area: vazioParaNull(f.area),
                duracao: vazioParaNull(f.duracao),
                resistencia: vazioParaNull(f.resistencia),
                aprimoramentos:
                    f.aprimoramentos && f.aprimoramentos.length > 0 ? f.aprimoramentos : null,
            };

        case "trilhas":
            return {
                ...comum,
                tipo: f.tipo,
                especial: vazioParaNull(f.especial),
                nex10: f.nex10,
                nex40: f.nex40,
                nex65: vazioParaNull(f.nex65),
                nex99: vazioParaNull(f.nex99),
            };

        case "regras":
            return {
                ...comum,
                categoria: csvParaArray(f.categoria),
            };
    }
}

// ─────────────────────────────────────────
// Componentes de campo (evita repetição de classes)
// ─────────────────────────────────────────

function Campo({
    label,
    children,
    span2,
}: {
    label: string;
    children: React.ReactNode;
    span2?: boolean;
}) {
    return (
        <div className={span2 ? "md:col-span-2" : ""}>
            <label className="text-[10px] uppercase tracking-wide text-gray-600 block mb-0.5">
                {label}
            </label>
            {children}
        </div>
    );
}

// Cabeçalho de seção — separa visualmente os grupos de campos sem pesar o layout
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-blur uppercase tracking-wider text-white bg-gray-950/90 px-2 border-gray-400 py-1">
                {titulo}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">{children}</div>
        </div>
    );
}

// Classe compacta para inputs/selects/comboboxes
const inputCls =
    "w-full px-2 py-1 text-sm outline-none focus:border-gray-900 bg-gray-600/10 border-2 border-dashed border-gray-400/50";

// Classe compacta para textareas
const textareaCls =
    "w-full px-2 py-1 text-sm outline-none focus:border-gray-900 bg-gray-600/10 border-2 border-dashed border-gray-400/50 resize-y";

function itemParaForm(categoria: Categoria, item: any): any {
    const base = {
        nome: item.nome ?? "",
        descricao: item.descricao ?? "",
        fonteLivro: item.fonteLivro ?? "Homebrew",
        fontePagina: item.fontePagina ?? "1",
    };

    switch (categoria) {
        case "poderes":
            return { ...base, tipo: item.tipo ?? "Geral", elemento: item.elemento ?? "", preRequisitos: item.preRequisitos ?? "", afinidade: item.afinidade ?? "" };
        case "equipamentos":
            return { ...base, tipo: (item.tipo ?? []).join(", "), subtipo: item.subtipo ?? "", categoria: item.categoria ?? "", espaco: item.espaco ?? "", elemento: item.elemento ?? "", dano: item.dano ?? "", critico: item.critico ?? "", alcance: item.alcance ?? "", tipoDano: item.tipoDano ?? "", temArma: !!item.arma, armaTipo: item.arma?.armaTipo ?? "", empunhadura: item.arma?.empunhadura ?? "", catArma: item.arma?.catArma ?? "", municao: item.arma?.municao ?? "" };
        case "origens":
            return { ...base, pericias: item.pericias ?? "", tecnicaNome: item.tecnicaNome ?? "", tecnicaDescricao: item.tecnicaDescricao ?? "" };
        case "rituais":
            return { ...base, elemento: (item.elemento ?? []).join(", "), circulo: String(item.circulo ?? 1), execucao: item.execucao ?? "", alcance: item.alcance ?? "", alvo: item.alvo ?? "", area: item.area ?? "", duracao: item.duracao ?? "", resistencia: item.resistencia ?? "", aprimoramentos: item.aprimoramentos ?? [] };
        case "trilhas":
            return { ...base, tipo: item.tipo ?? "", especial: item.especial ?? "", nex10: item.nex10 ?? "", nex40: item.nex40 ?? "", nex65: item.nex65 ?? "", nex99: item.nex99 ?? "" };
        case "regras":
            return { ...base, categoria: (item.categoria ?? []).join(", ") };
        default:
            return base;
    }
}

export default function ModalCriarRegistro({
    categoria,
    itemInicial,
    onClose,
}: {
    categoria: Categoria;
    itemInicial?: any;
    onClose: () => void;
}) {
    const dataCtx = useData();
    const { salvarRegistro } = dataCtx;
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [formData, setFormData] = useState<any>(() =>
        itemInicial ? itemParaForm(categoria, itemInicial) : estadoInicial(categoria)
    );

    // Coleta valores únicos já usados em cada campo "livre" da categoria atual,
    // pra alimentar os ComboBox/ComboBoxCsv como sugestões.
    const opcoes = useMemo(() => {
        const dados: any[] = (dataCtx as any)[categoria] ?? [];
        const unicosDe = (campo: string) =>
            dados
                .map((item) => item?.[campo])
                .filter((v): v is string => typeof v === "string" && v.trim() !== "");
        const unicosDeArray = (campo: string) =>
            dados.flatMap((item) => (Array.isArray(item?.[campo]) ? item[campo] : []));

        switch (categoria) {
            case "poderes":
                return {
                    elemento: unicosDe("elemento"),
                    preRequisitos: unicosDe("preRequisitos"),
                    fonte: unicosDe("fonteLivro")
                };
            case "equipamentos":
                return {
                    tipo: unicosDeArray("tipo"),
                    subtipo: unicosDe("subtipo"),
                    categoria: unicosDe("categoria"),
                    elemento: unicosDe("elemento"),
                    dano: unicosDe("dano"),
                    critico: unicosDe("critico"),
                    alcance: unicosDe("alcance"),
                    tipoDano: unicosDe("tipoDano"),
                    fonte: unicosDe("fonteLivro")
                };
            case "origens":
                return {
                    pericias: unicosDe("pericias"),
                    fonte: unicosDe("fonteLivro")
                };
            case "rituais":
                return {
                    elemento: unicosDeArray("elemento"),
                    alcance: unicosDe("alcance"),
                    alvo: unicosDe("alvo"),
                    area: unicosDe("area"),
                    duracao: unicosDe("duracao"),
                    resistencia: unicosDe("resistencia"),
                    fonte: unicosDe("fonteLivro")
                };
            case "trilhas":
                return {
                    tipo: unicosDe("tipo"),
                    fonte: unicosDe("fonteLivro")
                };
            case "regras":
                return {
                    categoria: unicosDeArray("categoria"),
                    fonte: unicosDe("fonteLivro")
                };
            default:
                return { fonte: unicosDe("fonteLivro") };
        }
    }, [dataCtx, categoria]);

    // Campos de arma ficam dentro de um objeto aninhado (`arma`), então são extraídos à parte.
    const opcoesArma = useMemo(() => {
        const dados: any[] = (dataCtx as any).equipamentos ?? [];
        const armas = dados.map((item) => item?.arma).filter(Boolean);
        const unicosDe = (campo: string) =>
            armas
                .map((a: any) => a?.[campo])
                .filter((v: any): v is string => typeof v === "string" && v.trim() !== "");
        return {
            armaTipo: unicosDe("armaTipo"),
            empunhadura: unicosDe("empunhadura"),
            catArma: unicosDe("catArma"),
            municao: unicosDe("municao"),
        };
    }, [dataCtx]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

    // Handler compatível com a assinatura (name, value) do ComboBox/ComboBoxCsv
    const handleComboChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const addAprimoramento = () => {
        setFormData((prev: any) => ({
            ...prev,
            aprimoramentos: [...prev.aprimoramentos, { nome: "", custo: "", descricao: "" }],
        }));
    };

    const removeAprimoramento = (idx: number) => {
        setFormData((prev: any) => ({
            ...prev,
            aprimoramentos: prev.aprimoramentos.filter((_: any, i: number) => i !== idx),
        }));
    };

    const changeAprimoramento = (idx: number, campo: keyof Aprimoramento, valor: string) => {
        setFormData((prev: any) => ({
            ...prev,
            aprimoramentos: prev.aprimoramentos.map((a: Aprimoramento, i: number) =>
                i === idx ? { ...a, [campo]: valor } : a
            ),
        }));
    };

    const handleSalvar = async () => {
        if (salvando) return;
        try {
            setErro("");
            setSalvando(true);
            const payload = montarPayload(categoria, formData);
            await salvarRegistro(categoria, payload);
            onClose();
        } catch (e: any) {
            setErro(e.message || "Erro ao salvar registro.");
        } finally {
            setSalvando(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="relative bg-[#837156] bg-[url(/assets/folder.jpg)] bg-blend-overlay bg-size-[30%] p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-lg max-w-4xl h-dvh sm:h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                <div className="relative h-full">
                    <div className="relative flex flex-col justify-between z-10 w-full p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] bg-repeat bg-size-[30%] border border-gray-300">
                        <div className="flex items-center justify-between p-3 border-b-2 border-dashed border-gray-400">
                            <h3 className="text-xl font-special text-gray-900 uppercase tracking-wider">
                                Criar Novo Registro - {categoria}
                            </h3>
                            <button onClick={onClose} className="text-black hover:text-red-700 cursor-pointer">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                            {erro && (
                                <div className="p-3 bg-red-100 text-red-800 border-l-4 border-red-800 text-sm font-bold whitespace-pre-wrap">
                                    {erro}
                                </div>
                            )}

                            {/* ── Identificação (sempre presente) ── */}
                            <Secao titulo="Identificação">
                                <div className="col-span-2 md:col-span-3">
                                    <Campo label="Nome *">
                                        <input
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            className={`${inputCls} font-special text-base`}
                                            placeholder="Ex: Golpe Demolidor"
                                        />
                                    </Campo>
                                </div>

                                {categoria === "poderes" && (
                                    <Campo label="Tipo">
                                        <select
                                            name="tipo"
                                            value={formData.tipo}
                                            onChange={handleChange}
                                            className={inputCls}
                                        >
                                            <option>Geral</option>
                                            <option>Combatente</option>
                                            <option>Especialista</option>
                                            <option>Ocultista</option>
                                            <option>Paranormal</option>
                                            <option>Sacrifício</option>
                                        </select>
                                    </Campo>
                                )}

                                {categoria === "trilhas" && (
                                    <Campo label="Classe *">
                                        <ComboBox
                                            name="tipo"
                                            value={formData.tipo}
                                            onChange={handleComboChange}
                                            opcoes={opcoes.tipo ?? []}
                                            className={inputCls}
                                        />
                                    </Campo>
                                )}

                                {categoria === "rituais" && (
                                    <Campo label="Círculo *">
                                        <select
                                            name="circulo"
                                            value={formData.circulo}
                                            onChange={handleChange}
                                            className={inputCls}
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </select>
                                    </Campo>
                                )}
                            </Secao>

                            {/* ── PODERES: atributos ── */}
                            {categoria === "poderes" && (
                                <Secao titulo="Atributos">
                                    <Campo label="Elemento (opcional)">
                                        <ComboBox
                                            name="elemento"
                                            value={formData.elemento}
                                            onChange={handleComboChange}
                                            opcoes={opcoes.elemento ?? []}
                                            className={inputCls}
                                            placeholder="Ex: Sangue"
                                        />
                                    </Campo>
                                    <div className="col-span-2">
                                        <Campo label="Pré-requisitos">
                                            <ComboBox
                                                name="preRequisitos"
                                                value={formData.preRequisitos}
                                                onChange={handleComboChange}
                                                opcoes={opcoes.preRequisitos ?? []}
                                                className={inputCls}
                                                placeholder="Ex: Requer NEX 15%"
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {/* ── EQUIPAMENTOS: atributos ── */}
                            {categoria === "equipamentos" && (
                                <>
                                    <Secao titulo="Classificação">
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Tipo (múltiplo) *">
                                                <ComboBoxCsv
                                                    name="tipo"
                                                    value={formData.tipo}
                                                    onChange={handleComboChange}
                                                    opcoes={opcoes.tipo ?? []}
                                                    className={inputCls}
                                                    placeholder="Ex: Arma, Corpo a corpo"
                                                />
                                            </Campo>
                                        </div>
                                        <Campo label="Subtipo">
                                            <ComboBox name="subtipo" value={formData.subtipo} onChange={handleComboChange} opcoes={opcoes.subtipo ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Categoria">
                                            <ComboBox name="categoria" value={formData.categoria} onChange={handleComboChange} opcoes={opcoes.categoria ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Espaço">
                                            <input
                                                type="number"
                                                name="espaco"
                                                value={formData.espaco}
                                                onChange={handleChange}
                                                className={inputCls}
                                            />
                                        </Campo>
                                    </Secao>

                                    <Secao titulo="Combate">
                                        <Campo label="Elemento">
                                            <ComboBox name="elemento" value={formData.elemento} onChange={handleComboChange} opcoes={opcoes.elemento ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Dano">
                                            <input name="dano" value={formData.dano} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="Crítico">
                                            <input name="critico" value={formData.critico} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="Alcance">
                                            <ComboBox name="alcance" value={formData.alcance} onChange={handleComboChange} opcoes={opcoes.alcance ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Tipo de Dano">
                                            <ComboBox name="tipoDano" value={formData.tipoDano} onChange={handleComboChange} opcoes={opcoes.tipoDano ?? []} className={inputCls} />
                                        </Campo>
                                    </Secao>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-700">
                                            <input
                                                type="checkbox"
                                                name="temArma"
                                                checked={formData.temArma}
                                                onChange={handleChange}
                                            />
                                            É uma arma? (habilita campos específicos)
                                        </label>

                                        {formData.temArma && (
                                            <Secao titulo="Dados da arma">
                                                <Campo label="Tipo de arma *">
                                                    <ComboBox name="armaTipo" value={formData.armaTipo} onChange={handleComboChange} opcoes={opcoesArma.armaTipo} className={inputCls} />
                                                </Campo>
                                                <Campo label="Empunhadura">
                                                    <ComboBox name="empunhadura" value={formData.empunhadura} onChange={handleComboChange} opcoes={opcoesArma.empunhadura} className={inputCls} />
                                                </Campo>
                                                <Campo label="Categoria da arma">
                                                    <ComboBox name="catArma" value={formData.catArma} onChange={handleComboChange} opcoes={opcoesArma.catArma} className={inputCls} />
                                                </Campo>
                                                <Campo label="Munição">
                                                    <ComboBox name="municao" value={formData.municao} onChange={handleComboChange} opcoes={opcoesArma.municao} className={inputCls} />
                                                </Campo>
                                            </Secao>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* ── ORIGENS: atributos ── */}
                            {categoria === "origens" && (
                                <Secao titulo="Atributos">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Perícias *">
                                            <ComboBoxCsv
                                                name="pericias"
                                                value={formData.pericias}
                                                onChange={handleComboChange}
                                                opcoes={opcoes.pericias ?? []}
                                                className={inputCls}
                                                placeholder="Ex: Investigação, Intuição"
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {/* ── RITUAIS: atributos ── */}
                            {categoria === "rituais" && (
                                <>
                                    <Secao titulo="Execução">
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Elemento (múltiplo) *">
                                                <ComboBoxCsv
                                                    name="elemento"
                                                    value={formData.elemento}
                                                    onChange={handleComboChange}
                                                    opcoes={opcoes.elemento ?? []}
                                                    className={inputCls}
                                                    placeholder="Ex: Sangue, Morte"
                                                />
                                            </Campo>
                                        </div>
                                        <Campo label="Execução *">
                                            <input name="execucao" value={formData.execucao} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="Alcance *">
                                            <ComboBox name="alcance" value={formData.alcance} onChange={handleComboChange} opcoes={opcoes.alcance ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Alvo">
                                            <ComboBox name="alvo" value={formData.alvo} onChange={handleComboChange} opcoes={opcoes.alvo ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Área">
                                            <ComboBox name="area" value={formData.area} onChange={handleComboChange} opcoes={opcoes.area ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Duração">
                                            <ComboBox name="duracao" value={formData.duracao} onChange={handleComboChange} opcoes={opcoes.duracao ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Resistência">
                                            <ComboBox name="resistencia" value={formData.resistencia} onChange={handleComboChange} opcoes={opcoes.resistencia ?? []} className={inputCls} />
                                        </Campo>
                                    </Secao>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between border-b border-dashed border-gray-400 pb-1">
                                            <h4 className="text-xs font-special uppercase tracking-wider text-gray-700">
                                                Aprimoramentos
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={addAprimoramento}
                                                className="flex items-center gap-1 text-[10px] font-special uppercase px-2 py-0.5 border border-gray-500 hover:bg-gray-200"
                                            >
                                                <Plus className="size-3" /> Adicionar
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.aprimoramentos.map((a: Aprimoramento, idx: number) => (
                                                <div key={idx} className="border border-gray-400 p-2 bg-white/40 space-y-1.5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold uppercase text-gray-600">
                                                            Aprimoramento {idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAprimoramento(idx)}
                                                            className="text-red-700 hover:text-red-900"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            placeholder="Nome (ex: 'Discente')"
                                                            value={a.nome}
                                                            onChange={(e) => changeAprimoramento(idx, "nome", e.target.value)}
                                                            className={inputCls}
                                                        />
                                                        <input
                                                            placeholder="Custo (ex: '+3 PE')"
                                                            value={a.custo}
                                                            onChange={(e) => changeAprimoramento(idx, "custo", e.target.value)}
                                                            className={inputCls}
                                                        />
                                                    </div>
                                                    <textarea
                                                        placeholder="Descrição"
                                                        value={a.descricao}
                                                        onChange={(e) => changeAprimoramento(idx, "descricao", e.target.value)}
                                                        rows={2}
                                                        className={textareaCls}
                                                    />
                                                </div>
                                            ))}
                                            {formData.aprimoramentos.length === 0 && (
                                                <p className="text-xs text-gray-500 italic">Nenhum aprimoramento adicionado.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── TRILHAS: progressão ── */}
                            {categoria === "trilhas" && (
                                <Secao titulo="Progressão">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Especial">
                                            <input name="especial" value={formData.especial} onChange={handleChange} className={inputCls} placeholder="Ex: Precisa ser treinado em Medicina..." />
                                        </Campo>
                                    </div>
                                    <Campo label="NEX 10% *">
                                        <textarea name="nex10" value={formData.nex10} onChange={handleChange} rows={2} className={textareaCls} />
                                    </Campo>
                                    <Campo label="NEX 40% *">
                                        <textarea name="nex40" value={formData.nex40} onChange={handleChange} rows={2} className={textareaCls} />
                                    </Campo>
                                    <Campo label="NEX 65%">
                                        <textarea name="nex65" value={formData.nex65} onChange={handleChange} rows={2} className={textareaCls} />
                                    </Campo>
                                    <Campo label="NEX 99%">
                                        <textarea name="nex99" value={formData.nex99} onChange={handleChange} rows={2} className={textareaCls} />
                                    </Campo>
                                </Secao>
                            )}

                            {/* ── REGRAS: atributos ── */}
                            {categoria === "regras" && (
                                <Secao titulo="Atributos">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Categorias/Tags (separadas por vírgula) *">
                                            <ComboBoxCsv
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleComboChange}
                                                opcoes={opcoes.categoria ?? []}
                                                className={inputCls}
                                                placeholder="Ex: Combate, Ações"
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {/* ── ORIGENS: habilidade ── */}
                            {categoria === "origens" && (
                                <Secao titulo="Habilidade / Técnica">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Nome da Habilidade *">
                                            <input
                                                name="tecnicaNome"
                                                value={formData.tecnicaNome}
                                                onChange={handleChange}
                                                className={inputCls}
                                            />
                                        </Campo>
                                    </div>
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Descrição da Habilidade *">
                                            <textarea
                                                name="tecnicaDescricao"
                                                value={formData.tecnicaDescricao}
                                                onChange={handleChange}
                                                rows={2}
                                                className={textareaCls}
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {/* ── Descrição + Fonte (universais) ── */}
                            <Secao titulo="Descrição e Fonte">
                                <div className="col-span-2 md:col-span-3">
                                    <Campo label={categoria === "origens" ? "Descrição *" : "Descrição (Suporta Markdown) *"}>
                                        <textarea
                                            name="descricao"
                                            value={formData.descricao}
                                            onChange={handleChange}
                                            rows={categoria === "origens" ? 3 : 4}
                                            className={textareaCls}
                                            placeholder="Descreva os efeitos mecânicos..."
                                        />
                                    </Campo>
                                </div>

                                {categoria === "poderes" && (
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Afinidade (opcional, requer elemento)">
                                            <textarea
                                                name="afinidade"
                                                value={formData.afinidade}
                                                onChange={handleChange}
                                                rows={2}
                                                className={textareaCls}
                                                placeholder="Descreva os efeitos de afinidade..."
                                            />
                                        </Campo>
                                    </div>
                                )}

                                <Campo label="Fonte / Livro">
                                    <ComboBox name="fonteLivro" value={formData.fonteLivro} onChange={handleComboChange} opcoes={opcoes.fonte} className={inputCls} />
                                </Campo>
                                <Campo label="Página">
                                    <input name="fontePagina" value={formData.fontePagina} onChange={handleChange} className={inputCls} />
                                </Campo>
                            </Secao>
                        </div>

                        <div className="p-3 border-t-2 border-dashed border-gray-400 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-special uppercase cursor-pointer tracking-wide border-2 border-gray-400 text-gray-700 hover:bg-gray-300 "
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvar}
                                disabled={salvando}
                                className="flex items-center gap-2 px-6 py-2 cursor-pointer bg-black text-white font-special uppercase tracking-wide border-2 border-gray-900 hover:bg-gray-800 disabled:opacity-50"
                            >
                                <Save className="size-4" /> {salvando ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
                </div>
            </div>

        </div>,
        document.body
    );
}