export function calcularProbabilidades(odds) {
  const probabilidades = odds.map((odd) => 1 / odd);

  const soma = probabilidades.reduce((a, b) => a + b, 0);

  return probabilidades.map((p) => p / soma);
}

export function calcularOddJusta(probabilidade) {
  return 1 / probabilidade;
}

export function calcularEV(oddMercado, oddJusta) {
  return ((oddMercado / oddJusta) - 1) * 100;
}

export function analisarMercado(casa, empate, fora) {
  if (!casa || !empate || !fora) {
    return null;
  }

  const odds = [
    casa.price,
    empate.price,
    fora.price
  ];

  const probs = calcularProbabilidades(odds);

  const oddJustaCasa = calcularOddJusta(probs[0]);
  const oddJustaEmpate = calcularOddJusta(probs[1]);
  const oddJustaFora = calcularOddJusta(probs[2]);

  const evCasa = calcularEV(casa.price, oddJustaCasa);
  const evEmpate = calcularEV(empate.price, oddJustaEmpate);
  const evFora = calcularEV(fora.price, oddJustaFora);

  return {
    casa: {
      prob: probs[0],
      oddJusta: oddJustaCasa,
      ev: evCasa
    },

    empate: {
      prob: probs[1],
      oddJusta: oddJustaEmpate,
      ev: evEmpate
    },

    fora: {
      prob: probs[2],
      oddJusta: oddJustaFora,
      ev: evFora
    }
  };
}
