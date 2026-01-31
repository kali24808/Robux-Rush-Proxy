import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/universe/:universeId", async (req, res) => {
  const universeId = req.params.universeId;

  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`
    );
    const json = await response.json();

    if (!json.data) {
      return res.json({ passes: [] });
    }

    const passes = json.data
      .filter(p => p.price && p.price > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }));

    res.json({ passes });

  } catch (err) {
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("Universe-based proxy running");
});
