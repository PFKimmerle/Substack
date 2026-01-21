# app/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "300"))
    PORT: int = int(os.getenv("PORT", "8790"))

settings = Settings()