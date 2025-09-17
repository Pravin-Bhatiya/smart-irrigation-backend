require('dotenv').config();
const connectDB = require('./config/db');
connectDB();

export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and Longitude are required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENWEATHER_KEY" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error("Weather API failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
