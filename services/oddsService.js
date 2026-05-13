import axios from "axios";

let cacheJogos = [];

const esportes = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba"
];

function normalizarTexto(texto) {
  return texto
    ?.toLowerCase()
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "")
    ?.trim();
}

export async function atualizarCacheJogos() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    let todosJogos = [];

    for (const esporte of esportes) {
      try {
        console.log("===============================");
        console.log(`CONSULTANDO: ${esporte}`);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: process.env.ODDS_API_KEY,
              regions: "us",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        const jogos = response.data || [];

        console.log(`ENCONTRADOS: ${jogos.length}`);

        todosJogos.push(...jogos);
      } catch (erro) {
        console.log(`ERRO NO ESPORTE: ${esporte}`);

        console.log(
          erro?.response?.data || erro.message
        );
      }
    }

    console.log("===============================");
    console.log(`TOTAL FINAL: ${todosJogos.length}`);
    console.log("===============================");

    if (todosJogos.length > 0) {
      cacheJogos = todosJogos;

      console.log("=======================");
      console.log("CACHE SALVO:");
      console.log(cacheJogos.length);
      console.log("=======================");
    } else {
      console.log("=======================");
      console.log("CACHE MANTIDO");
      console.log("API RETORNOU 0 JOGOS");
      console.log("=======================");
    }

    return cacheJogos;
  } catch (erro) {
    console.log("ERRO ATUALIZANDO CACHE:");
    console.log(erro.message);

    return cacheJogos;
  }
}

export function buscarJogosPorTexto(texto) {
  console.log("BUSCANDO NO CACHE:");
  console.log(texto);

  const busca = normalizarTexto(texto);

  const resultados = cacheJogos.filter((jogo) => {
    const casa = normalizarTexto(jogo.home_team);

    const fora = normalizarTexto(jogo.away_team);

    const campeonato = normalizarTexto(
      jogo.sport_title
    );

    return (
      casa?.includes(busca) ||
      fora?.includes(busca) ||
      campeonato?.includes(busca)
    );
  });

  return resultados;
}
