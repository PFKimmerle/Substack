// server/src/cache.js
import Redis from "ioredis";
import crypto from "node:crypto";

const TTL_DEFAULT = 60 * 60 * 24; // 24h

const REDIS_URL = process.env.REDIS_URL || "";
let redis = null;
let useRedis = false;

// Fallback in-memory cache (cleared on server restart)
const memory = new Map();

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableAutoPipelining: true,
      lazyConnect: true
    });
    await redis.connect();
    useRedis = true;
    console.log("[cache] using Redis");
  } catch (e) {
    console.warn("[cache] Redis unavailable, using in-memory fallback:", e.message);
    useRedis = false;
  }
} else {
  console.log("[cache] REDIS_URL not set, using in-memory fallback");
}

function sha1(s) {
  return crypto.createHash("sha1").update(String(s)).digest("hex");
}

function encode(v) { return JSON.stringify(v); }
function decode(s) { try { return JSON.parse(s); } catch { return null; } }

export async function cacheGet(key) {
  if (useRedis) {
    const v = await redis.get(key);
    return v ? decode(v) : null;
  } else {
    const hit = memory.get(key);
    if (!hit) return null;
    const { value, exp } = hit;
    if (exp && Date.now() > exp) { memory.delete(key); return null; }
    return value;
  }
}

export async function cacheSet(key, value, ttlSec = TTL_DEFAULT) {
  if (useRedis) {
    await redis.set(key, encode(value), "EX", ttlSec);
  } else {
    memory.set(key, { value, exp: Date.now() + ttlSec * 1000 });
  }
}

export function plantKey(provider, name) {
  return `plant:${provider}:${sha1(String(name).toLowerCase().trim())}`;
}

export function chatKey(prompt) {
  return `chat:${sha1(String(prompt))}`;
}
