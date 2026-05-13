import {
  gerarProbabilidades
} from "./modelService.js";

export function analisarJogo(jogo) {
  const bookmaker =
    jogo.bookmakers?.[0];

  if (!bookmaker) {
    return null;
  }

  const market =
    bookmaker.markets?.find(
      (m) => m.key === "h2h"
    );

  if (!market) {
    return null;
  }

  let oddCasa = null;
  let oddEmpate = null;
  let oddFora = null;

  for (const outcome of market.outcomes) {

    const nome =
      outcome.name.toLowerCase();

    if (
      nome ===
      jogo.home_team.toLowerCase()
    ) {
      oddCasa = outcome.price;
    }

    else if (
      nome ===
      jogo.away_team.toLowerCase()
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

  const probabilidades =
    gerarProbabilidades(jogo);

  const probCasa =
    probabilidades.casa;

  const probEmpate =
    probabilidades.empate;

  const probFora =
    probabilidades.fora;

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

    casa: {
      odd: oddCasa,
      probabilidade:
        (probCasa * 100).toFixed(1),
      oddJusta:
        oddJustaCasa.toFixed(2),
      ev:
        evCasa.toFixed(1)
    },

    empate: {
      odd: oddEmpate,
      probabilidade:
        (probEmpate * 100).toFixed(1),
      oddJusta:
        oddJustaEmpate.toFixed(2),
      ev:
        evEmpate.toFixed(1)
    },

    fora: {
      odd: oddFora,
      probabilidade:
        (probFora * 100).toFixed(1),
      oddJusta:
        oddJustaFora.toFixed(2),
      ev:
        evFora.toFixed(1)
    }
  };
}
