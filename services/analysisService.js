export function analisarJogo(jogo) {
  const homeTeam = jogo.home_team;
  const awayTeam = jogo.away_team;

  const bookmaker = jogo.bookmakers?.[0];

  if (!bookmaker) {
    return {
      erro: "Bookmaker não encontrado"
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
    (o) => o.name === "Draw"
  );

  const odds = [
    {
      time: homeTeam,
      odd: home?.price || 0
    },
    {
      time: awayTeam,
      odd: away?.price || 0
    }
  ];

  odds.sort((a, b) => a.odd - b.odd);

  const favorito = odds[0];

  let risco = "Alto";

  if (favorito.odd <= 1.60) {
    risco = "Baixo";
  } else if (favorito.odd <= 2.20) {
    risco = "Médio";
  }

  return {
    jogo: `${homeTeam} x ${awayTeam}`,
    favorito: favorito.time,
    oddFavorito: favorito.odd,
    risco,
    odds: {
      casa: home?.price || "-",
      empate: draw?.price || "-",
      fora: away?.price || "-"
    }
  };
}
