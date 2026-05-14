export function analisarJogo(odds) {
  const oddCasa = Number(
    odds?.casa ??
    odds?.home ??
    odds?.homeOdd
  );

  const oddEmpate = Number(
    odds?.empate ??
    odds?.draw ??
    odds?.drawOdd
  );

  const oddFora = Number(
    odds?.fora ??
    odds?.away ??
    odds?.awayOdd
  );

  if (
    isNaN(oddCasa) ||
    isNaN(oddEmpate) ||
    isNaN(oddFora)
  ) {
    console.log("ERRO ODDS:", odds);

    return {
      casa: {
        probabilidade: "-",
        oddJusta: "-",
        ev: "-"
      },

      empate: {
        probabilidade: "-",
        oddJusta: "-",
        ev: "-"
      },

      fora: {
        probabilidade: "-",
        oddJusta: "-",
        ev: "-"
      }
    };
  }

  // Probabilidades implícitas
  const probCasaBruta = 1 / oddCasa;
  const probEmpateBruta = 1 / oddEmpate;
  const probForaBruta = 1 / oddFora;

  const soma =
    probCasaBruta +
    probEmpateBruta +
    probForaBruta;

  // Remoção da margem
  const probCasa =
    (probCasaBruta / soma) * 100;

  const probEmpate =
    (probEmpateBruta / soma) * 100;

  const probFora =
    (probForaBruta / soma) * 100;

  // Odds justas
  const oddJustaCasa =
    100 / probCasa;

  const oddJustaEmpate =
    100 / probEmpate;

  const oddJustaFora =
    100 / probFora;

  // EV
  const evCasa =
    ((oddCasa / oddJustaCasa) - 1) * 100;

  const evEmpate =
    ((oddEmpate / oddJustaEmpate) - 1) * 100;

  const evFora =
    ((oddFora / oddJustaFora) - 1) * 100;

  return {
    casa: {
      probabilidade: probCasa.toFixed(1),
      oddJusta: oddJustaCasa.toFixed(2),
      ev: evCasa.toFixed(1)
    },

    empate: {
      probabilidade: probEmpate.toFixed(1),
      oddJusta: oddJustaEmpate.toFixed(2),
      ev: evEmpate.toFixed(1)
    },

    fora: {
      probabilidade: probFora.toFixed(1),
      oddJusta: oddJustaFora.toFixed(2),
      ev: evFora.toFixed(1)
    }
  };
}
