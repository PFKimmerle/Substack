# Alfred

A local AI assistant powered by Ollama. No API keys, no cloud, no cost.

## Projects

| Folder | Description |
|--------|-------------|
| `/Alfred` | Main app — FastAPI backend + web UI |
| `/Ollama` | Optional Node.js proxy for Ollama |

## Quick Start

1. Install [Ollama](https://ollama.com/download) and pull a model:
```
   ollama pull llama3.2
```

2. See `/Alfred/README.md` for full setup instructions.

## Ports

- **8790**: Alfred server
- **8788**: Ollama proxy (optional)

## License

MIT