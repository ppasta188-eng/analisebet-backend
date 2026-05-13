import {
  gerarProbabilidades
} from "./modelService.js";

export function analisarJogo(
  jogo
) {
  const odds =
    jogo.bookmakers?.[0]
      ?.markets?.[0]
      ?.outcomes;

  if (
    !odds ||
    odds.length < 3
  ) {
    return null;
  }

  const casa =
    odds.find(
      (o) =>
        o.name ===
        jogo.home_team
    );

  const fora =
    odds.find(
      (o) =>
        o.name ===
        jogo.away_team
    );

  const empate =
    odds.find(
      (o) =>
        o.name === "Draw"
    );

  if (
    !casa ||
    !fora ||
    !empate
  ) {
    return null;
  }

  const analise =
    gerarProbabilidades(
      casa.price,
      empate.price,
      fora.price
    );

  return {
    casa: {
      time:
        jogo.home_team,

      odd:
        casa.price,

      chance:
        (
          analise.casa
            .probabilidade *
          100
        ).toFixed(1),

      oddJusta:
        analise.casa.oddJusta.toFixed(
          2
        ),

      valorEsperado:
        (
          analise.casa
            .valorEsperado *
          100
        ).toFixed(1)
    },

    empate: {
      odd:
        empate.price,

      chance:
        (
          analise.empate
            .probabilidade *
          100
        ).toFixed(1),

      oddJusta:
        analise.empate.oddJusta.toFixed(
          2
        ),

      valorEsperado:
        (
          analise.empate
            .valorEsperado *
          100
        ).toFixed(1)
    },

    fora: {
      time:
        jogo.away_team,

      odd:
        fora.price,

      chance:
        (
          analise.fora
            .probabilidade *
          100
        ).toFixed(1),

      oddJusta:
        analise.fora.oddJusta.toFixed(
          2
        ),

      valorEsperado:
        (
          analise.fora
            .valorEsperado *
          100
        ).toFixed(1)
    }
  };
}
