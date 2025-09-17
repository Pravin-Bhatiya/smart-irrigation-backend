// routes/deviceRoutes.js
import express from "express";
import crypto from "crypto";
import axios from "axios";
import Device from "../models/Device.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
function genToken() { return crypto.randomBytes(20).toString("hex"); }

// Provision endpoint — called by device (hardwareId)
router.post("/provision", async (req, res) => {
  try {
    const { hardwareId, name } = req.body;
    if (!hardwareId) return res.status(400).json({ message: "hardwareId required" });

    let device = await Device.findOne({ hardwareId });
    if (!device) {
      const token = genToken();
      device = await Device.create({ hardwareId, name: name || `Device-${hardwareId.slice(-6)}`, token });
    }

    // If no ThingSpeak channel yet and we have master key — create channel
    if (!device.thingSpeakApiKey && process.env.THINGSPEAK_MASTER_API_KEY) {
      try {
        const params = new URLSearchParams();
        params.append("api_key", process.env.THINGSPEAK_MASTER_API_KEY);
        params.append("name", device.name);
        // create 4 fields named so they make sense
        params.append("field1", "temperature");
        params.append("field2", "humidity");
        params.append("field3", "soilMoisture");
        params.append("field4", "waterLevel");

        const createRes = await axios.post("https://api.thingspeak.com/channels.json", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 15000
        });

        if (createRes?.data) {
          // channel created; find write key
          const writeKeyObj = (createRes.data.api_keys || []).find(k => k.write_flag);
          if (writeKeyObj) {
            device.thingSpeakApiKey = writeKeyObj.api_key;
            device.thingSpeakChannelId = String(createRes.data.id);
            await device.save();
            console.log("ThingSpeak channel created:", createRes.data.id);
          } else {
            console.warn("No write key returned by ThingSpeak create channel.");
          }
        }
      } catch (err) {
        console.warn("ThingSpeak channel creation failed:", err.message);
        // don't fail provisioning entirely — device still exists
      }
    }

    return res.json({
      message: "OK",
      data: {
        deviceId: device._id,
        token: device.token,
        thingSpeakApiKey: device.thingSpeakApiKey || null,
        thingSpeakChannelId: device.thingSpeakChannelId || null
      }
    });
  } catch (err) {
    console.error("device provision error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/link", async (req, res) => {
  try {
    const { hardwareId, userId } = req.body;
    if (!hardwareId || !userId) return res.status(400).json({ message: "hardwareId and userId required" });
    const device = await Device.findOne({ hardwareId });
    if (!device) return res.status(404).json({ message: "Device not found" });
    device.userId = userId;
    await device.save();
    res.json({ message: "Device linked", device });
  } catch (err) {
    console.error("device link error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:hardwareId", async (req, res) => {
  try {
    const { hardwareId } = req.params;
    const device = await Device.findOne({ hardwareId }).lean();
    if (!device) return res.status(404).json({ message: "Device not found" });
    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
