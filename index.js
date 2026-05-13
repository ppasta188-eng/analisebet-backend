import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  buscarJogosPorTexto,
  salvarJogos
} from "./services/cacheService.js";

import {
  atualizarCacheJogos
} from "./services/oddsService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN);

const WEBHOOK_URL = `https://analisebet-backend.onrender.com/bot${TELEGRAM_TOKEN}`;

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

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);

  res.sendStatus(200);
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text || "";

    if (!texto.trim()) {
      return;
    }

    const resultados = buscarJogosPorTexto(texto);

    if (!resultados.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para:\n\n${texto}`
      );

      return;
    }

    const jogosLimitados = resultados.slice(0, 10);

    let resposta = `🔎 Busca: ${texto}\n`;
    resposta += `📊 Jogos encontrados: ${resultados.length}\n\n`;

    for (const jogo of jogosLimitados) {
      const casa = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
        (o) => o.name === jogo.home_team
      );

      const empate = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
        (o) => o.name.toLowerCase() === "draw"
      );

      const fora = jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
        (o) => o.name === jogo.away_team
      );

      const horario = new Date(jogo.commence_time).toLocaleString("pt-BR");

      resposta += `🏆 ${jogo.league}\n\n`;

      resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;

      resposta += `🕒 ${horario}\n\n`;

      if (casa) {
        resposta += `🏠 Casa: ${casa.price}\n`;
      }

      if (empate) {
        resposta += `🤝 Empate: ${empate.price}\n`;
      }

      if (fora) {
        resposta += `✈️ Fora: ${fora.price}\n`;
      }

      resposta += `\n━━━━━━━━━━━━━━━\n\n`;
    }

    if (resultados.length > 10) {
      resposta += `⚠️ Mostrando apenas os 10 primeiros resultados.`;
    }

    await bot.sendMessage(chatId, resposta);
  } catch (error) {
    console.log("ERRO NO BOT:");
    console.log(error);

    try {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Erro interno ao buscar jogos."
      );
    } catch {}
  }
});

async function iniciarSistema() {
  try {
    const jogos = await atualizarCacheJogos();

    salvarJogos(jogos);

    console.log("=======================");
    console.log("CACHE SALVO:");
    console.log(jogos.length);

    setInterval(async () => {
      try {
        console.log("=======================");
        console.log("ATUALIZANDO CACHE...");
        console.log("=======================");

        const novosJogos = await atualizarCacheJogos();

        if (novosJogos.length > 0) {
          salvarJogos(novosJogos);

          console.log("=======================");
          console.log("CACHE ATUALIZADO:");
          console.log(novosJogos.length);
        } else {
          console.log("=======================");
          console.log("CACHE MANTIDO");
          console.log("API RETORNOU 0 JOGOS");
        }
      } catch (error) {
        console.log("ERRO ATUALIZANDO CACHE:");
        console.log(error.message);
      }
    }, 1000 * 60 * 15);

    await iniciarBot();
  } catch (error) {
    console.log("ERRO INICIANDO SISTEMA:");
    console.log(error.message);
  }
}

app.get("/", (req, res) => {
  res.send("AnaliseBet IA Online");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarSistema();
});
