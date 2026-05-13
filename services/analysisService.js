function calcularProbabilidades(oddCasa, oddEmpate, oddFora) {
  const probCasaBruta = 1 / oddCasa;
  const probEmpateBruta = 1 / oddEmpate;
  const probForaBruta = 1 / oddFora;

  const soma =
    probCasaBruta +
    probEmpateBruta +
    probForaBruta;

  return {
    casa: probCasaBruta / soma,
    empate: probEmpateBruta / soma,
    fora: probForaBruta / soma
  };
}

function calcularOddsJustas(probabilidades) {
  return {
    casa: 1 / probabilidades.casa,
    empate: 1 / probabilidades.empate,
    fora: 1 / probabilidades.fora
  };
}

function calcularValorEsperado(odd, probabilidade) {
  return ((odd * probabilidade) - 1) * 100;
}

function obterForcaTime(nome) {
  const fortes = [
    "flamengo",
    "palmeiras",
    "manchester city",
    "real madrid",
    "barcelona",
    "bayern",
    "psg",
    "liverpool",
    "arsenal"
  ];

  const medios = [
    "bahia",
    "gremio",
    "internacional",
    "corinthians",
    "sao paulo",
    "fluminense",
    "botafogo",
    "vasco",
    "atletico mineiro"
  ];

  nome = nome.toLowerCase();

  if (fortes.some(t => nome.includes(t))) {
    return 0.10;
  }

  if (medios.some(t => nome.includes(t))) {
    return 0.05;
  }

  return 0;
}

function aplicarAjustes(probabilidades, timeCasa, timeFora) {
  let casa = probabilidades.casa;
  let empate = probabilidades.empate;
  let fora = probabilidades.fora;

  // bônus mandante
  casa += 0.03;

  // força times
  casa += obterForcaTime(timeCasa);
  fora += obterForcaTime(timeFora);

  // normalizar
  const soma = casa + empate + fora;

  return {
    casa: casa / soma,
    empate: empate / soma,
    fora: fora / soma
  };
}

function classificarValor(ev) {
  if (ev >= 10) {
    return "🔥 Excelente valor";
  }

  if (ev >= 5) {
    return "✅ Boa oportunidade";
  }

  if (ev >= 0) {
    return "⚠️ Valor baixo";
  }

  return "❌ Sem valor";
}

export function analisarJogo(jogo) {
  const oddCasa = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price;
  const oddEmpate = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.price;
  const oddFora = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[2]?.price;

  if (!oddCasa || !oddEmpate || !oddFora) {
    return null;
  }

  const probabilidadesBase =
    calcularProbabilidades(
      oddCasa,
      oddEmpate,
      oddFora
    );

  const probabilidades =
    aplicarAjustes(
      probabilidadesBase,
      jogo.home_team,
      jogo.away_team
    );

  const oddsJustas =
    calcularOddsJustas(probabilidades);

  const evCasa =
    calcularValorEsperado(
      oddCasa,
      probabilidades.casa
    );

  const evEmpate =
    calcularValorEsperado(
      oddEmpate,
      probabilidades.empate
    );

  const evFora =
    calcularValorEsperado(
      oddFora,
      probabilidades.fora
    );

  return {
    probabilidades,
    oddsJustas,

    valorEsperado: {
      casa: evCasa,
      empate: evEmpate,
      fora: evFora
    },

    classificacao: {
      casa: classificarValor(evCasa),
      empate: classificarValor(evEmpate),
      fora: classificarValor(evFora)
    }
  };
}
