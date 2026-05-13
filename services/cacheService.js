let jogosCache = [];

function salvarJogos(jogos) {
  if (!Array.isArray(jogos)) return;

  if (jogos.length === 0) {
    console.log("=======================");
    console.log("CACHE MANTIDO");
    console.log("API RETORNOU 0 JOGOS");
    console.log("=======================");
    return;
  }

  jogosCache = jogos;

  console.log("=======================");
  console.log("CACHE SALVO:");
  console.log(jogosCache.length);
  console.log("=======================");
}

function obterJogos() {
  return jogosCache;
}

function normalizarTexto(texto) {
  return texto
    ?.toLowerCase()
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "")
    ?.trim();
}

function buscarJogosPorTexto(texto) {
  const busca = normalizarTexto(texto);

  console.log("BUSCANDO NO CACHE:");
  console.log(texto);

  return jogosCache.filter((jogo) => {
    const home = normalizarTexto(jogo.home_team);
    const away = normalizarTexto(jogo.away_team);
    const esporte = normalizarTexto(jogo.sport_title);

    return (
      home.includes(busca) ||
      away.includes(busca) ||
      esporte.includes(busca)
    );
  });
}

function formatarMensagemJogos(jogos) {
  if (!jogos || jogos.length === 0) {
    return "❌ Nenhum jogo encontrado.";
  }

  let mensagem = "";

  jogos.slice(0, 10).forEach((jogo) => {
    const bookmaker = jogo.bookmakers?.[0];

    const market = bookmaker?.markets?.find(
      (m) => m.key === "h2h"
    );

    const outcomes = market?.outcomes || [];

    const homeOdd =
      outcomes.find((o) => o.name === jogo.home_team)?.price || "-";

    const awayOdd =
      outcomes.find((o) => o.name === jogo.away_team)?.price || "-";

    const drawOdd =
      outcomes.find((o) => o.name === "Draw")?.price || "-";

    mensagem += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;
    mensagem += `🏆 ${jogo.sport_title}\n`;
    mensagem += `🕒 ${new Date(jogo.commence_time).toLocaleString("pt-BR")}\n\n`;

    mensagem += `ODDS:\n`;
    mensagem += `🏠 ${jogo.home_team} → ${homeOdd}\n`;

    if (drawOdd !== "-") {
      mensagem += `🤝 Empate → ${drawOdd}\n`;
    }

    mensagem += `✈️ ${jogo.away_team} → ${awayOdd}\n`;

    mensagem += `\n━━━━━━━━━━━━━━\n\n`;
  });

  return mensagem;
}

export {
  salvarJogos,
  obterJogos,
  buscarJogosPorTexto,
  formatarMensagemJogos,
};
