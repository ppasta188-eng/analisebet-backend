import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.ODDS_API_KEY;

export async function buscarOdds() {
  try {
    const esportes = [
      "soccer_brazil_campeonato",
      "soccer_conmebol_libertadores",
      "soccer_uefa_champs_league",
      "soccer_spain_la_liga",
      "soccer_epl",
      "soccer_italy_serie_a",
      "soccer_germany_bundesliga",
      "soccer_france_ligue_one",
      "basketball_nba",
    ];

    let todosJogos = [];

    for (const esporte of esportes) {
      try {
        console.log("Buscando:", esporte);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: "us,uk,eu,br",
              markets: "h2h",
              oddsFormat: "decimal",
            },
          }
        );

        console.log(
          `Jogos encontrados ${esporte}:`,
          response.data.length
        );

        todosJogos = [
          ...todosJogos,
          ...response.data,
        ];
      } catch (erroInterno) {
        console.log(
          `Erro no esporte ${esporte}:`,
          erroInterno.response?.data || erroInterno.message
        );
      }
    }

    return todosJogos;
  } catch (error) {
    console.log(
      "Erro geral odds:",
      error.response?.data || error.message
    );

    return [];
  }
}
