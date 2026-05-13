import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

export let cacheJogos = [];

const esportes = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "soccer_uefa_champs_league",
  "basketball_nba"
];

function normalizarTexto(texto = "") {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatarJogo(jogo) {
  const bookmaker = jogo.bookmakers?.[0];
  const market = bookmaker?.markets?.find(
    (m) => m.key === "h2h"
  );

  const outcomes = market?.outcomes || [];

  const oddCasa =
    outcomes.find((o) => o.name === jogo.home_team)?.price || null;

  const oddFora =
    outcomes.find((o) => o.name === jogo.away_team)?.price || null;

  const oddEmpate =
    outcomes.find((o) => o.name === "Draw")?.price ||
    outcomes.find((o) => o.name === "Empate")?.price ||
    null;

  return {
    id: jogo.id,

    esporte: jogo.sport_key,
    campeonato: jogo.sport_title,

    casa: jogo.home_team,
    fora: jogo.away_team,

    data: jogo.commence_time,

    odds: {
      casa: oddCasa,
      empate: oddEmpate,
      fora: oddFora
    }
  };
}

export async function atualizarCache() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    let jogosFormatados = [];

    for (const esporte of esportes) {
      try {
        console.log("===============================");
        console.log(`CONSULTANDO: ${esporte}`);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: "us,eu,uk",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        console.log(`ENCONTRADOS: ${response.data.length}`);

        const jogos = response.data.map(formatarJogo);

        jogosFormatados.push(...jogos);
      } catch (erroEsporte) {
        console.log(`ERRO AO CONSULTAR ${esporte}`);
        console.log(erroEsporte.message);
      }
    }

    cacheJogos = jogosFormatados;

    console.log("===============================");
    console.log(`TOTAL FINAL: ${cacheJogos.length}`);
    console.log("===============================");

    console.log("=======================");
    console.log("CACHE SALVO:");
    console.log(cacheJogos.length);
    console.log("=======================");
  } catch (erro) {
    console.log("ERRO AO ATUALIZAR CACHE:");
    console.log(erro.message);
  }
}

export function buscarJogos(textoBusca) {
  console.log("BUSCANDO NO CACHE:");
  console.log(textoBusca);

  const termo = normalizarTexto(textoBusca);

  return cacheJogos.filter((jogo) => {
    return (
      normalizarTexto(jogo.casa).includes(termo) ||
      normalizarTexto(jogo.fora).includes(termo) ||
      normalizarTexto(jogo.campeonato).includes(termo) ||
      normalizarTexto(jogo.esporte).includes(termo)
    );
  });
}
