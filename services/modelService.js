export function gerarProbabilidades(
  oddCasa,
  oddEmpate,
  oddFora,
  forcaCasa = 0,
  forcaFora = 0
) {
  const probCasaBase = 1 / oddCasa;
  const probEmpateBase = 1 / oddEmpate;
  const probForaBase = 1 / oddFora;

  const somaBase =
    probCasaBase +
    probEmpateBase +
    probForaBase;

  let probCasa =
    probCasaBase / somaBase;

  let probFora =
    probForaBase / somaBase;

  const diferenca =
    Math.abs(
      forcaCasa - forcaFora
    );

  let probEmpate = 0.28;

  if (diferenca >= 5) {
    probEmpate = 0.25;
  }

  if (diferenca >= 10) {
    probEmpate = 0.22;
  }

  if (diferenca >= 15) {
    probEmpate = 0.19;
  }

  const ajusteForca =
    (forcaCasa - forcaFora) / 100;

  probCasa += ajusteForca;
  probFora -= ajusteForca;

  if (probCasa < 0.05) {
    probCasa = 0.05;
  }

  if (probFora < 0.05) {
    probFora = 0.05;
  }

  const somaFinal =
    probCasa +
    probEmpate +
    probFora;

  probCasa =
    probCasa / somaFinal;

  probEmpate =
    probEmpate / somaFinal;

  probFora =
    probFora / somaFinal;

  return {
    casa: {
      probabilidade: probCasa,
      oddJusta:
        1 / probCasa,
      valorEsperado:
        oddCasa *
          probCasa -
        1
    },

    empate: {
      probabilidade:
        probEmpate,
      oddJusta:
        1 / probEmpate,
      valorEsperado:
        oddEmpate *
          probEmpate -
        1
    },

    fora: {
      probabilidade:
        probFora,
      oddJusta:
        1 / probFora,
      valorEsperado:
        oddFora *
          probFora -
        1
    }
  };
}
