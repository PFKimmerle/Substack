# Alfred

A local AI assistant powered by Ollama. Runs entirely on your machine - no API keys, no cloud, no cost.

## Features

- Chat interface with streaming responses
- Web search integration (DuckDuckGo, no API key needed)
- Voice input/output (optional)
- Knowledge base RAG with FAISS (optional)
- Wake word detection ("Hey Alfred") (optional)
- Two modes: Friendly (casual) and Study (detailed with citations)

## Requirements

- Ollama installed and running (https://ollama.com/download)
- Python 3.10+
- Node.js (for Ollama proxy, optional)

## Quick Start

1. Install Ollama and pull a model:
   ```
   ollama pull llama3.2
   ```

2. Set up the server:
   ```
   cd Alfred/server
   python -m venv .venv

   # Windows
   .\.venv\Scripts\Activate.ps1

   # Linux/Mac
   source .venv/bin/activate

   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   python run.py
   ```

4. Open the UI at http://localhost:8790

## Configuration

Copy .env.example to .env and adjust as needed:
```
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
PORT=8790
```

Copy server/data/memory.example.json to server/data/memory.json:
```
cp server/data/memory.example.json server/data/memory.json
```

The memory file stores user preferences and is gitignored (your data stays private).

## Optional Features

### Voice Input/Output

```
pip install pyttsx3 faster-whisper soundfile
```

### Knowledge Base (RAG)

1. Install dependencies:
   ```
   pip install langchain-community langchain-ollama faiss-cpu
   ollama pull nomic-embed-text
   ```

2. Add documents to knowledge_base/ folder

3. Build the index:
   ```
   python indexer.py
   ```

### Wake Word ("Hey Alfred")

```
pip install openwakeword sounddevice numpy
python wake_listener.py
```

## License

MIT