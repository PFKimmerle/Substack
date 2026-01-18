# main.py
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os, json, datetime, requests, re, time
from typing import List
from pathlib import Path
import sys

# Import from services directory
from app.services.search_service import web_search, fetch_url, rag_search
from app.services.memory_service import remember_item, recall_item, ensure_files, recall_all
from app.services import api_service

# Optional voice helpers
try:
    from voice_tts import speak_text, set_voice
except Exception:
    def speak_text(_): return {"ok": False, "msg": "pyttsx3 not installed"}
    def set_voice(_): return {"ok": False, "msg": "pyttsx3 not installed"}

try:
    from voice_stt import transcribe_bytes
except Exception:
    def transcribe_bytes(_): return {"ok": False, "text": "", "msg": "STT not installed"}

# Import FAISS for knowledge base search
try:
    from langchain_community.vectorstores import FAISS
    from langchain_ollama import OllamaEmbeddings
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("[WARN]  FAISS not installed. Knowledge base search disabled. Run: pip install faiss-cpu langchain-ollama")

APP_DIR = Path(__file__).parent.parent.parent
CLIENT_DIR = APP_DIR / "client"
LOG_DIR = APP_DIR / "logs"
KB_INDEX_DIR = APP_DIR / "index"  # Where FAISS stores the index

MODEL = "llama3.2"
OLLAMA_URL = "http://127.0.0.1:11434"

app = FastAPI(title="Alfred (local)")
app.mount("/static", StaticFiles(directory=str(CLIENT_DIR)), name="static")

def log_line(s: str):
    LOG_DIR.mkdir(exist_ok=True)
    fn = LOG_DIR / f"{datetime.date.today().isoformat()}.log"
    with open(fn, "a", encoding="utf-8") as f:
        f.write(s + "\n")

def load_faiss_index():
    """Load FAISS index if available"""
    if not FAISS_AVAILABLE or not KB_INDEX_DIR.exists():
        return None
    try:
        embeddings = OllamaEmbeddings(model="nomic-embed-text")
        vs = FAISS.load_local(str(KB_INDEX_DIR), embeddings, allow_dangerous_deserialization=True)
        return vs
    except Exception as e:
        print(f"[WARN]  Could not load FAISS index: {e}")
        return None

def search_knowledge_base(query: str, vector_store) -> List[dict]:
    """Search FAISS index for relevant documents"""
    if not vector_store:
        return []
    try:
        results = vector_store.similarity_search(query, k=3)
        docs = []
        for i, doc in enumerate(results, 1):
            docs.append({
                "title": f"Knowledge Base - {doc.metadata.get('source', 'Document')}",
                "url": "",
                "text": doc.page_content,
                "snippet": doc.page_content[:300],
                "source": "knowledge_base"
            })
        return docs
    except Exception as e:
        print(f"[WARN]  KB search error: {e}")
        return []

# Load FAISS index at startup
VECTOR_STORE = load_faiss_index()

class ChatRequest(BaseModel):
    text: str
    allow_internet: bool = False
    speak: bool = False
    history: List[dict] = []
    mode: str = "friendly"  # "friendly" or "study"

_REQUIRES_WEB = re.compile(
    r"\b(today|tonight|now|currently|right now|this (?:morning|afternoon|evening|week)|"
    r"tomorrow|yesterday|latest|breaking|recent|showtimes?|movies?|weather|"
    r"temperature|forecast|traffic|news|score|stock|price)\b", re.I
)

_SUGGESTS_WEB = re.compile(r"\b(search|look up|find|google|web|check)\b", re.I)

def classify_query(txt: str) -> str:
    if _REQUIRES_WEB.search(txt or ""): return 'requires_web'
    elif _SUGGESTS_WEB.search(txt or ""): return 'suggests_web'
    return 'no_web'

_URL_RE = re.compile(r"https?://[^\s)>\]]+", re.I)

@app.get("/", response_class=HTMLResponse)
def index():
    return FileResponse(CLIENT_DIR / "index.html")

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def generate():
        yield f"data: {json.dumps({'type': 'status', 'text': 'Thinking...'})}\n\n"
        
        start_time = time.time()
        ensure_files()
        user_text = (req.text or "").strip()
        query_lower = user_text.lower()  # Define early so it's available throughout
        history = req.history or []
        mode = req.mode or "friendly"  # Define mode early
        
        mem = recall_all()
        match = re.search(r"\blive in ([A-Za-z .,'-]+,\s*[A-Za-z]{2})\b", user_text, re.I)
        if match:
            remember_item("location", match.group(1).strip())
        
        user_loc = mem.get("location", "")
        current_dt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        
        sources = []
        context_parts = []
        
        # Direct URLs
        direct_urls = _URL_RE.findall(user_text)
        if direct_urls:
            yield f"data: {json.dumps({'type': 'status', 'text': 'Reading links...'})}\n\n"
            for u in direct_urls:
                fetched = fetch_url(u, max_chars=3000)
                sources.append({
                    "title": fetched.get("title") or "(link)",
                    "url": u,
                    "text": fetched.get("text", "")
                })
                i = len(sources)
                excerpt = (fetched.get("text", "")[:200]).strip()
                context_parts.append(f"[{i}] {sources[-1]['title']} - {u}\n{excerpt}")
        
        # Quiz mode detection - respects the UI toggle
        # Only enter/stay in quiz if: (1) user says "quiz me" etc, OR (2) in study mode with quiz history
        is_quiz = any(w in query_lower for w in ["quiz me", "test me", "ask me", "quiz on"])

        # Only check history for ongoing quiz if in study mode
        if not is_quiz and mode == "study" and history:
            recent = history[-4:] if len(history) >= 4 else history
            for msg in recent:
                content = (msg.get("content") or "").lower()
                if any(w in content for w in ["quiz", "next question", "correct", "not quite"]):
                    is_quiz = True
                    break

        # Friendly mode = no quiz (unless explicitly requested in current message)
        if mode == "friendly" and not any(w in query_lower for w in ["quiz me", "test me", "ask me"]):
            is_quiz = False

        # Smart routing - Study mode always searches for sources
        query_type = classify_query(user_text)
        do_web = bool(req.allow_internet and query_type != 'no_web' and len(user_text) > 3)

        # Skip web search for quiz mode
        if is_quiz:
            do_web = False
        # Study mode: prioritize sources/citations (only if internet is enabled)
        elif mode == "study" and req.allow_internet:
            do_web = True
            query_type = 'requires_web'
        
        # Try API first (fast, 2s timeout)
        api_result = await api_service.try_api_first(user_text, user_loc)
        if api_result:
            # Use API data instead of web search
            context_parts.append(f"[API] {api_result['formatted']}")
        elif do_web and query_type in ('requires_web', 'suggests_web'):
            yield f"data: {json.dumps({'type': 'status', 'text': 'Checking latest info...'})}\n\n"
            fetch_start = time.time()
            results = rag_search(user_text, user_loc=user_loc, max_pages=1, max_chars=3000)
            # Filter out low-quality/irrelevant sources
            garbage_domains = {'fanfiction', 'wattpad', 'ao3', 'archiveofourown', 'biblegateway',
                               'biblehub', 'quora', 'pinterest', 'facebook', 'twitter', 'tiktok'}
            for r in results:
                if not (r.get("text") or r.get("snippet")):
                    continue
                url_lower = (r.get("url") or "").lower()
                if any(d in url_lower for d in garbage_domains):
                    continue
                sources.append(r)
                i = len(sources)
                excerpt = (r.get("text") or r.get("snippet") or "")[:200].strip()
                context_parts.append(f"[{i}] {r['title']} - {r['url']}\n{excerpt}")
            fetch_time = time.time() - fetch_start
            log_line(f"Web fetch: {fetch_time:.2f}s for {len(sources)} sources")
        
        # Try knowledge base search if no web results and user asks about knowledge/ebooks
        if not sources and any(word in query_lower for word in ["ebook", "book", "document", "knowledge", "file", "stored", "have you"]):
            yield f"data: {json.dumps({'type': 'status', 'text': 'Searching knowledge base...'})}\n\n"
            kb_results = search_knowledge_base(user_text, VECTOR_STORE)
            if kb_results:
                for r in kb_results:
                    sources.append(r)
                    i = len(sources)
                    excerpt = (r.get("text") or r.get("snippet") or "")[:200].strip()
                    context_parts.append(f"[KB-{i}] {r['title']}\n{excerpt}")
                log_line(f"KB search: {len(kb_results)} documents found")
        
        context = "\n\n".join(context_parts)
        
        # Build messages
        conversation_depth = len(history)
        
        # Core identity rules that ALWAYS apply
        identity_rules = (
            "CRITICAL RULES - NEVER BREAK THESE:\n"
            "1. You are Alfred, an AI chatbot. NOT a butler. NEVER say 'sir', 'madam', 'master', 'household', or 'mansion'.\n"
            "2. NEVER invent fictional people or scenarios. If you don't know someone, say 'I don't know who that is.'\n"
            "3. NEVER mention 'knowledge cutoff', 'training data', 'limitations', or 'as of my last update'. If asked what you can do, just list features.\n"
            "4. NEVER say 'you repeated yourself' or accuse user of repeating. Each message is fresh.\n"
            "5. Stay calm. No exclamation marks. Minimal apologies.\n"
        )

        # Mode-specific citation rules
        if mode == "study":
            identity_rules += "6. Cite sources as [1], [2] ONLY if directly relevant. Never invent citations.\n"
        else:
            identity_rules += "6. NEVER use citations like [1], [2]. Just answer naturally.\n"

        if is_quiz:
            system = identity_rules + "\nQUIZ MODE: Ask ONE short question, end with '?' and STOP. When user answers: say 'Correct.' or 'Not quite, it's [answer].' then ask the next question. NEVER say 'you repeated yourself' or 'stuck in a loop' - each answer is unique. No citations."
        elif mode == "study":
            # Study mode: concise explanations, cite only when relevant
            system = identity_rules + "\nYou are Alfred in Study Mode. HARD LIMIT: 3-5 sentences. Stop after 5 sentences even if incomplete. Cite [1], [2] only if source directly answers - otherwise no citations."
        else:
            # Friendly mode: short, no citations ever
            system = identity_rules + "\nYou are Alfred. 2-3 sentences max. NEVER use [1], [2] or any citations. No formatting. Just answer like a friend."
        
        messages = [{"role": "system", "content": system}]
        messages.append({"role": "system", "content": f"Current date/time: {current_dt}"})
        
        # SMART lazy-load: only inject memory sections relevant to this query (cuts lag)
        facts = []
        
        # Check what the user is asking about, inject ONLY that data
        if any(word in query_lower for word in ["dog", "pet", "animal", "married", "single", "family", "husband", "wife", "children", "name", "breed"]):
            if mem.get("family", {}).get("status"):
                facts.append(f"Status: {mem['family']['status']}")
            if mem.get("family", {}).get("children"):
                kids = ", ".join(mem['family']['children'])
                facts.append(f"Children: {kids}")
            if mem.get("dogs"):
                dogs_str = "; ".join([f"{d.get('name', '?')} ({d.get('type', 'unknown')}, {d.get('color', '?')}, age {d.get('age', '?')})" for d in mem['dogs']])
                facts.append(f"Dogs: {dogs_str}")
        
        if any(word in query_lower for word in ["tv", "show", "watch", "netflix", "hulu"]):
            if mem.get("interests", {}).get("favorite_tv"):
                tv_str = ", ".join(mem['interests']['favorite_tv'][:6])
                facts.append(f"Favorite TV: {tv_str}")
        
        if any(word in query_lower for word in ["music", "song", "artist", "listen", "spotify"]):
            if mem.get("interests", {}).get("favorite_music"):
                music_str = ", ".join(mem['interests']['favorite_music'][:8])
                facts.append(f"Favorite music: {music_str}")
        
        if any(word in query_lower for word in ["food", "eat", "like", "cook", "dish"]):
            if mem.get("interests", {}).get("food_likes"):
                food_str = ", ".join(mem['interests']['food_likes'][:5])
                facts.append(f"Food likes: {food_str}")
        
        if any(word in query_lower for word in ["project", "build", "code", "python", "react", "framework", "app", "chatbot", "past"]):
            if mem.get("tech_stack", {}).get("projects"):
                current = [p.get("name") for p in mem['tech_stack']['projects']]
                facts.append("Current projects: " + " | ".join(current))
            if mem.get("tech_stack", {}).get("past_projects"):
                past = [p.get("name") for p in mem['tech_stack']['past_projects']]
                facts.append("Past projects: " + " | ".join(past))
        
        if any(word in query_lower for word in ["morning", "routine", "wake", "day", "daily"]):
            if mem.get("daily_routine", {}).get("morning"):
                morning = mem['daily_routine']['morning'].get("actions", [])
                if morning:
                    facts.append("Morning: " + ", ".join(morning))
        
        if any(word in query_lower for word in ["hobby", "interest", "enjoy", "like to", "love", "sticker", "craft"]):
            if mem.get("interests", {}).get("hobbies"):
                hobbies = ", ".join(mem['interests']['hobbies'])
                facts.append(f"Hobbies: {hobbies}")
        
        # Always include name/location as baseline
        # Removed: don't force name/location on every response
        # if mem.get("name"):
        #     facts.insert(0, f"Name: {mem['name']}")
        # if user_loc:
        #     facts.insert(1, f"Location: {user_loc}")
        
        if facts:
            fact_msg = "FACTS (reference, do NOT hallucinate): " + " | ".join(facts)
            messages.append({"role": "system", "content": fact_msg})
        
        if context and mode == "study":
            user_text_with_context = (
                f"Web sources:\n{context}\n\n"
                f"User: {user_text}\n\n"
                f"Cite with [1], [2] only if directly relevant."
            )
        else:
            user_text_with_context = user_text
        
        messages += history[-20:]
        messages.append({"role": "user", "content": user_text_with_context})
        
        # Prepare sources for UI
        ui_sources = [
            {
                "i": i + 1,
                "title": s.get("title", "") or "(link)",
                "host": re.sub(r"^https?://([^/]+)/?.*", r"\1", s.get("url","")) if s.get("url") else "knowledge-base",
                "url": s.get("url",""),
            }
            for i, s in enumerate(sources)
        ]
        
        if ui_sources:
            yield f"data: {json.dumps({'type': 'sources', 'sources': ui_sources})}\n\n"
        
        # Stream LLM
        url = f"{OLLAMA_URL}/api/chat"
        payload = {
            "model": MODEL,
            "messages": messages,
            "stream": True,
            "keep_alive": "24h",
            "options": {
                "temperature": 0.4,
                "top_k": 20,
                "top_p": 0.7,
                "num_threads": 6,          
                "repeat_penalty": 1.15,
            }
        }

        full_text = ""
        llm_start = time.time()
        try:
            with requests.post(url, json=payload, stream=True, timeout=120) as r:
                r.raise_for_status()
                for line in r.iter_lines():
                    if line:
                        data = json.loads(line)
                        if chunk := data.get("message", {}).get("content"):
                            full_text += chunk
                            yield f"data: {json.dumps({'type': 'token', 'text': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'token', 'text': f'Error: {e}'})}\n\n"
        
        llm_time = time.time() - llm_start
        total_time = time.time() - start_time
        
        response_length = len(full_text)

        log_line(
            f"TIMING total={total_time:.2f}s llm={llm_time:.2f}s "
            f"ctx_chars={len(context)} query_type={query_type} sources={len(sources)} "
            f"response_chars={response_length} conversation_depth={conversation_depth}"
        )
        log_line(f"USER: {req.text}")
        log_line(f"ALFRED: {full_text}")
        
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/memory")
def memory_dump():
    mem_file = APP_DIR / "data" / "memory.json"
    with open(mem_file, "r", encoding="utf-8") as f:
        return JSONResponse(json.load(f))

@app.post("/stt")
async def stt(request: Request):
    audio_bytes = await request.body()
    if not audio_bytes:
        return {"ok": False, "msg": "No audio received"}
    return transcribe_bytes(audio_bytes)