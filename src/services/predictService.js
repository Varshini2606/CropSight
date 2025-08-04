// src/services/predictService.js
import axios from 'axios';

export const getCropPrediction = async (n, p, k, temperature, humidity, ph, rainfall) => {
  try {
    const res = await axios.post('http://localhost:8000/predict', { n, p, k, temperature, humidity, ph, rainfall}); // replace with your backend URL
    return res.data.crop;
  } catch (err) {
    console.error('Prediction error:', err);
    return null;
  }
};