export function analisarJogo(jogo) {
  const homeTeam = jogo.home_team;
  const awayTeam = jogo.away_team;

  const bookmaker = jogo.bookmakers?.[0];

  if (!bookmaker) {
    return {
      erro: "Sem odds disponíveis"
    };
  }

  const market = bookmaker.markets?.find(
    (m) => m.key === "h2h"
  );

  if (!market) {
    return {
      erro: "Mercado h2h não encontrado"
    };
  }

  const outcomes = market.outcomes;

  const home = outcomes.find(
    (o) => o.name === homeTeam
  );

  const away = outcomes.find(
    (o) => o.name === awayTeam
  );

  const draw = outcomes.find(
    (o) => o.name.toLowerCase() === "draw"
  );

  if (!home || !away || !draw) {
    return {
      erro: "Odds incompletas"
    };
  }

  const homeOdd = home.price;
  const awayOdd = away.price;
  const drawOdd = draw.price;

  // =========================
  // PROBABILIDADES
  // =========================

  const homeProbRaw = 1 / homeOdd;
  const drawProbRaw = 1 / drawOdd;
  const awayProbRaw = 1 / awayOdd;

  const total =
    homeProbRaw +
    drawProbRaw +
    awayProbRaw;

  const homeProb =
    (homeProbRaw / total) * 100;

  const drawProb =
    (drawProbRaw / total) * 100;

  const awayProb =
    (awayProbRaw / total) * 100;

  // =========================
  // FAVORITO
  // =========================

  let favorito = homeTeam;
  let favoritaOdd = homeOdd;
  let probFavorito = homeProb;

  if (awayOdd < homeOdd) {
    favorito = awayTeam;
    favoritaOdd = awayOdd;
    probFavorito = awayProb;
  }

  // =========================
  // RISCO
  // =========================

  let risco = "Alto";

  if (favoritaOdd <= 1.70) {
    risco = "Baixo";
  } else if (favoritaOdd <= 2.20) {
    risco = "Médio";
  }

  // =========================
  // CONFIANÇA
  // =========================

  let confianca = 5;

  if (probFavorito >= 60) {
    confianca = 9;
  } else if (probFavorito >= 55) {
    confianca = 8;
  } else if (probFavorito >= 50) {
    confianca = 7;
  } else if (probFavorito >= 45) {
    confianca = 6;
  }

  // =========================
  // SUGESTÃO
  // =========================

  let sugestao = "Jogo equilibrado";

  if (probFavorito >= 60) {
    sugestao = `Vitória ${favorito}`;
  } else if (probFavorito >= 50) {
    sugestao = `${favorito} DNB`;
  }

  return {
    homeTeam,
    awayTeam,

    homeOdd,
    drawOdd,
    awayOdd,

    homeProb: homeProb.toFixed(1),
    drawProb: drawProb.toFixed(1),
    awayProb: awayProb.toFixed(1),

    favorito,
    favoritaOdd,

    risco,
    confianca,
    sugestao
  };
}
