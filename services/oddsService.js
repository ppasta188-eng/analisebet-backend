import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

const esportes = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba"
];

export async function atualizarCacheJogos() {
  try {
    let todosJogos = [];

    for (const esporte of esportes) {
      try {
        console.log("===============================");
        console.log(`CONSULTANDO: ${esporte}`);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: "us",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        const jogos = response.data || [];

        console.log(`ENCONTRADOS: ${jogos.length}`);

        const jogosFormatados = jogos.map((jogo) => ({
          home_team: jogo.home_team || "",
          away_team: jogo.away_team || "",
          league: jogo.sport_title || esporte,
          commence_time: jogo.commence_time || "",
          bookmakers: jogo.bookmakers || []
        }));

        todosJogos.push(...jogosFormatados);

      } catch (error) {
        console.log(`ERRO NO ESPORTE: ${esporte}`);

        if (error.response?.data) {
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      }
    }

    console.log("===============================");
    console.log(`TOTAL FINAL: ${todosJogos.length}`);
    console.log("===============================");

    return todosJogos;

  } catch (error) {
    console.log("ERRO GERAL ODDS SERVICE:");
    console.log(error.message);

    return [];
  }
}
