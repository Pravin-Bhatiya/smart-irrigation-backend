// import express from "express";
// import PumpLog from "../models/PumpLog.js";
// import SensorData from "../models/SensorData.js";
// import Setting from "../models/Setting.js";

// const router = express.Router();

// // Placeholder: integrate with your hardware (MQTT/HTTP) here.
// async function sendPumpCommand(action) {
//   console.log(">> sendPumpCommand (placeholder):", action);
//   // TODO: Replace this with real device call (MQTT publish or HTTP to device)
//   return true;
// }

// // Manual pump control: { action: "ON"|"OFF", reason?: "...", userId?: "<id>" }
// router.post("/", async (req, res) => {
//   try {
//     const { action, reason = "manual", userId = null } = req.body;
//     if (!["ON", "OFF"].includes(action)) {
//       return res.status(400).json({ message: "action must be 'ON' or 'OFF'" });
//     }

//     const ok = await sendPumpCommand(action);
//     if (!ok) return res.status(500).json({ message: "Failed to send command to device" });

//     const log = await PumpLog.create({ userId, action, reason });
//     res.json({ message: "✅ Pump command executed", data: log });
//   } catch (err) {
//     console.error("pumpRoutes POST error:", err);
//     res.status(500).json({ message: "❌ Error", error: err.message });
//   }
// });

// // Get pump logs
// router.get("/logs", async (req, res) => {
//   try {
//     const logs = await PumpLog.find().sort({ createdAt: -1 }).limit(200);
//     res.json(logs);
//   } catch (err) {
//     console.error("pumpRoutes logs error:", err);
//     res.status(500).json({ message: "❌ Error", error: err.message });
//   }
// });

// // AUTO-CHECK: evaluate latest sensor vs settings and act if needed
// // POST body optional: { userId: "<id>" }
// router.post("/auto-check", async (req, res) => {
//   try {
//     const { userId = null } = req.body;

//     // get setting (user-specific or global)
//     const settingQuery = userId ? { userId } : {};
//     const setting = await Setting.findOne(settingQuery).sort({ createdAt: -1 });
//     if (!setting) return res.json({ message: "No settings found" });
//     if (setting.mode !== "threshold" || !setting.autoPump) {
//       return res.json({ message: "Auto mode disabled or not threshold mode" });
//     }

//     // get latest sensor reading (user-specific if userId given)
//     const sensorQuery = userId ? { userId } : {};
//     const latest = await SensorData.findOne(sensorQuery).sort({ createdAt: -1 });
//     if (!latest) return res.json({ message: "No sensor data available" });

//     const soil = latest.soilMoisture;
//     // decide action
//     if (soil < setting.minMoisture) {
//       await sendPumpCommand("ON");
//       const log = await PumpLog.create({
//         userId,
//         action: "ON",
//         reason: `Auto: moisture ${soil} < ${setting.minMoisture}`
//       });
//       return res.json({ action: "ON", log });
//     } else if (soil >= setting.maxMoisture) {
//       await sendPumpCommand("OFF");
//       const log = await PumpLog.create({
//         userId,
//         action: "OFF",
//         reason: `Auto: moisture ${soil} >= ${setting.maxMoisture}`
//       });
//       return res.json({ action: "OFF", log });
//     } else {
//       return res.json({ message: "No action required", soilMoisture: soil });
//     }
//   } catch (err) {
//     console.error("pumpRoutes auto-check error:", err);
//     res.status(500).json({ message: "❌ Error", error: err.message });
//   }
// });

// export default router;


import express from "express";
import PumpLog from "../models/PumpLog.js";
import SensorData from "../models/SensorData.js";
import Setting from "../models/Setting.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Send command to hardware (HTTP call to ESP32/NodeMCU)
async function sendPumpCommand(action) {
  try {
    const res = await fetch(`${process.env.DEVICE_IP}/pump`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });

    if (!res.ok) {
      console.error("❌ Failed to reach device:", res.statusText);
      return false;
    }
    console.log(`✅ Pump ${action} command sent to device`);
    return true;
  } catch (err) {
    console.error("❌ Device connection error:", err.message);
    return false;
  }
}

// Manual pump control
router.post("/", async (req, res) => {
  try {
    const { action, reason = "manual", userId = null } = req.body;
    if (!["ON", "OFF"].includes(action)) {
      return res.status(400).json({ message: "action must be 'ON' or 'OFF'" });
    }

    const ok = await sendPumpCommand(action);
    if (!ok) return res.status(500).json({ message: "Failed to send command to device" });

    const log = await PumpLog.create({ userId, action, reason });
    res.json({ message: "✅ Pump command executed", data: log });
  } catch (err) {
    console.error("pumpRoutes POST error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});

// Get pump logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await PumpLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    console.error("pumpRoutes logs error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});

// Auto-check sensor vs settings
router.post("/auto-check", async (req, res) => {
  try {
    const { userId = null } = req.body;

    const settingQuery = userId ? { userId } : {};
    const setting = await Setting.findOne(settingQuery).sort({ createdAt: -1 });
    if (!setting) return res.json({ message: "No settings found" });
    if (setting.mode !== "threshold" || !setting.autoPump) {
      return res.json({ message: "Auto mode disabled or not threshold mode" });
    }

    const sensorQuery = userId ? { userId } : {};
    const latest = await SensorData.findOne(sensorQuery).sort({ createdAt: -1 });
    if (!latest) return res.json({ message: "No sensor data available" });

    const soil = latest.soilMoisture;
    if (soil < setting.minMoisture) {
      await sendPumpCommand("ON");
      const log = await PumpLog.create({
        userId,
        action: "ON",
        reason: `Auto: moisture ${soil} < ${setting.minMoisture}`
      });
      return res.json({ action: "ON", log });
    } else if (soil >= setting.maxMoisture) {
      await sendPumpCommand("OFF");
      const log = await PumpLog.create({
        userId,
        action: "OFF",
        reason: `Auto: moisture ${soil} >= ${setting.maxMoisture}`
      });
      return res.json({ action: "OFF", log });
    } else {
      return res.json({ message: "No action required", soilMoisture: soil });
    }
  } catch (err) {
    console.error("pumpRoutes auto-check error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});
// Get current pump status (basic route)
router.get("/", async (req, res) => {
  try {
    // latest pump log = last known action (ON or OFF)
    const latestLog = await PumpLog.findOne().sort({ createdAt: -1 });

    if (!latestLog) {
      return res.json({ status: "unknown", message: "No pump logs yet" });
    }

    res.json({
      status: latestLog.action,
      lastUpdated: latestLog.createdAt,
    });
  } catch (err) {
    console.error("pumpRoutes GET error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});

export default router;
