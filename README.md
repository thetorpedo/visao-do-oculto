# Visão do Oculto

Uma ferramenta de consulta rápida para **Ordem Paranormal RPG**. Reúne poderes, rituais, equipamentos, origens, trilhas e regras de várias fontes num lugar só.

🔗 **[visao-do-oculto.web.app](https://visao-do-oculto.web.app)**

---

## Sobre

Ordem foi crescendo, veio o suplemento, veio os Arquivos Secretos, e ficar consultando PDF atrás de PDF no meio da sessão é complicado. Esse site é basicamente um índice navegável e filtrável de tudo que você inserir.

O site não vem com os dados, por razões óbvias. Você precisa importar seus próprios JSONs com os dados.
Na primeira vez acessando o site ele deve abrir na tela de importação, em que pede os dados necessários pra iniciar o site, mas ainda pode adicionar ou remover dados na tela de configuração.

Pra quem estiver aqui vendo o código do site, saiba que isso é um projeto que mexo no meu tempo livre e não segue muito um padrão de qualidade.
Tem muita gambiarra por aí, coisas que poderiam ser componentes mas não são... Mas dei uma ajeitada pra ficar um pouco mais apresentável nesse github público.

Tem partes do código que tem fallbacks e distinção de público/privado, isso é porque mantenho uma versão privada do site pras minhas mesas, em que já tem dados inserido no site.
Não deve afetar em nada a versão pública, só compartilham o mesmo código e quero continuar atualizando um único projeto.
Repetindo: a versão pública NÃO contém material de Ordem Paranormal RPG. 

## Formato dos dados

Cada categoria tem seu próprio schema. Para ajudar a montar seus JSONs, baixe o template de cada categoria na página de **Configurações** do site.
Suporta múltiplos arquivos por categoria (ex: `poderes-oprpg.json` + `poderes-homebrew.json`) e um JSON único com todas as categorias juntas.

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Sem dados importados, o site abre na tela de importação, que é o comportamento esperado.

## Stack

React + TypeScript + Vite + Tailwind. Dados ficam no IndexedDB do navegador, sem backend.

## Aviso legal

Todo o conteúdo original de Ordem Paranormal pertence à Jambô Editora e ao universo criado por Cellbit. Este projeto não tem vínculo comercial com a Jambô, não disponibiliza qualquer material de Ordem Paranormal RPG, e não substitui a compra dos materiais oficiais.
