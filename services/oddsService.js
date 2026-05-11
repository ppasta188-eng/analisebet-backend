import axios from "axios";

const API_KEY = process.env.ODDS_API_KEY;

export async function buscarOdds() {
  try {
    const response = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer_brazil_campeonato/odds",
      {
        params: {
          apiKey: API_KEY,
          regions: "eu",
          markets: "h2h,totals,btts",
          oddsFormat: "decimal",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("Erro ao buscar odds:", error.message);

    return [];
  }
}
