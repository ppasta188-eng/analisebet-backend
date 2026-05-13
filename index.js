import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCache,
  buscarJogosPorTexto
} from "./services/cacheService.js";

import { analisarJogo } from "./services/analysisService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TOKEN = process.env.TELEGRAM_TOKEN;

const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

const bot = new TelegramBot(TOKEN);

function dividirMensagem(texto, limite = 3500) {
  const partes = [];

  for (let i = 0; i < texto.length; i += limite) {
    partes.push(texto.slice(i, i + limite));
  }

  return partes;
}

async function enviarMensagemGrande(chatId, texto) {
  const partes = dividirMensagem(texto);

  for (const parte of partes) {
    await bot.sendMessage(chatId, parte);
  }
}

app.post(`/bot${TOKEN}`, async (req, res) => {
  try {
    bot.processUpdate(req.body);

    res.sendStatus(200);
  } catch (erro) {
    console.log("ERRO WEBHOOK:");
    console.log(erro);

    res.sendStatus(500);
  }
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text?.trim();

    if (!texto) {
      return;
    }

    const busca = texto;

    const jogos = buscarJogosPorTexto(busca);

    if (!jogos.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para: ${busca}`
      );

      return;
    }

    let resposta = "";

    resposta += `🔎 Busca: ${busca}\n`;
    resposta += `📊 Jogos encontrados: ${jogos.length}\n\n`;

    const jogosLimitados = jogos.slice(0, 10);

    for (const jogo of jogosLimitados) {
      const analise = analisarJogo(jogo);

      const casa = analise?.casa || {};
      const empate = analise?.empate || {};
      const fora = analise?.fora || {};

      resposta += `🏆 ${jogo.campeonato}\n\n`;

      resposta += `⚽ ${jogo.casa} x ${jogo.fora}\n`;

      resposta += `🕒 ${new Date(jogo.data).toLocaleString("pt-BR")}\n\n`;

      resposta += `🏠 ${jogo.casa}: ${jogo.odds?.casa ?? "-"}\n`;
      resposta += `📊 Chance estimada: ${casa.probabilidade ?? "-"}%\n`;
      resposta += `🎯 Odd justa: ${casa.oddJusta ?? "-"}\n`;
      resposta += `💰 Valor esperado: ${casa.valorEsperado ?? "-"}%\n`;
      resposta += `${casa.classificacao ?? "❌ Sem valor"}\n\n`;

      resposta += `🤝 Empate: ${jogo.odds?.empate ?? "-"}\n`;
      resposta += `📊 Chance estimada: ${empate.probabilidade ?? "-"}%\n`;
      resposta += `🎯 Odd justa: ${empate.oddJusta ?? "-"}\n`;
      resposta += `💰 Valor esperado: ${empate.valorEsperado ?? "-"}%\n`;
      resposta += `${empate.classificacao ?? "❌ Sem valor"}\n\n`;

      resposta += `✈️ ${jogo.fora}: ${jogo.odds?.fora ?? "-"}\n`;
      resposta += `📊 Chance estimada: ${fora.probabilidade ?? "-"}%\n`;
      resposta += `🎯 Odd justa: ${fora.oddJusta ?? "-"}\n`;
      resposta += `💰 Valor esperado: ${fora.valorEsperado ?? "-"}%\n`;
      resposta += `${fora.classificacao ?? "❌ Sem valor"}\n\n`;

      resposta += `━━━━━━━━━━━━━━━\n\n`;
    }

    if (jogos.length > 10) {
      resposta += `⚠️ Mostrando apenas os 10 primeiros resultados.`;
    }

    await enviarMensagemGrande(chatId, resposta);
  } catch (erro) {
    console.log("ERRO NO BOT:");
    console.log(erro);

    try {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Erro interno no sistema."
      );
    } catch {}
  }
});

async function iniciarSistema() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    await atualizarCache();

    setInterval(
      atualizarCache,
      1000 * 60 * 10
    );

    const webhookUrl = `${RENDER_URL}/bot${TOKEN}`;

    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(webhookUrl);

    console.log("WEBHOOK ATIVADO");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log("Sistema iniciado");
    });
  } catch (erro) {
    console.log("ERRO AO INICIAR:");
    console.log(erro);
  }
}

iniciarSistema();
