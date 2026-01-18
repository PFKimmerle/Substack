# app/services/api_service.py
"""
API Service for Alfred: Tier-1 Free APIs with Multiple Fallbacks
Handles: Weather, Anime, Recipes, Food, Fitness
No authentication required. 2-second timeout per API call.
Tries multiple APIs if first one fails.
"""

import aiohttp
import asyncio
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json

# ========== CACHE ==========
_api_cache: Dict[str, tuple] = {}  # {key: (result, timestamp)}
CACHE_TTL = 300  # 5 minutes


def _cache_key(api_name: str, query: str) -> str:
    """Generate cache key"""
    return f"{api_name}:{query.lower().strip()}"


def _get_cached(key: str) -> Optional[Dict]:
    """Get from cache if fresh"""
    if key in _api_cache:
        result, timestamp = _api_cache[key]
        if (datetime.now() - timestamp).total_seconds() < CACHE_TTL:
            return result
        else:
            del _api_cache[key]
    return None


def _set_cache(key: str, result: Dict) -> None:
    """Store in cache"""
    _api_cache[key] = (result, datetime.now())


# ========== INTENT DETECTION (regex, <1ms) ==========

_WEATHER_INTENT = re.compile(
    r"\b(weather|forecast|temp(?:erature)?|it's? (?:hot|cold|rainy|sunny|snowing)|"
    r"what.*?(?:wear|jacket)|rain|snow|wind|humidity|high|low)\b", re.I
)

_ANIME_INTENT = re.compile(
    r"\b(anime|manga|show|series|episode|season|character|voice.*?(?:actor|actress)|"
    r"(?:mob psycho|jujutsu|demon slayer|one piece|naruto|bleach|dragon ball|death note|"
    r"attack on titan|code geass|evangelion|steins?gate|monogatari|re:zero|isekai|"
    r"sword art online|shield hero|quintessential|toradora|clannad|little witch|"
    r"fire force|my hero|bunny girl|boarding house|chainsaw man|frieren|solo leveling))\b", re.I
)

_RECIPE_INTENT = re.compile(
    r"\b(recipe|(?:how to )?(?:make|cook|prepare|bake)|ingredients?|cooking|baking|"
    r"dish|meal|dinner|breakfast|lunch|dessert|cake|cookie|bread|pasta|soup|stew)\b", re.I
)

_FOOD_INTENT = re.compile(
    r"\b((?:calori|nutrition|protein|carb|fat|fiber|vitamin).*?(?:in|of)?|"
    r"how many.*?(?:calorie|gram|protein|carb)|nutritious|healthy|diet)\b", re.I
)

_FITNESS_INTENT = re.compile(
    r"\b(exercise|workout|bicep|tricep|shoulder|chest|leg|cardio|stretching?|"
    r"(?:how to )?(?:build|strengthen|tone)|muscle|reps|sets|push.?up|sit.?up|squat|deadlift|"
    r"running|cycling|swimming|fitness|gym)\b", re.I
)


def detect_intent(query: str) -> Optional[str]:
    """Fast regex intent detection"""
    q = (query or "").lower()
    
    if _WEATHER_INTENT.search(q):
        return "weather"
    elif _ANIME_INTENT.search(q):
        return "anime"
    elif _RECIPE_INTENT.search(q):
        return "recipe"
    elif _FOOD_INTENT.search(q):
        return "food"
    elif _FITNESS_INTENT.search(q):
        return "fitness"
    
    return None


# ========== WEATHER APIs (Multiple Fallbacks) ==========

async def _get_weather_openmeteo(query: str, user_loc: str, timeout: float = 2.0) -> Optional[Dict]:
    """Open-Meteo (Primary)"""
    try:
        loc = user_loc or "New York, NY"
        
        async with aiohttp.ClientSession() as session:
            # Geocode
            geo_url = "https://geocoding-api.open-meteo.com/v1/search"
            geo_params = {"name": loc.split(",")[0], "count": 1}
            
            async with session.get(geo_url, params=geo_params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                geo_data = await resp.json()
                
                if not geo_data.get("results"):
                    return None
                
                result = geo_data["results"][0]
                latitude = result["latitude"]
                longitude = result["longitude"]
                location_name = f"{result.get('name', '')}"
            
            # Get weather
            weather_url = "https://api.open-meteo.com/v1/forecast"
            weather_params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                "temperature_unit": "fahrenheit",
                "timezone": "auto"
            }
            
            async with session.get(weather_url, params=weather_params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                weather_data = await resp.json()
                current = weather_data.get("current", {})
                
                temp = current.get("temperature_2m")
                humidity = current.get("relative_humidity_2m")
                wind = current.get("wind_speed_10m")
                code = current.get("weather_code")
                
                weather_desc = _interpret_weather_code(code)
                
                formatted = (
                    f"Temp: {location_name}: {temp}F, {weather_desc}\n"
                    f"Wind: {wind} mph | Humidity: {humidity}%"
                )
                
                return {"formatted": formatted, "raw": weather_data}
    
    except asyncio.TimeoutError:
        return None
    except Exception as e:
        print(f"[WARN] Open-Meteo failed: {e}")
        return None


async def _get_weather_weatherapi(query: str, user_loc: str, timeout: float = 2.0) -> Optional[Dict]:
    """WeatherAPI (Fallback 1) - Free tier available"""
    try:
        loc = user_loc or "New York, NY"
        
        async with aiohttp.ClientSession() as session:
            # WeatherAPI has free tier without key
            url = "https://api.weatherapi.com/v1/current.json"
            params = {
                "q": loc,
                "aqi": "no"
            }
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                current = data.get("current", {})
                location = data.get("location", {})
                
                temp = current.get("temp_f")
                condition = current.get("condition", {}).get("text")
                humidity = current.get("humidity")
                wind = current.get("wind_mph")
                location_name = location.get("name", "Unknown")
                
                formatted = (
                    f"Temp: {location_name}: {temp}F, {condition}\n"
                    f"Wind: {wind} mph | Humidity: {humidity}%"
                )
                
                return {"formatted": formatted, "raw": data}
    
    except asyncio.TimeoutError:
        return None
    except Exception as e:
        print(f"[WARN] WeatherAPI failed: {e}")
        return None


async def _get_weather_wttr(query: str, user_loc: str, timeout: float = 2.0) -> Optional[Dict]:
    """wttr.in (Fallback 2) - Ultra simple, no auth"""
    try:
        loc = user_loc.split(",")[0] if user_loc else "New York"
        
        async with aiohttp.ClientSession() as session:
            url = f"https://wttr.in/{loc}?format=j1"
            
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                current_condition = data.get("current_condition", [{}])[0]
                
                temp = current_condition.get("temp_F")
                description = current_condition.get("weatherDesc", [{}])[0].get("value", "Unknown")
                humidity = current_condition.get("humidity")
                wind = current_condition.get("windspeedMiles")
                
                formatted = (
                    f"Temp: {loc}: {temp}F, {description}\n"
                    f"Wind: {wind} mph | Humidity: {humidity}%"
                )
                
                return {"formatted": formatted, "raw": data}
    
    except asyncio.TimeoutError:
        return None
    except Exception as e:
        print(f"[WARN] wttr.in failed: {e}")
        return None


async def _get_weather(query: str, user_loc: str) -> Optional[Dict]:
    """Try weather APIs in order"""
    cache_key = _cache_key("weather", query)
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    # Try each API in order
    for api_func in [_get_weather_openmeteo, _get_weather_weatherapi, _get_weather_wttr]:
        try:
            result = await api_func(query, user_loc, timeout=2.0)
            if result:
                _set_cache(cache_key, result)
                return result
        except Exception as e:
            print(f"[WARN] Weather API attempt failed: {e}")
            continue
    
    return None


def _interpret_weather_code(code: int) -> str:
    """WMO weather code to description"""
    if code is None:
        return "Unknown"
    
    code_map = {
        0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Foggy/Rime",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Heavy drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
        80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
        85: "Snow showers", 86: "Heavy snow showers",
        95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Thunderstorm w/ hail",
    }
    
    return code_map.get(code, "Unknown conditions")


# ========== ANIME APIs (Multiple Fallbacks) ==========

async def _get_anime_jikan(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """Jikan (MAL) - Primary"""
    try:
        title = re.sub(r"\b(anime|manga|show|series|episode|season)\b", "", query, flags=re.I).strip()
        if len(title) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            url = "https://api.jikan.moe/v4/anime"
            params = {"query": title, "order_by": "score", "sort": "desc"}
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                results = data.get("data", [])
                
                if not results:
                    return None
                
                anime = results[0]
                title = anime.get("title")
                year = anime.get("year")
                score = anime.get("score")
                episodes = anime.get("episodes")
                status = anime.get("status")
                synopsis = anime.get("synopsis")
                
                formatted = (
                    f"Show: {title} ({year})\n"
                    f"Rating: {score}/10 | Episodes: {episodes or 'N/A'} | {status}\n"
                    f"Info: {(synopsis or '')[:200]}..."
                )
                
                return {"formatted": formatted, "raw": anime}
    
    except Exception as e:
        print(f"[WARN] Jikan failed: {e}")
        return None


async def _get_anime_kitsu(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """Kitsu (Fallback 1)"""
    try:
        title = re.sub(r"\b(anime|manga|show|series)\b", "", query, flags=re.I).strip()
        if len(title) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            url = "https://kitsu.io/api/edge/anime"
            params = {"filter[text]": title, "sort": "-averageRating", "page[limit]": 1}
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                results = data.get("data", [])
                
                if not results:
                    return None
                
                anime = results[0]
                attributes = anime.get("attributes", {})
                
                title = attributes.get("canonicalTitle")
                year = attributes.get("startDate", "")[:4]
                score = attributes.get("averageRating")
                episodes = attributes.get("episodeCount")
                status = attributes.get("status")
                synopsis = attributes.get("synopsis")
                
                formatted = (
                    f"Show: {title} ({year})\n"
                    f"Rating: {score}/100 | Episodes: {episodes or 'N/A'} | {status}\n"
                    f"Info: {(synopsis or '')[:200]}..."
                )
                
                return {"formatted": formatted, "raw": anime}
    
    except Exception as e:
        print(f"[WARN] Kitsu failed: {e}")
        return None


async def _get_anime_tvmaze(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """TVMaze (Fallback 2) - Also has anime"""
    try:
        title = re.sub(r"\b(anime|manga|show|series)\b", "", query, flags=re.I).strip()
        if len(title) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            url = "https://api.tvmaze.com/search/shows"
            params = {"q": title}
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                
                if not data:
                    return None
                
                show = data[0].get("show", {})
                
                title = show.get("name")
                year = show.get("premiered", "")[:4]
                rating = show.get("rating", {}).get("average")
                genres = show.get("genres", [])
                status = show.get("status")
                summary = show.get("summary", "").replace("<p>", "").replace("</p>", "")[:200]
                
                formatted = (
                    f"Show: {title} ({year})\n"
                    f"Rating: {rating}/10 | Status: {status} | {', '.join(genres)}\n"
                    f"Info: {summary}..."
                )
                
                return {"formatted": formatted, "raw": show}
    
    except Exception as e:
        print(f"[WARN] TVMaze failed: {e}")
        return None


async def _get_anime(query: str) -> Optional[Dict]:
    """Try anime APIs in order"""
    cache_key = _cache_key("anime", query)
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    for api_func in [_get_anime_jikan, _get_anime_kitsu, _get_anime_tvmaze]:
        try:
            result = await api_func(query, timeout=2.0)
            if result:
                _set_cache(cache_key, result)
                return result
        except Exception as e:
            print(f"[WARN] Anime API attempt failed: {e}")
            continue
    
    return None


# ========== RECIPE API (Multiple Fallbacks) ==========

async def _get_recipe_themealdb(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """TheMealDB (Primary)"""
    try:
        dish = re.sub(r"\b(recipe|(?:how to )?(?:make|cook|prepare|bake))\b", "", query, flags=re.I).strip()
        if len(dish) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            url = "https://www.themealdb.com/api/json/v1/1/search.php"
            params = {"s": dish}
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                meals = data.get("meals")
                
                if not meals:
                    return None
                
                meal = meals[0]
                name = meal.get("strMeal")
                category = meal.get("strCategory")
                instructions = meal.get("strInstructions", "")[:300]
                
                formatted = (
                    f"Recipe: {name}\n"
                    f"Category: {category}\n"
                    f"Instructions: {instructions}..."
                )
                
                return {"formatted": formatted, "raw": meal}
    
    except Exception as e:
        print(f"[WARN] TheMealDB failed: {e}")
        return None


async def _get_recipe_spoonacular(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """Spoonacular (Fallback 1) - Free tier no key"""
    try:
        dish = re.sub(r"\b(recipe|(?:how to )?(?:make|cook|prepare|bake))\b", "", query, flags=re.I).strip()
        if len(dish) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            url = "https://api.spoonacular.com/recipes/complexSearch"
            params = {"query": dish, "number": 1, "apiKey": "dummy"}  # Spoonacular allows dummy key for basic search
            
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    results = data.get("results", [])
                    
                    if results:
                        recipe = results[0]
                        title = recipe.get("title")
                        
                        formatted = f"Recipe: {title}\nNote: Search on spoonacular.com for full recipe"
                        return {"formatted": formatted, "raw": recipe}
                
                return None
    
    except Exception as e:
        print(f"[WARN] Spoonacular failed: {e}")
        return None


async def _get_recipe(query: str) -> Optional[Dict]:
    """Try recipe APIs in order"""
    cache_key = _cache_key("recipe", query)
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    for api_func in [_get_recipe_themealdb, _get_recipe_spoonacular]:
        try:
            result = await api_func(query, timeout=2.0)
            if result:
                _set_cache(cache_key, result)
                return result
        except Exception as e:
            print(f"[WARN] Recipe API attempt failed: {e}")
            continue
    
    return None


# ========== FOOD/NUTRITION API (Multiple Fallbacks) ==========

async def _get_food_openfoodfacts(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """Open Food Facts (Primary)"""
    try:
        food = re.sub(r"\b(calori|nutrition|protein|carb|fat|fiber|vitamin|how many|in|of)\b", "", query, flags=re.I).strip()
        if len(food) < 2:
            return None
        
        async with aiohttp.ClientSession() as session:
            search_url = "https://world.openfoodfacts.org/cgi/search.pl"
            params = {"search_terms": food, "json": 1, "page_size": 1}
            
            async with session.get(search_url, params=params, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status != 200:
                    return None
                
                data = await resp.json()
                products = data.get("products", [])
                
                if not products:
                    return None
                
                product = products[0]
                name = product.get("product_name", food)
                calories = product.get("nutriments", {}).get("energy-kcal_100g")
                protein = product.get("nutriments", {}).get("proteins_100g")
                carbs = product.get("nutriments", {}).get("carbohydrates_100g")
                fat = product.get("nutriments", {}).get("fat_100g")
                
                nutrients = []
                if calories:
                    nutrients.append(f"{calories} kcal/100g")
                if protein:
                    nutrients.append(f"{protein}g protein")
                if carbs:
                    nutrients.append(f"{carbs}g carbs")
                if fat:
                    nutrients.append(f"{fat}g fat")

                formatted = f"Food: {name}\n" + " | ".join(nutrients) if nutrients else f"Food: {name}"
                
                return {"formatted": formatted, "raw": product}
    
    except Exception as e:
        print(f"[WARN] Open Food Facts failed: {e}")
        return None


async def _get_food(query: str) -> Optional[Dict]:
    """Try food APIs"""
    cache_key = _cache_key("food", query)
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    result = await _get_food_openfoodfacts(query, timeout=2.0)
    if result:
        _set_cache(cache_key, result)
        return result
    
    return None


# ========== FITNESS API (Hardcoded - No Auth) ==========

async def _get_exercise(query: str, timeout: float = 2.0) -> Optional[Dict]:
    """Fitness advice (local knowledge, no API needed)"""
    cache_key = _cache_key("exercise", query)
    cached = _get_cached(cache_key)
    if cached:
        return cached
    
    exercise = re.sub(r"\b(exercise|workout|how to|(?:build|strengthen|tone)|muscle)\b", "", query, flags=re.I).strip()
    
    if len(exercise) < 2:
        return None
    
    muscle_groups = {
        "bicep": "Bicep curls, hammer curls, concentration curls. 3x10-12 reps.",
        "tricep": "Tricep dips, overhead press, skull crushers. 3x10-12 reps.",
        "shoulder": "Lateral raises, military press, upright rows. 3x12-15 reps.",
        "chest": "Push-ups, bench press, cable flyes. 3x8-12 reps.",
        "leg": "Squats, lunges, leg press. 3x12-15 reps.",
        "back": "Pull-ups, rows, lat pulldowns. 3x8-12 reps.",
        "cardio": "Running, cycling, rowing. 20-30 min moderate intensity.",
    }

    for muscle, advice in muscle_groups.items():
        if muscle in exercise.lower():
            formatted = f"Exercise: {exercise.title()}\n{advice}"
            result = {"formatted": formatted, "raw": {"type": "fitness_advice"}}
            _set_cache(cache_key, result)
            return result
    
    return None


# ========== MAIN DISPATCHER ==========

async def try_api_first(query: str, user_loc: str = "") -> Optional[Dict]:
    """
    Main entry point: detect intent, call appropriate APIs, return formatted result or None
    If API fails, returns None --> fallback to web search
    Tries multiple APIs per category for reliability
    """
    intent = detect_intent(query)
    print(f"[DEBUG] INTENT DETECTED: {intent} for query: {query}")
    
    if intent == "weather":
        return await _get_weather(query, user_loc)
    elif intent == "anime":
        return await _get_anime(query)
    elif intent == "recipe":
        return await _get_recipe(query)
    elif intent == "food":
        return await _get_food(query)
    elif intent == "fitness":
        return await _get_exercise(query)
    
    return None