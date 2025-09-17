// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// // Load environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Debug: check if MONGO_URI is loaded
// if (!process.env.MONGO_URI) {
//   console.error("❌ MONGO_URI is missing! Check your .env file.");
//   process.exit(1);
// }

// // Middleware
// app.use(express.json());

// // Import routes
// import sensorRoutes from "./routes/sensorRoutes.js";

// // Use routes
// app.use("/api/sensor", sensorRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("Smart Irrigation Backend is running 🚀");
// });

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err.message));

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });






// import authRoutes from "./routes/authRoutes.js";
// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// // Load env
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Check MONGO_URI
// if (!process.env.MONGO_URI) {
//   console.error("❌ MONGO_URI is missing! Check your .env file.");
//   process.exit(1);
// }

// // Body parser
// app.use(express.json());
// app.use("/api/auth", authRoutes);


// // import routes
// import sensorRoutes from "./routes/sensorRoutes.js";
// import settingsRoutes from "./routes/settingsRoutes.js";
// import pumpRoutes from "./routes/pumpRoutes.js";

// // mount routes
// app.use("/api/sensor", sensorRoutes);
// app.use("/api/settings", settingsRoutes);
// app.use("/api/pump", pumpRoutes);

// // simple health route
// app.get("/", (req, res) => res.send("Smart Irrigation Backend is running 🚀"));

// // connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err.message));

// // start server
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// import cron from "node-cron";
// import { runThingSpeakWorker } from "./services/thingspeakWorker.js";

// // run worker every 30 seconds (*/0.5 minute not possible in cron; use */1 and node-cron supports seconds)
// /* Node-cron supports seconds when 6 field syntax */
// cron.schedule("*/30 * * * * *", async () => {
//   console.log("🕒 ThingSpeak worker running...");
//   await runThingSpeakWorker();
// });




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

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);   // 👈 this is the missing one
app.use("/api/pump", pumpRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("✅ MongoDB Connected");
    });
  })
  .catch((err) => console.error(err));
