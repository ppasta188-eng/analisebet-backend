import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.BOT_TOKEN, {
polling: true,
});

bot.on("message", async (msg) => {
const chatId = msg.chat.id;
const texto = msg.text;

console.log("Mensagem recebida:", texto);

if (texto === "/start") {
bot.sendMessage(
chatId,
"🚀 Bem-vindo ao AnaliseBet IA!\n\nEnvie prints de apostas ou jogos para análise."
);
return;
}

bot.sendMessage(
chatId,
"📊 Você enviou:\n${texto}\n\nA IA analisará este conteúdo em breve."
);
});

app.get("/", (req, res) => {
res.send("AnaliseBet Backend Online 🚀");
});

app.listen(PORT, () => {
console.log("Servidor rodando na porta ${PORT}");
});
