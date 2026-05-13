import TelegramBot from "node-telegram-bot-api";
import express from "express";

const app = express();

const PORT = process.env.PORT || 10000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.log("TOKEN TELEGRAM NÃO CONFIGURADO");
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false,
});

let pollingAtivo = false;

async function iniciarBot() {
  if (pollingAtivo) {
    console.log("POLLING JÁ ESTÁ ATIVO");
    return;
  }

  try {
    pollingAtivo = true;

    await bot.deleteWebHook({
      drop_pending_updates: true,
    });

    try {
      await bot.stopPolling();
    } catch {}

    await bot.startPolling({
      restart: false,
    });

    console.log("BOT POLLING INICIADO");
  } catch (erro) {
    pollingAtivo = false;

    console.log("ERRO AO INICIAR POLLING:");
    console.log(erro.message);
  }
}

bot.on("polling_error", async (erro) => {
  console.log("POLLING ERROR:");
  console.log(erro.message);

  if (erro.message.includes("409")) {
    console.log("CONFLITO 409 IGNORADO");
    return;
  }

  pollingAtivo = false;

  try {
    await bot.stopPolling();
  } catch {}

  setTimeout(async () => {
    await iniciarBot();
  }, 5000);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    "Bot funcionando normalmente."
  );
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarBot();
});
