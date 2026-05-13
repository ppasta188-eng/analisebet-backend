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
  vasco: 75,
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
  const chave = normalizar(nome);

  return FORCA_TIMES[chave] || 70;
}

function calcularProbabilidades(
  oddCasa,
  oddEmpate,
  oddFora
) {
  const casa = 1 / oddCasa;
  const empate = 1 / oddEmpate;
  const fora = 1 / oddFora;

  const soma = casa + empate + fora;

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
  const forcaCasa = obterForca(timeCasa);
  const forcaFora = obterForca(timeFora);

  let casa = probabilidades.casa;
  let empate = probabilidades.empate;
  let fora = probabilidades.fora;

  // bônus mando
  casa += 0.04;

  // diferença força
  const diff = (forcaCasa - forcaFora) / 100;

  casa += diff * 0.12;
  fora -= diff * 0.12;

  // equilíbrio
  empate -= Math.abs(diff) * 0.03;

  const soma = casa + empate + fora;

  return {
    casa: casa / soma,
    empate: empate / soma,
    fora: fora / soma
  };
}

function oddJusta(prob) {
  return 1 / prob;
}

function valorEsperado(odd, prob) {
  return ((odd * prob) - 1) * 100;
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
  const oddCasa =
    jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price;

  const oddEmpate =
    jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.price;

  const oddFora =
    jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[2]?.price;

  if (!oddCasa || !oddEmpate || !oddFora) {
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
