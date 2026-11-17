import type { ConteudoAba } from "@/hooks/useEscudo";
import SlotAnotacoes, { type DadosAnotacoes } from "./slot-anotacoes";
import SlotCondicoes from "./slot-condicoes";
import SlotDados, { type DadosRolador } from "./slot-dados";
import SlotIniciativa, { type DadosIniciativa } from "./slot-iniciativa";
import SlotRegistro from "./slot-registro";

export default function SlotConteudo({
    conteudo,
    onChangeDados,
}: {
    conteudo: ConteudoAba;
    onChangeDados: (dados: unknown) => void;
}) {
    switch (conteudo.tipo) {
        case "registro":
            return <SlotRegistro categoria={conteudo.categoria} itemId={conteudo.itemId} />;
        case "iniciativa":
            return <SlotIniciativa dados={conteudo.dados as DadosIniciativa | undefined} onChange={onChangeDados} />;
        case "dados":
            return <SlotDados dados={conteudo.dados as DadosRolador | undefined} onChange={onChangeDados} />;
        case "anotacoes":
            return <SlotAnotacoes dados={conteudo.dados as DadosAnotacoes | undefined} onChange={onChangeDados} />;
        case "condicoes":
            return <SlotCondicoes />;
    }
}
