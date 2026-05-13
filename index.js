import express from "express";
import TelegramBot from "node-telegram-bot-api";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.log("TOKEN TELEGRAM NÃO CONFIGURADO");
  process.exit(1);
}

const URL_RENDER =
  "https://analisebet-backend.onrender.com";

const bot = new TelegramBot(TELEGRAM_TOKEN);

async function iniciarWebhook() {
  try {
    await bot.deleteWebHook({
      drop_pending_updates: true,
    });

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(
      `${URL_RENDER}/bot${TELEGRAM_TOKEN}`
    );

    console.log("WEBHOOK ATIVADO");
  } catch (erro) {
    console.log("ERRO WEBHOOK:");
    console.log(erro.message);
  }
}

app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    const msg = req.body.message;

    if (!msg) {
      return res.sendStatus(200);
    }

    const chatId = msg.chat.id;

    const texto = msg.text || "";

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    await bot.sendMessage(
      chatId,
      `Você buscou: ${texto}`
    );

    res.sendStatus(200);
  } catch (erro) {
    console.log("ERRO GERAL:");
    console.log(erro.message);

    res.sendStatus(200);
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarWebhook();
});
