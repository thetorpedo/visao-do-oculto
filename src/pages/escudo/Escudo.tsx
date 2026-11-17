import { useState } from "react";
import type { Categoria } from "@/context/DataContext";
import { cn } from "@/lib/utils";
import { useEscudo, type TipoEspecial } from "@/hooks/useEscudo";
import BarraPasta from "./components/barra-pasta";
import RegistroPicker from "./components/registro-picker";
import SlotConteudo from "./components/slot-conteudo";
import SlotTabs from "./components/slot-tabs";
import SlotVazio from "./components/slot-vazio";

interface AlvoPicker {
    slotIndice: number;
    abaId: string | null;
}

const SLOT_PREENCHIDO =
    "overflow-visible border border-black/40 bg-[linear-gradient(rgba(249,249,249,0.85),rgba(249,249,249,0.85)),url(/assets/paper.png)] bg-size-[30%] bg-repeat shadow-md dark:border-zinc-800/90 dark:bg-[#101312] dark:bg-none";
const SLOT_LIVRE = "overflow-hidden border-2 border-dashed border-black/25 bg-black/5 dark:border-zinc-700/60 dark:bg-black/15";

export default function Escudo() {
    const {
        paineis,
        painelAtivo,
        setAtivo,
        adicionarPainel,
        removerPainel,
        renomearPainel,
        adicionarAba,
        removerAba,
        selecionarAba,
        atualizarConteudoAba,
    } = useEscudo();

    const [alvoPicker, setAlvoPicker] = useState<AlvoPicker | null>(null);
    const [menuAbertoIndice, setMenuAbertoIndice] = useState<number | null>(null);

    const painelId = painelAtivo.id;

    const adicionarEspecial = (indice: number, tipo: TipoEspecial) =>
        adicionarAba(painelId, indice, { tipo, dados: undefined });

    const selecionarRegistro = (categoria: Categoria, itemId: string) => {
        if (!alvoPicker) return;
        const { slotIndice, abaId } = alvoPicker;
        const conteudo = { tipo: "registro" as const, categoria, itemId };

        if (abaId) atualizarConteudoAba(painelId, slotIndice, abaId, () => conteudo);
        else adicionarAba(painelId, slotIndice, conteudo);
        setAlvoPicker(null);
    };

    return (
        <div className="relative flex h-full min-h-screen w-full select-none flex-col items-center justify-start overflow-x-hidden bg-[#453b13] bg-[radial-gradient(#5b4f21_1px,transparent_1px)] bg-size-[16px_16px] px-2 sm:px-4 lg:px-6 dark:bg-[#040c07] dark:bg-[radial-gradient(#123520_1px,transparent_1px)]">
            <main className="relative z-10 mx-auto mt-14 w-full pb-6 sm:mt-16 lg:mt-14">
                <BarraPasta
                    paineis={paineis}
                    ativoId={painelId}
                    onSelecionar={setAtivo}
                    onAdicionar={adicionarPainel}
                    onRemover={removerPainel}
                    onRenomear={renomearPainel}
                />

                <div className="relative z-10 hidden h-5 w-full bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay lg:block dark:hidden!" />

                <div className="relative h-full w-full rounded-md bg-[#837156] bg-[url(/assets/folder.jpg)] bg-size-[30%] bg-blend-overlay p-2 shadow-2xl/90 sm:p-4 lg:rounded-t-none lg:rounded-b-lg lg:p-5 dark:rounded-none! dark:border dark:border-zinc-800 dark:bg-[#141716] dark:bg-none">
                    <div className="grid h-[calc(100vh-130px)] min-h-150 w-full grid-cols-1 grid-rows-6 gap-3 md:grid-cols-2 md:grid-rows-3 lg:grid-cols-3 lg:grid-rows-2">
                        {painelAtivo.slots.map((slot, indice) => {
                            const abaAtiva = slot?.abas.find((a) => a.id === slot.abaAtivaId) ?? slot?.abas[0];

                            return (
                                <div
                                    key={indice}
                                    className={cn(
                                        "relative flex h-full min-h-0 w-full flex-col",
                                        slot ? SLOT_PREENCHIDO : SLOT_LIVRE
                                    )}
                                >
                                    {slot && abaAtiva ? (
                                        <>
                                            <SlotTabs
                                                abas={slot.abas}
                                                abaAtivaId={slot.abaAtivaId}
                                                menuAberto={menuAbertoIndice === indice}
                                                onToggleMenu={() => setMenuAbertoIndice((atual) => (atual === indice ? null : indice))}
                                                onFecharMenu={() => setMenuAbertoIndice(null)}
                                                onSelecionarAba={(abaId) => selecionarAba(painelId, indice, abaId)}
                                                onRemoverAba={(abaId) => removerAba(painelId, indice, abaId)}
                                                onTrocarRegistro={(abaId) => setAlvoPicker({ slotIndice: indice, abaId })}
                                                onAdicionarRegistro={() => setAlvoPicker({ slotIndice: indice, abaId: null })}
                                                onAdicionarEspecial={(tipo) => adicionarEspecial(indice, tipo)}
                                            />

                                            <div className="relative min-h-0 flex-1 select-text overflow-hidden">
                                                <SlotConteudo
                                                    key={abaAtiva.id}
                                                    conteudo={abaAtiva.conteudo}
                                                    onChangeDados={(dados) =>
                                                        atualizarConteudoAba(painelId, indice, abaAtiva.id, (c) =>
                                                            c.tipo === "registro" ? c : { ...c, dados }
                                                        )
                                                    }
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <SlotVazio
                                            onAdicionarRegistro={() => setAlvoPicker({ slotIndice: indice, abaId: null })}
                                            onAdicionarEspecial={(tipo) => adicionarEspecial(indice, tipo)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {alvoPicker && <RegistroPicker onSelect={selecionarRegistro} onClose={() => setAlvoPicker(null)} />}
        </div>
    );
}
