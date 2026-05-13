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
  polling: {
    autoStart: false,
    interval: 3000,
    params: {
      timeout: 10,
    },
  },
});

async function iniciarBot() {
  try {
    await bot.deleteWebHook({
      drop_pending_updates: true,
    });

    console.log("WEBHOOK REMOVIDO");

    await bot.startPolling();

    console.log("BOT POLLING INICIADO");
  } catch (erro) {
    console.log("ERRO AO INICIAR BOT:");
    console.log(erro.message);
  }
}

bot.on("polling_error", async (erro) => {
  console.log("POLLING ERROR:");
  console.log(erro.message);

  // IGNORA COMPLETAMENTE 409
  if (erro.message.includes("409")) {
    return;
  }
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text || "";

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    await bot.sendMessage(
      chatId,
      `Você buscou: ${texto}`
    );
  } catch (erro) {
    console.log("ERRO GERAL:");
    console.log(erro.message);
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarBot();
});
