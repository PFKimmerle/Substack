# app/services/memory_service.py
import os, json
from pathlib import Path

APP_DIR = Path(__file__).parent.parent.parent  # Go to server/
MEM_FILE = APP_DIR / "data" / "memory.json"

def ensure_files():
    MEM_FILE.parent.mkdir(exist_ok=True)
    if not MEM_FILE.exists():
        with open(MEM_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f, indent=2)

def remember_item(key: str, value):
    ensure_files()
    with open(MEM_FILE, "r") as f:
        data = json.load(f)
    data[key] = value
    with open(MEM_FILE, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return True

def recall_item(key: str):
    ensure_files()
    with open(MEM_FILE, "r") as f:
        data = json.load(f)
    return data.get(key, "")

def recall_all():
    ensure_files()
    with open(MEM_FILE, "r") as f:
        return json.load(f)