# services/chat_service.py
"""
ChatService: Handles all chat-related business logic
Extracted from main.py for better testability and maintainability
"""

import json
import requests
import re
import time
from typing import List, Dict, Any, Optional, Generator
from datetime import datetime

class ChatService:
    """Handles chat operations, web search, and LLM interactions"""
    
    def __init__(self, ollama_url: str, model: str):
        self.ollama_url = ollama_url
        self.model = model
        self._search_cache: Dict[str, tuple] = {}
        
    def get_cached_search(self, query: str, cache_ttl: int) -> Optional[List[Dict]]:
        """Get cached search results if still fresh"""
        if query in self._search_cache:
            results, timestamp = self._search_cache[query]
            if time.time() - timestamp < cache_ttl:
                return results
            else:
                del self._search_cache[query]
        return None
    
    def cache_search(self, query: str, results: List[Dict]) -> None:
        """Cache search results with timestamp"""
        self._search_cache[query] = (results, time.time())
    
    def needs_fresh_web(self, txt: str) -> bool:
        """Check if query needs real-time web data"""
        _NEWSY = re.compile(
            r"\b("
            r"(?:what(?:'s| is)|weather|forecast|temp(?:erature)?).*?(?:today|tonight|now|right now|this morning|this afternoon|this evening)|"
            r"today(?:'s| is)?\s+(?:weather|date|forecast|news|temp(?:erature)?)|"
            r"(?:latest|breaking|current|recent)\s+(?:news|update|info)|"
            r"showtimes?|movies?\s+playing|what(?:'s| is)\s+playing|theaters?|schedule|"
            r"traffic|score|stock\s+price|release\s+date|concert|event"
            r")\b",
            re.I
        )
        return bool(_NEWSY.search(txt or ""))
    
    def is_explicit_search(self, txt: str) -> bool:
        """Check if query explicitly requests a search"""
        _EXPLICIT_SEARCH = re.compile(
            r"\b(search|look up|find|google|web)\b"
            r"|^(?:show|list|get|pull)\b",
            re.I
        )
        return bool(_EXPLICIT_SEARCH.search(txt or ""))
    
    def build_system_messages(self, current_dt: str, user_loc: str = "", user_name: str = "") -> List[Dict[str, str]]:
        """Build system messages for LLM context"""
        system = "You are Alfred. Match response length to user's message. Short input = short reply (1 sentence). Only expand when asked or when explaining complex topics. Never add unsolicited facts or trivia."
        
        messages = [{"role": "system", "content": system}]
        messages.append({"role": "system", "content": f"Current date/time: {current_dt}"})
        
        if user_loc:
            messages.append({"role": "system", "content": f"User location: {user_loc}"})
        if user_name:
            messages.append({"role": "system", "content": f"User's name: {user_name}"})
        
        return messages
    
    def build_context_parts(self, sources: List[Dict[str, str]]) -> List[str]:
        """Build context parts from sources for LLM prompt"""
        context_parts = []
        for i, source in enumerate(sources, 1):
            title = source.get("title", "(link)")
            url = source.get("url", "")
            text = source.get("text", "") or source.get("snippet", "")
            excerpt = text[:200].strip()
            
            if url:
                piece = f"[{i}] {title} - {url}\n{excerpt}"
            else:
                piece = f"[{i}] {title}\n{excerpt}"
            
            context_parts.append(piece)
        
        return context_parts
    
    def build_user_message(self, user_text: str, context: str) -> str:
        """Build the user message with optional context"""
        if context:
            return (
                f"Web sources:\n{context}\n\n"
                f"User: {user_text}\n\n"
                f"Use web sources if relevant. Cite with [1], [2]."
            )
        return user_text
    
    def prepare_ui_sources(self, sources: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Prepare sources for frontend display"""
        ui_sources = []
        for i, s in enumerate(sources, 1):
            title = s.get("title", "") or "(link)"
            url = s.get("url", "")
            host = re.sub(r"^https?://([^/]+)/?.*", r"\1", url) if url else ""
            
            ui_sources.append({
                "i": i,
                "title": title,
                "host": host,
                "url": url,
            })
        
        return ui_sources
    
    def ollama_chat(self, messages: List[Dict[str, str]]) -> str:
        """Send messages to Ollama (non-streaming)"""
        url = f"{self.ollama_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }
        r = requests.post(url, json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        return data.get("message", {}).get("content", "")
    
    def ollama_chat_stream(self, messages: List[Dict[str, str]]) -> Generator[str, None, None]:
        """Stream tokens from Ollama"""
        url = f"{self.ollama_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True
        }
        
        try:
            with requests.post(url, json=payload, stream=True, timeout=120) as r:
                r.raise_for_status()
                for line in r.iter_lines():
                    if line:
                        data = json.loads(line)
                        if chunk := data.get("message", {}).get("content"):
                            yield chunk
        except requests.exceptions.ReadTimeout:
            yield "\n\n[TIMEOUT] The AI is taking longer than expected (likely processing a very complex query). Please try again with a simpler question, or check that Ollama is running properly."
        except Exception as e:
            yield f"\n\n[ERROR] {str(e)}"