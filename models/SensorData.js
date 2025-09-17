// import mongoose from "mongoose";

// const sensorSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // optional
//     soilMoisture: { type: Number, required: true },
//     temperature: { type: Number, required: true },
//     humidity: { type: Number, required: true },
//     waterLevel: { type: Number, required: true }
//   },
//   { timestamps: true }
// );

// const SensorData = mongoose.model("SensorData", sensorSchema);
// export default SensorData;
import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    soilMoisture: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    waterLevel: { type: Number, required: true },
    // optional channel id / thingSpeak api key to map to channel
    thingSpeakApiKey: { type: String, default: null },
    channelId: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("SensorData", sensorSchema);
