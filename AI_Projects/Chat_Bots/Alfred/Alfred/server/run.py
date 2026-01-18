# run.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Starting Alfred on http://localhost:{settings.PORT}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)