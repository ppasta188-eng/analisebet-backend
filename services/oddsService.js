import axios from "axios";

import {
  salvarJogos,
  buscarJogosPorTexto
} from "./cacheService.js";

const ODDS_API_KEY = process.env.ODDS_API_KEY;

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
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    let jogosFinais = [];

    for (const esporte of esportes) {
      try {
        console.log("===============================");
        console.log(`CONSULTANDO: ${esporte}`);

        const url = `https://api.the-odds-api.com/v4/sports/${esporte}/odds`;

        const response = await axios.get(url, {
          params: {
            apiKey: ODDS_API_KEY,
            regions: "us,eu,br",
            markets: "h2h",
            oddsFormat: "decimal"
          }
        });

        const jogos = response.data || [];

        console.log(`ENCONTRADOS: ${jogos.length}`);

        const formatados = jogos.map((jogo) => {
          let homeOdd = "-";
          let drawOdd = "-";
          let awayOdd = "-";

          const bookmaker = jogo.bookmakers?.[0];

          const market = bookmaker?.markets?.find(
            (m) => m.key === "h2h"
          );

          if (market?.outcomes) {
            market.outcomes.forEach((o) => {
              if (o.name === jogo.home_team) {
                homeOdd = o.price;
              } else if (o.name === jogo.away_team) {
                awayOdd = o.price;
              } else {
                drawOdd = o.price;
              }
            });
          }

          return {
            league: jogo.sport_title,
            home_team: jogo.home_team,
            away_team: jogo.away_team,
            home_odd: homeOdd,
            draw_odd: drawOdd,
            away_odd: awayOdd
          };
        });

        jogosFinais.push(...formatados);

      } catch (erroEsporte) {
        console.log(`ERRO NO ESPORTE: ${esporte}`);

        if (erroEsporte.response?.data) {
          console.log(erroEsporte.response.data);
        } else {
          console.log(erroEsporte.message);
        }
      }
    }

    console.log("===============================");
    console.log(`TOTAL FINAL: ${jogosFinais.length}`);
    console.log("===============================");

    if (jogosFinais.length > 0) {
      salvarJogos(jogosFinais);

      console.log("=======================");
      console.log("CACHE SALVO:");
      console.log(jogosFinais.length);
    } else {
      console.log("=======================");
      console.log("CACHE MANTIDO");
      console.log("API RETORNOU 0 JOGOS");
    }

  } catch (error) {
    console.log("ERRO GERAL:");
    console.log(error.message);
  }
}

export { buscarJogosPorTexto };
