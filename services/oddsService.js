import axios from "axios";

let cacheJogos = [];

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

function normalizarTexto(texto) {
  return texto
    ?.toLowerCase()
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "")
    ?.trim();
}

function gerarTextoBusca(jogo) {
  const sportKey = normalizarTexto(jogo.sport_key || "");

  let aliases = [];

  // Brasil
  if (
    sportKey.includes("brazil")
  ) {
    aliases.push(
      "brasil",
      "brasileirao",
      "serie a",
      "futebol brasileiro"
    );
  }

  // Série B
  if (
    sportKey.includes("serie_b")
  ) {
    aliases.push(
      "serie b",
      "brasileirao serie b"
    );
  }

  // Espanha
  if (
    sportKey.includes("la_liga")
  ) {
    aliases.push(
      "la liga",
      "espanha",
      "campeonato espanhol"
    );
  }

  // Alemanha
  if (
    sportKey.includes("bundesliga")
  ) {
    aliases.push(
      "bundesliga",
      "alemanha",
      "campeonato alemao"
    );
  }

  // Itália
  if (
    sportKey.includes("serie_a")
  ) {
    aliases.push(
      "italia",
      "serie a italiana",
      "campeonato italiano"
    );
  }

  // França
  if (
    sportKey.includes("ligue")
  ) {
    aliases.push(
      "franca",
      "ligue 1",
      "campeonato frances"
    );
  }

  // Champions
  if (
    sportKey.includes("champs")
  ) {
    aliases.push(
      "champions",
      "champions league",
      "liga dos campeoes",
      "uefa"
    );
  }

  // NBA
  if (
    sportKey.includes("nba")
  ) {
    aliases.push(
      "nba",
      "basquete",
      "basketball"
    );
  }

  return normalizarTexto(`
    ${jogo.home_team}
    ${jogo.away_team}
    ${jogo.sport_title}
    ${jogo.sport_key}
    ${aliases.join(" ")}
  `);
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
    const textoBusca =
      gerarTextoBusca(jogo);

    return textoBusca.includes(busca);
  });

  return resultados;
}
