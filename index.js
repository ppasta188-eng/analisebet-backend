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
  const texto = msg.text?.trim();

  console.log("Mensagem recebida:", texto);

  if (!texto) {
    return;
  }

  if (texto === "/start") {
    bot.sendMessage(
      chatId,
      "🚀 Bem-vindo ao AnaliseBet IA!\n\nEnvie um jogo de futebol para análise.\n\nExemplo:\nPalmeiras x Flamengo"
    );
    return;
  }

  if (texto.length < 5) {
    bot.sendMessage(
      chatId,
      "⚠️ Digite um jogo válido.\n\nExemplo:\nPalmeiras x Flamengo"
    );
    return;
  }

  try {
    const odds = await buscarOdds();

    if (!odds || odds.length === 0) {
      bot.sendMessage(
        chatId,
        "❌ Nenhum jogo encontrado."
      );
      return;
    }

    const busca = texto.toLowerCase();

    const jogosFiltrados = odds.filter((jogo) => {
      if (jogo.sport_key !== "soccer") {
        return false;
      }

      const casa = jogo.home_team?.toLowerCase() || "";
      const fora = jogo.away_team?.toLowerCase() || "";

      return (
        casa.includes(busca) ||
        fora.includes(busca) ||
        `${casa} x ${fora}`.includes(busca)
      );
    });

    if (jogosFiltrados.length === 0) {
      bot.sendMessage(
        chatId,
        "❌ Não encontrei esse jogo nas odds disponíveis agora."
      );
      return;
    }

    let resposta = "📊 Análise encontrada:\n\n";

    jogosFiltrados.slice(0, 3).forEach((jogo) => {
      resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n\n`;

      const bookmaker = jogo.bookmakers?.[0];

      if (bookmaker) {
        const mercados = bookmaker.markets?.[0];

        if (mercados) {
          mercados.outcomes.forEach((odd) => {
            resposta += `• ${odd.name}: ${odd.price}\n`;
          });
        }
      }

      resposta += "\n";
    });

    bot.sendMessage(chatId, resposta);
  } catch (error) {
    console.log("Erro geral:", error.message);

    bot.sendMessage(
      chatId,
      "❌ Erro ao processar análise."
    );
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
