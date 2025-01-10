const express = require('express');
const Crypto = require('../models/Crypto.js');

const router = express.Router();

router.get("/", async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({ error: "Missing required query parameter: coin" });
  }

  try {
    const cryptoData = await Crypto.find({ coinId: coin }).sort({ timestamp: -1 }).limit(100);

    if (cryptoData.length === 0) {
      return res.status(404).json({ error: `No data found for coin: ${coin}` });
    }

    const prices = cryptoData.map((data) => data.price);
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
    const variance = prices.reduce((acc, price) => acc + (price - mean) ** 2, 0) / prices.length;
    const deviation = Math.sqrt(variance);

    return res.status(200).json({ deviation });
  } catch (error) {
    console.error("Error calculating deviation:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
