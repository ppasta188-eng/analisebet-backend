export async function atualizarCache() {
  try {
    console.log("=======================");
    console.log("ATUALIZANDO CACHE...");
    console.log("=======================");

    const esportes = [
      "soccer_brazil_campeonato",
      "soccer_brazil_serie_b",
      "soccer_spain_la_liga",
      "soccer_italy_serie_a",
      "soccer_germany_bundesliga",
      "soccer_france_ligue_one",
      "soccer_uefa_champs_league",
      "basketball_nba"
    ];

    let todosJogos = [];

    for (const esporte of esportes) {
      try {
        console.log("===============================");
        console.log(`CONSULTANDO: ${esporte}`);

        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${esporte}/odds`,
          {
            params: {
              apiKey: process.env.ODDS_API_KEY,
              regions: "us,uk,eu,br",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        const jogos = response.data || [];

        console.log(`ENCONTRADOS: ${jogos.length}`);

        for (const jogo of jogos) {
          try {
            const bookmaker =
              jogo.bookmakers?.[0];

            const market =
              bookmaker?.markets?.[0];

            const outcomes =
              market?.outcomes || [];

            const casa = outcomes.find(
              o => o.name === jogo.home_team
            );

            const fora = outcomes.find(
              o => o.name !== jogo.home_team &&
              o.name.toLowerCase() !== "draw"
            );

            const empate = outcomes.find(
              o =>
                o.name.toLowerCase() === "draw"
            );

            todosJogos.push({
              esporte,

              liga:
                jogo.sport_title,

              casa:
                jogo.home_team,

              fora:
                jogo.away_team,

              horario:
                jogo.commence_time,

              odds: {
                casa: casa?.price || null,
                empate: empate?.price || null,
                fora: fora?.price || null
              }
            });
          } catch (erroJogo) {
            console.log(
              "ERRO AO PROCESSAR JOGO"
            );

            console.log(erroJogo.message);
          }
        }
      } catch (erro) {
        console.log(
          `ERRO AO CONSULTAR ${esporte}`
        );

        console.log(erro.message);
      }
    }

    console.log("===============================");
    console.log(
      `TOTAL FINAL: ${todosJogos.length}`
    );
    console.log("===============================");

    // PROTEÇÃO DO CACHE
    if (todosJogos.length > 0) {
      cacheJogos = todosJogos;

      console.log("=======================");
      console.log("CACHE SALVO:");
      console.log(cacheJogos.length);
      console.log("=======================");
    } else {
      console.log("=======================");
      console.log("CACHE NÃO ATUALIZADO");
      console.log(
        "Mantendo último cache válido"
      );
      console.log("=======================");
    }
  } catch (erro) {
    console.log(
      "ERRO GERAL AO ATUALIZAR CACHE"
    );

    console.log(erro.message);
  }
}
