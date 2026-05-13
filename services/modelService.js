const FORCA_TIMES = {
  "Flamengo": 92,
  "Palmeiras": 91,
  "Botafogo": 84,
  "Bahia": 78,
  "Grêmio": 77,
  "Corinthians": 80,
  "Santos": 76,
  "São Paulo": 83,
  "Sao Paulo": 83,
  "Internacional": 82,
  "Cruzeiro": 79,
  "Fluminense": 81,
  "Vasco da Gama": 74,
  "Vasco": 74,
  "Coritiba": 69,
  "Vitória": 68,
  "Vitoria": 68,
  "Mirassol": 65,
  "Bragantino-SP": 78,
  "Athletico Paranaense": 82,
  "Atletico Paranaense": 82,
  "Atlético Mineiro": 85,
  "Atletico Mineiro": 85,
  "Chapecoense": 67,
  "Remo": 66
};

function obterForca(time) {
  return FORCA_TIMES[time] || 70;
}

export function gerarProbabilidades(jogo) {
  const timeCasa =
    jogo.home_team;

  const timeFora =
    jogo.away_team;

  const forcaCasa =
    obterForca(timeCasa) + 5;

  const forcaFora =
    obterForca(timeFora);

  const total =
    forcaCasa + forcaFora;

  let probCasa =
    (forcaCasa / total);

  let probFora =
    (forcaFora / total);

  let probEmpate =
    0.24;

  probCasa =
    probCasa * (1 - probEmpate);

  probFora =
    probFora * (1 - probEmpate);

  const soma =
    probCasa +
    probEmpate +
    probFora;

  probCasa =
    probCasa / soma;

  probEmpate =
    probEmpate / soma;

  probFora =
    probFora / soma;

  return {
    casa: probCasa,
    empate: probEmpate,
    fora: probFora
  };
}
