import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCacheJogos,
  buscarJogosPorTexto
} from "./services/oddsService.js";

import { analisarJogo } from "./services/analysisService.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN);

const WEBHOOK_URL = `https://analisebet-backend.onrender.com/bot${TELEGRAM_TOKEN}`;

async function iniciarSistema() {
  try {
    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(WEBHOOK_URL);

    console.log("WEBHOOK ATIVADO");

    await atualizarCacheJogos();
  } catch (erro) {
    console.log("ERRO INICIANDO SISTEMA:");
    console.log(erro.message);
  }
}

app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    bot.processUpdate(req.body);

    res.sendStatus(200);
  } catch (erro) {
    console.log("ERRO WEBHOOK:");
    console.log(erro.message);

    res.sendStatus(500);
  }
});

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto = msg.text;

    if (!texto) {
      return;
    }

    console.log("BUSCANDO NO CACHE:");
    console.log(texto);

    const textoLimpo = texto.trim().toLowerCase();

    if (
      textoLimpo === "oi" ||
      textoLimpo === "olá" ||
      textoLimpo === "ola" ||
      textoLimpo === "bom dia" ||
      textoLimpo === "boa tarde" ||
      textoLimpo === "boa noite"
    ) {
      await bot.sendMessage(
        chatId,
        "👋 Olá! Envie o nome de um time, campeonato ou país.\n\nExemplos:\n- Bahia\n- Brasileirão\n- Flamengo\n- Espanha"
      );

      return;
    }

    const jogos = buscarJogosPorTexto(texto);

    if (!jogos.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para: ${texto}`
      );

      return;
    }

    let mensagem = "";

    mensagem += `🔎 Busca: ${texto}\n`;
    mensagem += `📊 Jogos encontrados: ${jogos.length}\n\n`;

    const jogosLimitados = jogos.slice(0, 10);

    for (const jogo of jogosLimitados) {
      const oddCasa =
        jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price;

      const oddEmpate =
        jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.price;

      const oddFora =
        jogo.bookmakers?.[0]?.markets?.[0]?.outcomes?.[2]?.price;

      if (!oddCasa || !oddEmpate || !oddFora) {
        continue;
      }

      const analise = analisarJogo(jogo);

      if (!analise) {
        continue;
      }

      const data = new Date(jogo.commence_time);

      const dataFormatada =
        data.toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo"
        });

      mensagem += `
🏆 ${jogo.sport_title.replace("Brazil", "Brasil")}

⚽ ${jogo.home_team} x ${jogo.away_team}
🕒 ${dataFormatada}

🏠 ${jogo.home_team}: ${oddCasa}
📊 Chance estimada: ${(analise.probabilidades.casa * 100).toFixed(1)}%
🎯 Odd justa: ${analise.oddsJustas.casa.toFixed(2)}
💰 Valor esperado: ${analise.valorEsperado.casa.toFixed(1)}%
${analise.classificacao.casa}

🤝 Empate: ${oddEmpate}
📊 Chance estimada: ${(analise.probabilidades.empate * 100).toFixed(1)}%
🎯 Odd justa: ${analise.oddsJustas.empate.toFixed(2)}
💰 Valor esperado: ${analise.valorEsperado.empate.toFixed(1)}%
${analise.classificacao.empate}

✈️ ${jogo.away_team}: ${oddFora}
📊 Chance estimada: ${(analise.probabilidades.fora * 100).toFixed(1)}%
🎯 Odd justa: ${analise.oddsJustas.fora.toFixed(2)}
💰 Valor esperado: ${analise.valorEsperado.fora.toFixed(1)}%
${analise.classificacao.fora}

━━━━━━━━━━━━━━━

`;
    }

    if (jogos.length > 10) {
      mensagem += "⚠️ Mostrando apenas os 10 primeiros resultados.";
    }

    await bot.sendMessage(chatId, mensagem);
  } catch (erro) {
    console.log("ERRO NO BOT:");
    console.log(erro);

    await bot.sendMessage(
      msg.chat.id,
      "❌ Ocorreu um erro ao processar sua busca."
    );
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet IA online.");
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  await iniciarSistema();
});
