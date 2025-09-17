// models/Device.js
import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ["on", "off"], default: "off" },
}, { timestamps: true });

const Device = mongoose.model("Device", deviceSchema);
export default Device;
