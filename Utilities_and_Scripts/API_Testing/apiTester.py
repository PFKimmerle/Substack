import requests
import json
import time

def test_api(name, url, params=None, headers=None, method="GET", is_json=True):
    print(f"\nTesting {name}...")
    print(f"URL: {url}")
    
    try:
        # Send the request
        if method.upper() == "GET":
            response = requests.get(url, params=params, headers=headers, timeout=10)
        else:  # POST
            if is_json:
                response = requests.post(url, json=params, headers=headers, timeout=10)
            else:
                response = requests.post(url, data=params, headers=headers, timeout=10)
        
        print(f"Status code: {response.status_code}")
        
        # Check if the API returned a successful status code
        if 200 <= response.status_code < 300:
            print("API is working!")
            try:
                # Try to format response as JSON
                json_response = response.json()
                # Truncate long responses for readability
                print("Response:", json.dumps(json_response, indent=2)[:300] + "..." if len(json.dumps(json_response, indent=2)) > 300 else json.dumps(json_response, indent=2))
                return True
            except:
                # If not JSON, print text response
                print("Response:", response.text[:200] + "..." if len(response.text) > 200 else response.text)
                return True
        else:
            print("API returned an error code")
            try:
                json_response = response.json()
                print("Response:", json.dumps(json_response, indent=2)[:300] + "..." if len(json.dumps(json_response, indent=2)) > 300 else json.dumps(json_response, indent=2))
            except:
                print("Response:", response.text[:200] + "..." if len(response.text) > 200 else response.text)
            return False
    except Exception as e:
        print(f"Error testing API: {e}")
        return False

# List of APIs to test
apis = [
    # Utility APIs
    {
        "name": "GitHub API - Zen",
        "url": "https://api.github.com/zen",
        "method": "GET",
        "is_json": False,
        "category": "Utility"
    },
    {
        "name": "GitHub API - Emojis",
        "url": "https://api.github.com/emojis",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "JSON Placeholder",
        "url": "https://jsonplaceholder.typicode.com/posts/1",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Open Meteo API",
        "url": "https://api.open-meteo.com/v1/forecast",
        "params": {"latitude": 52.52, "longitude": 13.41, "current_weather": True},
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Dog API",
        "url": "https://dog.ceo/api/breeds/image/random",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "IP API",
        "url": "https://ipapi.co/json/",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Joke API",
        "url": "https://official-joke-api.appspot.com/random_joke",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Cat Facts API",
        "url": "https://catfact.ninja/fact",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Random Facts API",
        "url": "https://uselessfacts.jsph.pl/api/v2/facts/random",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "NASA APOD API",
        "url": "https://api.nasa.gov/planetary/apod",
        "params": {"api_key": "DEMO_KEY"},
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Useless Facts API (Alt)",
        "url": "https://uselessfacts.jsph.pl/random.json?language=en",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "REST Countries API",
        "url": "https://restcountries.com/v3.1/all",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Kanye REST",
        "url": "https://api.kanye.rest/",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Exchange Rate API",
        "url": "https://open.er-api.com/v6/latest/USD",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Pokemon API",
        "url": "https://pokeapi.co/api/v2/pokemon/1",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Random User API",
        "url": "https://randomuser.me/api/",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "NumbersAPI",
        "url": "http://numbersapi.com/42/trivia?json=true",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "JokeAPI - Safe Mode",
        "url": "https://v2.jokeapi.dev/joke/Any?safe-mode",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Czech National Bank - Currency Exchange",
        "url": "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt",
        "method": "GET",
        "is_json": False,
        "category": "Utility"
    },
    {
        "name": "Randomuser.me Generated Users",
        "url": "https://randomuser.me/api/?results=1&nat=us",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    
    {
        "name": "TheMealDB - Random Meal",
        "url": "https://www.themealdb.com/api/json/v1/1/random.php",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "TheMealDB - Categories",
        "url": "https://www.themealdb.com/api/json/v1/1/categories.php",
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "TheMealDB - Search by Name",
        "url": "https://www.themealdb.com/api/json/v1/1/search.php",
        "params": {"s": "chicken"},
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "Google Books API - Volume Info",
        "url": "https://www.googleapis.com/books/v1/volumes",
        "params": {"q": "harry potter"},
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },
    {
        "name": "National Park Service - Parks",
        "url": "https://developer.nps.gov/api/v1/parks",
        "params": {"limit": 5, "api_key": "DEMO_KEY"},
        "method": "GET",
        "is_json": True,
        "category": "Utility"
    },

    
    # AI APIs
    {
        "name": "Hugging Face - Public Model",
        "url": "https://huggingface.co/api/models/gpt2",
        "method": "GET",
        "is_json": True,
        "category": "AI"
    },
    {
        "name": "TextGears Grammar Check",
        "url": "https://api.textgears.com/check.php",
        "params": {"text": "I is programmer", "key": "demo_key"},
        "method": "GET",
        "is_json": True,
        "category": "AI"
    },
    {
        "name": "Stanford NLP API",
        "url": "http://corenlp.run/",
        "params": {"properties": json.dumps({"annotators": "tokenize,ssplit,pos", "outputFormat": "json"}), "pipelineLanguage": "en"},
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "method": "POST",
        "is_json": False,
        "category": "AI"
    },
    {
        "name": "Algorithmia NLP",
        "url": "https://algorithmia.com/algorithms/nlp/LDA/info",
        "method": "GET",
        "is_json": True,
        "category": "AI"
    }
]

if __name__ == "__main__":
    print("Free API Tester")
    print("===============")
    
    # Track working APIs by category
    working_apis = {"Utility": 0, "AI": 0}
    total_apis = {"Utility": 0, "AI": 0}
    
    # Test each
    for api in apis:
        category = api.get("category", "Uncategorized")
        total_apis[category] = total_apis.get(category, 0) + 1
        
        success = test_api(
            api["name"], 
            api["url"], 
            api.get("params"), 
            api.get("headers"), 
            api.get("method", "GET"),
            api.get("is_json", True)
        )
        
        if success:
            working_apis[category] = working_apis.get(category, 0) + 1
            
        # Wait a bit between requests
        time.sleep(2)
    
    print("\n=== TEST SUMMARY ===")
    for category in total_apis:
        print(f"{category} APIs: {working_apis[category]}/{total_apis[category]} working ({working_apis[category]/total_apis[category]*100:.1f}%)")
    
    print("\nNote: Free APIs may change frequently. This test was run on " + time.strftime("%Y-%m-%d %H:%M:%S"))