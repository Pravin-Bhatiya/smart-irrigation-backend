import mongoose from "mongoose";

const PumpLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, enum: ["ON", "OFF"], required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("PumpLog", PumpLogSchema);
