import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { buscarOdds } from "./services/oddsService.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text;

  console.log("Mensagem recebida:", texto);

  if (texto === "/start") {
    bot.sendMessage(
      chatId,
      "🚀 Bem-vindo ao AnaliseBet IA!\n\nEnvie jogos para análise."
    );

    return;
  }

  const odds = await buscarOdds();

  if (!odds.length) {
    bot.sendMessage(
      chatId,
      "❌ Não foi possível buscar odds agora."
    );

    return;
  }

  let resposta = "📊 Jogos encontrados:\n\n";

  odds.slice(0, 5).forEach((jogo) => {
    resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;
  });

  bot.sendMessage(chatId, resposta);
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
