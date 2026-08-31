import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { useData, type Categoria } from "@/context/DataContext";
import ComboBox, { ComboBoxCsv } from "@/components/ui/combo-box";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFormOptions } from "@/hooks/useFormOptions";
import { Secao, Campo, inputCls, textareaCls } from "./form-layout";
import { itemParaForm, estadoInicial, Aprimoramento, montarPayload } from "./utils/form-utils";


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

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [formData, setFormData] = useState<any>(() =>
        itemInicial ? itemParaForm(categoria, itemInicial) : estadoInicial(categoria)
    );

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

    const handleExcluir = async () => {
        if (!itemInicial?.id) return;
        try {
            setErro("");
            setExcluindo(true);
            await removerRegistro(categoria, itemInicial.id);
            onClose();
        } catch (e: any) {
            setErro(e.message || "Erro ao excluir registro.");
        } finally {
            setExcluindo(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-49 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
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

                            <Secao titulo="Identificação">
                                <div className="col-span-2 md:col-span-3">
                                    <Campo label="Nome *">
                                        <input name="nome" value={formData.nome} onChange={handleChange} className={`${inputCls} font-special text-base`} />
                                    </Campo>
                                </div>
                                <div className="col-span-2 md:col-span-3">
                                    <Campo label={categoria === "origens" ? "Descrição *" : "Descrição (Suporta Markdown) *"}>
                                        <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={categoria === "origens" ? 3 : 4} className={textareaCls} />
                                    </Campo>
                                </div>

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
                                            <textarea name="afinidade" value={formData.afinidade} onChange={handleChange} rows={2} className={textareaCls} placeholder="Ex: Aumenta o dano em 10..." />
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
                                                        <textarea placeholder="Descrição" value={a.descricao} onChange={(e) => changeAprimoramento(idx, "descricao", e.target.value)} rows={2} className={textareaCls} />
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
                                    <Campo spanfull label="NEX 10% (Ou Estágio 2)"><textarea name="nex10" value={formData.nex10} onChange={handleChange} rows={2} className={textareaCls} /></Campo>
                                    <Campo spanfull label="NEX 40% (Ou Estágio 4)"><textarea name="nex40" value={formData.nex40} onChange={handleChange} rows={2} className={textareaCls} /></Campo>
                                    <Campo spanfull label="NEX 65%"><textarea name="nex65" value={formData.nex65} onChange={handleChange} rows={2} className={textareaCls} /></Campo>
                                    <Campo spanfull label="NEX 99%"><textarea name="nex99" value={formData.nex99} onChange={handleChange} rows={2} className={textareaCls} /></Campo>
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
                                            <textarea name="tecnicaDescricao" value={formData.tecnicaDescricao} onChange={handleChange} rows={2} className={textareaCls} placeholder="Ex: Sempre que cura um personagem..." />
                                        </Campo>
                                    </div>
                                </Secao>
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

                            <div className="flex gap-3">
                                <Button type="button" onClick={onClose} disabled={salvando || excluindo} variant="outline">
                                    Cancelar
                                </Button>
                                <Button type="button" onClick={handleSalvar} disabled={salvando || excluindo} variant="default">
                                    <Save className="size-4" /> {salvando ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-1 p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
                </div>
            </div>
        </div>,
        document.body
    );
}