import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/inventory?assetTypes=GamePass&limit=100`
    );

    const data = await response.json();

    if (!data.data) {
      return res.json({ passes: [] });
    }

    let passes = [];

    for (const item of data.data) {
      // Only passes CREATED by the user
      if (item.creator?.id !== userId) continue;

      const price = item.product?.price;
      if (!price || price <= 0) continue;

      passes.push({
        id: item.assetId,
        name: item.name,
        price: price
      });
    }

    res.json({ passes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("Gamepass proxy running");
});
