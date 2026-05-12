import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

const SPORTS = [
  "soccer_brazil_campeonato",
  "soccer_uefa_champs_league",
  "soccer_spain_la_liga",
  "soccer_epl",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba"
];

function normalizar(texto) {

  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function buscarJogos(termo) {

  try {

    const busca = normalizar(termo);

    let jogosEncontrados = [];

    for (const sport of SPORTS) {

      try {

        console.log("Consultando esporte:", sport);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: "us,uk",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        console.log(
          `Jogos recebidos (${sport}):`,
          response.data.length
        );

        const jogos = response.data || [];

        const filtrados = jogos.filter((jogo) => {

          const home = normalizar(jogo.home_team || "");
          const away = normalizar(jogo.away_team || "");
          const league = normalizar(jogo.sport_title || "");

          return (
            home.includes(busca) ||
            away.includes(busca) ||
            league.includes(busca)
          );
        });

        console.log(
          `Filtrados (${sport}):`,
          filtrados.length
        );

        jogosEncontrados.push(...filtrados);

      } catch (erroSport) {

        console.log(
          `Erro no esporte ${sport}:`,
          erroSport.response?.data || erroSport.message
        );
      }
    }

    console.log(
      "TOTAL ENCONTRADOS:",
      jogosEncontrados.length
    );

    return jogosEncontrados;

  } catch (error) {

    console.log(
      "ERRO GERAL:",
      error.message
    );

    return [];
  }
}
