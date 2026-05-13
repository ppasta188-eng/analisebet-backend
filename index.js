import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  buscarJogosPorTexto,
  salvarJogos
} from "./services/cacheService.js";

import {
  atualizarCacheJogos
} from "./services/oddsService.js";

import {
  analisarMercado
} from "./services/valueService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN);

const WEBHOOK_URL = `https://analisebet-backend.onrender.com/bot${TELEGRAM_TOKEN}`;

const mensagensIgnoradas = [
  "oi",
  "ola",
  "olá",
  "opa",
  "bom dia",
  "boa tarde",
  "boa noite",
  "teste",
  "test"
];

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

function traduzirLiga(nomeLiga) {
  return nomeLiga
    .replace("Brazil", "Brasil")
    .replace("Spain", "Espanha")
    .replace("Germany", "Alemanha")
    .replace("Italy", "Itália")
    .replace("France", "França");
}

function gerarMensagemValor(nomeTime, valorEsperado) {
  if (valorEsperado >= 8) {
    return `🔥 Forte valor encontrado para ${nomeTime}`;
  }

  if (valorEsperado >= 4) {
    return `✅ Boa oportunidade para ${nomeTime}`;
  }

  if (valorEsperado >= 0) {
    return `⚖️ Mercado equilibrado para ${nomeTime}`;
  }

  return `❌ Sem valor para ${nomeTime}`;
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = (msg.text || "").trim();

    if (!texto) {
      return;
    }

    const textoNormalizado = texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (mensagensIgnoradas.includes(textoNormalizado)) {
      return;
    }

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const resultados = buscarJogosPorTexto(texto);

    if (!resultados.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para:\n\n${texto}`
      );

      return;
    }

    const jogosLimitados = resultados.slice(0, 10);

    let resposta = "";

    resposta += `🔎 <b>Busca:</b> ${texto}\n`;
    resposta += `📊 <b>Jogos encontrados:</b> ${resultados.length}\n\n`;

    for (const jogo of jogosLimitados) {
      const market = jogo.bookmakers?.[0]?.markets?.[0];

      const casa = market?.outcomes?.find(
        (o) => o.name === jogo.home_team
      );

      const empate = market?.outcomes?.find(
        (o) => o.name.toLowerCase() === "draw"
      );

      const fora = market?.outcomes?.find(
        (o) => o.name === jogo.away_team
      );

      const horario = new Date(jogo.commence_time).toLocaleString(
        "pt-BR",
        {
          timeZone: "America/Sao_Paulo"
        }
      );

      const analise = analisarMercado(
        casa,
        empate,
        fora,
        jogo
      );

      resposta += `🏆 <b>${traduzirLiga(jogo.league)}</b>\n\n`;

      resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;

      resposta += `🕒 ${horario}\n\n`;

      if (casa && analise) {
        resposta += `🏠 ${jogo.home_team}: ${casa.price}\n`;
        resposta += `📊 Chance estimada: ${(analise.casa.prob * 100).toFixed(1)}%\n`;
        resposta += `🎯 Odd justa: ${analise.casa.oddJusta.toFixed(2)}\n`;
        resposta += `💰 Valor esperado: ${analise.casa.valorEsperado.toFixed(1)}%\n`;
        resposta += `${gerarMensagemValor(
          jogo.home_team,
          analise.casa.valorEsperado
        )}\n\n`;
      }

      if (empate && analise) {
        resposta += `🤝 Empate: ${empate.price}\n`;
        resposta += `📊 Chance estimada: ${(analise.empate.prob * 100).toFixed(1)}%\n`;
        resposta += `🎯 Odd justa: ${analise.empate.oddJusta.toFixed(2)}\n`;
        resposta += `💰 Valor esperado: ${analise.empate.valorEsperado.toFixed(1)}%\n\n`;
      }

      if (fora && analise) {
        resposta += `✈️ ${jogo.away_team}: ${fora.price}\n`;
        resposta += `📊 Chance estimada: ${(analise.fora.prob * 100).toFixed(1)}%\n`;
        resposta += `🎯 Odd justa: ${analise.fora.oddJusta.toFixed(2)}\n`;
        resposta += `💰 Valor esperado: ${analise.fora.valorEsperado.toFixed(1)}%\n`;
        resposta += `${gerarMensagemValor(
          jogo.away_team,
          analise.fora.valorEsperado
        )}\n`;
      }

      resposta += `\n━━━━━━━━━━━━━━━\n\n`;
    }

    if (resultados.length > 10) {
      resposta += `⚠️ Mostrando apenas os 10 primeiros resultados.`;
    }

    await bot.sendMessage(
      chatId,
      resposta,
      {
        parse_mode: "HTML"
      }
    );

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
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    const jogos = await atualizarCacheJogos();

    if (jogos.length > 0) {
      salvarJogos(jogos);

      console.log("=======================");
      console.log("CACHE SALVO:");
      console.log(jogos.length);
      console.log("=======================");
    }

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
          console.log("=======================");
        } else {
          console.log("=======================");
          console.log("CACHE MANTIDO");
          console.log("API RETORNOU 0 JOGOS");
          console.log("=======================");
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
