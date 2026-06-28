// ============================================================================
// weather.js — Talking to the outside world (Study Plan: Stop 5)
// ============================================================================
//
// THE BIG IDEA — your app plays TWO roles at once:
//   Up to now our backend has been a SERVER: the browser is the client, our app
//   answers. In this file the roles flip. Here our backend becomes a CLIENT of
//   someone ELSE'S server — OpenWeatherMap, a weather service running somewhere
//   on the internet. We send THEM an HTTP request and wait for THEIR response.
//   Same HTTP concepts you already learned, just viewed from the other side of
//   the conversation. Recognizing that "client" and "server" are roles, not fixed
//   identities, is a real milestone in understanding how the web fits together.
//
// WHAT'S A "THIRD-PARTY API"?
//   An API another company exposes so programs (not humans) can request data from
//   them. OpenWeatherMap offers a URL you can call to get the current weather for
//   a city, and they answer with JSON. We don't run their servers or know their
//   code — we just follow the address-and-format contract they publish.
//
// WHY AN "API KEY"?
//   OpenWeatherMap needs to know who's calling (to enforce free-tier limits), so
//   they issue you a secret key you attach to every request. It's like a library
//   card: it identifies you and must stay private. That's why it lives in .env and
//   is read via process.env — NEVER typed directly into the code, which could end
//   up public on GitHub.
// ----------------------------------------------------------------------------

// Load the .env values so process.env.WEATHER_API_KEY and process.env.CITY exist.
// (server.js also calls this, but loading it here too means this module works even
// if it were ever imported on its own — dotenv is safe to call more than once.)
require("dotenv").config();

// getWeather — fetch the current weather for the configured city.
//   Returns an object: { weather, temperature }, e.g. { weather: "Clouds",
//   temperature: "21°C" }. It is `async` because talking to the internet takes
//   time, and we don't want to freeze the whole server while we wait — `await`
//   lets other work continue and resumes here once the reply arrives.
async function getWeather() {
  // The ENTIRE body is wrapped in try/catch for a deliberate reason: the network
  // is unreliable (the service could be down, the key wrong, the internet flaky).
  // We must guarantee this function NEVER throws, because the POST route calls it
  // mid-save — if it crashed, saving a journal entry would fail just because the
  // weather happened to be unavailable. Instead, on ANY failure we return safe
  // placeholder values (see the catch block) and the save proceeds normally.
  try {
    // Read the secret key and the city name from the environment (never hardcoded).
    const apiKey = process.env.WEATHER_API_KEY;
    const city = process.env.CITY;

    // BUILD THE REQUEST URL. APIs are driven by carefully formatted URLs. The part
    // after "?" is the QUERY STRING — a list of key=value parameters separated by
    // "&" that tell the API what we want:
    //   q={city}        → which city's weather
    //   appid={apiKey}  → our identifying secret key
    //   units=metric    → give temperatures in Celsius (use "imperial" for °F)
    //
    // encodeURIComponent(city) makes the city name URL-safe: if a city is "New
    // York", the space must become "%20" or the URL would be malformed. Always
    // encode values you drop into a URL.
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    // SEND THE REQUEST. fetch() is the built-in tool for making HTTP requests. It
    // returns a Promise, and `await` pauses until OpenWeatherMap answers. `response`
    // is their reply — but note: it's the raw HTTP response, not the data yet.
    const response = await fetch(url);

    // CHECK THE STATUS before trusting the body. response.ok is true only for
    // success statuses (200–299). A 401 (bad key) or 404 (unknown city) would set
    // it to false. We throw here so control jumps to the catch block, which returns
    // our safe placeholders rather than crashing on malformed data below.
    if (!response.ok) {
      throw new Error(`Weather API responded with status ${response.status}`);
    }

    // PARSE THE BODY. The response arrives as a JSON-formatted text stream;
    // response.json() reads it fully and turns it into a real JavaScript object.
    // It's async (more waiting on the stream), hence another `await`.
    const data = await response.json();

    // EXTRACT only the two pieces we care about from OpenWeatherMap's large reply:
    //   - data.weather is an array of conditions; [0].main is the headline word
    //     like "Clear", "Clouds", or "Rain".
    //   - data.main.temp is the numeric temperature; Math.round drops the decimals,
    //     and we append "°C" to make a tidy display string like "21°C".
    const weather = data.weather[0].main;
    const temperature = `${Math.round(data.main.temp)}°C`;

    return { weather, temperature };
  } catch (error) {
    // Log WHY it failed (to the server terminal) so a developer can diagnose it —
    // e.g. an invalid key or a typo'd city name shows up here.
    console.error("getWeather failed:", error.message);
    // Return harmless placeholders so the caller (the POST route) can still save
    // the entry. The frontend knows to show "Weather not available" for these.
    return { weather: "Unavailable", temperature: "Unavailable" };
  }
}

// Export getWeather so the entries route (Stop 4) can call it while saving a new
// entry. One file = one job: this module's only responsibility is "get the weather".
module.exports = getWeather;
