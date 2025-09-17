// services/thingspeakWorker.js
import axios from "axios";
import SensorData from "../models/SensorData.js";
import PumpLog from "../models/PumpLog.js"; // if needed
import Setting from "../models/Setting.js";

const CHANNEL_LAST_UPDATED = {}; // in-memory last update epoch per channelId (persist in DB if you want)

const MIN_INTERVAL_SEC = 75; // minimum seconds between updates per channel

async function sendToThingSpeak(channelApiKey, channelId, fields) {
  try {
    // Build URL — update endpoint accepts multiple fields: field1, field2, ...
    const params = new URLSearchParams();
    if (fields.field1 !== undefined) params.append("field1", String(fields.field1));
    if (fields.field2 !== undefined) params.append("field2", String(fields.field2));
    if (fields.field3 !== undefined) params.append("field3", String(fields.field3));
    if (fields.field4 !== undefined) params.append("field4", String(fields.field4));

    const url = `https://api.thingspeak.com/update?api_key=${encodeURIComponent(channelApiKey)}&${params.toString()}`;
    const res = await axios.get(url, { timeout: 10000 });
    return res.data; // returns entry id or 0 on failure
  } catch (err) {
    console.error("ThingSpeak send error:", err.message);
    return null;
  }
}

export async function runThingSpeakWorker() {
  try {
    // 1) find distinct channels with a channelId or thingSpeakApiKey in recent sensor data
    const recent = await SensorData.find({ channelId: { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(200);

    // group by channelId (or thingSpeakApiKey)
    const channels = {};
    for (const doc of recent) {
      const ch = doc.channelId || doc.thingSpeakApiKey;
      if (!ch) continue;
      if (!channels[ch]) channels[ch] = [];
      channels[ch].push(doc);
    }

    // Process each channel
    for (const chKey of Object.keys(channels)) {
      const docs = channels[chKey];
      // get the latest doc per field — but easier: take latest doc with all fields non-null if exists
      // Build latest values by picking most recent non-null value for each field
      let latestFieldValues = { field1: null, field2: null, field3: null, field4: null };
      // iterate docs in descending createdAt
      docs.sort((a,b) => b.createdAt - a.createdAt);
      for (const d of docs) {
        if (latestFieldValues.field1 === null && d.temperature !== undefined) latestFieldValues.field1 = d.temperature;
        if (latestFieldValues.field2 === null && d.humidity !== undefined) latestFieldValues.field2 = d.humidity;
        if (latestFieldValues.field3 === null && d.soilMoisture !== undefined) latestFieldValues.field3 = d.soilMoisture;
        if (latestFieldValues.field4 === null && d.waterLevel !== undefined) latestFieldValues.field4 = d.waterLevel;
        // if all found break
        if (Object.values(latestFieldValues).every(v => v !== null)) break;
      }

      // if still null for some fields, skip? we can send previous saved values; but above should find latest.
      // check last send time
      const last = CHANNEL_LAST_UPDATED[chKey] || 0;
      const now = Math.floor(Date.now() / 1000);
      if (now - last < MIN_INTERVAL_SEC) {
        // skip this channel for now
        continue;
      }

      // Need a channel API key — assume channelId variable is actually the api key or store mapping
      // We'll accept that channelId is the API KEY; or you can store thingSpeakApiKey property
      const apiKey = docs[0].thingSpeakApiKey || docs[0].channelId;
      if (!apiKey) {
        console.warn("No API key for channel", chKey);
        continue;
      }

      // send the update
      const res = await sendToThingSpeak(apiKey, chKey, latestFieldValues);
      if (res !== null) {
        CHANNEL_LAST_UPDATED[chKey] = now;
        console.log("ThingSpeak updated channel", chKey, "response:", res);
      }
    }
  } catch (err) {
    console.error("ThingSpeak worker error:", err);
  }
}
