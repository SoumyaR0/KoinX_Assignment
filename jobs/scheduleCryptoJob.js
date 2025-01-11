const cron = require('node-cron');
const fetch = require('node-fetch');
const Crypto = require('../models/Crypto.js');  

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINS = ["bitcoin", "ethereum", "matic-network"]; 

const fetchCryptoData = async () => {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${COINS.join(",")}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data from CoinGecko: ${response.statusText}`);
    }

    const data = await response.json();

    return COINS.map((coin) => ({
      coinId: coin,
      name: coin === "matic-network" ? "Polygon" : coin.charAt(0).toUpperCase() + coin.slice(1),
      price: data[coin].usd,
      marketCap: data[coin].usd_market_cap,
      change24h: data[coin].usd_24h_change,
    }));
  } catch (error) {
    console.error("Error fetching crypto data:", error.message);
    return [];
  }
};

cron.schedule("0 */2 * * *", async () => {
    try {
      console.log("Fetching cryptocurrency data...");
      const cryptoData = await fetchCryptoData();

      if (cryptoData.length === 0) {
        console.log("No data fetched.");
        return;
      }

      for (const coin of cryptoData) {
        try {
          const newRecord = new Crypto({ ...coin });
          await newRecord.save();
          console.log(`Saved data for: ${coin.coinId}`);
        } catch (error) {
          console.error(`Error saving data for ${coin.coinId}:`, error.message);
        }
      }

      console.log("Cryptocurrency data updated.");
    } catch (error) {
      console.error("Error in cron job:", error.message, error.stack);
    }
  },
  {
    timezone: "Asia/Kolkata", // India Standard Time (IST)
  }
);

module.exports = scheduleCryptoJob;
