import { Book, Image as ImageIcon } from "lucide-react";
import PaperDiv from "@/components/ui/paper-div";
import { FonteConfig } from "@/context/DataContext";
import { estiloBadgeTipo } from "@/utils/badgeUtils";
import { badgeClass } from "../../../components/ui/item-card";

export default function FonteCard({ fonte, onClick }: { fonte: FonteConfig; onClick: () => void }) {
    const isDados = fonte.tipo === "dados";
    const extensaoPadrao = isDados ? "pdf" : "jpg";

    return (
        <div className="cursor-pointer h-full" onClick={onClick}>
            <PaperDiv className="transition-all duration-300 hover:-translate-y-1 url(/assets/paper.png)]">
                <div className="flex justify-between items-start mb-4">
                    <span
                        className={`${badgeClass} ${estiloBadgeTipo('default')} gap-1 text-xs`}>

                        {isDados ? <Book className="size-3" /> : <ImageIcon className="size-3" />}
                        {isDados ? "PDF" : "IMAGEM"}
                    </span>
                </div>

                <h3 className="text-2xl font-special underline leading-tight mb-2 text-gray-900">
                    {fonte.label || fonte.id}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-400 border-dashed text-xs text-gray-600 font-daisy break-all">
                    {fonte.nomeArquivo || `${fonte.id}.${extensaoPadrao}`}
                </div>
            </PaperDiv>
        </div>
    );
}