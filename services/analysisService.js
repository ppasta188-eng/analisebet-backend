const FORCA_TIMES = {
  flamengo: 92,
  palmeiras: 91,
  bahia: 78,
  gremio: 79,
  corinthians: 82,
  sao_paulo: 84,
  fluminense: 84,
  botafogo: 85,
  internacional: 83,
  atletico_mineiro: 84,
  santos: 76,
  vasco_da_gama: 75,
  coritiba: 72,
  vitoria: 70,
  mirassol: 68,
  remo: 66,
  chapecoense: 67
};

function normalizar(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function obterForca(nome) {
  return FORCA_TIMES[
    normalizar(nome)
  ] || 70;
}

function obterOddsCorretas(jogo) {
  const outcomes =
    jogo.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

  let oddCasa = null;
  let oddEmpate = null;
  let oddFora = null;

  for (const outcome of outcomes) {
    const nome =
      outcome.name?.toLowerCase();

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
      nome.includes("draw")
    ) {
      oddEmpate = outcome.price;
    }
  }

  return {
    oddCasa,
    oddEmpate,
    oddFora
  };
}

function calcularProbabilidades(
  oddCasa,
  oddEmpate,
  oddFora
) {
  const casa = 1 / oddCasa;
  const empate = 1 / oddEmpate;
  const fora = 1 / oddFora;

  const soma =
    casa + empate + fora;

  return {
    casa: casa / soma,
    empate: empate / soma,
    fora: fora / soma
  };
}

function aplicarModelo(
  probabilidades,
  timeCasa,
  timeFora
) {
  const forcaCasa =
    obterForca(timeCasa);

  const forcaFora =
    obterForca(timeFora);

  let casa =
    probabilidades.casa;

  let empate =
    probabilidades.empate;

  let fora =
    probabilidades.fora;

  // mando
  casa += 0.04;

  // força
  const diff =
    (forcaCasa - forcaFora) / 100;

  casa += diff * 0.12;

  fora -= diff * 0.12;

  empate -=
    Math.abs(diff) * 0.03;

  const soma =
    casa + empate + fora;

  return {
    casa: casa / soma,
    empate: empate / soma,
    fora: fora / soma
  };
}

function oddJusta(prob) {
  return 1 / prob;
}

function valorEsperado(
  odd,
  prob
) {
  return (
    (odd * prob) - 1
  ) * 100;
}

function classificar(ev) {
  if (ev >= 15) {
    return "🔥 Excelente valor";
  }

  if (ev >= 8) {
    return "✅ Boa oportunidade";
  }

  if (ev >= 3) {
    return "⚠️ Valor baixo";
  }

  return "❌ Sem valor";
}

export function analisarJogo(jogo) {
  const {
    oddCasa,
    oddEmpate,
    oddFora
  } = obterOddsCorretas(jogo);

  if (
    !oddCasa ||
    !oddEmpate ||
    !oddFora
  ) {
    return null;
  }

  const probsBase =
    calcularProbabilidades(
      oddCasa,
      oddEmpate,
      oddFora
    );

  const probs =
    aplicarModelo(
      probsBase,
      jogo.home_team,
      jogo.away_team
    );

  const evCasa =
    valorEsperado(
      oddCasa,
      probs.casa
    );

  const evEmpate =
    valorEsperado(
      oddEmpate,
      probs.empate
    );

  const evFora =
    valorEsperado(
      oddFora,
      probs.fora
    );

  return {
    odds: {
      casa: oddCasa,
      empate: oddEmpate,
      fora: oddFora
    },

    probabilidades: probs,

    oddsJustas: {
      casa: oddJusta(probs.casa),
      empate: oddJusta(probs.empate),
      fora: oddJusta(probs.fora)
    },

    valorEsperado: {
      casa: evCasa,
      empate: evEmpate,
      fora: evFora
    },

    classificacao: {
      casa: classificar(evCasa),
      empate: classificar(evEmpate),
      fora: classificar(evFora)
    }
  };
}
