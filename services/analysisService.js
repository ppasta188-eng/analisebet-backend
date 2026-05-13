export function calcularAnaliseMercado(jogo) {
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

  let oddCasa = null;
  let oddEmpate = null;
  let oddFora = null;

  for (const outcome of market.outcomes) {
    const nome = outcome.name.toLowerCase();

    if (
      nome === jogo.home_team.toLowerCase()
    ) {
      oddCasa = outcome.price;
    }

    else if (
      nome === jogo.away_team.toLowerCase()
    ) {
      oddFora = outcome.price;
    }

    else if (
      nome.includes("draw") ||
      nome.includes("tie") ||
      nome.includes("empate")
    ) {
      oddEmpate = outcome.price;
    }
  }

  if (
    !oddCasa ||
    !oddEmpate ||
    !oddFora
  ) {
    return null;
  }

  const somaProbabilidades =
    (1 / oddCasa) +
    (1 / oddEmpate) +
    (1 / oddFora);

  const probCasa =
    (1 / oddCasa) / somaProbabilidades;

  const probEmpate =
    (1 / oddEmpate) / somaProbabilidades;

  const probFora =
    (1 / oddFora) / somaProbabilidades;

  const oddJustaCasa =
    1 / probCasa;

  const oddJustaEmpate =
    1 / probEmpate;

  const oddJustaFora =
    1 / probFora;

  const evCasa =
    ((oddCasa * probCasa) - 1) * 100;

  const evEmpate =
    ((oddEmpate * probEmpate) - 1) * 100;

  const evFora =
    ((oddFora * probFora) - 1) * 100;

  return {
    oddCasa,
    oddEmpate,
    oddFora,

    probCasa:
      (probCasa * 100).toFixed(1),

    probEmpate:
      (probEmpate * 100).toFixed(1),

    probFora:
      (probFora * 100).toFixed(1),

    oddJustaCasa:
      oddJustaCasa.toFixed(2),

    oddJustaEmpate:
      oddJustaEmpate.toFixed(2),

    oddJustaFora:
      oddJustaFora.toFixed(2),

    evCasa:
      evCasa.toFixed(1),

    evEmpate:
      evEmpate.toFixed(1),

    evFora:
      evFora.toFixed(1)
  };
}
