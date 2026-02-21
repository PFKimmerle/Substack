import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fetch } from "undici";
import { z } from "zod";
import { cacheGet, cacheSet, plantKey, chatKey } from "./cache.js";

/* ----------------------------- validation ----------------------------- */

const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(30),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().min(1).max(2000).optional(),
});

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

  app.use(express.json({ limit: "200kb" }));

  // rate limit for all /api/* routes
  app.use("/api/", rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  /* ------------------------------- health ------------------------------ */

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

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

  /* ----------------------------- validate name ------------------------ */
  // GET /api/plant/validate?name=...&provider=perenual|trefle
  // Purpose: Normalize names once, cache them, and return {scientific, common, valid}.
  app.get("/api/plant/validate", async (req, res) => {
    const rawName = String(req.query.name || "").trim();
    const provider = String(req.query.provider || "perenual").toLowerCase();
    if (!rawName) return res.status(400).json({ error: "bad_request", detail: "name is required", valid: false });

    try {
      // Use the same cache key scheme used by your plant search helpers
      const k = plantKey(provider, rawName);

      // 1) Cache first
      const cached = await cacheGet(k);
      if (cached && (cached.scientific || cached.common)) {
        return res.json({
          source: "cache",
          scientific: cached.scientific || null,
          common: cached.common || rawName,
          valid: true
        });
      }

      // 2) Provider lookups (Perenual -> Trefle fallback if provider is "perenual")
      async function perenualLookup(name) {
        const key = encodeURIComponent(process.env.PERENUAL_KEY || "");
        const q = encodeURIComponent(name);
        const s = await fetch(`https://perenual.com/api/species-list?key=${key}&q=${q}`);
        if (!s.ok) return null;
        const sData = await s.json();
        const hit = sData?.data?.[0];
        if (!hit?.id) return null;

        const d = await fetch(`https://perenual.com/api/species/details/${hit.id}?key=${key}`);
        if (!d.ok) return null;
        const dData = await d.json();
        return {
          provider: "perenual",
          common: dData?.common_name || hit?.common_name || name,
          scientific: dData?.scientific_name || hit?.scientific_name || null
        };
      }

      async function trefleLookup(name) {
        const token = encodeURIComponent(process.env.TREFLE_TOKEN || "");
        const q = encodeURIComponent(name);
        const s = await fetch(`https://trefle.io/api/v1/plants/search?token=${token}&q=${q}`);
        if (!s.ok) return null;
        const sData = await s.json();
        const hit = sData?.data?.[0];
        if (!hit?.id) return null;

        const d = await fetch(`https://trefle.io/api/v1/plants/${hit.id}?token=${token}`);
        if (!d.ok) return null;
        const dData = await d.json();
        const p = dData?.data || hit;
        return {
          provider: "trefle",
          common: p?.common_name || hit?.common_name || name,
          scientific: p?.scientific_name || hit?.scientific_name || null
        };
      }

      let normalized = null;

      if (provider === "perenual") {
        normalized = await perenualLookup(rawName);
        if (!normalized) {
          // graceful fallback to Trefle if Perenual misses
          normalized = await trefleLookup(rawName);
        }
      } else if (provider === "trefle") {
        normalized = await trefleLookup(rawName);
      } else {
        return res.status(400).json({ error: "bad_request", detail: "unknown provider", valid: false });
      }

      if (normalized && (normalized.scientific || normalized.common)) {
        // Save to the same cache key so /api/plant/search benefits too
        await cacheSet(k, normalized);
        return res.json({
          source: "api",
          scientific: normalized.scientific || null,
          common: normalized.common || rawName,
          valid: true
        });
      }

      return res.status(404).json({ error: "not_found", valid: false });
    } catch (e) {
      return res.status(502).json({ error: "upstream_error", detail: String(e?.message || e), valid: false });
    }
  });

  /* -------------------------- LLM chat proxy --------------------------- */
  // Uses Groq (OpenAI-compatible). Caches by exact last user message.

  app.post("/api/chat", async (req, res) => {
    try {
      const input = ChatSchema.parse(req.body);

      const lastUser = [...input.messages].reverse().find(m => m.role === "user")?.content;
      if (lastUser) {
        const ck = chatKey(lastUser);
        const cached = await cacheGet(ck);
        if (cached) return res.status(200).json({ content: cached, cached: true });
      }

      const systemInstruction = [
        "You are ApexVora, a concise, friendly carnivorous-plant expert.",
        "STYLE: modern-minimal, practical, 3–6 short sentences max.",
        "SAFETY: never suggest fertilizer/tap water; prefer rain/distilled/RO.",
      ].join(" ");

      const messages = [{ role: "system", content: systemInstruction }, ...input.messages];

      const base = process.env.GROQ_BASE || "https://api.groq.com/openai";
      const url = `${base}/v1/chat/completions`;
      const headers = {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.GROQ_API_KEY || ""}`,
      };
      const body = JSON.stringify({
        model: process.env.GROQ_CHAT_MODEL,
        messages,
        temperature: input.temperature ?? 0.3,
        max_tokens: input.max_tokens ?? 300,
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

      if (lastUser && content) {
        const ck = chatKey(lastUser);
        await cacheSet(ck, String(content));
      }

      return res.status(200).json({ content });
    } catch (err) {
      return res.status(400).json({ error: "bad_request", detail: err?.message || String(err) });
    }
  });

  return app;
}

const app = createApp();
export default app;
