function normalizarProbabilidades(probabilidades) {
  const soma = probabilidades.reduce((a, b) => a + b, 0);

  return probabilidades.map((p) => p / soma);
}

function calcularOddJusta(probabilidade) {
  return 1 / probabilidade;
}

function calcularValorEsperado(oddMercado, oddJusta) {
  return ((oddMercado / oddJusta) - 1) * 100;
}

function ajustarProbabilidades(
  probCasa,
  probEmpate,
  probFora,
  jogo
) {
  let casa = probCasa;
  let empate = probEmpate;
  let fora = probFora;

  const timeCasa = jogo.home_team.toLowerCase();
  const timeFora = jogo.away_team.toLowerCase();

  const timesFortes = [
    "flamengo",
    "palmeiras",
    "atletico mineiro",
    "atlético mineiro",
    "botafogo",
    "fluminense"
  ];

  if (timesFortes.includes(timeCasa)) {
    casa += 0.04;
    empate -= 0.02;
    fora -= 0.02;
  }

  if (timesFortes.includes(timeFora)) {
    fora += 0.04;
    empate -= 0.02;
    casa -= 0.02;
  }

  return normalizarProbabilidades([
    casa,
    empate,
    fora
  ]);
}

export function analisarMercado(
  casa,
  empate,
  fora,
  jogo
) {
  if (!casa || !empate || !fora) {
    return null;
  }

  const probsOriginais = [
    1 / casa.price,
    1 / empate.price,
    1 / fora.price
  ];

  const probsSemMargem = normalizarProbabilidades(
    probsOriginais
  );

  const probsAjustadas = ajustarProbabilidades(
    probsSemMargem[0],
    probsSemMargem[1],
    probsSemMargem[2],
    jogo
  );

  const oddJustaCasa = calcularOddJusta(
    probsAjustadas[0]
  );

  const oddJustaEmpate = calcularOddJusta(
    probsAjustadas[1]
  );

  const oddJustaFora = calcularOddJusta(
    probsAjustadas[2]
  );

  return {
    casa: {
      prob: probsAjustadas[0],
      oddJusta: oddJustaCasa,
      valorEsperado: calcularValorEsperado(
        casa.price,
        oddJustaCasa
      )
    },

    empate: {
      prob: probsAjustadas[1],
      oddJusta: oddJustaEmpate,
      valorEsperado: calcularValorEsperado(
        empate.price,
        oddJustaEmpate
      )
    },

    fora: {
      prob: probsAjustadas[2],
      oddJusta: oddJustaFora,
      valorEsperado: calcularValorEsperado(
        fora.price,
        oddJustaFora
      )
    }
  };
}
