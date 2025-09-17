import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional
    mode: { type: String, enum: ["manual", "threshold"], default: "threshold" },
    minMoisture: { type: Number, default: 30 }, // start values you can change
    maxMoisture: { type: Number, default: 60 },
    autoPump: { type: Boolean, default: true },
    timerSeconds: { type: Number, default: 0 } // optional: run pump this many seconds when ON
  },
  { timestamps: true }
);

export default mongoose.model("Setting", SettingSchema);
