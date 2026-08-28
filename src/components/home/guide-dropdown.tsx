import { useState } from "react";
import { ChevronDown, BookOpen, Bookmark } from "lucide-react";

type Secao = {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
};

const SECOES: Secao[] = [
  {
    id: "navegacao",
    titulo: "Navegação",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>O site é organizado como uma pasta de fichas, com abas para cada seção:</p>
        <table className="w-full text-xs border-collapse mt-2">
          <tbody>
            {[
              ["Origens", "Origens de personagens e suas habilidades"],
              ["Poderes", "Poderes de classe, gerais e paranormais"],
              ["Trilhas", "Trilhas de NEX para todas as classes"],
              ["Equipam.", "Armas, proteções, itens, maldições e modificações"],
              ["Rituais", "Rituais de todos os elementos e círculos"],
              ["Regras", "Regras do sistema com busca e leitura"],
              ["Fontes", "Acesso direto aos PDFs e imagens cadastrados"],
              ["Coleções", "Seus favoritos organizados em grupos"],
              ["⚙️", "Configurações, importação e exportação de dados"],
            ].map(([aba, desc]) => (
              <tr key={aba} className="border-b border-dashed border-gray-300">
                <td className="py-1 pr-3 font-special font-bold text-gray-900 whitespace-nowrap">{aba}</td>
                <td className="py-1 text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "busca",
    titulo: "Busca Global",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>Pressione <kbd className="font-mono bg-gray-200 border border-gray-400 px-1 text-xs">Ctrl + K</kbd> em qualquer página para abrir a busca global. Ela pesquisa simultaneamente em todas as categorias.</p>
        <p>Os resultados mostram um trecho da descrição com o termo destacado. Clicar leva direto para a página do item com o filtro aplicado.</p>
        <p>A URL salva os filtros ativos, você pode copiar e compartilhar com outros jogadores.</p>
      </div>
    ),
  },
  {
    id: "filtros",
    titulo: "Filtros",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>Cada página tem filtros com três estados:</p>
        <ul className="space-y-1 mt-1">
          <li><span className="inline-block border border-gray-400 bg-white/60 text-gray-700 px-2 py-0.5 text-xs font-special mr-2">Neutro</span> sem filtro</li>
          <li><span className="inline-block border border-gray-900 bg-gray-900 text-white px-2 py-0.5 text-xs font-special mr-2">Incluir</span> mostra só itens com esse valor</li>
          <li><span className="inline-block border border-red-700 bg-red-700 text-white line-through px-2 py-0.5 text-xs font-special mr-2">Excluir</span> esconde itens com esse valor</li>
        </ul>
        <p className="mt-1">Você pode combinar vários filtros ao mesmo tempo.<br />Além disso, pode buscar o modo de busca de filtro clicando no
          <span className="mx-1 px-1 text-[10px] font-bold uppercase bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300 cursor-pointer select-none transition-colors rounded-xs"
          >OU</span>
          e
          <span className="mx-1 px-1 text-[10px] font-bold uppercase bg-gray-200 border border-gray-400 text-gray-700 hover:bg-gray-300 cursor-pointer select-none transition-colors rounded-xs"
          >E</span>
          para exigir todos ou aceitar qualquer um dos filtros ativos.
          </p>
      </div>
    ),
  },
  {
    id: "fontes",
    titulo: "Leitura de Fontes & Cache",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>Cada card tem um botão de fonte no rodapé. Clicar abre o PDF ou imagem correspondente no site, já na página certa.</p>
        <p>Para isso funcionar, o arquivo precisa estar disponível: cadastre-o em <span className="font-special">Configurações → Fontes & PDFs</span>.</p>
        <p>Clique em <strong>Baixar fontes em cache</strong> na página inicial para salvar os arquivos no navegador. Depois disso os PDFs abrem mais rápido e sem internet.</p>
      </div>
    ),
  },
  {
    id: "favoritos",
    titulo: "Favoritos e Coleções",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>Clique no <strong>marca página (<Bookmark className="w-4 h-4 inline" />)</strong> em qualquer card para favoritar. O site permite escolher em qual grupo salvar, ou criar um grupo novo.</p>
        <p>Um item pode estar em vários grupos ao mesmo tempo.</p>
        <p>Na aba <span className="font-special">Coleções</span>, veja todos os favoritos organizados por grupo.</p>
        <p className="text-xs text-gray-500">Os favoritos ficam salvos no seu navegador.</p>
      </div>
    ),
  },
  {
    id: "importar",
    titulo: "Importar e Exportar Dados",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-2">
        <p>Em <span className="font-special">Configurações → Dados JSON</span> você pode:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li><strong>Adicionar JSON</strong> : importar dados por categoria ou um pacote completo</li>
          <li><strong>Exportar</strong> : baixar os itens de uma categoria como JSON</li>
          <li><strong>Exportar tudo</strong> : gera um único JSON com todas as categorias (use como backup)</li>
          <li><strong>Template</strong> : baixar um arquivo de exemplo para criar seus próprios dados</li>
        </ul>
      </div>
    ),
  },
  {
    id: "json-geral",
    titulo: "Criando JSONs - Regras Gerais",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        <p>Você pode criar conteúdo homebrew ou adicionar itens que faltam. Baixe o template em <span className="font-special">Configurações → Template</span> e siga a estrutura.</p>
        <p>Cada arquivo deve ser um <strong>array</strong> de objetos, mesmo com um só item:</p>
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto">{`[ { "id": "meu_poder", ... }, { "id": "outro_poder", ... } ]`}</pre>
        <p>O site também aceita um <strong>pacote completo</strong> com múltiplas categorias (formato do "Exportar tudo"):</p>
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto">{`{ "poderes": [...], "rituais": [...], "equipamentos": [...] }`}</pre>

        <p className="font-bold text-gray-900 mt-1">Campos comuns a todas as categorias:</p>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-gray-900 text-white font-special"><th className="p-1 text-left">Campo</th><th className="p-1 text-left">Tipo</th><th className="p-1 text-left">Descrição</th></tr></thead>
          <tbody>
            {[
              ["id", "string", "snake_case único - ex: ataque_rapido_as5"],
              ["codigo", "número", "Inteiro positivo único dentro da categoria"],
              ["nome", "string", "Nome como aparece no livro"],
              ["fonteLivro", "string", "Sigla da fonte: OPRPG, SAH, AS1…AS6"],
              ["fontePagina", "string", "Página sempre entre aspas: \"42\", não 42"],
            ].map(([campo, tipo, desc]) => (
              <tr key={campo} className="border-b border-dashed border-gray-200">
                <td className="py-1 pr-2 font-mono text-gray-900 whitespace-nowrap">{campo}</td>
                <td className="py-1 pr-2 text-gray-500 whitespace-nowrap">{tipo}</td>
                <td className="py-1 text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="font-bold text-gray-900 mt-1">IDs com colisão de nomes:</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Mesmo nome, fontes diferentes → adicione a sigla: <span className="font-mono">ataque_rapido_as5</span></li>
          <li>Mesmo nome e mesma fonte → adicione número: <span className="font-mono">ataque_rapido_as5_2</span></li>
        </ul>
      </div>
    ),
  },
  {
    id: "json-poderes",
    titulo: "Criando JSONs - Poderes",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "resistencia_paranormal",
  "codigo": 47,
  "nome": "Resistência Paranormal",
  "tipo": "Ocultista",
  "elemento": "Morte",
  "descricao": "Você recebe +2 em testes de Vontade contra efeitos paranormais.",
  "preRequisitos": "NEX 25%, Ocultismo (treinado)",
  "afinidade": "O bônus aumenta para +5.",
  "fonteLivro": "AS5",
  "fontePagina": "34"
}`}</pre>

        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-gray-900 text-white font-special"><th className="p-1 text-left">Campo</th><th className="p-1 text-left">Observação</th></tr></thead>
          <tbody>
            {[
              ["tipo", "Exatamente um de: Geral, Combatente, Especialista, Ocultista, Sacrifício, Paranormal"],
              ["elemento", "String ou null - um único elemento, não array"],
              ["afinidade", "Só preencha se tiver elemento. Obrigatoriamente null se elemento for null"],
              ["preRequisitos", "Texto livre ou null"],
            ].map(([campo, obs]) => (
              <tr key={campo} className="border-b border-dashed border-gray-200">
                <td className="py-1 pr-2 font-mono text-gray-900 whitespace-nowrap">{campo}</td>
                <td className="py-1 text-gray-600">{obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "json-rituais",
    titulo: "Criando JSONs - Rituais",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "invocar_sombras",
  "codigo": 12,
  "nome": "Invocar Sombras",
  "elemento": ["Morte", "Medo"],
  "circulo": 2,
  "execucao": "Padrão",
  "alcance": "Médio",
  "alvo": null,
  "area": "Esfera de 6m",
  "duracao": "Sustentada",
  "resistencia": "Vontade parcial",
  "descricao": "Descrição do ritual.",
  "aprimoramentos": [
    { "nome": "Discente", "custo": "+2 PE", "descricao": "Efeito. Requer 3º círculo." }
  ],
  "fonteLivro": "OPRPG",
  "fontePagina": "215"
}`}</pre>

        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-gray-900 text-white font-special"><th className="p-1 text-left">Campo</th><th className="p-1 text-left">Observação</th></tr></thead>
          <tbody>
            {[
              ["elemento", "Array obrigatório - ex: [\"Morte\"] ou [\"Morte\", \"Medo\"]"],
              ["circulo", "Número inteiro de 1 a 4"],
              ["alvo / area", "Normalmente um é null e o outro preenchido. Ambos podem ser null"],
              ["resistencia", "Texto livre ou null se não houver resistência"],
              ["aprimoramentos", "Array de {nome, custo, descricao} ou null se não houver"],
            ].map(([campo, obs]) => (
              <tr key={campo} className="border-b border-dashed border-gray-200">
                <td className="py-1 pr-2 font-mono text-gray-900 whitespace-nowrap">{campo}</td>
                <td className="py-1 text-gray-600">{obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "json-equipamentos",
    titulo: "Criando JSONs - Equipamentos",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "espingarda_tatica",
  "codigo": 88,
  "nome": "Espingarda Tática",
  "tipo": ["Arma"],
  "subtipo": null,
  "categoria": "II",
  "espaco": 2,
  "descricao": "Uma espingarda robusta.",
  "elemento": null,
  "dano": "3d6",
  "critico": "x3",
  "alcance": "Curto",
  "tipoDano": "Balístico",
  "arma": {
    "armaTipo": "Disparo",
    "empunhadura": "Duas mãos",
    "catArma": null,
    "municao": "Cartuchos"
  },
  "fonteLivro": "OPRPG",
  "fontePagina": "178"
}`}</pre>

        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-gray-900 text-white font-special"><th className="p-1 text-left">Campo</th><th className="p-1 text-left">Observação</th></tr></thead>
          <tbody>
            {[
              ["tipo", "Array - ex: [\"Arma\"], [\"Proteção\"], [\"Item Amaldiçoado\", \"Arma\"]"],
              ["categoria", "\"0\", \"I\", \"II\", \"III\", \"IV\" ou null"],
              ["arma", "Preencha só se for arma. Use null para todo o resto"],
              ["arma.armaTipo", "Corpo a Corpo, Arremesso, Disparo ou Fogo"],
              ["arma.empunhadura", "Uma mão, Duas mãos ou Leve"],
              ["arma.catArma", "Ágil, Automática ou null"],
              ["dano/critico/alcance/tipoDano", "Use null para itens que não causam dano"],
            ].map(([campo, obs]) => (
              <tr key={campo} className="border-b border-dashed border-gray-200">
                <td className="py-1 pr-2 font-mono text-gray-900 whitespace-nowrap">{campo}</td>
                <td className="py-1 text-gray-600">{obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "json-origens-trilhas",
    titulo: "Criando JSONs - Origens e Trilhas",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-4">
        <div>
          <p className="font-bold text-gray-900 mb-2">Origens</p>
          <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "militar",
  "codigo": 15,
  "nome": "Militar",
  "descricao": "Você serviu nas forças armadas.",
  "pericias": "Atletismo e Pontaria.",
  "tecnicaNome": "Treinamento de Campo",
  "tecnicaDescricao": "Uma vez por cena, role um dado extra em testes de Atletismo ou Fortitude e descarte o menor.",
  "fonteLivro": "OPRPG",
  "fontePagina": "92"
}`}</pre>
          <p className="text-xs text-gray-500 mt-1"><span className="font-mono">tecnicaNome</span> e <span className="font-mono">tecnicaDescricao</span> se referem a habilidade que vem com a origem. Não lembro porque deixei com esse nome mas agora já tá definido no sistema desse jeito.</p>
          <p className="text-xs text-gray-500 mt-1"><span className="font-mono">tecnicaNome</span> e <span className="font-mono">tecnicaDescricao</span> são obrigatórios - não aceitam null.</p>
        </div>

        <div>
          <p className="font-bold text-gray-900 mb-2">Trilhas</p>
          <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "aniquilador",
  "codigo": 3,
  "nome": "Aniquilador",
  "tipo": "Combatente",
  "descricao": "Você focou em causar o máximo de dano possível.",
  "especial": null,
  "nex10": "Golpe Brutal. Gaste 1 PE para aumentar o dano em 1d6.",
  "nex40": "Ímpeto Destruidor. Uma vez por rodada, faça um segundo ataque.",
  "nex65": "Força Avassaladora. Seus ataques ignoram 5 pontos de RD.",
  "nex99": null,
  "fonteLivro": "OPRPG",
  "fontePagina": "145"
}`}</pre>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside mt-1">
            <li><span className="font-mono">nex10</span> e <span className="font-mono">nex40</span> são obrigatórios. <span className="font-mono">nex65</span> e <span className="font-mono">nex99</span> podem ser null.</li>
            <li>Formato recomendado: <span className="font-mono">"Nome. Descrição."</span> - o ponto separa o nome do efeito na exibição.</li>
            <li>Trilhas de Sobrevivente usam <span className="font-mono">nex10</span>/<span className="font-mono">nex40</span> para Estágio 2/4.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "json-regras",
    titulo: "Criando JSONs - Regras",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        <pre className="bg-gray-100 border border-gray-300 p-2 text-xs font-mono overflow-x-auto whitespace-pre">{`{
  "id": "flanquear",
  "codigo": 42,
  "nome": "Flanquear",
  "categoria": ["Combate", "Posicionamento"],
  "descricao": "Você e um aliado flanqueiam um inimigo quando estão em posições opostas adjacentes a ele.\\n\\nQuando flanqueia, recebe **+2 em testes de ataque** contra ele.\\n\\n> **FLANQUEAR:** +2 em testes de ataque contra o alvo flanqueado.",
  "fonteLivro": "OPRPG",
  "fontePagina": "177"
}`}</pre>

        <p className="font-bold text-gray-900">Markdown disponível na descrição:</p>
        <table className="w-full text-xs border-collapse">
          <tbody>
            {[
              ["**texto**", "Negrito"],
              ["*texto*", "Itálico"],
              ["# Título", "Título grande (use ## ou ### para menores)"],
              ["- item", "Lista com marcadores"],
              ["> texto", "Citação / caixa de destaque"],
              ["| A | B |\\n|---|---|\\n| 1 | 2 |", "Tabela"],
              ["\\n\\n", "Quebra de parágrafo dentro do JSON"],
            ].map(([sintaxe, desc]) => (
              <tr key={sintaxe} className="border-b border-dashed border-gray-200">
                <td className="py-1 pr-2 font-mono text-gray-900 whitespace-nowrap">{sintaxe}</td>
                <td className="py-1 text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-gray-500">A categoria é um array de tags livres - use o que fizer sentido para organização e filtragem.</p>
      </div>
    ),
  },
  {
    id: "faq",
    titulo: "Perguntas Frequentes",
    conteudo: (
      <div className="text-sm text-gray-700 space-y-3">
        {[
          ["Perdi meus dados, o que faço?", "Os dados ficam no navegador. Se você limpou o histórico ou trocou de dispositivo, use \"Exportar tudo\" regularmente para guardar um backup em JSON."],
          ["Posso usar em outro dispositivo?", "Sim, mas precisará importar os dados novamente. Exporte o pacote completo no dispositivo atual e importe no novo."],
          ["Posso adicionar conteúdo homebrew?", "Você pode adicionar o que quiser. Crie um JSON seguindo a estrutura dos templates, dê um nome como poderes-homebrew.json e importe em Configurações."],
          ["Dois itens com o mesmo nome dão problema?", "O id é o que precisa ser único, não o nome. Se dois itens tiverem nomes iguais mas forem de fontes diferentes, use o sufixo da fonte no id: ataque_rapido_as5."],
        ].map(([pergunta, resposta]) => (
          <div key={pergunta as string}>
            <p className="font-bold text-gray-900">{pergunta}</p>
            <p className="text-gray-600 mt-0.5">{resposta}</p>
          </div>
        ))}
      </div>
    ),
  },
];

function SecaoDropdown({ secao }: { secao: Secao }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="border border-dashed border-gray-400 bg-white/40">
      <button
        onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100/50 transition-colors"
      >
        <span className="font-special uppercase tracking-wide text-gray-900 text-sm">{secao.titulo}</span>
        <ChevronDown className={`size-4 text-gray-500 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} />
      </button>
      {aberto && (
        <div className="px-4 pb-4 pt-1 border-t border-dashed border-gray-300 animate-in slide-in-from-top-1 duration-150">
          {secao.conteudo}
        </div>
      )}
    </div>
  );
}

export default function GuideDropdown() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative w-full">
      <div className="relative z-10 bg-black/10 bg-repeat bg-size-[30%] border border-black/40">
        <button
          onClick={() => setAberto(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-gray-700" />
            <span className="font-special uppercase tracking-wider text-gray-900">Guia & Documentação</span>
          </div>
          <ChevronDown className={`size-5 text-gray-500 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} />
        </button>

        {aberto && (
          <div className="border-t border-dashed border-gray-400 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {SECOES.map(secao => (
              <SecaoDropdown key={secao.id} secao={secao} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}