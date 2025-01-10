const express = require('express');
const Crypto = require('../models/Crypto.js');

const router = express.Router();

router.get("/", async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({ error: "Missing required query parameter: coin" });
  }

  try {
    const cryptoData = await Crypto.findOne({ coinId: coin }).sort({ timestamp: -1 });

    if (!cryptoData) {
      return res.status(404).json({ error: `No data found for coin: ${coin}` });
    }

    const response = {
      price: cryptoData.price,
      marketCap: cryptoData.marketCap,
      "24hChange": cryptoData.change24h,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stats:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
