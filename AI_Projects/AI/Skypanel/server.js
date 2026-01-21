
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    apiKeyLoaded: !!process.env.API_KEY,
    groqKeyLoaded: !!process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  });
});

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${process.env.API_KEY}&units=metric`;
  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok || (data.cod && Number(data.cod) !== 200)) {
    throw new Error(data.message || "OpenWeather error");
  }
  return data;
}

async function getWeatherSummary(city, weatherData) {
  const system_prompt =
    "You are SkyPanel, a concise weather bot. Reply with ONE short sentence (≤18 words) including city, temp in °C and °F, and the main condition. No extra advice or emojis.";
  const user_prompt = `City: ${city}\nRaw weather JSON: ${JSON.stringify(
    weatherData
  )}\nReturn only the sentence.`;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt },
      ],
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    console.error("[GROQ ERROR]", data);
    throw new Error(data.error?.message || "Groq API request failed");
  }
  return data.choices?.[0]?.message?.content ?? "";
}

app.get("/weather", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "City is required" });
  try {
    const data = await fetchWeather(city);
    res.json(data);
  } catch (e) {
    console.error("[/weather ERROR]", e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/weather-summary", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "City is required" });
  try {
    const raw = await fetchWeather(city);
    const summary = await getWeatherSummary(city, raw);
    res.json({ summary, raw });
  } catch (e) {
    console.error("[/weather-summary ERROR]", e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/home", (_req, res) => res.redirect("/"));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, () => {
  console.log(`[OK] Server running at http://localhost:${PORT}`);
});
