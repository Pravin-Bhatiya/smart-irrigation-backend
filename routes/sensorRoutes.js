// import express from "express";
// import SensorData from "../models/SensorData.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   // === DEBUG LOGS ===
//   console.log(">>> Received POST /api/sensor");
//   console.log("Content-Type header:", req.headers["content-type"]);
//   console.log("Raw body (req.body):", req.body);
//   console.log("Body keys:", Object.keys(req.body || {}));
//   console.log("waterLevel value:", req.body ? req.body.waterLevel : undefined);
//   // === end debug logs ===

//   try {
//     const { soilMoisture, temperature, humidity, waterLevel } = req.body;
//     const newData = new SensorData({ soilMoisture, temperature, humidity, waterLevel });
//     await newData.save();
//     res.status(201).json({ message: "✅ Data saved successfully", data: newData });
//   } catch (error) {
//     console.error("Error saving sensor data:", error);
//     res.status(500).json({ message: "Error saving data ❌", error: error.message });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const data = await SensorData.find().sort({ createdAt: -1 });
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: "❌ Error fetching data", error: error.message });
//   }
// });

// export default router;

// routes/sensorRoutes.js
import express from "express";
import SensorData from "../models/SensorData.js";
const router = express.Router();

// Save sensor data
router.post("/", async (req, res) => {
  try {
    // Accept: soilMoisture, temperature, humidity, waterLevel, userId(optional), thingSpeakApiKey(optional), channelId(optional)
    const payload = req.body;
    const newData = await SensorData.create(payload);
    return res.status(201).json({ message: "✅ Data saved successfully", data: newData });
  } catch (err) {
    console.error("sensorRoutes POST error", err);
    return res.status(500).json({ message: "Error saving data", error: err.message });
  }
});

// Get latest (optionally for a user)
router.get("/latest", async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const latest = await SensorData.findOne(query).sort({ createdAt: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all (optionally user)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const q = userId ? { userId } : {};
    const all = await SensorData.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

