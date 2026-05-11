import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";

import { buscarOdds } from "./services/oddsService.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text || "";

    console.log("Mensagem recebida:", texto);

    if (texto === "/start") {
      await bot.sendMessage(
        chatId,
        "🚀 Bem-vindo ao AnaliseBet IA!\n\nEnvie jogos, times ou ligas para análise."
      );

      return;
    }

    if (texto.length < 2) {
      await bot.sendMessage(
        chatId,
        "⚠️ Digite um jogo, time ou liga válida."
      );

      return;
    }

    const odds = await buscarOdds();

    console.log("Total jogos encontrados:", odds.length);

    const busca = normalizarTexto(texto);

    const encontrados = odds.filter((jogo) => {
      const home = normalizarTexto(jogo.home_team || "");
      const away = normalizarTexto(jogo.away_team || "");
      const liga = normalizarTexto(jogo.sport_title || "");

      return (
        home.includes(busca) ||
        away.includes(busca) ||
        liga.includes(busca) ||
        `${home} x ${away}`.includes(busca)
      );
    });

    console.log("Jogos filtrados:", encontrados.length);

    if (encontrados.length === 0) {
      await bot.sendMessage(
        chatId,
        "❌ Nenhum jogo encontrado agora."
      );

      return;
    }

    let resposta = `📊 Jogos encontrados (${encontrados.length})\n\n`;

    encontrados.slice(0, 5).forEach((jogo) => {
      const bookmaker = jogo.bookmakers?.[0];

      if (!bookmaker) return;

      const market = bookmaker.markets?.[0];

      if (!market) return;

      resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;
      resposta += `🏆 ${jogo.sport_title}\n`;

      market.outcomes.forEach((outcome) => {
        resposta += `• ${outcome.name}: ${outcome.price}\n`;
      });

      const favorito = market.outcomes.reduce((menor, atual) =>
        atual.price < menor.price ? atual : menor
      );

      let risco = "Alto";

      if (favorito.price <= 1.70) {
        risco = "Baixo";
      } else if (favorito.price <= 2.20) {
        risco = "Médio";
      }

      resposta += `\n🧠 Análise IA:\n`;
      resposta += `⭐ Favorito: ${favorito.name}\n`;
      resposta += `📉 Odd favorita: ${favorito.price}\n`;
      resposta += `⚠️ Risco: ${risco}\n`;

      resposta += `\n━━━━━━━━━━━━━━\n\n`;
    });

    if (resposta.length > 4000) {
      resposta = resposta.slice(0, 3900);
    }

    await bot.sendMessage(chatId, resposta);
  } catch (error) {
    console.log("ERRO GERAL BOT:");
    console.log(error);

    try {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Erro interno ao buscar jogos."
      );
    } catch {}
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
