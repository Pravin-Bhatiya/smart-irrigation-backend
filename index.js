import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import pumpRoutes from "./routes/pumpRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Register routes
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/pump", pumpRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Simple health route
app.get("/", (req, res) => {
  res.send("🌱 Smart Irrigation Backend is Live!");
});

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working fine 🚀" });
});

const PORT = process.env.PORT || 5000;

// ✅ Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err.message));
