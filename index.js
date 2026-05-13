import express from "express";
import TelegramBot from "node-telegram-bot-api";

import {
  atualizarCacheJogos,
  buscarJogosPorTexto
} from "./services/oddsService.js";

import { analisarJogo } from "./services/analysisService.js";

const app = express();

app.use(express.json());

const TOKEN = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(TOKEN);

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("AnaliseBet IA Online");
});

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

async function iniciarWebhook() {
  const url = process.env.RENDER_EXTERNAL_URL;

  if (!url) {
    console.log("RENDER_EXTERNAL_URL não encontrada");
    return;
  }

  try {
    await bot.deleteWebHook();

    console.log("WEBHOOK ANTIGO REMOVIDO");

    await bot.setWebHook(
      `${url}/bot${TOKEN}`
    );

    console.log("WEBHOOK ATIVADO");
  }

  catch (erro) {
    console.log(
      "ERRO NO WEBHOOK:"
    );

    console.log(erro.message);
  }
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;

    const texto =
      msg.text?.trim();

    if (!texto) {
      return;
    }

    const textoLower =
      texto.toLowerCase();

    if (
      textoLower === "oi" ||
      textoLower === "olá" ||
      textoLower === "ola"
    ) {
      await bot.sendMessage(
        chatId,
        `👋 Olá!\n\nEnvie:\n• Nome de time\n• Campeonato\n• País\n\nExemplos:\nBahia\nBrasileirão\nLa Liga\nChampions`
      );

      return;
    }

    const jogos =
      buscarJogosPorTexto(texto);

    if (!jogos.length) {
      await bot.sendMessage(
        chatId,
        `❌ Nenhum jogo encontrado para:\n${texto}`
      );

      return;
    }

    let resposta =
      `🔎 Busca: ${texto}\n`;

    resposta +=
      `📊 Jogos encontrados: ${jogos.length}\n\n`;

    const jogosLimitados =
      jogos.slice(0, 10);

    for (const jogo of jogosLimitados) {

      const analise =
        analisarJogo(jogo);

      if (!analise) {
        continue;
      }

      const casa =
        analise.casa;

      const empate =
        analise.empate;

      const fora =
        analise.fora;

      const data =
        new Date(
          jogo.commence_time
        ).toLocaleString(
          "pt-BR",
          {
            timeZone:
              "America/Bahia"
          }
        );

      const liga =
        jogo.sport_title
          ?.replace(
            "Brazil",
            "Brasil"
          );

      resposta +=
`🏆 ${liga}

⚽ ${jogo.home_team} x ${jogo.away_team}
🕒 ${data}

🏠 ${jogo.home_team}: ${casa.odd}
📊 Chance estimada: ${casa.probabilidade}%
🎯 Odd justa: ${casa.oddJusta}
💰 Valor esperado: ${casa.ev}%
${textoEV(casa.ev)}

🤝 Empate: ${empate.odd}
📊 Chance estimada: ${empate.probabilidade}%
🎯 Odd justa: ${empate.oddJusta}
💰 Valor esperado: ${empate.ev}%
${textoEV(empate.ev)}

✈️ ${jogo.away_team}: ${fora.odd}
📊 Chance estimada: ${fora.probabilidade}%
🎯 Odd justa: ${fora.oddJusta}
💰 Valor esperado: ${fora.ev}%
${textoEV(fora.ev)}

━━━━━━━━━━━━━━━

`;
    }

    if (jogos.length > 10) {
      resposta +=
        `⚠️ Mostrando apenas os 10 primeiros resultados.`;
    }

    await bot.sendMessage(
      chatId,
      resposta
    );
  }

  catch (erro) {
    console.log(
      "ERRO NO BOT:"
    );

    console.log(erro);

    await bot.sendMessage(
      msg.chat.id,
      "❌ Erro interno no sistema."
    );
  }
});

function textoEV(ev) {
  const valor =
    Number(ev);

  if (valor >= 15) {
    return "🔥 Excelente valor";
  }

  if (valor >= 5) {
    return "✅ Boa oportunidade";
  }

  return "❌ Sem valor";
}

async function iniciarSistema() {
  try {
    await atualizarCacheJogos();

    setInterval(
      atualizarCacheJogos,
      1000 * 60 * 10
    );

    await iniciarWebhook();

    console.log(
      "Sistema iniciado"
    );
  }

  catch (erro) {
    console.log(
      "ERRO INICIANDO SISTEMA:"
    );

    console.log(
      erro.message
    );
  }
}

app.listen(PORT, async () => {
  console.log(
    `Servidor rodando na porta ${PORT}`
  );

  await iniciarSistema();
});
