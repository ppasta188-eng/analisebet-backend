import TelegramBot from "node-telegram-bot-api";
import express from "express";

import { buscarJogos } from "./services/oddsService.js";

const app = express();

const PORT = process.env.PORT || 10000;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: true
});

function gerarAnalise(jogo) {

  try {

    const bookmaker = jogo.bookmakers?.[0];

    if (!bookmaker) {
      return "⚠️ Odds indisponíveis.";
    }

    const market = bookmaker.markets?.[0];

    if (!market) {
      return "⚠️ Mercado indisponível.";
    }

    const outcomes = market.outcomes;

    const sorted = [...outcomes].sort((a, b) => a.price - b.price);

    const favorito = sorted[0];

    let risco = "Alto";

    if (favorito.price <= 1.70) {
      risco = "Baixo";
    } else if (favorito.price <= 2.20) {
      risco = "Médio";
    }

    return `
🧠 Análise IA:
⭐ Favorito: ${favorito.name}
📉 Odd favorita: ${favorito.price}
⚠️ Risco: ${risco}
`;

  } catch {

    return "⚠️ Não foi possível gerar análise.";
  }
}

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(
    msg.chat.id,
    `🚀 Bem-vindo ao AnaliseBet IA!\n\nEnvie jogos, times ou ligas para análise.`
  );
});

bot.on("message", async (msg) => {

  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;

  console.log("Mensagem recebida:", msg.text);

  await bot.sendMessage(
    chatId,
    "🔎 Buscando odds no sistema global..."
  );

  const jogos = await buscarJogos(msg.text);

  if (!jogos.length) {

    return bot.sendMessage(
      chatId,
      "❌ Nenhum jogo encontrado agora."
    );
  }

  let resposta = `📊 Jogos encontrados (${jogos.length})\n\n`;

  jogos.slice(0, 10).forEach((jogo) => {

    const bookmaker = jogo.bookmakers?.[0];

    if (!bookmaker) return;

    const market = bookmaker.markets?.[0];

    if (!market) return;

    const outcomes = market.outcomes;

    resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;
    resposta += `🏆 ${jogo.sport_title}\n`;

    outcomes.forEach((o) => {

      resposta += `• ${o.name}: ${o.price}\n`;
    });

    resposta += gerarAnalise(jogo);

    resposta += `\n━━━━━━━━━━━━━━\n\n`;
  });

  bot.sendMessage(chatId, resposta);
});

bot.on("polling_error", (error) => {

  console.log("Polling error:", error.message);
});

app.get("/", (req, res) => {

  res.send("AnaliseBet IA online");
});

app.listen(PORT, () => {

  console.log(`Servidor rodando na porta ${PORT}`);
});
