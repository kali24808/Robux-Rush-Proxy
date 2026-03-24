import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  let allPasses = [];

  try {
    // 1️⃣ Get user's games
    const gamesRes = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const gamesJson = await gamesRes.json();

    const games = gamesJson.data || [];

    // 2️⃣ Loop through each game
    for (const game of games) {
      try {
        const passesRes = await fetch(
          `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
        );
        const passesJson = await passesRes.json();

        if (passesJson.data) {
          const passes = passesJson.data
            .filter(p => p.price && p.price > 0)
            .map(p => ({
              id: p.id,
              name: p.name,
              price: p.price
            }));

          allPasses.push(...passes);
        }
      } catch (err) {
        console.log("Error fetching passes for game", game.id);
      }
    }

    res.json({ passes: allPasses });

  } catch (err) {
    console.error(err);
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("Advanced proxy running on port", PORT);
});
