import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

const SPORTS = [
  "soccer_brazil_campeonato",
  "soccer_uefa_champs_league",
  "soccer_spain_la_liga",
  "soccer_epl",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "basketball_nba"
];

function normalizar(texto) {

  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function buscarJogos(termo) {

  const busca = normalizar(termo);

  let jogosEncontrados = [];

  console.log("=================================");
  console.log("BUSCA RECEBIDA:", busca);
  console.log("=================================");

  for (const sport of SPORTS) {

    try {

      console.log("");
      console.log("=================================");
      console.log("CONSULTANDO:", sport);
      console.log("=================================");

      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
        {
          params: {
            apiKey: API_KEY,
            regions: "us",
            markets: "h2h",
            oddsFormat: "decimal"
          }
        }
      );

      const jogos = response.data || [];

      console.log("TOTAL RECEBIDO:", jogos.length);

      if (jogos.length > 0) {

        console.log("EXEMPLO JOGO:");

        console.log({
          home: jogos[0].home_team,
          away: jogos[0].away_team,
          league: jogos[0].sport_title
        });
      }

      const filtrados = jogos.filter((jogo) => {

        const home = normalizar(jogo.home_team || "");
        const away = normalizar(jogo.away_team || "");
        const league = normalizar(jogo.sport_title || "");

        return (
          home.includes(busca) ||
          away.includes(busca) ||
          league.includes(busca)
        );
      });

      console.log("FILTRADOS:", filtrados.length);

      jogosEncontrados.push(...filtrados);

    } catch (erro) {

      console.log("ERRO NO ESPORTE:", sport);

      console.log(
        erro.response?.data || erro.message
      );
    }
  }

  console.log("");
  console.log("=================================");
  console.log("TOTAL FINAL:", jogosEncontrados.length);
  console.log("=================================");

  return jogosEncontrados;
}
