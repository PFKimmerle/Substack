# Ollama Proxy

A simple Node.js proxy that forwards chat requests to your local Ollama instance. Used by Alfred but can work standalone.

## Setup

1. Install Ollama from https://ollama.com and pull a model:
   ```
   ollama pull llama3.2
   ```

2. Install dependencies and start the server:
   ```
   npm install
   node server.js
   ```

   Server runs on http://localhost:8788

## Test it

```
curl -X POST http://localhost:8788/chat -H "Content-Type: application/json" -d "{\"user\":\"hello\"}"
```

Or use the included body.json:
```
curl -X POST http://localhost:8788/chat -H "Content-Type: application/json" --data-binary @body.json
```

You should get back a JSON response with the model's reply.
