import TelegramBot from "node-telegram-bot-api";
import express from "express";

import {
  salvarJogos,
  obterJogos,
  buscarJogosPorTime,
} from "./services/cacheService.js";

import { analisarJogo } from "./services/analysisService.js";

import { buscarTodosJogos } from "./services/oddsService.js";

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("AnaliseBet Bot Online");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.log("TOKEN TELEGRAM NÃO ENCONTRADO");
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: true,
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
  await atualizarCache();
}, 5 * 60 * 1000);

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const texto = msg.text;

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const jogos = buscarJogosPorTime(texto);

    if (!jogos.length) {
      bot.sendMessage(
        chatId,
        "❌ Nenhum jogo encontrado no cache."
      );

      return;
    }

    let resposta = "📊 Jogos encontrados\n\n";

    for (const jogo of jogos) {
      const analise = analisarJogo(jogo);

      if (analise) {
        resposta += analise + "\n";
      }
    }

    bot.sendMessage(chatId, resposta);
  } catch (erro) {
    console.log("ERRO GERAL:");
    console.log(erro.message);
  }
});
