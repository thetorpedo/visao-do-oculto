import type { Categoria } from "@/context/DataContext";

export const vazioParaNull = (v: string) => (v.trim() === "" ? null : v);

export const csvParaArray = (v: string) =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

export type Aprimoramento = { nome: string; custo: string; descricao: string };
export type PericiaForm = { nome: string; valor: string };
export type BlocoForm = {
  secao: "caracteristicas" | "tracos" | "acoes" | "enigma" | "comportamento";
  acao: string;
  titulo: string;
  tags: string;
  descricao: string;
};

function separarHabilidade(texto: string | null | undefined) {
  const valor = texto ?? "";
  const ponto = valor.indexOf(".");

  if (ponto === -1) return { titulo: valor, descricao: "" };

  return {
    titulo: valor.slice(0, ponto).trim(),
    descricao: valor.slice(ponto + 1).trim(),
  };
}

function juntarHabilidade(titulo: string, descricao: string) {
  const nome = titulo.trim();
  const efeito = descricao.trim();
  if (!nome) return efeito;
  if (!efeito) return nome;
  return `${nome.replace(/\.$/, "")}. ${efeito}`;
}

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
      return {
        ...base,
        tipo: "",
        especial: "",
        nex10Titulo: "",
        nex10Descricao: "",
        nex40Titulo: "",
        nex40Descricao: "",
        nex65Titulo: "",
        nex65Descricao: "",
        nex99Titulo: "",
        nex99Descricao: "",
      };
    case "regras":
      return { ...base, categoria: "" };
    case "ameacas":
      return {
        ...base,
        vd: "20",
        tipo: "Criatura",
        tamanho: "Médio",
        elementos: "",
        elementosSecundarios: "",
        grupos: "",
        apresentacao: "",
        percepcao: "1d20",
        iniciativa: "1d20",
        sentidosExtras: "",
        defesaValor: "15",
        fortitude: "1d20",
        reflexos: "1d20",
        vontade: "1d20",
        pv: "50",
        machucado: "",
        resistencias: "",
        imunidades: "",
        vulnerabilidades: "",
        agi: "1",
        for: "1",
        int: "1",
        pre: "1",
        vig: "1",
        deslocamento: "9m | 6□",
        pericias: [] as PericiaForm[],
        blocos: [] as BlocoForm[],
        observacoes: "",
      };
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
                nex10: juntarHabilidade(f.nex10Titulo, f.nex10Descricao),
                nex40: juntarHabilidade(f.nex40Titulo, f.nex40Descricao),
                nex65: vazioParaNull(juntarHabilidade(f.nex65Titulo, f.nex65Descricao)),
                nex99: vazioParaNull(juntarHabilidade(f.nex99Titulo, f.nex99Descricao)),
            };

        case "regras":
            return {
                ...comum,
                categoria: csvParaArray(f.categoria),
            };

        case "ameacas":
            return {
                id: f.id,
                codigo: f.codigo,
                nome: f.nome,
                vd: f.vd === "" ? 0 : Number(f.vd),
                tipo: f.tipo,
                tamanho: f.tamanho,
                elementos: csvParaArray(f.elementos ?? ""),
                elementosSecundarios: csvParaArray(f.elementosSecundarios ?? ""),
                grupos: csvParaArray(f.grupos ?? ""),
                apresentacao: vazioParaNull(f.apresentacao ?? ""),
                sentidos: {
                    percepcao: f.percepcao,
                    iniciativa: f.iniciativa,
                    extras: csvParaArray(f.sentidosExtras ?? ""),
                },
                defesa: {
                    valor: f.defesaValor === "" ? 0 : Number(f.defesaValor),
                    fortitude: f.fortitude,
                    reflexos: f.reflexos,
                    vontade: f.vontade,
                },
                pv: f.pv === "" ? 0 : Number(f.pv),
                machucado:
                    f.machucado === "" || f.machucado === null || f.machucado === undefined
                        ? null
                        : Number(f.machucado),
                resistencias: csvParaArray(f.resistencias ?? ""),
                imunidades: csvParaArray(f.imunidades ?? ""),
                vulnerabilidades: csvParaArray(f.vulnerabilidades ?? ""),
                atributos: {
                    agi: f.agi === "" || f.agi === null || f.agi === undefined ? null : Number(f.agi),
                    for: f.for === "" || f.for === null || f.for === undefined ? null : Number(f.for),
                    int: f.int === "" || f.int === null || f.int === undefined ? null : Number(f.int),
                    pre: f.pre === "" || f.pre === null || f.pre === undefined ? null : Number(f.pre),
                    vig: f.vig === "" || f.vig === null || f.vig === undefined ? null : Number(f.vig),
                },
                pericias: (f.pericias ?? []).map((p: PericiaForm) => ({
                    nome: p.nome.trim(),
                    valor: p.valor.trim(),
                })),
                deslocamento: f.deslocamento,
                blocos: (f.blocos ?? []).map((b: BlocoForm) => ({
                    secao: b.secao === "tracos" ? "caracteristicas" : b.secao,
                    acao: vazioParaNull(b.acao ?? ""),
                    titulo: b.titulo.trim(),
                    tags: csvParaArray(b.tags ?? ""),
                    descricao: b.descricao,
                })),
                observacoes: vazioParaNull(f.observacoes ?? ""),
                fonteLivro: f.fonteLivro || "Homebrew",
                fontePagina: f.fontePagina || "1",
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
          const nex10 = separarHabilidade(item.nex10);
          const nex40 = separarHabilidade(item.nex40);
          const nex65 = separarHabilidade(item.nex65);
          const nex99 = separarHabilidade(item.nex99);
          return {
              ...base,
              tipo: item.tipo ?? "",
              especial: item.especial ?? "",
              nex10Titulo: nex10.titulo,
              nex10Descricao: nex10.descricao,
              nex40Titulo: nex40.titulo,
              nex40Descricao: nex40.descricao,
              nex65Titulo: nex65.titulo,
              nex65Descricao: nex65.descricao,
              nex99Titulo: nex99.titulo,
              nex99Descricao: nex99.descricao,
          };
      case "regras":
          return { ...base, categoria: (item.categoria ?? []).join(", ") };
      case "ameacas":
          return {
              ...base,
              vd: String(item.vd ?? 0),
              tipo: item.tipo ?? "",
              tamanho: item.tamanho ?? "",
              elementos: (item.elementos ?? []).join(", "),
              elementosSecundarios: (item.elementosSecundarios ?? []).join(", "),
              grupos: (item.grupos ?? []).join(", "),
              apresentacao: item.apresentacao ?? "",
              percepcao: item.sentidos?.percepcao ?? "",
              iniciativa: item.sentidos?.iniciativa ?? "",
              sentidosExtras: (item.sentidos?.extras ?? []).join(", "),
              defesaValor: String(item.defesa?.valor ?? 0),
              fortitude: item.defesa?.fortitude ?? "",
              reflexos: item.defesa?.reflexos ?? "",
              vontade: item.defesa?.vontade ?? "",
              pv: String(item.pv ?? 0),
              machucado: item.machucado !== null && item.machucado !== undefined ? String(item.machucado) : "",
              resistencias: (item.resistencias ?? []).join(", "),
              imunidades: (item.imunidades ?? []).join(", "),
              vulnerabilidades: (item.vulnerabilidades ?? []).join(", "),
              agi: item.atributos?.agi !== null && item.atributos?.agi !== undefined ? String(item.atributos.agi) : "",
              for: item.atributos?.for !== null && item.atributos?.for !== undefined ? String(item.atributos.for) : "",
              int: item.atributos?.int !== null && item.atributos?.int !== undefined ? String(item.atributos.int) : "",
              pre: item.atributos?.pre !== null && item.atributos?.pre !== undefined ? String(item.atributos.pre) : "",
              vig: item.atributos?.vig !== null && item.atributos?.vig !== undefined ? String(item.atributos.vig) : "",
              deslocamento: item.deslocamento ?? "",
              pericias: (item.pericias ?? []).map((p: any) => ({
                  nome: p.nome ?? "",
                  valor: p.valor ?? "",
              })),
              blocos: (item.blocos ?? []).map((b: any) => ({
                  secao: b.secao === "tracos" || !b.secao ? "caracteristicas" : b.secao,
                  acao: b.acao ?? "",
                  titulo: b.titulo ?? "",
                  tags: (b.tags ?? []).join(", "),
                  descricao: b.descricao ?? "",
              })),
              observacoes: item.observacoes ?? "",
          };
      default:
          return base;
  }
}