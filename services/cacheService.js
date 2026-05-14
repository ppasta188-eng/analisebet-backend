import axios from "axios";
import fs from "fs";

const ODDS_API_KEY = process.env.ODDS_API_KEY;

const CACHE_FILE = "./cache.json";

let jogosCache = carregarCache();

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

function salvarCache(jogos) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(jogos, null, 2),
      "utf-8"
    );

    console.log("=======================");
    console.log("CACHE SALVO EM ARQUIVO");
    console.log(jogos.length);
    console.log("=======================");
  } catch (error) {
    console.log("=======================");
    console.log("ERRO AO SALVAR CACHE");
    console.log(error.message);
    console.log("=======================");
  }
}

function carregarCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const dados = fs.readFileSync(
        CACHE_FILE,
        "utf-8"
      );

      const jogos = JSON.parse(dados);

      if (Array.isArray(jogos)) {
        console.log("=======================");
        console.log("CACHE CARREGADO");
        console.log(jogos.length);
        console.log("=======================");

        return jogos;
      }
    }
  } catch (error) {
    console.log("=======================");
    console.log("ERRO AO CARREGAR CACHE");
    console.log(error.message);
    console.log("=======================");
  }

  return [];
}

export async function atualizarCache() {
  console.log("=======================");
  console.log("ATUALIZANDO CACHE...");
  console.log("=======================");

  const novosJogos = [];

  for (const esporte of esportes) {
    try {
      console.log("===============================");
      console.log(`CONSULTANDO: ${esporte}`);

      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
        {
          params: {
            apiKey: ODDS_API_KEY,
            regions: "us",
            markets: "h2h",
            oddsFormat: "decimal"
          }
        }
      );

      const jogos = response.data || [];

      console.log(`ENCONTRADOS: ${jogos.length}`);

      novosJogos.push(...jogos);

    } catch (error) {
      console.log(`ERRO AO CONSULTAR ${esporte}`);

      if (error.response?.data) {
        console.log(error.response.data);

        if (
          error.response.data.error_code ===
          "OUT_OF_USAGE_CREDITS"
        ) {
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
  console.log(`TOTAL FINAL: ${novosJogos.length}`);
  console.log("===============================");

  if (novosJogos.length > 0) {
    jogosCache = novosJogos;

    salvarCache(jogosCache);

    console.log("=======================");
    console.log("CACHE ATUALIZADO");
    console.log(jogosCache.length);
    console.log("=======================");
  } else {
    console.log("=======================");
    console.log("CACHE NÃO ATUALIZADO");
    console.log("Mantendo último cache válido");
    console.log("=======================");
  }
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
