import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

export async function buscarOdds() {
  try {
    const esportes = [
      // BRASIL
      "soccer_brazil_campeonato",

      // INTERNACIONAIS
      "soccer_epl",
      "soccer_spain_la_liga",
      "soccer_italy_serie_a",
      "soccer_germany_bundesliga",
      "soccer_france_ligue_one",

      // COPAS
      "soccer_uefa_champs_league",
      "soccer_conmebol_libertadores",
      "soccer_conmebol_sudamericana",

      // OUTROS
      "basketball_nba",
    ];

    let todosJogos = [];

    for (const esporte of esportes) {
      try {
        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: "us,uk,eu",
              markets: "h2h",
              oddsFormat: "decimal",
            },
          }
        );

        const agora = new Date();

        const jogosFuturos = response.data.filter((jogo) => {
          return new Date(jogo.commence_time) > agora;
        });

        todosJogos = [...todosJogos, ...jogosFuturos];
      } catch (erroInterno) {
        console.log(
          `Erro ao buscar ${esporte}:`,
          erroInterno.response?.status
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
