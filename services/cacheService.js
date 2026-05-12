import fs from "fs";

const CAMINHO_CACHE = "./cacheJogos.json";

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

  const dados = fs.readFileSync(CAMINHO_CACHE, "utf-8");

  return JSON.parse(dados);
}

function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

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

  // aliases inteligentes
  if (key.includes("brazil_campeonato")) {
    termos.push("brasileirao");
    termos.push("brasileirão");
    termos.push("serie a");
    termos.push("série a");
    termos.push("brasil serie a");
  }

  if (key.includes("brazil_serie_b")) {
    termos.push("serie b");
    termos.push("série b");
    termos.push("brasil serie b");
  }

  if (key.includes("spain_la_liga")) {
    termos.push("la liga");
    termos.push("laliga");
    termos.push("espanhol");
  }

  if (key.includes("italy_serie_a")) {
    termos.push("italiano");
    termos.push("serie a italia");
  }

  if (key.includes("germany_bundesliga")) {
    termos.push("bundesliga");
    termos.push("alemao");
    termos.push("alemão");
  }

  if (key.includes("france_ligue_one")) {
    termos.push("ligue 1");
    termos.push("frances");
    termos.push("francês");
  }

  if (key.includes("champions")) {
    termos.push("champions");
    termos.push("liga dos campeoes");
    termos.push("liga dos campeões");
  }

  return termos.map(normalizarTexto);
}

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
