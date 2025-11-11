const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.WEATHER_API_KEY;

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// 🌎 Solo Argentina
async function geocodeCity(cityInput) {
  if (!cityInput) return null;
  const clean = normalize(cityInput);

  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(clean)},AR&limit=5&appid=${API_KEY}`;
  let res = await axios.get(url);
  let results = res.data;

  if (!results?.length) {
    const parts = clean.split(' ');
    if (parts.length > 1) {
      const main = parts[0];
      const rest = parts.slice(1).join(' ');
      const altQuery = `${main},${rest},AR`;
      url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(altQuery)}&limit=5&appid=${API_KEY}`;
      res = await axios.get(url);
      results = res.data;
    }
  }

  if (!results?.length) return null;
  const filtered = results.filter(r => r.country === 'AR');
  const chosen = filtered.length > 0 ? filtered[0] : results[0];

  return {
    lat: chosen.lat,
    lon: chosen.lon,
    name: chosen.name,
    state: chosen.state || '',
    country: chosen.country
  };
}

async function getCurrentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
}

async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
}

module.exports = { geocodeCity, getCurrentWeather, getForecast, normalize };
