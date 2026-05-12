let jogosCache = [];

export function salvarJogos(jogos) {
  jogosCache = jogos;
}

export function obterJogos() {
  return jogosCache;
}

export function limparCache() {
  jogosCache = [];
}
