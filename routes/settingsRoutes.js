import express from "express";
import Setting from "../models/Setting.js";

const router = express.Router();

// Create or update settings (upsert by userId or global if userId null)
router.post("/", async (req, res) => {
  try {
    const {
      userId = null,
      mode = "threshold",
      minMoisture = 30,
      maxMoisture = 60,
      autoPump = true,
      timerSeconds = 0
    } = req.body;

    const filter = { userId };
    const update = { mode, minMoisture, maxMoisture, autoPump, timerSeconds };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const setting = await Setting.findOneAndUpdate(filter, update, options);
    res.json({ message: "✅ Settings saved", data: setting });
  } catch (err) {
    console.error("settingsRoutes POST error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});

// Get settings (optional ?userId=...)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const query = typeof userId !== "undefined" ? { userId } : {};
    const setting = await Setting.findOne(query).sort({ createdAt: -1 });
    res.json(setting);
  } catch (err) {
    console.error("settingsRoutes GET error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});
// Get latest settings
router.get("/latest", async (req, res) => {
  try {
    const latest = await Setting.findOne().sort({ createdAt: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No settings found" });
    }
    res.json(latest);
  } catch (err) {
    console.error("settingsRoutes latest error:", err);
    res.status(500).json({ message: "❌ Error", error: err.message });
  }
});

export default router;
