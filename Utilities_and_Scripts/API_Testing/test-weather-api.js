// This script fetches the current weather data from the Open Meteo API
// Requires the node-fetch packagen: npm install node-fetch
// Run with Node.js: node test-weather-api.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=26.33&longitude=127.80&current_weather=true';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

getWeather();