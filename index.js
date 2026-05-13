import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCacheJogos
} from "./services/oddsService.js";

import {
  buscarJogosPorTexto
} from "./services/cacheService.js";

import {
  analisarJogo
} from "./services/analysisService.js";

const app = express();

app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN);

const PORT = process.env.PORT || 10000;

const WEBHOOK_URL = "https://analisebet-backend.onrender.com";

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

function formatarData(dataISO) {
  const data = new Date(dataISO);

  return data.toLocaleString("pt-BR", {
    timeZone: "America/Bahia"
  });
}

function limitarMensagem(texto, limite = 3500) {
  if (texto.length <= limite) {
    return [texto];
  }

  const partes = [];
  let atual = "";

  const blocos = texto.split("━━━━━━━━━━━━━━━");

  for (const bloco of blocos) {
    if ((atual + bloco).length > limite) {
      partes.push(atual);
      atual = "";
    }

    atual += bloco + "\n━━━━━━━━━━━━━━━\n";
  }

  if (atual.length > 0) {
    partes.push(atual);
  }

  return partes;
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const texto = msg.text;

    if (!texto) {
      return;
    }

    const textoLower = texto.toLowerCase().trim();

    if (
      textoLower === "oi" ||
      textoLower === "olá" ||
      textoLower === "ola" ||
      textoLower === "opa" ||
      textoLower === "bom dia" ||
      textoLower === "boa tarde" ||
      textoLower === "boa noite"
    ) {
      await bot.sendMessage(
        chatId,
        "👋 Fala! Me envie:\n\n• Nome de time\n• Campeonato\n• País\n\nExemplos:\nBahia\nFlamengo\nBrasileirão\nChampions\nLa Liga"
      );

      return;
    }

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const jogos = buscarJogosPorTexto(texto);

    if (!jogos.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para: ${texto}`
      );

      return;
    }

    let resposta = "";

    resposta += `🔎 Busca: ${texto}\n`;
    resposta += `📊 Jogos encontrados: ${jogos.length}\n\n`;

    const limiteJogos = jogos.slice(0, 10);

    for (const jogo of limiteJogos) {
      const analise = analisarJogo(jogo);

      resposta += `🏆 ${jogo.liga}\n\n`;

      resposta += `⚽ ${jogo.timeCasa} x ${jogo.timeFora}\n`;

      resposta += `🕒 ${formatarData(jogo.data)}\n\n`;

      resposta += `🏠 ${jogo.timeCasa}: ${jogo.odds.casa}\n`;
      resposta += `📊 Chance estimada: ${analise.casa.chance}%\n`;
      resposta += `🎯 Odd justa: ${analise.casa.oddJusta}\n`;
      resposta += `💰 Valor esperado: ${analise.casa.valorEsperado}%\n`;
      resposta += `${analise.casa.status}\n\n`;

      resposta += `🤝 Empate: ${jogo.odds.empate}\n`;
      resposta += `📊 Chance estimada: ${analise.empate.chance}%\n`;
      resposta += `🎯 Odd justa: ${analise.empate.oddJusta}\n`;
      resposta += `💰 Valor esperado: ${analise.empate.valorEsperado}%\n`;
      resposta += `${analise.empate.status}\n\n`;

      resposta += `✈️ ${jogo.timeFora}: ${jogo.odds.fora}\n`;
      resposta += `📊 Chance estimada: ${analise.fora.chance}%\n`;
      resposta += `🎯 Odd justa: ${analise.fora.oddJusta}\n`;
      resposta += `💰 Valor esperado: ${analise.fora.valorEsperado}%\n`;
      resposta += `${analise.fora.status}\n\n`;

      resposta += `━━━━━━━━━━━━━━━\n\n`;
    }

    if (jogos.length > 10) {
      resposta += `⚠️ Mostrando apenas os 10 primeiros resultados.`;
    }

    const mensagens = limitarMensagem(resposta);

    for (const mensagem of mensagens) {
      await bot.sendMessage(chatId, mensagem);
    }
  } catch (erro) {
    console.log("ERRO NO BOT:");
    console.log(erro);

    await bot.sendMessage(
      msg.chat.id,
      "❌ Ocorreu um erro ao analisar os jogos."
    );
  }
});

async function iniciarSistema() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    await atualizarCacheJogos();

    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(`${WEBHOOK_URL}/bot${TOKEN}`);

    console.log("WEBHOOK ATIVADO");

    console.log("Sistema iniciado");
  } catch (erro) {
    console.log("ERRO INICIANDO SISTEMA:");
    console.log(erro.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarSistema();
});
