const q = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

function cToF(c){ return (c*9/5)+32; }
function msToMph(ms){ return ms*2.23694; }
function mToMi(m){ return m/1609.34; }
function degToDir(d){ const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]; return dirs[Math.round(d/22.5)%16]||"—"; }

function oneSentence(text){
  if (!text) return "";
  const m = text.match(/[^.!?]+[.!?]/);
  let s = (m ? m[0] : text).replace(/\s+/g," ").trim();
  if (s.length > 160) s = s.slice(0,160).replace(/\s+\S*$/,"") + "…";
  return s;
}

function renderError(msg){
  q("alert").textContent = msg;
  show(q("alert"));
  hide(q("dashboard"));
}

function renderDashboard(city, raw, summary){
  hide(q("alert"));
  show(q("dashboard"));

  const t = raw.main?.temp ?? null;
  const f = t!=null ? cToF(t) : null;
  const feels = raw.main?.feels_like ?? null;
  const feelsF = feels!=null ? cToF(feels) : null;

  const main = raw.weather?.[0]?.main || "—";
  const desc = raw.weather?.[0]?.description || "—";

  const short = oneSentence(summary) || `${raw.name}: ${t?.toFixed?.(1)}°C / ${f?.toFixed?.(1)}°F, ${main}`;
  q("summary").textContent = short;

  q("temp").textContent = t!=null ? `${t.toFixed(1)}°C / ${f.toFixed(1)}°F` : "—";
  q("feels").textContent = feels!=null ? `Feels like ${feels.toFixed(1)}°C / ${feelsF.toFixed(1)}°F` : "—";

  q("condition").textContent = main;
  q("desc").textContent = desc.charAt(0).toUpperCase()+desc.slice(1);

  const ws = raw.wind?.speed ?? null;
  const wd = raw.wind?.deg ?? null;
  q("wind").textContent = ws!=null ? `${msToMph(ws).toFixed(1)} mph` : "—";
  q("windDir").textContent = wd!=null ? `${degToDir(wd)} (${wd}°)` : "—";

  const hum = raw.main?.humidity ?? null;
  q("humidity").textContent = hum!=null ? `${hum}%` : "—";

  const vis = raw.visibility ?? null;
  q("visibility").textContent = vis!=null ? `${mToMi(vis).toFixed(1)} mi` : "—";

  const country = raw.sys?.country ? `, ${raw.sys.country}` : "";
  q("meta").textContent = `Source: OpenWeather • Location: ${raw.name || city}${country}`;
}

q("getWeather").addEventListener("click", async () => {
  const city = q("city").value.trim();
  if (!city) return renderError("Please enter a city.");

  hide(q("alert"));
  try {
    const res = await fetch(`/weather-summary?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = (data?.error || "Error fetching data").toString();
      if (/city not found/i.test(msg) || /404/i.test(msg)) renderError("City not found. Try another name.");
      else if (/api key/i.test(msg)) renderError("API key error. Check your server .env.");
      else renderError(msg);
      return;
    }
    renderDashboard(city, data.raw, data.summary);
  } catch {
    renderError("Network error. Please try again.");
  }
});

q("city").addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ q("getWeather").click(); }});
