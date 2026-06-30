import type { Categoria } from "@/context/DataContext";

const TEMPLATES: Record<Categoria, unknown> = {
  poderes: [{
    id: "exemplo_poder",
    codigo: 1, // ID numérico único
    nome: "Nome do Poder",
    tipo: "Combatente", // Valores: "Geral", "Combatente", "Especialista", "Ocultista", "Sacrifício", "Paranormal"
    elemento: "Sangue", // Opcional (pode ser null)
    descricao: "Texto que descreve o efeito do poder.",
    preRequisitos: "NEX 15%, Treinado em Luta",
    afinidade: "Apenas se tiver elemento.",
    fonteLivro: "OPRPG", // Sigla do livro
    fontePagina: "100"   // Sempre como string
  }],

  rituais: [{
    id: "exemplo_ritual",
    codigo: 1,
    nome: "Nome do Ritual",
    elemento: ["Morte", "Medo"], // Array de elementos
    circulo: 1, // 1, 2, 3 ou 4
    execucao: "Padrão",
    alcance: "Curto",
    alvo: "1 alvo", // Pode ser null
    area: "Esfera de 6m",     // Pode ser null
    duracao: "Instantânea",
    resistencia: "Fortitude",
    descricao: "Descrição completa do ritual.",
    aprimoramentos: [ // Opcional
      { nome: "Discente", custo: "+2 PE", descricao: "Descrição do efeito aprimorado." }
    ],
    fonteLivro: "OPRPG",
    fontePagina: "120"
  }],

  equipamentos: [{
    id: "exemplo_equipamento",
    codigo: 1,
    nome: "Faca",
    tipo: ["Arma", "Item Amaldiçoado"], // Array de tipos (ex: Arma, Proteção, Utensílio...)
    subtipo: "Item Operacional", // Pode ser null
    categoria: "I", // "0", "I", "II", "III", "IV"
    espaco: 1,
    descricao: "Uma faca comum de cozinha.",
    elemento: "Sangue", // Pode ser null
    dano: "1d4",
    critico: "19/x2",
    alcance: "Curto",
    tipoDano: "Cortante",
    arma: { // Opcional: preencher apenas se for arma
      armaTipo: "Leve",
      empunhadura: "Uma mão",
      catArma: "Simples",
      municao: "Balas Curtas" // Pode ser null
    },
    fonteLivro: "OPRPG",
    fontePagina: "150"
  }],

  origens: [{
    id: "exemplo_origem",
    codigo: 1,
    nome: "Atleta",
    descricao: "Você é um esportista profissional.",
    pericias: "Atletismo e Fortitude.",
    tecnicaNome: "Nome da Habilidade Especial",
    tecnicaDescricao: "Descrição da habilidade que a origem concede.",
    fonteLivro: "OPRPG",
    fontePagina: "80"
  }],

  trilhas: [{
    id: "exemplo_trilha",
    codigo: 1,
    nome: "Aniquilador",
    tipo: "Combatente",
    descricao: "Você foca em causar o máximo de dano possível.",
    especial: "Efeito único da trilha se houver.",
    nex10: "Nome. Efeito no NEX 10%.",
    nex40: "Nome. Efeito no NEX 40%.",
    nex65: "Nome. Efeito no NEX 65% (pode ser null).",
    nex99: "Nome. Efeito no NEX 99% (pode ser null).",
    fonteLivro: "OPRPG",
    fontePagina: "90"
  }],

  regras: [{
    id: "exemplo_regra",
    codigo: 1,
    nome: "Regra de Combate",
    categoria: ["Combate", "Movimentação"], // Array de tags
    descricao: "### Texto em Markdown\n\nTexto explicando a regra com formatação, **negrito**, *itálico*, etc.",
    fonteLivro: "OPRPG",
    fontePagina: "200"
  }]
};

export function baixarTemplate(categoria: Categoria) {
  const data = TEMPLATES[categoria];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template-${categoria}.json`;
  a.click();
  URL.revokeObjectURL(url);
}