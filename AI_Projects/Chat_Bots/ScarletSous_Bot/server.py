import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="public", static_url_path="")

# ----- Recipe APIs -----
def search_spoonacular(ingredient: str):
    """Primary: Spoonacular - returns cards with images."""
    key = (os.environ.get("SPOON_KEY") or "").strip()
    if not key:
        return None

    try:
        r = requests.get(
            "https://api.spoonacular.com/recipes/findByIngredients",
            params={"ingredients": ingredient, "number": 3, "apiKey": key},
            timeout=12,
        )
        r.raise_for_status()
        items = r.json() or []
        ids = [it.get("id") for it in items if it.get("id")][:3]
        if not ids:
            return None

        recipes = []
        for rid in ids:
            try:
                r2 = requests.get(
                    f"https://api.spoonacular.com/recipes/{rid}/information",
                    params={"apiKey": key},
                    timeout=12,
                )
                r2.raise_for_status()
                info = r2.json() or {}

                title = (info.get("title") or "").strip()
                image = (info.get("image") or "").strip()
                source_url = (info.get("sourceUrl") or "").strip()
                cook_time = info.get("readyInMinutes")
                servings = info.get("servings")

                if title and source_url:
                    recipes.append({
                        "title": title,
                        "image": image,
                        "sourceUrl": source_url,
                        "cookTime": cook_time,
                        "servings": servings
                    })
            except requests.exceptions.RequestException:
                continue

        if recipes:
            return recipes
    except requests.exceptions.RequestException:
        pass

    return None


def search_tasty(ingredient: str):
    """Fallback: Tasty API - returns cards with images."""
    key = (os.environ.get("RAPID_API_KEY") or "").strip()
    if not key:
        return None

    try:
        r = requests.get(
            "https://tasty.p.rapidapi.com/recipes/list",
            params={"q": ingredient, "from": "0", "size": "3"},
            headers={
                "X-RapidAPI-Key": key,
                "X-RapidAPI-Host": "tasty.p.rapidapi.com"
            },
            timeout=12,
        )
        r.raise_for_status()
        data = r.json() or {}
        results = data.get("results") or []
    except requests.exceptions.RequestException:
        return None

    recipes = []
    for item in results[:3]:
        title = (item.get("name") or "").strip()
        image = (item.get("thumbnail_url") or "").strip()
        cook_time = item.get("total_time_minutes")
        servings = item.get("num_servings")
        source_url = f"https://tasty.co/recipe/{item.get('slug', '')}" if item.get("slug") else ""

        if title and source_url:
            recipes.append({
                "title": title,
                "image": image,
                "sourceUrl": source_url,
                "cookTime": cook_time,
                "servings": servings
            })

    return recipes if recipes else None


def search_recipes(ingredient: str):
    """Try Spoonacular first, then Tasty as fallback."""
    return search_spoonacular(ingredient) or search_tasty(ingredient)


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
        return jsonify({"error": "Please enter an ingredient."}), 400

    recipes = search_recipes(msg)
    if not recipes:
        return jsonify({"error": "No recipes found. Try a different ingredient."})

    return jsonify({
        "greeting": f"Here are some recipes using {msg}!",
        "recipes": recipes
    })

if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 3000)))
