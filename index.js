import TelegramBot from "node-telegram-bot-api";
import express from "express";

import {
  salvarJogos,
  buscarJogosPorTime,
} from "./services/cacheService.js";

import { buscarTodosJogos } from "./services/oddsService.js";

const TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 10000;

const app = express();

app.get("/", (req, res) => {
  res.send("AnaliseBet Bot ONLINE");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

if (!TOKEN) {
  console.log("TELEGRAM_TOKEN NÃO CONFIGURADO");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

console.log("Bot iniciado.");

async function atualizarCache() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    const jogos = await buscarTodosJogos();

    salvarJogos(jogos);

    console.log("===============================");
    console.log("CACHE SALVO:");
    console.log(jogos.length);
  } catch (erro) {
    console.log("ERRO AO ATUALIZAR CACHE:");
    console.log(erro.message);
  }
}

await atualizarCache();

setInterval(async () => {
  atualizarCache();
}, 5 * 60 * 1000);

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text?.trim();

    if (!texto) return;

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const resultados = buscarJogosPorTime(texto);

    if (!resultados.length) {
      await bot.sendMessage(
        chatId,
        "❌ Nenhum jogo encontrado."
      );
      return;
    }

    let resposta = "📊 Jogos encontrados\n\n";

    resultados.slice(0, 10).forEach((jogo) => {
      const home = jogo.home_team;
      const away = jogo.away_team;

      const odds =
        jogo.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

      const oddCasa = odds.find(
        (o) => o.name === home
      )?.price;

      const oddFora = odds.find(
        (o) => o.name === away
      )?.price;

      const oddEmpate = odds.find(
        (o) =>
          o.name?.toLowerCase() === "draw"
      )?.price;

      const favorito =
        oddCasa < oddFora ? home : away;

      const oddFavorita =
        oddCasa < oddFora
          ? oddCasa
          : oddFora;

      let risco = "Alto";

      if (oddFavorita <= 1.60) {
        risco = "Baixo";
      } else if (oddFavorita <= 2.20) {
        risco = "Médio";
      }

      resposta += `⚽ ${home} x ${away}\n`;
      resposta += `🏆 ${jogo.sport_title}\n\n`;

      resposta += `• ${home}: ${oddCasa}\n`;
      resposta += `• ${away}: ${oddFora}\n`;
      resposta += `• Empate: ${oddEmpate}\n\n`;

      resposta += `🧠 Análise IA:\n`;
      resposta += `⭐ Favorito: ${favorito}\n`;
      resposta += `📉 Odd favorita: ${oddFavorita}\n`;
      resposta += `⚠️ Risco: ${risco}\n`;

      resposta += `\n━━━━━━━━━━━━━━━\n\n`;
    });

    await bot.sendMessage(chatId, resposta);
  } catch (erro) {
    console.log("ERRO TELEGRAM:");
    console.log(erro.message);
  }
});
