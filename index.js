import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  let debug = {
    userId,
    pagesFetched: 0,
    totalItemsSeen: 0,
    itemsSample: [],
    creatorIdsSeen: {},
    pricesSeen: {},
    rawErrors: []
  };

  let cursor = "";

  try {
    do {
      const url =
        `https://inventory.roblox.com/v1/users/${userId}/inventory` +
        `?assetTypes=GamePass&limit=100&cursor=${cursor}`;

      const response = await fetch(url);
      const json = await response.json();

      debug.pagesFetched++;

      if (!json.data) {
        debug.rawErrors.push("NO_DATA_FIELD");
        break;
      }

      for (const item of json.data) {
        debug.totalItemsSeen++;

        // collect samples (first 5 only)
        if (debug.itemsSample.length < 5) {
          debug.itemsSample.push(item);
        }

        // track creators
        if (item.creator?.id) {
          debug.creatorIdsSeen[item.creator.id] =
            (debug.creatorIdsSeen[item.creator.id] || 0) + 1;
        }

        // track prices
        if (item.product?.price !== undefined) {
          debug.pricesSeen[item.product.price] =
            (debug.pricesSeen[item.product.price] || 0) + 1;
        }
      }

      cursor = json.nextPageCursor;

    } while (cursor);

    res.json({
      passes: [],
      debug
    });

  } catch (err) {
    res.status(500).json({
      passes: [],
      debug: { error: err.message }
    });
  }
});

app.listen(PORT, () => {
  console.log("HARD DEBUG proxy running");
});
