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

  // aliases Brasil
  if (
    league.includes("brazil") ||
    league.includes("serie a") ||
    league.includes("serie b")
  ) {
    extra += " brasil brasileirao brasileirão copa do brasil ";
  }

  // aliases Espanha
  if (
    league.includes("spain") ||
    league.includes("la liga")
  ) {
    extra += " espanha laliga la liga ";
  }

  // aliases Alemanha
  if (
    league.includes("bundesliga") ||
    league.includes("germany")
  ) {
    extra += " alemanha bundesliga ";
  }

  // aliases Itália
  if (
    league.includes("italy") ||
    league.includes("serie a")
  ) {
    extra += " italia italiano ";
  }

  // aliases França
  if (
    league.includes("france") ||
    league.includes("ligue")
  ) {
    extra += " franca francês ligue ";
  }

  return `
    ${home}
    ${away}
    ${league}
    ${extra}
  `;
}

export function salvarJogos(jogos) {
  cacheJogos = jogos || [];
}

export function buscarTodosJogos() {
  return cacheJogos;
}

export function buscarJogosPorTexto(textoBusca) {
  console.log("BUSCANDO NO CACHE:");
  console.log(textoBusca);

  const busca = normalizarTexto(textoBusca);

  return cacheJogos.filter((jogo) => {
    const textoCompleto = gerarTextoBusca(jogo);

    return textoCompleto.includes(busca);
  });
}
