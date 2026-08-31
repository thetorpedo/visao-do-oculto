import { Button } from "@/components/ui/button";
import { badgeClass } from "@/components/ui/item-card";
import PaperDiv from "@/components/ui/paper-div";
import { FonteConfig } from "@/context/DataContext";
import { estiloBadgeTipo } from "@/utils/badgeUtils";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FonteLeitor({
    fonte,
    mediaUrl,
    isLoading,
    onVoltar,
}: {
    fonte: FonteConfig | null;
    mediaUrl: string;
    isLoading: boolean;
    onVoltar: () => void;
}) {
    return (
        <div className="flex-1 w-full relative min-h-[85vh] flex flex-col mb-10">
            <PaperDiv>
                <div className=" py-2 mb-4 border-b-2 border-black/40 border-dashed text-gray-800 uppercase font-daisy tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-4 truncate">
                        <Button
                            onClick={onVoltar}
                            variant='default'
                        >
                            <ArrowLeft className="size-4 -mb-0.5" /> <span>Voltar</span>
                        </Button>
                        <h2 className="font-special text-xl truncate hidden sm:block mt-1 text-gray-900">
                            Lendo: {fonte?.label || fonte?.id}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 w-full relative bg-gray-900/5 border-2 border-gray-400 flex items-center justify-center min-h-[70vh]">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 z-10 gap-3 bg-gray-200/50 backdrop-blur-sm">
                            <Loader2 className="size-8 animate-spin" />
                            <span className="font-special tracking-widest uppercase">Carregando arquivo...</span>
                        </div>
                    )}

                    {mediaUrl &&
                        (fonte?.tipo === "visual" ? (
                            <div className="absolute inset-0 overflow-auto flex justify-center custom-scrollbar p-4">
                                <img src={mediaUrl} alt={fonte?.id} className="max-w-full h-auto object-contain shadow-2xl" />
                            </div>
                        ) : (
                            <iframe
                                src={mediaUrl}
                                className="absolute inset-0 w-full h-full border-none invert-[0.05] contrast-[1.1] bg-white"
                                title={`Leitor de PDF - ${fonte?.id}`}
                            />
                        ))}
                </div>
            </PaperDiv>

            <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rotate-[0.5deg] p-1 bg-[linear-gradient(rgba(139,139,139,0.4),rgba(139,139,139,0.2)),url(/assets/paper.png)] shadow-[0_0_15px_rgba(0,0,0,0.15)] bg-repeat bg-size-[30%]" />
        </div>
    );
}