import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { buscarOdds } from "./services/oddsService.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function analisarJogo(market) {
  if (!market || !market.outcomes) {
    return {
      favorito: "Indefinido",
      risco: "Desconhecido",
    };
  }

  const oddsOrdenadas = [...market.outcomes].sort(
    (a, b) => a.price - b.price
  );

  const favorito = oddsOrdenadas[0];

  let risco = "Alto";

  if (favorito.price <= 1.50) {
    risco = "Baixo";
  } else if (favorito.price <= 2.00) {
    risco = "Médio";
  }

  return {
    favorito: favorito.name,
    oddFavorita: favorito.price,
    risco,
  };
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text?.trim();

  console.log("Mensagem recebida:", texto);

  if (!texto) return;

  if (texto === "/start") {
    bot.sendMessage(
      chatId,
      `🚀 Bem-vindo ao AnaliseBet IA!

🌎 Cobertura global de odds e análises esportivas.

Envie:
• Nome de time
• Liga
• Campeonato
• Ou confronto

Exemplos:
Flamengo
NBA
Champions
La Liga
Real Madrid`
    );

    return;
  }

  try {
    const odds = await buscarOdds();

    if (!odds || odds.length === 0) {
      bot.sendMessage(
        chatId,
        "❌ Nenhum jogo encontrado agora."
      );

      return;
    }

    const busca = normalizarTexto(texto);

    const jogosFiltrados = odds.filter((jogo) => {
      const liga = normalizarTexto(
        jogo.sport_title || ""
      );

      const casa = normalizarTexto(
        jogo.home_team || ""
      );

      const fora = normalizarTexto(
        jogo.away_team || ""
      );

      const confronto = `${casa} x ${fora}`;

      return (
        liga.includes(busca) ||
        casa.includes(busca) ||
        fora.includes(busca) ||
        confronto.includes(busca)
      );
    });

    if (jogosFiltrados.length === 0) {
      bot.sendMessage(
        chatId,
        "❌ Não encontrei jogos relacionados."
      );

      return;
    }

    let resposta = `📊 Jogos encontrados (${jogosFiltrados.length})\n\n`;

    jogosFiltrados.slice(0, 5).forEach((jogo) => {
      resposta += `⚽ ${jogo.home_team} x ${jogo.away_team}\n`;
      resposta += `🏆 ${jogo.sport_title}\n`;

      const bookmaker = jogo.bookmakers?.[0];

      if (bookmaker) {
        const market = bookmaker.markets?.find(
          (m) => m.key === "h2h"
        );

        if (market) {
          market.outcomes.forEach((odd) => {
            resposta += `• ${odd.name}: ${odd.price}\n`;
          });

          const analise = analisarJogo(market);

          resposta += `\n🧠 Análise IA:\n`;
          resposta += `⭐ Favorito: ${analise.favorito}\n`;
          resposta += `📉 Odd favorita: ${analise.oddFavorita}\n`;
          resposta += `⚠️ Risco: ${analise.risco}\n`;
        }
      }

      resposta += `\n━━━━━━━━━━━━━━\n\n`;
    });

    bot.sendMessage(chatId, resposta);
  } catch (error) {
    console.log("Erro geral:", error.message);

    bot.sendMessage(
      chatId,
      "❌ Erro ao processar busca."
    );
  }
});

app.get("/", (req, res) => {
  res.send("AnaliseBet Backend Online 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
