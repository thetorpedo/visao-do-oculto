import type { Categoria } from "@/context/DataContext";

const TEMPLATES: Record<Categoria, unknown[]> = {
  poderes: [{
    id: "exemplo_poder", codigo: 1, nome: "Exemplo de Poder",
    tipo: "Geral", elemento: null, descricao: "Descrição do poder.",
    preRequisitos: null, afinidade: null,
    fonteLivro: "OPRPG", fontePagina: "42"
  }],
  rituais: [{
    id: "exemplo_ritual", codigo: 1, nome: "Exemplo de Ritual",
    elemento: ["Morte"], circulo: 1, execucao: "padrão",
    alcance: "curto", alvo: "1 alvo", area: null, duracao: "instantânea",
    resistencia: null, descricao: "Descrição do ritual.",
    aprimoramentos: null, fonteLivro: "OPRPG", fontePagina: "42"
  }],
  equipamentos: [{
    id: "exemplo_equipamento", codigo: 1, nome: "Exemplo de Equipamento",
    tipo: ["Equipamento Geral"], subtipo: "Acessório", categoria: "I",
    espaco: 1, descricao: "Descrição do item.", elemento: null,
    dano: null, critico: null, alcance: null, tipoDano: null,
    arma: null, fonteLivro: "OPRPG", fontePagina: "42"
  }],
  origens: [{
    id: "exemplo_origem", codigo: 1, nome: "Exemplo de Origem",
    descricao: "Descrição da origem.", pericias: "Atletismo e Luta.",
    tecnicaNome: "Técnica Especial",
    tecnicaDescricao: "Descrição da técnica.",
    fonteLivro: "OPRPG", fontePagina: "42"
  }],
  trilhas: [{
    id: "exemplo_trilha", codigo: 1, nome: "Exemplo de Trilha",
    tipo: "Combatente", descricao: "Descrição da trilha.",
    especial: null, nex10: "Nome. Descrição da habilidade no NEX 10%.",
    nex40: "Nome. Descrição da habilidade no NEX 40%.",
    nex65: null, nex99: null,
    fonteLivro: "OPRPG", fontePagina: "42"
  }],
  regras: [{
    id: "exemplo_regra", codigo: 1, nome: "Exemplo de Regra",
    categoria: ["Combate"], descricao: "Descrição da regra.",
    fonteLivro: "OPRPG", fontePagina: "42"
  }],
};

export function baixarTemplate(categoria: Categoria) {
  const blob = new Blob([JSON.stringify(TEMPLATES[categoria], null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template-${categoria}.json`;
  a.click();
  URL.revokeObjectURL(url);
}