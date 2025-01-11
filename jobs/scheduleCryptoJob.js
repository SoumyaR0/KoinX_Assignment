const Agenda = require('agenda');
const fetch = require('node-fetch');
const Crypto = require('../models/Crypto.js');
require('dotenv').config();

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINS = ["bitcoin", "ethereum", "matic-network"];

// MongoDB connection string
const mongoConnectionString = process.env.MONGODB_URL; // Use your MongoDB Atlas URI

// Fetch crypto data from CoinGecko API
const fetchCryptoData = async () => {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${COINS.join(",")}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data from CoinGecko: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return COINS.map((coin) => ({
      coinId: coin,
      name: coin === "matic-network" ? "Polygon" : coin.charAt(0).toUpperCase() + coin.slice(1),
      price: data[coin]?.usd || null,
      marketCap: data[coin]?.usd_market_cap || null,
      change24h: data[coin]?.usd_24h_change || null,
    }));
  } catch (error) {
    console.error("Error fetching crypto data:", error.message);
    return [];
  }
};

// Define Agenda job
const setupAgenda = async () => {
  const agenda = new Agenda({ db: { address: mongoConnectionString } });

  // Define the job
  agenda.define('fetch crypto data', async (job) => {
    console.log(`[${new Date().toISOString()}] Fetching cryptocurrency data...`);
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

    console.log(`[${new Date().toISOString()}] Cryptocurrency data updated.`);
  });

  // Start Agenda
  await agenda.start();
  console.log("Agenda started.");

  // Schedule the job to run every 2 hours
  await agenda.every('2 hours', 'fetch crypto data');
};

module.exports = setupAgenda;
