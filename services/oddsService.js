const axios = require("axios");

const API_KEY = process.env.ODDS_API_KEY;

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function buscarEsportes() {
  try {
    const response = await axios.get(
      "https://api.the-odds-api.com/v4/sports",
      {
        params: {
          apiKey: API_KEY
        }
      }
    );

    return response.data;

  } catch (error) {
    console.log("Erro esportes:", error.message);
    return [];
  }
}

async function buscarOddsPorEsporte(sportKey) {
  try {
    const response = await axios.get(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: "eu,us,uk,br",
          markets: "h2h",
          oddsFormat: "decimal"
        }
      }
    );

    return response.data;

  } catch (error) {
    return [];
  }
}

async function buscarJogos(query) {

  const termo = normalizeText(query);

  const esportes = await buscarEsportes();

  const esportesFiltrados = esportes.filter((e) => {

    const title = normalizeText(e.title || "");
    const description = normalizeText(e.description || "");
    const key = normalizeText(e.key || "");

    return (
      title.includes("soccer") ||
      description.includes("soccer") ||
      key.includes("soccer") ||
      title.includes("football")
    );
  });

  let todosJogos = [];

  for (const esporte of esportesFiltrados) {

    const jogos = await buscarOddsPorEsporte(esporte.key);

    todosJogos.push(...jogos);
  }

  const encontrados = todosJogos.filter((jogo) => {

    const home = normalizeText(jogo.home_team || "");

    const away = normalizeText(
      jogo.away_team ||
      jogo.teams?.find((t) => t !== jogo.home_team) ||
      ""
    );

    const sport = normalizeText(jogo.sport_title || "");

    return (
      home.includes(termo) ||
      away.includes(termo) ||
      sport.includes(termo)
    );
  });

  return encontrados;
}

module.exports = {
  buscarJogos
};
