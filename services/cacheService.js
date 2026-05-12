let jogosCache = [];

function normalizarTexto(texto) {
  return texto
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function gerarTermosBusca(jogo) {
  const termos = [];

  const home = jogo.home_team || "";
  const away = jogo.away_team || "";
  const sport = jogo.sport_title || "";
  const league = jogo.sport_key || "";

  termos.push(home);
  termos.push(away);
  termos.push(`${home} ${away}`);
  termos.push(sport);
  termos.push(league);

  // Brasileirão
  if (
    league.includes("brazil") ||
    sport.toLowerCase().includes("brazil")
  ) {
    termos.push("brasileirao");
    termos.push("brasileirão");
    termos.push("brasil");
    termos.push("serie a");
    termos.push("campeonato brasileiro");
  }

  // Copa do Brasil
  if (
    sport.toLowerCase().includes("copa") ||
    league.toLowerCase().includes("copa")
  ) {
    termos.push("copa do brasil");
    termos.push("copa brasil");
  }

  // La Liga
  if (
    league.includes("spain") ||
    sport.toLowerCase().includes("la liga")
  ) {
    termos.push("la liga");
    termos.push("laliga");
    termos.push("espanhol");
  }

  // Champions
  if (
    league.includes("champions") ||
    sport.toLowerCase().includes("champions")
  ) {
    termos.push("champions");
    termos.push("liga dos campeoes");
    termos.push("liga dos campeões");
    termos.push("ucl");
  }

  // Bundesliga
  if (
    league.includes("bundesliga") ||
    sport.toLowerCase().includes("bundesliga")
  ) {
    termos.push("bundesliga");
    termos.push("alemao");
    termos.push("alemão");
  }

  // NBA
  if (
    league.includes("nba") ||
    sport.toLowerCase().includes("nba")
  ) {
    termos.push("nba");
    termos.push("basquete");
  }

  // Serie A Itália
  if (
    league.includes("italy") ||
    sport.toLowerCase().includes("serie a")
  ) {
    termos.push("italiano");
    termos.push("serie a italia");
    termos.push("serie a italiana");
  }

  // Ligue 1
  if (
    league.includes("france") ||
    sport.toLowerCase().includes("ligue")
  ) {
    termos.push("frances");
    termos.push("francês");
    termos.push("ligue 1");
  }

  return termos.map(normalizarTexto);
}

export function salvarJogos(jogos) {
  jogosCache = jogos.map((jogo) => ({
    ...jogo,
    termosBusca: gerarTermosBusca(jogo),
  }));
}

export function buscarJogosPorTime(texto) {
  const busca = normalizarTexto(texto);

  return jogosCache.filter((jogo) => {
    return jogo.termosBusca.some((termo) =>
      termo.includes(busca)
    );
  });
}
