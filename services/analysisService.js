export function analisarJogo(jogo) {
  const homeTeam = jogo.home_team;
  const awayTeam = jogo.away_team;

  const bookmaker = jogo.bookmakers?.[0];

  if (!bookmaker) {
    return null;
  }

  const market = bookmaker.markets?.find(
    (m) => m.key === "h2h"
  );

  if (!market) {
    return null;
  }

  const outcomes = market.outcomes;

  const homeOdd =
    outcomes.find((o) => o.name === homeTeam)?.price;

  const awayOdd =
    outcomes.find((o) => o.name === awayTeam)?.price;

  const empateOdd =
    outcomes.find((o) => o.name === "Draw")?.price;

  let favorito = "";
  let oddFavorita = 0;

  if (homeOdd < awayOdd) {
    favorito = homeTeam;
    oddFavorita = homeOdd;
  } else {
    favorito = awayTeam;
    oddFavorita = awayOdd;
  }

  let risco = "Alto";

  if (oddFavorita <= 1.60) {
    risco = "Baixo";
  } else if (oddFavorita <= 2.20) {
    risco = "Médio";
  }

  return `
⚽ ${homeTeam} x ${awayTeam}
🏆 ${jogo.sport_title}

• ${homeTeam}: ${homeOdd}
• ${awayTeam}: ${awayOdd}
• Empate: ${empateOdd}

🧠 Análise IA:
⭐ Favorito: ${favorito}
📉 Odd favorita: ${oddFavorita}
⚠️ Risco: ${risco}

━━━━━━━━━━━━━━
`;
}
