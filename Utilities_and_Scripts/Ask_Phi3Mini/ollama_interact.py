import requests

# Get prompt from the user
prompt = input("Ask phi3:mini → ")

# Set up the request to Ollama
url = "http://localhost:11434/api/generate"
payload = {
    "model": "phi3:mini",
    "prompt": prompt,
    "stream": False
}

try:
    response = requests.post(url, json=payload)
    response.raise_for_status()  # Check for HTTP errors
    data = response.json()

    # Show just the model’s reply
    print("\nAI says:", data.get("response", "Hmm... no response."))

except requests.exceptions.ConnectionError:
    print("Can't reach Ollama. Is it running? Try: `ollama run phi3:mini`")

except requests.exceptions.HTTPError as e:
    print("Server error:", e)

except Exception as e:
    print("Something went wrong:", e)
