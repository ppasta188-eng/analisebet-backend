import axios from "axios";

let jogosCache = [];
let ultimoCacheValido = [];

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

export async function atualizarCache() {
  console.log("=======================");
  console.log("ATUALIZANDO CACHE...");
  console.log("=======================");

  const todosJogos = [];

  for (const esporte of esportes) {
    try {
      console.log("===============================");
      console.log(`CONSULTANDO: ${esporte}`);

      const url = `https://api.the-odds-api.com/v4/sports/${esporte}/odds`;

      const response = await axios.get(url, {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: "us,uk,eu",
          markets: "h2h",
          oddsFormat: "decimal"
        }
      });

      const jogos = response.data || [];

      console.log(`ENCONTRADOS: ${jogos.length}`);

      todosJogos.push(...jogos);

    } catch (error) {
      console.log(`ERRO AO CONSULTAR ${esporte}`);

      const erroApi = error.response?.data;

      if (erroApi) {
        console.log(erroApi);

        if (erroApi.error_code === "OUT_OF_USAGE_CREDITS") {
          console.log("=======================");
          console.log("LIMITE DA API ATINGIDO");
          console.log("INTERROMPENDO CONSULTAS");
          console.log("=======================");

          break;
        }
      } else {
        console.log(error.message);
      }
    }
  }

  console.log("===============================");
  console.log(`TOTAL FINAL: ${todosJogos.length}`);
  console.log("===============================");

  if (todosJogos.length > 0) {
    jogosCache = todosJogos;
    ultimoCacheValido = todosJogos;

    console.log("=======================");
    console.log("CACHE SALVO:");
    console.log(jogosCache.length);
    console.log("=======================");
  } else {
    console.log("=======================");
    console.log("CACHE NÃO ATUALIZADO");
    console.log("Mantendo último cache válido");
    console.log("=======================");

    jogosCache = ultimoCacheValido;
  }

  return jogosCache;
}

export function obterCache() {
  return jogosCache;
}

export function buscarJogosPorTexto(texto) {
  console.log("BUSCANDO NO CACHE:");
  console.log(texto);

  if (!texto || texto.trim() === "") {
    return [];
  }

  const busca = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return jogosCache.filter((jogo) => {
    const home = jogo.home_team
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const away = jogo.away_team
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const sport = jogo.sport_title
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return (
      home?.includes(busca) ||
      away?.includes(busca) ||
      sport?.includes(busca)
    );
  });
}
