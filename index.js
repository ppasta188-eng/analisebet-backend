import TelegramBot from "node-telegram-bot-api";

import { buscarJogos } from "./services/oddsService.js";
import { analisarJogo } from "./services/analysisService.js";
import {
  salvarJogos,
  obterJogos
} from "./services/cacheService.js";

const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: true
});

console.log("Bot iniciado.");

async function atualizarCache() {
  console.log("=======================");
  console.log("ATUALIZANDO CACHE...");
  console.log("=======================");

  try {
    const jogos = await buscarJogos("");

    salvarJogos(jogos);

    console.log("CACHE SALVO:");
    console.log(jogos.length);

  } catch (error) {
    console.log("ERRO NO CACHE:");
    console.log(error.message);
  }
}

atualizarCache();

setInterval(() => {
  atualizarCache();
}, 1000 * 60 * 5);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text;

  if (!texto) {
    return;
  }

  console.log("BUSCANDO NO CACHE:");
  console.log(texto);

  bot.sendMessage(
    chatId,
    "🔎 Buscando jogos no cache local..."
  );

  const jogos = obterJogos();

  const encontrados = jogos.filter((jogo) => {
    const nomeJogo =
      `${jogo.home_team} ${jogo.away_team}`.toLowerCase();

    return nomeJogo.includes(texto.toLowerCase());
  });

  if (encontrados.length === 0) {
    bot.sendMessage(
      chatId,
      "❌ Nenhum jogo encontrado no cache."
    );

    return;
  }

  let resposta =
    `📊 Jogos encontrados (${encontrados.length})\n\n`;

  encontrados.forEach((jogo) => {
    const analise = analisarJogo(jogo);

    resposta += `
⚽ ${jogo.home_team} x ${jogo.away_team}
🏆 ${jogo.sport_title}

• ${analise.home}: ${analise.homeOdd}
• ${analise.away}: ${analise.awayOdd}
• Empate: ${analise.drawOdd}

🧠 Análise IA:
⭐ Favorito: ${analise.favorito}
📉 Odd favorita: ${analise.oddFavorita}
⚠️ Risco: ${analise.risco}

━━━━━━━━━━━━━━━

`;
  });

  bot.sendMessage(chatId, resposta);
});
