# ScarletSous

A simple recipe chatbot. Tell it what ingredients you have, get recipe suggestions with images.

## Setup

1. Create `.env` with your keys:
```
SPOON_KEY=your_spoonacular_key
RAPID_API_KEY=your_rapidapi_key
GROQ_API_KEY=your_groq_key
PORT=3000
```

2. Install and run:
```
pip install -r requirements.txt
python server.py
```

3. Open http://localhost:3000

## How it works

Uses Spoonacular as the primary recipe API. Falls back to Tasty (via RapidAPI) if Spoonacular is unavailable. Both return recipe cards with images, cook time, and links to the full recipe.
