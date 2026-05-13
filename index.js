import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCacheJogos,
} from "./services/oddsService.js";

import {
  salvarJogos,
  buscarJogosPorTexto,
  formatarMensagemJogos,
} from "./services/cacheService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token);

const WEBHOOK_URL = `https://analisebet-backend.onrender.com/bot${token}`;

async function iniciarBot() {
  try {
    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(WEBHOOK_URL);

    console.log("WEBHOOK ATIVADO");
  } catch (error) {
    console.log("ERRO WEBHOOK:");
    console.log(error.message);
  }
}

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text;

    if (!texto) {
      return;
    }

    const jogos = buscarJogosPorTexto(texto);

    const mensagem = formatarMensagemJogos(jogos);

    await bot.sendMessage(chatId, mensagem);
  } catch (error) {
    console.log("ERRO TELEGRAM:");
    console.log(error.message);
  }
});

async function atualizarCache() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    const jogos = await atualizarCacheJogos();

    console.log("===============================");
    console.log("TOTAL FINAL:", jogos.length);
    console.log("===============================");

    salvarJogos(jogos);
  } catch (error) {
    console.log("ERRO CACHE:");
    console.log(error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarBot();

  await atualizarCache();

  setInterval(async () => {
    await atualizarCache();
  }, 1000 * 60 * 10);
});
