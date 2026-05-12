let jogosCache = [];

export function salvarJogos(jogos) {
  jogosCache = jogos;
}

export function obterJogos() {
  return jogosCache;
}

export function buscarJogosPorTime(nomeTime) {
  return jogosCache.filter((jogo) => {
    const home = jogo.home_team?.toLowerCase() || "";
    const away = jogo.away_team?.toLowerCase() || "";

    return (
      home.includes(nomeTime.toLowerCase()) ||
      away.includes(nomeTime.toLowerCase())
    );
  });
}

export function limparCache() {
  jogosCache = [];
}
