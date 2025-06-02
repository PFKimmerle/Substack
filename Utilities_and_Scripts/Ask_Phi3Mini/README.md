# Ask Phi3Mini

## What is this?
A tiny Python script that lets you chat with the `phi3:mini` language model running locally via Ollama. It’s fast, offline, and simple.

## Features
- Ask anything via command line
- Uses the local Ollama API (no cloud needed)
- Clean, readable responses
- Basic error handling if Ollama isn’t running

## Setup
1. Install [Ollama](https://ollama.com) if you haven’t already.
2. Pull the model: `ollama run phi3:mini`
3. Make sure you have Python 3.7+ and `requests`: `pip install requests`


**Already set it up before?**  
If you’ve previously installed Ollama and pulled the model, you don’t need to do it again. Just run the script.

## How to Use
Run the script: python ollama_interact.py


You’ll be prompted like this: 
Ask phi3:mini → What’s the capital of France?
AI says: Paris.

Ask anything and get a quick response.

## Common Issues
- **Connection error?**  
  Make sure Ollama is running:  
  `ollama run phi3:mini`

- **No response?**  
  Check that you're hitting the right local API (`http://localhost:11434`), and that the model loaded correctly.

## License
Free to use, tweak, and share. Great for learning or local experiments.
