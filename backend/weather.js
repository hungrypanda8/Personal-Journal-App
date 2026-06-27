// weather.js — Fetches current weather from OpenWeatherMap for the configured city.

// Load environment variables (WEATHER_API_KEY and CITY) from the .env file.
require("dotenv").config();

// getWeather — fetches the current weather for the city in .env and returns
// { weather, temperature }; returns "Unavailable" values if anything fails.
async function getWeather() {
  try {
    // Read the API key and city name from environment variables only (never hardcoded).
    const apiKey = process.env.WEATHER_API_KEY;
    const city = process.env.CITY;

    // Build the OpenWeatherMap request URL with metric units (Celsius).
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    // Call the OpenWeatherMap API and wait for the response.
    const response = await fetch(url);

    // A non-OK status (e.g. bad key or unknown city) means we cannot use the data.
    if (!response.ok) {
      throw new Error(`Weather API responded with status ${response.status}`);
    }

    // Parse the JSON body returned by the API.
    const data = await response.json();

    // Extract the condition (e.g. "Clouds") and the temperature, rounded to a whole number.
    const weather = data.weather[0].main;
    const temperature = `${Math.round(data.main.temp)}°C`;

    return { weather, temperature };
  } catch (error) {
    // Log the underlying error so weather failures can be diagnosed.
    console.error("getWeather failed:", error.message);
    // On any failure, return placeholders so the entry can still be saved.
    return { weather: "Unavailable", temperature: "Unavailable" };
  }
}

// Export getWeather so the entries route can tag new entries with weather.
module.exports = getWeather;
