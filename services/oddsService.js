import axios from "axios";
import { salvarJogos } from "./cacheService.js";

const API_KEY = process.env.ODDS_API_KEY;

const ESPORTES = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba"
];

export async function buscarJogos(timeBusca) {
  let jogosEncontrados = [];

  for (const esporte of ESPORTES) {
    try {
      console.log("===============================");
      console.log("CONSULTANDO:", esporte);

      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
        {
          params: {
            apiKey: API_KEY,
            regions: "eu",
            markets: "h2h",
            oddsFormat: "decimal"
          }
        }
      );

      const jogos = response.data;

      const encontrados = jogos.filter((jogo) => {
        const texto =
          `${jogo.home_team} ${jogo.away_team}`.toLowerCase();

        return texto.includes(timeBusca.toLowerCase());
      });

      console.log("ENCONTRADOS:", encontrados.length);

      jogosEncontrados.push(...encontrados);

    } catch (error) {
      console.log("===============================");
      console.log("ERRO NO ESPORTE:", esporte);

      if (error.response?.data) {
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  }

  console.log("===============================");
  console.log("TOTAL FINAL:", jogosEncontrados.length);
  console.log("===============================");

  salvarJogos(jogosEncontrados);

  return jogosEncontrados;
}
