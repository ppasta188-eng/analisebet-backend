import TelegramBot from "node-telegram-bot-api";
import express from "express";

import {
  salvarJogos,
  buscarJogosPorTime
} from "./services/cacheService.js";

import {
  buscarTodosJogos
} from "./services/oddsService.js";

/*
====================================
CONFIG
====================================
*/

const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) {
  console.log("TOKEN TELEGRAM NÃO CONFIGURADO");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

console.log("Bot iniciado.");

/*
====================================
EXPRESS / RENDER
====================================
*/

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

/*
====================================
ATUALIZAÇÃO DE CACHE
====================================
*/

async function atualizarCache() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    const jogos = await buscarTodosJogos();

    /*
    ====================================
    PROTEÇÃO DE CACHE
    NÃO SOBRESCREVER COM ARRAY VAZIO
    ====================================
    */

    if (!jogos || jogos.length === 0) {
      console.log("=======================");
      console.log("CACHE MANTIDO");
      console.log("API RETORNOU 0 JOGOS");
      console.log("=======================");

      return;
    }

    salvarJogos(jogos);

    console.log("=======================");
    console.log("CACHE SALVO:");
    console.log(jogos.length);
  } catch (erro) {
    console.log("ERRO AO ATUALIZAR CACHE:");
    console.log(erro.message);
  }
}

/*
====================================
INICIALIZAÇÃO
====================================
*/

await atualizarCache();

/*
====================================
ATUALIZAÇÃO AUTOMÁTICA
15 MINUTOS
====================================
*/

setInterval(async () => {
  await atualizarCache();
}, 15 * 60 * 1000);

/*
====================================
BUSCA INTELIGENTE
====================================
*/

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text?.trim();

    if (!texto) {
      return;
    }

    const jogos = buscarJogosPorTime(texto);

    if (!jogos || jogos.length === 0) {
      await bot.sendMessage(
        chatId,
        "Nenhum jogo encontrado."
      );

      return;
    }

    /*
    ====================================
    LIMITAR TAMANHO TELEGRAM
    ====================================
    */

    const mensagens = [];

    let blocoAtual = "";

    for (const jogo of jogos) {
      const linha =
`🏆 ${jogo.sport_title}

⚽ ${jogo.home_team} x ${jogo.away_team}

📅 ${new Date(jogo.commence_time).toLocaleString("pt-BR")}

────────────────────

`;

      if ((blocoAtual + linha).length > 3500) {
        mensagens.push(blocoAtual);
        blocoAtual = linha;
      } else {
        blocoAtual += linha;
      }
    }

    if (blocoAtual.length > 0) {
      mensagens.push(blocoAtual);
    }

    for (const mensagem of mensagens) {
      await bot.sendMessage(chatId, mensagem);
    }

  } catch (erro) {
    console.log("ERRO GERAL:");
    console.log(erro.message);
  }
});

/*
====================================
POLLING ERROR
SEM RESTART MANUAL
====================================
*/

bot.on("polling_error", (erro) => {
  console.log("POLLING ERROR:");
  console.log(erro.message);
});
