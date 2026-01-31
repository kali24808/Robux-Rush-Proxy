import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1️⃣ Get games created by user
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const gamesJson = await gamesResponse.json();

    if (!gamesJson.data) {
      return res.json({ passes: [] });
    }

    let passes = [];

    // 2️⃣ Loop through each game
    for (const game of gamesJson.data) {
      const universeId = game.universeId;

      const passResponse = await fetch(
        `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`
      );
      const passJson = await passResponse.json();

      if (!passJson.data) continue;

      for (const pass of passJson.data) {
        passes.push({
          id: pass.id,
          name: pass.name,
          price: pass.price ?? 0
        });
      }
    }

    // 3️⃣ Send result
    res.json({ passes });

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
