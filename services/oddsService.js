import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

const ESPORTES = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba",
];

export async function buscarTodosJogos() {
  let todosJogos = [];

  for (const esporte of ESPORTES) {
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
            oddsFormat: "decimal",
          },
        }
      );

      console.log(`ENCONTRADOS: ${response.data.length}`);

      todosJogos.push(...response.data);
    } catch (erro) {
      console.log(`ERRO NO ESPORTE: ${esporte}`);

      if (erro.response?.data) {
        console.log(erro.response.data);
      } else {
        console.log(erro.message);
      }
    }
  }

  console.log("===============================");
  console.log(`TOTAL FINAL: ${todosJogos.length}`);
  console.log("===============================");

  return todosJogos;
}
