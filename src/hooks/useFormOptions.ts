import { useMemo } from "react";
import { useData, type Categoria } from "@/context/DataContext";

export function useFormOptions(categoria: Categoria) {
  const dataCtx = useData();

  const opcoes = useMemo(() => {
    const dados: any[] = (dataCtx as any)[categoria] ?? [];
    const unicosDe = (campo: string) =>
      dados.map((item) => item?.[campo]).filter((v): v is string => typeof v === "string" && v.trim() !== "");
    const unicosDeArray = (campo: string) =>
      dados.flatMap((item) => (Array.isArray(item?.[campo]) ? item[campo] : []));

    switch (categoria) {
      case "poderes":
        return { elemento: unicosDe("elemento"), preRequisitos: unicosDe("preRequisitos"), fonte: unicosDe("fonteLivro") };
      case "equipamentos":
        return { tipo: unicosDeArray("tipo"), subtipo: unicosDe("subtipo"), categoria: unicosDe("categoria"), elemento: unicosDe("elemento"), dano: unicosDe("dano"), critico: unicosDe("critico"), alcance: unicosDe("alcance"), tipoDano: unicosDe("tipoDano"), fonte: unicosDe("fonteLivro") };
      case "origens":
        return { pericias: unicosDe("pericias"), fonte: unicosDe("fonteLivro") };
      case "rituais":
        return { elemento: unicosDeArray("elemento"), alcance: unicosDe("alcance"), execucao: unicosDe("execucao"), alvo: unicosDe("alvo"), area: unicosDe("area"), duracao: unicosDe("duracao"), resistencia: unicosDe("resistencia"), fonte: unicosDe("fonteLivro") };
      case "trilhas":
        return { tipo: unicosDe("tipo"), fonte: unicosDe("fonteLivro") };
      case "regras":
        return { categoria: unicosDeArray("categoria"), fonte: unicosDe("fonteLivro") };
      case "ameacas":
        return {
          tipo: ["Criatura", "Pessoa", "Animal", ...unicosDe("tipo")],
          tamanho: ["Minúsculo", "Pequeno", "Médio", "Grande", "Enorme", "Colossal", ...unicosDe("tamanho")],
          elemento: [
            "Sangue",
            "Morte",
            "Energia",
            "Conhecimento",
            "Medo",
            ...unicosDeArray("elementos"),
            ...unicosDeArray("elementosSecundarios"),
          ],
          grupos: unicosDeArray("grupos"),
          sentidosExtras: [
            "Percepção às cegas",
            "Visão no escuro",
            "Visão na penumbra",
            "Faro",
            ...dados.flatMap((item) =>
              Array.isArray(item?.sentidos?.extras) ? item.sentidos.extras : []
            ),
          ],
          resistencias: unicosDeArray("resistencias"),
          imunidades: unicosDeArray("imunidades"),
          vulnerabilidades: unicosDeArray("vulnerabilidades"),
          deslocamento: ["9m | 6□", "12m | 8□", "6m | 4□", ...unicosDe("deslocamento")],
          acaoBloco: [
            "Padrão",
            "Movimento",
            "Livre",
            "Reação",
            "Completa",
            ...dados.flatMap((item) =>
              Array.isArray(item?.blocos)
                ? item.blocos.map((b: any) => b?.acao).filter((v: any): v is string => typeof v === "string" && v.trim() !== "")
                : []
            ),
          ],
          fonte: unicosDe("fonteLivro"),
        };
      default:
        return { fonte: unicosDe("fonteLivro") };
    }
  }, [dataCtx, categoria]);

  const opcoesArma = useMemo(() => {
    const dados: any[] = (dataCtx as any).equipamentos ?? [];
    const armas = dados.map((item) => item?.arma).filter(Boolean);
    const unicosDe = (campo: string) =>
      armas.map((a: any) => a?.[campo]).filter((v: any): v is string => typeof v === "string" && v.trim() !== "");
    return { armaTipo: unicosDe("armaTipo"), empunhadura: unicosDe("empunhadura"), catArma: unicosDe("catArma"), municao: unicosDe("municao") };
  }, [dataCtx]);

  return { opcoes, opcoesArma };
}