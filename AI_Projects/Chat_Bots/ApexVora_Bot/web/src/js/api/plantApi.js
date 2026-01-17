// web/src/js/api/plantApi.js
// Pulls plant context in this order: browser cache -> Perenual -> Trefle.
// Saves normalized results back to browser cache for speed.

const PLANT_CACHE_KEY = 'apexvora_plant_cache';

function loadPlantCache() {
  try { return JSON.parse(localStorage.getItem(PLANT_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function savePlantCache(obj) {
  try { localStorage.setItem(PLANT_CACHE_KEY, JSON.stringify(obj)); } catch {}
}

// Very light name normalizer (feel free to extend)
export function normalizePlantKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Optional helper used by UI
export function clearPlantCache() {
  localStorage.removeItem(PLANT_CACHE_KEY);
}

// Try server search endpoint (provider = perenual | trefle)
async function fetchFromProvider(provider, key) {
  const base = (window?.ApexVoraEnv?.API_BASE) || 'http://localhost:3000';
  const url = `${base}/api/plant/search?provider=${encodeURIComponent(provider)}&name=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const payload = await res.json(); // { source: "api"|"cache", data: {...} }
  return payload?.data ? payload : null;
}

/**
 * getPlantContext(name)
 * Returns { source: 'cache'|'api'|null, data: { provider, common, scientific, ... } } or null
 */
export async function getPlantContext(name) {
  const key = normalizePlantKey(name);
  if (!key) return null;

  // 1) Browser cache first
  const plantCache = loadPlantCache();
  if (plantCache[key]) {
    return { source: 'cache', data: plantCache[key] };
  }

  // 2) Perenual first (free tier)
  let hit = await fetchFromProvider('perenual', key);
  if (hit && hit.data) {
    plantCache[key] = hit.data;
    savePlantCache(plantCache);
    return { source: 'api', data: hit.data };
  }

  // 3) Fallback to Trefle
  hit = await fetchFromProvider('trefle', key);
  if (hit && hit.data) {
    plantCache[key] = hit.data;
    savePlantCache(plantCache);
    return { source: 'api', data: hit.data };
  }

  // Nothing found
  return null;
}

/**
 * detectPlantName(text)
 * Very simple detector you can improve later. Returns null if no match.
 */
export function detectPlantName(text) {
  const t = String(text || '').toLowerCase();
  const known = [
    'cape sundew', 'drosera capensis', 'drosera', 'sundew',
    'venus flytrap', 'flytrap', 'dionaea muscipula',
    'nepenthes', 'pitcher', 'mini pitcher', 'heliamphora', 'cephalotus'
  ];
  for (const k of known) if (t.includes(k)) return k;
  // fallback: single word heuristic (e.g., "capensis")
  const m = t.match(/\b([a-z]{4,})\b/);
  return m ? m[1] : null;
}
