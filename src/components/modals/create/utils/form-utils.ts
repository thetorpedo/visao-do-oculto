import type { Categoria } from "@/context/DataContext";

export const vazioParaNull = (v: string) => (v.trim() === "" ? null : v);

export const csvParaArray = (v: string) =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

export type Aprimoramento = { nome: string; custo: string; descricao: string };

export function estadoInicial(categoria: Categoria): any {
  const base = { nome: "", descricao: "", fonteLivro: "Homebrew", fontePagina: "1" };

  switch (categoria) {
    case "poderes":
      return { ...base, tipo: "Geral", elemento: "", preRequisitos: "", afinidade: "" };
    case "equipamentos":
      return { ...base, tipo: "", subtipo: "", categoria: "", espaco: "", elemento: "", dano: "", critico: "", alcance: "", tipoDano: "", temArma: false, armaTipo: "", empunhadura: "", catArma: "", municao: "" };
    case "origens":
      return { ...base, pericias: "", tecnicaNome: "", tecnicaDescricao: "" };
    case "rituais":
      return { ...base, elemento: "", circulo: "1", execucao: "", alcance: "", alvo: "", area: "", duracao: "", resistencia: "", aprimoramentos: [] as Aprimoramento[] };
    case "trilhas":
      return { ...base, tipo: "", especial: "", nex10: "", nex40: "", nex65: "", nex99: "" };
    case "regras":
      return { ...base, categoria: "" };
  }
}

export function montarPayload(categoria: Categoria, f: any) {
    // ADICIONADO: id e codigo para o payload final
    const comum = {
        id: f.id,
        codigo: f.codigo,
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

export function itemParaForm(categoria: Categoria, item: any): any {
  const base = {
      id: item.id,
      codigo: item.codigo,
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