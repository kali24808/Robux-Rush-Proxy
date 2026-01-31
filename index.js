import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  let passes = [];
  let cursor = "";
  let safety = 0;

  try {
    do {
      const url =
        `https://inventory.roblox.com/v1/users/${userId}/inventory` +
        `?assetTypes=GamePass&limit=100&cursor=${cursor}`;

      const response = await fetch(url);
      const json = await response.json();

      if (!json.data) break;

      for (const item of json.data) {
        // MUST exist
        if (!item.product || !item.creator) continue;

        // Only gamepasses CREATED by the user
        if (item.creator.id !== userId) continue;

        // Must be for sale
        if (!item.product.price || item.product.price <= 0) continue;

        passes.push({
          id: item.assetId,
          name: item.name,
          price: item.product.price
        });
      }

      cursor = json.nextPageCursor;
      safety++;

    } while (cursor && safety < 10); // safety = anti-infinite loop

    res.json({ passes });

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("Gamepass proxy running (final)");
});
