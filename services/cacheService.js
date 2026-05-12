import fs from "fs";

const CAMINHO_CACHE = "./cacheJogos.json";

/*
====================================
FUNÇÕES PRINCIPAIS
====================================
*/

export function salvarCache(jogos) {
  fs.writeFileSync(
    CAMINHO_CACHE,
    JSON.stringify(jogos, null, 2),
    "utf-8"
  );
}

export function carregarCache() {
  if (!fs.existsSync(CAMINHO_CACHE)) {
    return [];
  }

  const dados = fs.readFileSync(
    CAMINHO_CACHE,
    "utf-8"
  );

  return JSON.parse(dados);
}

/*
====================================
NORMALIZAÇÃO
====================================
*/

function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/*
====================================
TERMOS DE BUSCA
====================================
*/

function gerarTermosBusca(jogo) {
  const termos = [];

  const home = jogo.home_team || "";
  const away = jogo.away_team || "";
  const esporte = jogo.sport_title || "";
  const key = jogo.sport_key || "";

  termos.push(home);
  termos.push(away);
  termos.push(`${home} ${away}`);
  termos.push(esporte);
  termos.push(key);

  /*
  ============================
  BRASILEIRÃO
  ============================
  */

  if (key.includes("brazil_campeonato")) {
    termos.push("brasileirao");
    termos.push("brasileirão");
    termos.push("serie a");
    termos.push("série a");
    termos.push("brasil serie a");
    termos.push("campeonato brasileiro");
  }

  /*
  ============================
  SÉRIE B
  ============================
  */

  if (key.includes("brazil_serie_b")) {
    termos.push("serie b");
    termos.push("série b");
    termos.push("brasil serie b");
  }

  /*
  ============================
  LA LIGA
  ============================
  */

  if (key.includes("spain_la_liga")) {
    termos.push("la liga");
    termos.push("laliga");
    termos.push("espanhol");
    termos.push("campeonato espanhol");
  }

  /*
  ============================
  ITALIANO
  ============================
  */

  if (key.includes("italy_serie_a")) {
    termos.push("italiano");
    termos.push("serie a italia");
    termos.push("campeonato italiano");
  }

  /*
  ============================
  BUNDESLIGA
  ============================
  */

  if (key.includes("germany_bundesliga")) {
    termos.push("bundesliga");
    termos.push("alemao");
    termos.push("alemão");
    termos.push("campeonato alemao");
  }

  /*
  ============================
  FRANCÊS
  ============================
  */

  if (key.includes("france_ligue_one")) {
    termos.push("ligue 1");
    termos.push("frances");
    termos.push("francês");
    termos.push("campeonato frances");
  }

  /*
  ============================
  CHAMPIONS
  ============================
  */

  if (key.includes("champions")) {
    termos.push("champions");
    termos.push("liga dos campeoes");
    termos.push("liga dos campeões");
    termos.push("ucl");
  }

  return termos.map(normalizarTexto);
}

/*
====================================
BUSCA INTELIGENTE
====================================
*/

export function buscarNoCache(textoBusca) {
  const jogos = carregarCache();

  const busca = normalizarTexto(textoBusca);

  console.log("BUSCANDO NO CACHE:");
  console.log(textoBusca);

  return jogos.filter((jogo) => {
    const termos = gerarTermosBusca(jogo);

    return termos.some((termo) => {
      return (
        termo.includes(busca) ||
        busca.includes(termo)
      );
    });
  });
}

/*
====================================
COMPATIBILIDADE TOTAL
NÃO REMOVER
====================================
*/

export function buscarJogosPorTime(textoBusca) {
  return buscarNoCache(textoBusca);
}

export function salvarJogos(jogos) {
  return salvarCache(jogos);
}

export function carregarJogos() {
  return carregarCache();
}
