// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  location: {
    country: String,
    state: String,
    district: String,
    city: String
  }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
