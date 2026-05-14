import axios from "axios";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

function calcularOddJusta(probabilidade) {
  if (!probabilidade || probabilidade <= 0) {
    return null;
  }

  return (1 / probabilidade).toFixed(2);
}

function calcularEV(probabilidade, odd) {
  if (!probabilidade || !odd) {
    return null;
  }

  return (((probabilidade * odd) - 1) * 100).toFixed(2);
}

function formatarPorcentagem(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "-";
  }

  return `${(valor * 100).toFixed(2)}%`;
}

async function buscarEstatisticasAPIFootball(homeTeam, awayTeam) {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/teams",
      {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY
        },
        params: {
          search: homeTeam
        }
      }
    );

    const homeEncontrado =
      response.data?.response &&
      response.data.response.length > 0;

    const responseAway = await axios.get(
      "https://v3.football.api-sports.io/teams",
      {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY
        },
        params: {
          search: awayTeam
        }
      }
    );

    const awayEncontrado =
      responseAway.data?.response &&
      responseAway.data.response.length > 0;

    if (!homeEncontrado || !awayEncontrado) {
      return null;
    }

    return {
      homeStrength: 0.45,
      drawStrength: 0.27,
      awayStrength: 0.28
    };
  } catch (error) {
    console.log("=======================");
    console.log("ERRO API-FOOTBALL");
    console.log(error.response?.data || error.message);
    console.log("=======================");

    return null;
  }
}

export async function analisarJogo(jogo) {
  const homeOdd = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
    o => o.name === jogo.home_team
  )?.price;

  const awayOdd = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
    o => o.name === jogo.away_team
  )?.price;

  const drawOdd = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
    o => o.name.toLowerCase() === "draw"
  )?.price;

  let homeProbability = null;
  let drawProbability = null;
  let awayProbability = null;

  const estatisticas = await buscarEstatisticasAPIFootball(
    jogo.home_team,
    jogo.away_team
  );

  if (estatisticas) {
    homeProbability = estatisticas.homeStrength;
    drawProbability = estatisticas.drawStrength;
    awayProbability = estatisticas.awayStrength;
  }

  const homeFairOdd = calcularOddJusta(homeProbability);
  const drawFairOdd = calcularOddJusta(drawProbability);
  const awayFairOdd = calcularOddJusta(awayProbability);

  const homeEV = calcularEV(homeProbability, homeOdd);
  const drawEV = calcularEV(drawProbability, drawOdd);
  const awayEV = calcularEV(awayProbability, awayOdd);

  return {
    home: {
      odd: homeOdd,
      probability: formatarPorcentagem(homeProbability),
      fairOdd: homeFairOdd || "-",
      ev: homeEV ? `${homeEV}%` : "-",
      value:
        homeEV && Number(homeEV) > 0
    },

    draw: {
      odd: drawOdd,
      probability: formatarPorcentagem(drawProbability),
      fairOdd: drawFairOdd || "-",
      ev: drawEV ? `${drawEV}%` : "-",
      value:
        drawEV && Number(drawEV) > 0
    },

    away: {
      odd: awayOdd,
      probability: formatarPorcentagem(awayProbability),
      fairOdd: awayFairOdd || "-",
      ev: awayEV ? `${awayEV}%` : "-",
      value:
        awayEV && Number(awayEV) > 0
    }
  };
}
