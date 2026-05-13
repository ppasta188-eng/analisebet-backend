import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCacheJogos,
  buscarJogosPorTexto
} from "./services/oddsService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TOKEN = process.env.TELEGRAM_TOKEN;

const WEBHOOK_URL = `https://analisebet-backend.onrender.com/bot${TOKEN}`;

const bot = new TelegramBot(TOKEN);

async function iniciarBot() {
  try {
    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(WEBHOOK_URL);

    console.log("WEBHOOK ATIVADO");
  } catch (error) {
    console.log("ERRO AO CONFIGURAR WEBHOOK:");
    console.log(error.message);
  }
}

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const texto = msg.text;

    if (!texto) return;

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const resultados = buscarJogosPorTexto(texto);

    if (!resultados || resultados.length === 0) {
      await bot.sendMessage(
        chatId,
        "Nenhum jogo encontrado."
      );
      return;
    }

    let resposta = "";

    resultados.slice(0, 10).forEach((jogo) => {
      resposta += `
🏆 ${jogo.league}

⚽ ${jogo.home_team} x ${jogo.away_team}

🏠 Casa: ${jogo.home_odd}
🤝 Empate: ${jogo.draw_odd}
✈️ Fora: ${jogo.away_odd}

──────────────────
`;
    });

    await bot.sendMessage(chatId, resposta);

  } catch (error) {
    console.log("ERRO NO BOT:");
    console.log(error);

    await bot.sendMessage(
      msg.chat.id,
      "Erro ao buscar jogos."
    );
  }
});

app.get("/", (_, res) => {
  res.send("AnaliseBet rodando.");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarBot();

  await atualizarCacheJogos();
});
