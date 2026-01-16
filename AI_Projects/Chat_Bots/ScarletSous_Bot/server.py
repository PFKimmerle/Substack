import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="public", static_url_path="")

# ----- External lookups -----
def search_spoon_links(ingredient: str):
    key = (os.environ.get("SPOON_KEY") or "").strip()
    if not key:
        return []
    try:
        r = requests.get(
            "https://api.spoonacular.com/recipes/findByIngredients",
            params={"ingredients": ingredient, "number": 3, "apiKey": key},
            timeout=12,
        )
        r.raise_for_status()
        items = r.json() or []
        ids = [str(it.get("id")) for it in items if it.get("id")][:3]
        if not ids:
            return []

        r2 = requests.get(
            "https://api.spoonacular.com/recipes/informationBulk",
            params={"ids": ",".join(ids), "apiKey": key},
            timeout=12,
        )
        r2.raise_for_status()
        infos = r2.json() or []
    except requests.exceptions.RequestException:
        return []

    out = []
    for info in infos:
        name = (info.get("title") or "").strip()
        rid = str(info.get("id") or "").strip()
        url = (info.get("spoonacularSourceUrl") or info.get("sourceUrl") or "").strip()
        mins = info.get("readyInMinutes")
        serves = info.get("servings")
        img = (info.get("image") or "").strip()
        if name and rid and url:
            out.append((name, rid, url, mins, serves, img))
    return out

def search_mealdb_links(ingredient: str):
    try:
        r = requests.get(
            "https://www.themealdb.com/api/json/v1/1/filter.php",
            params={"i": ingredient},
            timeout=12,
        )
        r.raise_for_status()
        meals = (r.json() or {}).get("meals") or []
    except requests.exceptions.RequestException:
        return []

    out = []
    for m in meals[:3]:
        name = (m.get("strMeal") or "").strip()
        mid = (m.get("idMeal") or "").strip()
        url = f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={mid}"
        img = (m.get("strMealThumb") or "").strip()
        if name and mid:
            out.append((name, mid, url, None, None, img))
    return out

def search_recipes(ingredient: str):
    return search_spoon_links(ingredient) or search_mealdb_links(ingredient)

# ----- LLM persona -----
SCARLET_SOUS_PERSONA = (
  "You are ScarletSous, a friendly, encouraging chef assistant. "
  "Given INGREDIENTS and RAW items in the form (name, id, url, minutes?, servings?, image?), "
  "greet the user and confirm their ingredients, then output up to 3 lines, each formatted exactly as: "
  "• {name} | {minutes} | {url} | {image}. "
  "If minutes are missing, omit them. Always include the url and image. "
  "Do not invent data or add instructions. End with a short, upbeat sign-off."
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

# ----- Routes -----
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route("/api/rolebot", methods=["POST"])
def rolebot():
    data = request.get_json(silent=True) or {}
    msg = (data.get("message") or "").strip()
    if not msg:
        return jsonify({"message": "Please send ingredients."}), 400

    results = search_recipes(msg)
    if not results:
        return jsonify({"reply": "No matches yet—try a single main ingredient (e.g., “chicken”)."})

    raw_lines = []
    for (name, rid, url, mins, serves, img) in results:
        mins_txt = f"{mins} min" if mins is not None else ""
        raw_lines.append(f"{name} | {mins_txt} | {url} | {img}")

    prompt = f"INGREDIENTS: {msg}\nRAW:\n" + "\n".join(raw_lines)

    try:
        resp = client.chat.completions.create(
            model=os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": SCARLET_SOUS_PERSONA},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        reply = resp.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception:
        return jsonify({"message": "Server error. ScarletSous is tidying the kitchen."}), 500

if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 3000)))
