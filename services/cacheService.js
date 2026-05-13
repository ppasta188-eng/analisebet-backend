let cacheJogos = [];

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function gerarTextoBusca(jogo) {
  const home = normalizarTexto(jogo.home_team);
  const away = normalizarTexto(jogo.away_team);
  const league = normalizarTexto(jogo.league);

  let extra = "";

  if (league.includes("brazil")) {
    extra += " brasil brasileirao brasileirão copa do brasil ";
  }

  if (league.includes("serie a")) {
    extra += " brasileirao brasileirão ";
  }

  if (league.includes("serie b")) {
    extra += " brasileirão serie b ";
  }

  if (league.includes("la liga")) {
    extra += " espanha la liga laliga ";
  }

  if (league.includes("bundesliga")) {
    extra += " alemanha bundesliga ";
  }

  if (league.includes("italy")) {
    extra += " italia italiano ";
  }

  if (league.includes("france")) {
    extra += " franca francês ";
  }

  return `
    ${home}
    ${away}
    ${league}
    ${extra}
  `;
}

export function salvarJogos(jogos) {
  cacheJogos = Array.isArray(jogos) ? jogos : [];
}

export function buscarTodosJogos() {
  return cacheJogos;
}

export function buscarJogosPorTexto(textoBusca) {
  console.log("BUSCANDO NO CACHE:");
  console.log(textoBusca);

  const busca = normalizarTexto(textoBusca);

  return cacheJogos.filter((jogo) => {
    try {
      const textoCompleto = gerarTextoBusca(jogo);

      return textoCompleto.includes(busca);

    } catch (error) {
      return false;
    }
  });
}
