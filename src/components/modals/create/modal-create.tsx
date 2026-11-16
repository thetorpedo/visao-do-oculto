import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, Plus, Trash2, RotateCcw } from "lucide-react";
import { useData, type Categoria } from "@/context/DataContext";
import ComboBox, { ComboBoxCsv } from "@/components/ui/combo-box";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFormOptions } from "@/hooks/useFormOptions";
import { Secao, Campo, inputCls, textareaCls } from "./form-layout";
import {
    itemParaForm,
    estadoInicial,
    Aprimoramento,
    PericiaForm,
    BlocoForm,
    montarPayload,
} from "./utils/form-utils";
import MarkdownEditor from "./markdown-editor";

const rascunhosModal = new Map<string, any>();

export default function ModalCriarRegistro({
    categoria,
    itemInicial,
    onClose,
}: {
    categoria: Categoria;
    itemInicial?: any;
    onClose: () => void;
}) {
    const { salvarRegistro, removerRegistro } = useData();
    const { opcoes, opcoesArma } = useFormOptions(categoria);

    const chaveRascunho = `${categoria}:${itemInicial?.id ?? "novo"}`;

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [formData, setFormData] = useState<any>(() => {
        const salvo = rascunhosModal.get(chaveRascunho);
        if (salvo) return salvo;
        return itemInicial ? itemParaForm(categoria, itemInicial) : estadoInicial(categoria);
    });

    useEffect(() => {
        rascunhosModal.set(chaveRascunho, formData);
    }, [chaveRascunho, formData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !e.defaultPrevented) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleResetar = () => {
        const estadoPadrao = itemInicial ? itemParaForm(categoria, itemInicial) : estadoInicial(categoria);
        rascunhosModal.delete(chaveRascunho);
        setFormData(estadoPadrao);
        setErro("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

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
            aprimoramentos: prev.aprimoramentos.map((a: Aprimoramento, i: number) => i === idx ? { ...a, [campo]: valor } : a),
        }));
    };

    const addPericia = () => {
        setFormData((prev: any) => ({
            ...prev,
            pericias: [...(prev.pericias ?? []), { nome: "", valor: "" }],
        }));
    };

    const removePericia = (idx: number) => {
        setFormData((prev: any) => ({
            ...prev,
            pericias: prev.pericias.filter((_: any, i: number) => i !== idx),
        }));
    };

    const changePericia = (idx: number, campo: keyof PericiaForm, valor: string) => {
        setFormData((prev: any) => ({
            ...prev,
            pericias: prev.pericias.map((p: PericiaForm, i: number) => (i === idx ? { ...p, [campo]: valor } : p)),
        }));
    };

    const addBloco = () => {
        setFormData((prev: any) => ({
            ...prev,
            blocos: [
                ...(prev.blocos ?? []),
                { secao: "caracteristicas", acao: "", titulo: "", tags: "", descricao: "" },
            ],
        }));
    };

    const removeBloco = (idx: number) => {
        setFormData((prev: any) => ({
            ...prev,
            blocos: prev.blocos.filter((_: any, i: number) => i !== idx),
        }));
    };

    const changeBloco = (idx: number, campo: keyof BlocoForm, valor: string) => {
        setFormData((prev: any) => ({
            ...prev,
            blocos: prev.blocos.map((b: BlocoForm, i: number) => (i === idx ? { ...b, [campo]: valor } : b)),
        }));
    };

    const handleSalvar = async () => {
        if (salvando) return;
        try {
            setErro("");
            setSalvando(true);
            const payload = montarPayload(categoria, formData);
            await salvarRegistro(categoria, payload);
            rascunhosModal.delete(chaveRascunho);
            onClose();
        } catch (e: any) {
            setErro(e.message || "Erro ao salvar registro.");
        } finally {
            setSalvando(false);
        }
    };

    const handleExcluir = async () => {
        if (!itemInicial?.id) return;
        try {
            setErro("");
            setExcluindo(true);
            await removerRegistro(categoria, itemInicial.id);
            rascunhosModal.delete(chaveRascunho);
            onClose();
        } catch (e: any) {
            setErro(e.message || "Erro ao excluir registro.");
        } finally {
            setExcluindo(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
            <div className="relative bg-[#837156] dark:bg-[#141716] bg-[url(/assets/folder.jpg)] dark:bg-none dark:border dark:border-zinc-800 bg-blend-overlay bg-size-[30%] p-2 sm:p-6 lg:p-6 shadow-2xl/90 rounded-lg dark:rounded-none! max-w-4xl h-[92dvh] sm:h-[90vh] w-full" onClick={e => e.stopPropagation()}>
                <div className="relative h-full">
                    <div className="relative flex flex-col justify-between z-10 w-full p-3 sm:p-5 h-full shadow-lg bg-[linear-gradient(rgba(249,249,249,0.5),rgba(249,249,249,0.5)),url(/assets/paper.png)] dark:bg-[#1e2220] dark:bg-none bg-repeat bg-size-[30%] border border-gray-300 dark:border-zinc-700/80 dark:text-zinc-100">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 border-b-2 border-dashed border-gray-400">
                            <h3 className="text-base sm:text-xl font-special text-gray-900 uppercase tracking-wider truncate pr-2">
                                {itemInicial ? "Editar Registro" : "Criar Novo Registro"} - {categoria}
                            </h3>
                            <button onClick={onClose} className="text-black hover:text-red-700 cursor-pointer shrink-0">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-2.5 sm:p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                            {erro && (
                                <div className="p-3 bg-red-100 text-red-800 border-l-4 border-red-800 text-sm font-bold whitespace-pre-wrap">
                                    {erro}
                                </div>
                            )}

                            <Secao titulo="Identificação">
                                <div className="col-span-2 md:col-span-3">
                                    <Campo label="Nome *">
                                        <input name="nome" value={formData.nome} onChange={handleChange} className={`${inputCls} font-special text-base`} />
                                    </Campo>
                                </div>
                                {categoria !== "ameacas" && (
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label={categoria === "origens" ? "Descrição *" : "Descrição (Suporta Markdown) *"}>
                                            <MarkdownEditor
                                                value={formData.descricao}
                                                onChange={(value) => handleComboChange("descricao", value)}
                                                rows={8}
                                            />
                                        </Campo>
                                    </div>
                                )}

                                {categoria === "ameacas" && (
                                    <>
                                        <Campo label="VD *">
                                            <input type="number" name="vd" value={formData.vd} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="Tipo *">
                                            <ComboBox name="tipo" value={formData.tipo} onChange={handleComboChange} opcoes={opcoes.tipo ?? []} className={inputCls} placeholder="Ex: Criatura, Pessoa" />
                                        </Campo>
                                        <Campo label="Tamanho *">
                                            <ComboBox name="tamanho" value={formData.tamanho} onChange={handleComboChange} opcoes={opcoes.tamanho ?? []} className={inputCls} placeholder="Ex: Médio, Grande" />
                                        </Campo>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Elementos Principais (separados por vírgula)">
                                                <ComboBoxCsv name="elementos" value={formData.elementos} onChange={handleComboChange} opcoes={opcoes.elemento ?? []} className={inputCls} placeholder="Ex: Sangue, Morte" />
                                            </Campo>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Elementos Secundários (separados por vírgula)">
                                                <ComboBoxCsv name="elementosSecundarios" value={formData.elementosSecundarios} onChange={handleComboChange} opcoes={opcoes.elemento ?? []} className={inputCls} placeholder="Ex: Medo, Conhecimento" />
                                            </Campo>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Grupos / Tags (separados por vírgula)">
                                                <ComboBoxCsv name="grupos" value={formData.grupos} onChange={handleComboChange} opcoes={opcoes.grupos ?? []} className={inputCls} placeholder="Ex: Cultista, Zumbi de Sangue" />
                                            </Campo>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Apresentação (opcional, suporta Markdown)">
                                                <MarkdownEditor
                                                    value={formData.apresentacao}
                                                    onChange={(value) => handleComboChange("apresentacao", value)}
                                                    rows={4}
                                                />
                                            </Campo>
                                        </div>
                                    </>
                                )}

                                {categoria === "poderes" && (
                                    <Campo label="Tipo">
                                        <select name="tipo" value={formData.tipo} onChange={handleChange} className={inputCls}>
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
                                        <ComboBox name="tipo" value={formData.tipo} onChange={handleComboChange} opcoes={opcoes.tipo ?? []} className={inputCls} />
                                    </Campo>
                                )}

                                {categoria === "rituais" && (
                                    <Campo label="Círculo *">
                                        <select name="circulo" value={formData.circulo} onChange={handleChange} className={inputCls}>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </select>
                                    </Campo>
                                )}
                            </Secao>

                            {categoria === "poderes" && (
                                <Secao titulo="Especificações">
                                    <Campo label="Elemento (se paranormal)">
                                        <ComboBox name="elemento" value={formData.elemento} onChange={handleComboChange} opcoes={opcoes.elemento ?? []} className={inputCls} placeholder="Ex: Sangue" />
                                    </Campo>
                                    <div className="col-span-2">
                                        <Campo label="Pré-requisitos">
                                            <ComboBox name="preRequisitos" value={formData.preRequisitos} onChange={handleComboChange} opcoes={opcoes.preRequisitos ?? []} className={inputCls} placeholder="Ex: Requer NEX 15%" />
                                        </Campo>
                                    </div>
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Afinidade (opcional, requer elemento)">
                                            <MarkdownEditor
                                                value={formData.afinidade}
                                                onChange={(value) => handleComboChange("afinidade", value)}
                                                rows={6}
                                                placeholder="Ex: Aumenta o dano em 10..."
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {categoria === "equipamentos" && (
                                <>
                                    <Secao titulo="Classificação">
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Tipo (múltiplo) *">
                                                <ComboBoxCsv name="tipo" value={formData.tipo} onChange={handleComboChange} opcoes={opcoes.tipo ?? []} className={inputCls} placeholder="Ex: Arma, Item Amaldiçoado" />
                                            </Campo>
                                        </div>
                                        <Campo label="Subtipo">
                                            <ComboBox name="subtipo" value={formData.subtipo} onChange={handleComboChange} opcoes={opcoes.subtipo ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Categoria">
                                            <ComboBox name="categoria" value={formData.categoria} onChange={handleComboChange} opcoes={opcoes.categoria ?? []} className={inputCls} />
                                        </Campo>
                                        <Campo label="Espaço">
                                            <input type="number" name="espaco" value={formData.espaco} onChange={handleChange} className={inputCls} />
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
                                            <input type="checkbox" name="temArma" checked={formData.temArma} onChange={handleChange} />
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

                            {categoria === "origens" && (
                                <Secao titulo="Perícias">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Perícias *">
                                            <textarea
                                                name="pericias"
                                                value={formData.pericias}
                                                onChange={handleChange}
                                                rows={2}
                                                className={textareaCls}
                                                placeholder="Ex: Ocultismo e 1 perícia..."
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {categoria === "rituais" && (
                                <>
                                    <Secao titulo="Execução">
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Elemento (múltiplo) *">
                                                <ComboBoxCsv name="elemento" value={formData.elemento} onChange={handleComboChange} opcoes={opcoes.elemento ?? []} className={inputCls} placeholder="Ex: Sangue, Morte" />
                                            </Campo>
                                        </div>
                                        <Campo label="Execução *">
                                            <ComboBox name="execucao" value={formData.execucao} onChange={handleComboChange} opcoes={opcoes.execucao ?? []} className={inputCls} />
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

                                    <Secao titulo="Aprimoramentos">
                                        <div className="space-y-2 col-span-full">
                                            <div className="flex items-center justify-between border-b border-gray-400 pb-2">
                                                <button type="button" onClick={addAprimoramento} className="flex items-center gap-1 text-[10px] font-special uppercase px-2 py-0.5 border border-gray-500 hover:bg-gray-200">
                                                    <Plus className="size-3" /> Adicionar
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.aprimoramentos.map((a: Aprimoramento, idx: number) => (
                                                    <div key={idx} className="border border-gray-400 p-2 bg-white/40 space-y-1.5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase text-gray-600">Aprimoramento {idx + 1}</span>
                                                            <button type="button" onClick={() => removeAprimoramento(idx)} className="text-red-700 hover:text-red-900"><Trash2 className="size-3.5" /></button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input placeholder="Nome (ex: 'Discente')" value={a.nome} onChange={(e) => changeAprimoramento(idx, "nome", e.target.value)} className={inputCls} />
                                                            <input placeholder="Custo (ex: '+3 PE')" value={a.custo} onChange={(e) => changeAprimoramento(idx, "custo", e.target.value)} className={inputCls} />
                                                        </div>
                                                        <MarkdownEditor
                                                            value={a.descricao}
                                                            onChange={(value) => changeAprimoramento(idx, "descricao", value)}
                                                            rows={6}
                                                            placeholder="Descrição"
                                                        />
                                                    </div>
                                                ))}
                                                {formData.aprimoramentos.length === 0 && <p className="text-sm text-gray-500 italic">Nenhum aprimoramento adicionado.</p>}
                                            </div>
                                        </div>
                                    </Secao>
                                </>
                            )}

                            {categoria === "trilhas" && (
                                <Secao titulo="Progressão">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Especial">
                                            <input name="especial" value={formData.especial} onChange={handleChange} className={inputCls} placeholder="Ex: Precisa ser treinado em Medicina..." />
                                        </Campo>
                                    </div>
                                    {(["nex10", "nex40", "nex65", "nex99"] as const).map((campo, index) => {
                                        const rotulo = ["NEX 10% (Ou Estágio 2)", "NEX 40% (Ou Estágio 4)", "NEX 65%", "NEX 99%"][index];
                                        return (
                                            <Fragment key={campo}>
                                                <Campo spanfull label={`${rotulo} - Título`}>
                                                    <input
                                                        name={`${campo}Titulo`}
                                                        value={formData[`${campo}Titulo`]}
                                                        onChange={handleChange}
                                                        className={inputCls}
                                                        placeholder="Ex: Golpe Brutal"
                                                    />
                                                </Campo>
                                                <Campo spanfull label={`${rotulo} - Descrição`}>
                                                    <MarkdownEditor
                                                        value={formData[`${campo}Descricao`]}
                                                        onChange={(value) => handleComboChange(`${campo}Descricao`, value)}
                                                        rows={6}
                                                    />
                                                </Campo>
                                            </Fragment>
                                        );
                                    })}
                                </Secao>
                            )}

                            {categoria === "regras" && (
                                <Secao titulo="Tags">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Categorias/Tags (separadas por vírgula) *">
                                            <ComboBoxCsv name="categoria" value={formData.categoria} onChange={handleComboChange} opcoes={opcoes.categoria ?? []} className={inputCls} placeholder="Ex: Combate, Ações" />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {categoria === "origens" && (
                                <Secao titulo="Habilidade">
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Nome da Habilidade *">
                                            <input name="tecnicaNome" value={formData.tecnicaNome} onChange={handleChange} className={inputCls} placeholder="Ex: Técnica Medicinal" />
                                        </Campo>
                                    </div>
                                    <div className="col-span-2 md:col-span-3">
                                        <Campo label="Descrição da Habilidade *">
                                            <MarkdownEditor
                                                value={formData.tecnicaDescricao}
                                                onChange={(value) => handleComboChange("tecnicaDescricao", value)}
                                                rows={6}
                                                placeholder="Ex: Sempre que cura um personagem..."
                                            />
                                        </Campo>
                                    </div>
                                </Secao>
                            )}

                            {categoria === "ameacas" && (
                                <>
                                    <Secao titulo="Sentidos">
                                        <Campo label="Percepção *">
                                            <input name="percepcao" value={formData.percepcao} onChange={handleChange} className={inputCls} placeholder="Ex: 3d20+10" />
                                        </Campo>
                                        <Campo label="Iniciativa *">
                                            <input name="iniciativa" value={formData.iniciativa} onChange={handleChange} className={inputCls} placeholder="Ex: 2d20+10" />
                                        </Campo>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Sentidos Extras (separados por vírgula)">
                                                <ComboBoxCsv name="sentidosExtras" value={formData.sentidosExtras} onChange={handleComboChange} opcoes={opcoes.sentidosExtras ?? []} className={inputCls} placeholder="Ex: Visão no escuro, Faro" />
                                            </Campo>
                                        </div>
                                    </Secao>

                                    <Secao titulo="Defesa e Pontos de Vida">
                                        <Campo label="Defesa *">
                                            <input type="number" name="defesaValor" value={formData.defesaValor} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="PV *">
                                            <input type="number" name="pv" value={formData.pv} onChange={handleChange} className={inputCls} />
                                        </Campo>
                                        <Campo label="Machucado (vazio = PV ÷ 2)">
                                            <input type="number" name="machucado" value={formData.machucado} onChange={handleChange} className={inputCls} placeholder={formData.pv ? String(Math.floor(Number(formData.pv) / 2)) : "Automático"} />
                                        </Campo>
                                        <Campo label="Fortitude *">
                                            <input name="fortitude" value={formData.fortitude} onChange={handleChange} className={inputCls} placeholder="Ex: 3d20+15" />
                                        </Campo>
                                        <Campo label="Reflexos *">
                                            <input name="reflexos" value={formData.reflexos} onChange={handleChange} className={inputCls} placeholder="Ex: 2d20+10" />
                                        </Campo>
                                        <Campo label="Vontade *">
                                            <input name="vontade" value={formData.vontade} onChange={handleChange} className={inputCls} placeholder="Ex: 4d20+15" />
                                        </Campo>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Resistências (separadas por vírgula)">
                                                <ComboBoxCsv name="resistencias" value={formData.resistencias} onChange={handleComboChange} opcoes={opcoes.resistencias ?? []} className={inputCls} placeholder="Ex: Balístico 10, Sangue 20" />
                                            </Campo>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Imunidades (separadas por vírgula)">
                                                <ComboBoxCsv name="imunidades" value={formData.imunidades} onChange={handleComboChange} opcoes={opcoes.imunidades ?? []} className={inputCls} placeholder="Ex: Condições de paralisia, Dano mental" />
                                            </Campo>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Vulnerabilidades (separadas por vírgula)">
                                                <ComboBoxCsv name="vulnerabilidades" value={formData.vulnerabilidades} onChange={handleComboChange} opcoes={opcoes.vulnerabilidades ?? []} className={inputCls} placeholder="Ex: Morte, Energia" />
                                            </Campo>
                                        </div>
                                    </Secao>

                                    <Secao titulo="Atributos e Deslocamento">
                                        <Campo label="AGI (vazio = —)">
                                            <input type="number" name="agi" value={formData.agi} onChange={handleChange} className={inputCls} placeholder="—" />
                                        </Campo>
                                        <Campo label="FOR (vazio = —)">
                                            <input type="number" name="for" value={formData.for} onChange={handleChange} className={inputCls} placeholder="—" />
                                        </Campo>
                                        <Campo label="INT (vazio = —)">
                                            <input type="number" name="int" value={formData.int} onChange={handleChange} className={inputCls} placeholder="—" />
                                        </Campo>
                                        <Campo label="PRE (vazio = —)">
                                            <input type="number" name="pre" value={formData.pre} onChange={handleChange} className={inputCls} placeholder="—" />
                                        </Campo>
                                        <Campo label="VIG (vazio = —)">
                                            <input type="number" name="vig" value={formData.vig} onChange={handleChange} className={inputCls} placeholder="—" />
                                        </Campo>
                                        <Campo label="Deslocamento *">
                                            <ComboBox name="deslocamento" value={formData.deslocamento} onChange={handleComboChange} opcoes={opcoes.deslocamento ?? []} className={inputCls} placeholder="Ex: 9m | 6□" />
                                        </Campo>
                                    </Secao>

                                    <Secao titulo="Perícias">
                                        <div className="space-y-2 col-span-full">
                                            <div className="flex items-center justify-between border-b border-gray-400 pb-2">
                                                <button type="button" onClick={addPericia} className="flex items-center gap-1 text-[10px] font-special uppercase px-2 py-0.5 border border-gray-500 hover:bg-gray-200">
                                                    <Plus className="size-3" /> Adicionar Perícia
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(formData.pericias ?? []).map((p: PericiaForm, idx: number) => (
                                                    <div key={idx} className="border border-gray-400 p-2 bg-white/40 flex items-center gap-2">
                                                        <input
                                                            placeholder="Nome (ex: Atletismo)"
                                                            value={p.nome}
                                                            onChange={(e) => changePericia(idx, "nome", e.target.value)}
                                                            className={inputCls}
                                                        />
                                                        <input
                                                            placeholder="Valor (ex: 3d20+10)"
                                                            value={p.valor}
                                                            onChange={(e) => changePericia(idx, "valor", e.target.value)}
                                                            className={inputCls}
                                                        />
                                                        <button type="button" onClick={() => removePericia(idx)} className="text-red-700 hover:text-red-900 shrink-0 p-1">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(formData.pericias ?? []).length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">Nenhuma perícia adicionada.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Secao>

                                    <Secao titulo="Blocos (Características, Ações, Comportamento, Enigma)">
                                        <div className="space-y-2 col-span-full">
                                            <div className="flex items-center justify-between border-b border-gray-400 pb-2">
                                                <button type="button" onClick={addBloco} className="flex items-center gap-1 text-[10px] font-special uppercase px-2 py-0.5 border border-gray-500 hover:bg-gray-200">
                                                    <Plus className="size-3" /> Adicionar Bloco
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(formData.blocos ?? []).map((b: BlocoForm, idx: number) => (
                                                    <div key={idx} className="border border-gray-400 p-2 bg-white/40 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase text-gray-600">Bloco {idx + 1}</span>
                                                            <button type="button" onClick={() => removeBloco(idx)} className="text-red-700 hover:text-red-900">
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <Campo label="Seção *">
                                                                <select
                                                                    value={b.secao}
                                                                    onChange={(e) => changeBloco(idx, "secao", e.target.value)}
                                                                    className={inputCls}
                                                                >
                                                                    <option value="caracteristicas">Características</option>
                                                                    <option value="acoes">Ações</option>
                                                                    <option value="comportamento">Comportamento</option>
                                                                    <option value="enigma">Enigma de Medo</option>
                                                                </select>
                                                            </Campo>
                                                            <Campo label="Ação (ex: Padrão, Livre, Reação)">
                                                                <ComboBox
                                                                    name={`bloco_acao_${idx}`}
                                                                    value={b.acao}
                                                                    onChange={(_, val) => changeBloco(idx, "acao", val)}
                                                                    opcoes={opcoes.acaoBloco ?? []}
                                                                    className={inputCls}
                                                                    placeholder="Opcional"
                                                                />
                                                            </Campo>
                                                            <Campo label="Título *">
                                                                <input placeholder="Ex: Presença Perturbadora, Agredir" value={b.titulo} onChange={(e) => changeBloco(idx, "titulo", e.target.value)} className={inputCls} />
                                                            </Campo>
                                                            <Campo label="Tags (separadas por vírgula)">
                                                                <input placeholder="Ex: Corpo a corpo, Ritual, Energia 1" value={b.tags} onChange={(e) => changeBloco(idx, "tags", e.target.value)} className={inputCls} />
                                                            </Campo>
                                                        </div>
                                                        <Campo spanfull label="Descrição (Suporta Markdown) *">
                                                            <MarkdownEditor
                                                                value={b.descricao}
                                                                onChange={(value) => changeBloco(idx, "descricao", value)}
                                                                rows={5}
                                                            />
                                                        </Campo>
                                                    </div>
                                                ))}
                                                {(formData.blocos ?? []).length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">Nenhum bloco adicionado.</p>
                                                )}
                                            </div>
                                        </div>
                                    </Secao>

                                    <Secao titulo="Observações">
                                        <div className="col-span-2 md:col-span-3">
                                            <Campo label="Observações Finais (opcional, suporta Markdown)">
                                                <MarkdownEditor
                                                    value={formData.observacoes}
                                                    onChange={(value) => handleComboChange("observacoes", value)}
                                                    rows={4}
                                                />
                                            </Campo>
                                        </div>
                                    </Secao>
                                </>
                            )}

                            <Secao titulo="Fonte">
                                <Campo label="Fonte / Livro">
                                    <ComboBox name="fonteLivro" value={formData.fonteLivro} onChange={handleComboChange} opcoes={opcoes.fonte} className={inputCls} />
                                </Campo>
                                <Campo label="Página">
                                    <input name="fontePagina" value={formData.fontePagina} onChange={handleChange} className={inputCls} />
                                </Campo>
                            </Secao>
                        </div>

                        <div className="p-3 border-t-2 border-dashed border-gray-400 flex items-center justify-between gap-3">
                            {itemInicial ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button type="button" disabled={salvando || excluindo} variant="destructive" title="Excluir este item">
                                            <Trash2 className="size-4" />
                                            <span className="hidden sm:inline">{excluindo ? "Excluindo..." : "Excluir"}</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent showCloseButton={false}>
                                        <DialogTitle>Excluir este registro?</DialogTitle>
                                        Tem certeza de que quer fazer essa ação?
                                        <DialogFooter className="mt-5">
                                            <DialogClose asChild>
                                                <Button type="button" onClick={handleExcluir} disabled={salvando || excluindo} variant="destructive" title="Excluir este item">
                                                    <Trash2 className="size-4" />
                                                    <span className="hidden sm:inline">{excluindo ? "Excluindo..." : "Excluir"}</span>
                                                </Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button type="button" disabled={salvando || excluindo} variant="default">
                                                    <Trash2 className="size-4" />
                                                    <span className="hidden sm:inline">Cancelar</span>
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div />
                            )}

                            <div className="flex gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    onClick={handleResetar}
                                    disabled={salvando || excluindo}
                                    variant="outline"
                                    title="Limpar alterações"
                                >
                                    <RotateCcw className="size-4" />
                                    <span className="hidden sm:inline">Limpar</span>
                                </Button>
                                <Button type="button" onClick={onClose} disabled={salvando || excluindo} variant="outline">
                                    Fechar
                                </Button>
                                <Button type="button" onClick={handleSalvar} disabled={salvando || excluindo} variant="default">
                                    <Save className="size-4" /> {salvando ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%] pointer-events-none dark:hidden" />
                </div>
            </div>
        </div>,
        document.body
    );
}