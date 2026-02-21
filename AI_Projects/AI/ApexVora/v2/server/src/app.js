import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fetch } from "undici";
import { cacheGet, cacheSet, plantKey, chatKey } from "./cache.js";
import { ChatSchema, hasImageContent } from "./validate.js";

/* -------------------------- usage tracking ---------------------------- */
// Simple in-memory daily request counter (resets on server restart or new day)
const DAILY_LIMIT = parseInt(process.env.GROQ_DAILY_LIMIT || "1000", 10);

let usageStats = {
  date: new Date().toISOString().split("T")[0],
  requests: 0,
  cached: 0
};

function getUsage() {
  const today = new Date().toISOString().split("T")[0];
  if (usageStats.date !== today) {
    // Reset for new day
    usageStats = { date: today, requests: 0, cached: 0 };
  }
  return {
    ...usageStats,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - usageStats.requests),
    percentUsed: Math.round((usageStats.requests / DAILY_LIMIT) * 100)
  };
}

function incrementUsage(fromCache = false) {
  const today = new Date().toISOString().split("T")[0];
  if (usageStats.date !== today) {
    usageStats = { date: today, requests: 0, cached: 0 };
  }
  if (fromCache) {
    usageStats.cached++;
  } else {
    usageStats.requests++;
  }
}

/* ----------------------------- app factory ---------------------------- */

export function createApp() {
  const app = express();

  // security + basic hardening
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // CORS for your local web server origins
  app.use(cors({
    origin: (process.env.CORS_ORIGIN?.split(",") || "*"),
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  }));

  app.use(express.json({ limit: "5mb" }));

  // rate limit for all /api/* routes
  app.use("/api/", rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  /* ------------------------------- health ------------------------------ */

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  /* ------------------------------- usage ------------------------------ */

  app.get("/api/usage", (_req, res) => res.status(200).json(getUsage()));

  /* ------------------------ plant lookup (free APIs) ------------------- */
  // Normalizes Perenual/Trefle and caches results (Redis if REDIS_URL set, else memory).

  app.get("/api/plant/search", async (req, res) => {
    const rawName = String(req.query.name || "").trim();
    const provider = String(req.query.provider || "perenual").toLowerCase(); // 'perenual' | 'trefle'
    if (!rawName) return res.status(400).json({ error: "bad_request", detail: "name is required" });

    const k = plantKey(provider, rawName);
    const cached = await cacheGet(k);
    if (cached) return res.json({ source: "cache", data: cached });

    try {
      let normalized = null;

      if (provider === "perenual") {
        const s = await fetch(
          `https://perenual.com/api/species-list?key=${encodeURIComponent(process.env.PERENUAL_KEY || "")}&q=${encodeURIComponent(rawName)}`
        );
        const sData = await s.json();
        const hit = sData?.data?.[0];
        if (hit?.id) {
          const d = await fetch(
            `https://perenual.com/api/species/details/${hit.id}?key=${encodeURIComponent(process.env.PERENUAL_KEY || "")}`
          );
          const dData = await d.json();
          normalized = {
            provider: "perenual",
            common: dData?.common_name || hit?.common_name || rawName,
            scientific: dData?.scientific_name || hit?.scientific_name,
            light: Array.isArray(dData?.sunlight) ? dData.sunlight.join(", ") : dData?.sunlight ?? null,
            water: dData?.watering ?? null,
            soil: dData?.soil ?? null,
            dormancy: null,
            feeding: null,
          };
        }
      } else if (provider === "trefle") {
        const s = await fetch(
          `https://trefle.io/api/v1/plants/search?token=${encodeURIComponent(process.env.TREFLE_TOKEN || "")}&q=${encodeURIComponent(rawName)}`
        );
        const sData = await s.json();
        const hit = sData?.data?.[0];
        if (hit?.id) {
          const d = await fetch(
            `https://trefle.io/api/v1/plants/${hit.id}?token=${encodeURIComponent(process.env.TREFLE_TOKEN || "")}`
          );
          const dData = await d.json();
          const p = dData?.data || hit;
          normalized = {
            provider: "trefle",
            common: p?.common_name || hit?.common_name || rawName,
            scientific: p?.scientific_name || hit?.scientific_name,
            light: null,
            water: null,
            soil: null,
            dormancy: null,
            feeding: null,
          };
        }
      } else {
        return res.status(400).json({ error: "bad_request", detail: "unknown provider" });
      }

      if (!normalized) return res.status(404).json({ error: "not_found", detail: "no plant match" });

      await cacheSet(k, normalized);            // persist (Redis or memory)
      return res.json({ source: "api", data: normalized });
    } catch (e) {
      return res.status(502).json({ error: "upstream_error", detail: String(e?.message || e) });
    }
  });

  /* -------------------------- LLM chat proxy --------------------------- */
  // Uses Groq (OpenAI-compatible). Caches by exact last user message.
  // Vision requests use a different model and skip caching.

  app.post("/api/chat", async (req, res) => {
    try {
      const input = ChatSchema.parse(req.body);
      const isVisionRequest = hasImageContent(input.messages);

      // For text-only requests, try cache first
      const lastUserMsg = [...input.messages].reverse().find(m => m.role === "user");
      const lastUserText = typeof lastUserMsg?.content === "string"
        ? lastUserMsg.content
        : Array.isArray(lastUserMsg?.content)
          ? lastUserMsg.content.find(p => p.type === "text")?.text
          : null;

      if (!isVisionRequest && lastUserText) {
        const ck = chatKey(lastUserText);
        const cached = await cacheGet(ck);
        if (cached) {
          incrementUsage(true); // count as cached, not against limit
          return res.status(200).json({ content: cached, cached: true, usage: getUsage() });
        }
      }

      // Check daily limit before making API call
      const currentUsage = getUsage();
      if (currentUsage.remaining <= 0) {
        return res.status(429).json({
          error: "daily_limit_exceeded",
          detail: `Daily limit of ${DAILY_LIMIT} requests reached. Resets at midnight UTC.`,
          usage: currentUsage
        });
      }

      // Text-only instruction
      const textSystemInstruction = [
        "You are ApexVora, a concise, friendly carnivorous-plant expert.",
        "STYLE: modern-minimal, practical, 3-6 short sentences max.",
        "SAFETY: never suggest fertilizer/tap water; prefer rain/distilled/RO.",
      ].join(" ");

      // Vision instruction (enhanced with plant ID guide and health issue reference)
      const visionSystemInstruction = `You are ApexVora, a carnivorous plant expert analyzing photos.

PLANT ID QUICK GUIDE:
- SUNDEW: Sticky tentacles with dew drops, NO snap traps
- VENUS FLYTRAP: Jaw-like snap traps with trigger hairs
- NEPENTHES: Hanging pitcher tubes from tendrils
- SARRACENIA: Tall upright trumpet tubes
- BUTTERWORT: Flat sticky leaves, no tentacles

HEALTH ISSUES TO LOOK FOR:
- WHITE FUZZY GROWTH = mold/fungus (needs airflow)
- BLACK/MUSHY BASE = root rot (overwatered)
- BROWN CRISPY TIPS = low humidity or sunburn
- PALE/STRETCHED = needs more light
- WHITE CRUST ON SOIL = mineral buildup (use distilled water)
- PERLITE = white balls in soil, NORMAL, not mold

First identify the plant, then note any health issues you see.
Keep responses to 3-6 sentences. Never suggest fertilizer or tap water.`;

      let messages;
      if (isVisionRequest) {
        // Vision models don't support system messages - inject into first user message
        messages = input.messages.map((msg, idx) => {
          if (msg.role === "user" && idx === input.messages.findIndex(m => m.role === "user")) {
            // Inject vision system instruction into first user message
            if (Array.isArray(msg.content)) {
              return {
                ...msg,
                content: [
                  { type: "text", text: `[SYSTEM]\n${visionSystemInstruction}\n[/SYSTEM]\n\n` },
                  ...msg.content
                ]
              };
            } else {
              return {
                ...msg,
                content: `[SYSTEM]\n${visionSystemInstruction}\n[/SYSTEM]\n\n${msg.content}`
              };
            }
          }
          return msg;
        });
      } else {
        messages = [{ role: "system", content: textSystemInstruction }, ...input.messages];
      }

      // Select model based on whether images are present
      const model = isVisionRequest
        ? (process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct")
        : process.env.GROQ_CHAT_MODEL;

      console.log(`[ApexVora] Using model: ${model} (vision: ${isVisionRequest})`);

      const base = process.env.GROQ_BASE || "https://api.groq.com/openai";
      const url = `${base}/v1/chat/completions`;
      const headers = {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.GROQ_API_KEY || ""}`,
      };
      const body = JSON.stringify({
        model,
        messages,
        temperature: input.temperature ?? 0.3,
        max_tokens: input.max_tokens ?? (isVisionRequest ? 500 : 300),
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);
      const upstream = await fetch(url, { method: "POST", headers, body, signal: controller.signal })
        .finally(() => clearTimeout(timeout));

      const txt = await upstream.text();
      if (!upstream.ok) return res.status(upstream.status).json({ error: "upstream_error", detail: txt.slice(0, 800) });

      let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text ??
        data?.content ?? "No content";

      // Only cache text-only responses
      if (!isVisionRequest && lastUserText && content) {
        const ck = chatKey(lastUserText);
        await cacheSet(ck, String(content));
      }

      // Track API usage
      incrementUsage(false);

      return res.status(200).json({ content, usage: getUsage() });
    } catch (err) {
      return res.status(400).json({ error: "bad_request", detail: err?.message || String(err) });
    }
  });

  return app;
}

const app = createApp();
export default app;
