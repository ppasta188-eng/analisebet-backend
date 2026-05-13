let cacheJogos = [];

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function salvarJogos(jogos) {
  cacheJogos = jogos || [];
}

export function buscarTodosJogos() {
  return cacheJogos;
}

export function buscarJogosPorTexto(textoBusca) {
  console.log("BUSCANDO NO CACHE:");
  console.log(textoBusca);

  const busca = normalizarTexto(textoBusca);

  return cacheJogos.filter((jogo) => {
    const home = normalizarTexto(jogo.home_team);
    const away = normalizarTexto(jogo.away_team);
    const league = normalizarTexto(jogo.league);

    return (
      home.includes(busca) ||
      away.includes(busca) ||
      league.includes(busca)
    );
  });
}
