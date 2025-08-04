// src/services/thingSpeakService.js
import axios from 'axios';

const CHANNEL_ID = '2909184';
const API_KEY = 'GI01AS470OI9IJX6';

export const fetchLatestNPK = async () => {
  try {
    const [nRes, pRes, kRes, temperatureRes, humidityRes, phRes] = await Promise.all([
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/3/last.json?api_key=${API_KEY}`),
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/4/last.json?api_key=${API_KEY}`),
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/5/last.json?api_key=${API_KEY}`),
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1/last.json?api_key=${API_KEY}`),
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/2/last.json?api_key=${API_KEY}`),
      axios.get(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/6/last.json?api_key=${API_KEY}`),
    ]);

    return {
      n: parseFloat(nRes.data.field3),
      p: parseFloat(pRes.data.field4),
      k: parseFloat(kRes.data.field5),
      temperature: parseFloat(temperatureRes.data.field1),
      humidity: parseFloat(humidityRes.data.field2),
      ph: parseFloat(phRes.data.field6),
      created_at: nRes.data.created_at
    };
  } catch (err) {
    console.error('ThingSpeak API Error:', err);
    return null;
  }
};

// New function to fetch historical NPK values
export const fetchHistoricalNPK = async (results = 10) => {
  try {
    // Fetch data from all fields in one request (more efficient)
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${API_KEY}&results=${results}`
    );

    // Process the data
    const feeds = response.data.feeds;
    return feeds.map(feed => ({
      n: parseFloat(feed.field3) || 0,
      p: parseFloat(feed.field4) || 0,
      k: parseFloat(feed.field5) || 0,
      temperature: parseFloat(feed.field1) || 0,
      humidity: parseFloat(feed.field2) || 0,
      ph: parseFloat(feed.field6) || 0,
      created_at: feed.created_at
    })).reverse(); // Most recent first
  } catch (err) {
    console.error('ThingSpeak History API Error:', err);
    return [];
  }
};