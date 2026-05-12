let jogosCache = [];

export function salvarJogos(jogos) {
  jogosCache = jogos;
}

function normalizarTexto(texto) {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim();
}

function quebrarTexto(texto) {
  return normalizarTexto(texto)
    .split(" ")
    .filter(Boolean);
}

function calcularRelevancia(jogo, termosBusca) {
  let pontos = 0;

  const campos = [
    jogo.home_team || "",
    jogo.away_team || "",
    jogo.sport_title || "",
    jogo.sport_key || "",
  ];

  const textoCompleto = normalizarTexto(campos.join(" "));

  termosBusca.forEach((termo) => {
    if (textoCompleto.includes(termo)) {
      pontos += 10;
    }

    const palavras = quebrarTexto(textoCompleto);

    palavras.forEach((palavra) => {
      if (palavra.startsWith(termo)) {
        pontos += 5;
      }

      if (palavra.includes(termo)) {
        pontos += 2;
      }
    });
  });

  return pontos;
}

export function buscarJogosPorTime(busca) {
  const buscaNormalizada = normalizarTexto(busca);

  const termosBusca = quebrarTexto(buscaNormalizada);

  const resultados = jogosCache
    .map((jogo) => {
      const relevancia = calcularRelevancia(jogo, termosBusca);

      return {
        ...jogo,
        relevancia,
      };
    })
    .filter((jogo) => jogo.relevancia > 0)
    .sort((a, b) => b.relevancia - a.relevancia);

  return resultados;
}
