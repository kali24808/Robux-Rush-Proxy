import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  let debug = {
    userId,
    gamesFound: 0,
    universes: [],
    passesFound: 0
  };

  try {
    // 1️⃣ Fetch games
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const gamesJson = await gamesResponse.json();

    if (!gamesJson.data || gamesJson.data.length === 0) {
      return res.json({
        passes: [],
        debug: { ...debug, error: "NO_GAMES_FOUND" }
      });
    }

    debug.gamesFound = gamesJson.data.length;

    let passes = [];

    // 2️⃣ Loop games
    for (const game of gamesJson.data) {
      const universeId = game.universeId;
      debug.universes.push(universeId);

      const passResponse = await fetch(
        `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`
      );
      const passJson = await passResponse.json();

      if (!passJson.data || passJson.data.length === 0) continue;

      for (const pass of passJson.data) {
        debug.passesFound++;

        passes.push({
          id: pass.id,
          name: pass.name,
          price: pass.price ?? 0
        });
      }
    }

    res.json({ passes, debug });

  } catch (err) {
    res.status(500).json({
      passes: [],
      debug: { ...debug, error: err.message }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Debug proxy running on port ${PORT}`);
});
