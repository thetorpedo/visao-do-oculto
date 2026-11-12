type CampoBusca = string | null | undefined;

export function ordenarPorRelevancia<T extends { nome: string }>(
  itens: T[],
  busca: string,
  extrairCampos: (item: T) => CampoBusca[],
): T[] {
  const termo = busca.trim().toLowerCase();
  const compararNome = (a: T, b: T) => a.nome.localeCompare(b.nome);

  if (!termo) {
    return [...itens].sort(compararNome);
  }

  const pontuar = (item: T) =>
    extrairCampos(item).reduce((melhor, campo, prioridade) => {
      if (!campo) return melhor;

      const texto = campo.toLowerCase();
      const indice = texto.indexOf(termo);
      if (indice === -1) return melhor;

      const distancia = indice === 0 ? 0 : 1_000_000 + indice * 100;
      const pontuacao = prioridade * 10_000_000 + distancia + texto.length - termo.length;
      return Math.min(melhor, pontuacao);
    }, Number.POSITIVE_INFINITY);

  return [...itens].sort((a, b) => pontuar(a) - pontuar(b) || compararNome(a, b));
}
