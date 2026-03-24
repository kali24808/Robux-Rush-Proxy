import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100`
    );

    const json = await response.json();

    const passes = (json.data || [])
      .filter(p => p.price && p.price > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }));

    res.json({ passes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
