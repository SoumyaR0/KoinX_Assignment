const express = require('express');
const mongoose = require('mongoose');
const setupAgenda = require('./jobs/scheduleCryptoJob');
const statsRouter = require('./routes/stats.js');
const deviationRouter = require('./routes/deviation.js');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//securing url port thorough .env configuration
require('dotenv').config();
const mongoURL=process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose
  .connect(mongoURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

// routes
app.get('/',(req,res)=>{
  res.status(200).json({coin_used:"bitcoin, polygon(matic-network), ethereum",1:" To view coin data- /stats?coin=coin_name", 2:" To view standard deviation- /deviation?coin=coin_name"});
});
app.use("/stats", statsRouter);
app.use("/deviation", deviationRouter);

setupAgenda();

app.listen(PORT, () => {
  console.log(`Server running`);
});
