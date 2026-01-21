# server/search.py - minimal, generic web search + cleaner + JS fallback
# - No API keys required (DuckDuckGo via duckduckgo-search)
# - requests first; fallback to Playwright only if needed (Cloudflare/JS-heavy)
# - Lowercases & condenses text, caps per-page length, returns top 5 sources
# - Optional rag_search_stream(...) yields docs one-by-one for server-side streaming

from __future__ import annotations

import re
from typing import List, Dict, Generator, Optional
from urllib.parse import urlparse
import ipaddress

import requests
from ddgs import DDGS
from bs4 import BeautifulSoup

# --- minimal query cleaner ---
_URL_IN_TEXT = re.compile(r"https?://\S+", re.I)
_INSTRUCTIONY = re.compile(
    r"\b(?:search(?: online)?|tell me|can you|please|find|show me|"
    r"what(?:'s| is)|give me|look up)\b", re.I
)

def _prep_query(q: str) -> str:
    q = (q or "").strip()
    q = _URL_IN_TEXT.sub("", q)
    q = _INSTRUCTIONY.sub("", q)
    q = re.sub(r"\s+", " ", q).strip()
    return q


# ---------- URL Security Guard (Task 5) ----------
def is_safe_url(url: str) -> bool:
    """
    Block localhost and private IPs to prevent SSRF attacks.
    Returns True if URL is safe to fetch, False otherwise.
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        
        if not hostname:
            return False
            
        # Block localhost variants
        if hostname.lower() in ['localhost', '127.0.0.1', '0.0.0.0', '::1']:
            return False
        
        # Try to parse as IP address
        try:
            ip = ipaddress.ip_address(hostname)
            # Block private/loopback/link-local IPs
            return ip.is_global
        except ValueError:
            # Not an IP, it's a hostname - allow it
            # (DNS rebinding is still possible but requires more complex checks)
            return True
            
    except Exception:
        return False  # Invalid URL format


# ---------- Tunables ----------
_CLOUDFLARE_HINT = re.compile(r"(just a moment|cloudflare|checking your browser)", re.I)
_MIN_BODY_CHARS = 800          # if below this after requests, try JS render
_MAX_PER_PAGE_CHARS = 6000     # cap raw text per page to avoid big prompts
_TIMEOUT = (7, 20)             # requests (connect, read) timeouts
_MAX_RESULTS = 10              # initial DDG fetch cap before trimming to top-5
_TOP_K = 5                     # final max number of URLs to fetch
_HEADERS = {
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0 Safari/537.36"
    )
}

# ---------- Search ----------

def web_search(query: str, max_results: int = _MAX_RESULTS) -> List[Dict]:
    """
    DuckDuckGo text search (no API key).
    Small robustness: retry with very light variation if the first call returns nothing.
    Returns a de-duplicated list of {title,url,snippet}.
    """
    q = _prep_query(query)

    if len(q) < 3:
        return []
    
    # Add smart site hints for common query types
    q_lower = q.lower()
    if "python" in q_lower and any(word in q_lower for word in ["version", "release", "latest", "3."]):
        q += " site:python.org"
    elif any(word in q_lower for word in ["showtimes", "movies", "playing", "theaters"]):
        q += " (site:fandango.com OR site:imdb.com)"
    elif any(word in q_lower for word in ["hurricane", "tropical storm", "weather", "forecast"]):
        q += " (site:nhc.noaa.gov OR site:weather.gov)"
    elif "npm" in q_lower or ("node" in q_lower and "js" in q_lower):
        q += " site:npmjs.com"
    elif "github" in q_lower or ("repository" in q_lower or "repo" in q_lower):
        q += " site:github.com"

    def _ddg_text(qtext: str, n: int) -> List[Dict]:
        out: List[Dict] = []
        with DDGS() as ddgs:
            # region/safesearch params are intentionally neutral; timelimit=None for breadth
            fresh = any(k in (qtext or "").lower() for k in ("today","latest","breaking","hurricane","storm","showtimes","release"))
            for r in ddgs.text(qtext, max_results=n, region="wt-wt", safesearch="Off", timelimit=("d" if fresh else None)):
                out.append({
                    "title": (r.get("title") or "").strip(),
                    "url": (r.get("href") or "").strip(),
                    "snippet": (r.get("body") or "").strip(),
                })
        # de-dupe on host+path
        seen = set()
        uniq: List[Dict] = []
        for x in out:
            u = x.get("url") or ""
            if not u:
                continue
            parsed = urlparse(u)
            key = (parsed.netloc, parsed.path)
            if key not in seen:
                seen.add(key)
                uniq.append(x)
        return uniq

    # pass 1
    results = _ddg_text(q, max_results)
    if results:
        return results

    # pass 2: a gentle variation to shake different results loose
    # (keeps it generic; not tied to any vertical)
    alt_q = f"{q} latest updates"
    results = _ddg_text(alt_q, max_results)
    return results or []

# ---------- Clean & Fetch ----------

def _clean_html_to_text(html: str) -> str:
    """
    Strip scripts/styles/nav/media; collapse whitespace; lowercase; cap length.
    """
    soup = BeautifulSoup(html or "", "lxml")

    # remove noisy elements
    for tag in soup([
        "script", "style", "noscript", "header", "footer", "nav",
        "svg", "img", "video", "source", "iframe", "form", "aside"
    ]):
        tag.decompose()

    # trim attributes that often add weight without value
    for el in soup(True):
        for attr in list(el.attrs.keys()):
            if attr.startswith("data-") or attr in ("class", "id", "style", "onclick", "onload"):
                del el.attrs[attr]

    # prefer main/article if present
    main = soup.find(["main", "article"]) or soup.body or soup
    text = main.get_text(separator=" ", strip=True) if main else soup.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip().lower()

    if len(text) > _MAX_PER_PAGE_CHARS:
        text = text[:_MAX_PER_PAGE_CHARS] + " ..."
    return text

def _guess_title(html: str) -> str:
    try:
        soup = BeautifulSoup(html or "", "lxml")
        if soup.title and soup.title.string:
            return soup.title.string.strip()
    except Exception:
        pass
    return ""

def _requests_fetch(url: str) -> Dict:
    r = requests.get(url, headers=_HEADERS, timeout=_TIMEOUT, allow_redirects=True)
    r.raise_for_status()
    html = r.text or ""
    return {
        "title": _guess_title(html) or url,
        "url": url,
        "text": _clean_html_to_text(html),
        "raw_html": html,
    }

def _playwright_fetch(url: str) -> Dict:
    """
    Render with Playwright only when needed (Cloudflare/JS-heavy pages).
    One-time setup on your machine:
      python -m playwright install chromium
    """
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            ctx = browser.new_context(user_agent=_HEADERS["user-agent"])
            page = ctx.new_page()
            page.set_default_timeout(20000)
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(800)  # small settle window for SPA content
            html = page.content()
        finally:
            browser.close()
    return {
        "title": _guess_title(html) or url,
        "url": url,
        "text": _clean_html_to_text(html),
        "raw_html": html,
    }

def fetch_url(url: str, max_chars: int = _MAX_PER_PAGE_CHARS) -> Dict:
    """
    Fetch one URL via requests, then Playwright fallback if body is empty/blocked.
    Returns {title,url,text,snippet}.
    Includes URL security check to prevent SSRF.
    """
    # Security check (Task 5)
    if not is_safe_url(url):
        return {
            "title": "Blocked",
            "url": url,
            "text": "",
            "snippet": "URL blocked for security reasons (localhost/private IP)"
        }
    
    try:
        doc = _requests_fetch(url)
        looks_cf = bool(_CLOUDFLARE_HINT.search(doc.get("raw_html", "")))
        too_short = len(doc.get("text", "")) < _MIN_BODY_CHARS
        if looks_cf or too_short:
            doc = _playwright_fetch(url)
    except Exception:
        # as a last resort, attempt playwright once
        try:
            doc = _playwright_fetch(url)
        except Exception:
            return {"title": "", "url": url, "text": "", "snippet": ""}

    text = (doc.get("text") or "")[:max_chars]
    return {
        "title": doc.get("title") or url,
        "url": url,
        "text": text,
        "snippet": text[:300],
    }

# ---------- Orchestration (non-stream + stream) ----------

def rag_search(
    query: str,
    user_loc: str = "",
    max_pages: int = 3,           # kept for signature compatibility with existing code
    max_chars: int = _MAX_PER_PAGE_CHARS
) -> List[Dict]:
    """
    Search + fetch + clean. Keeps the API your main.py expects.
    Returns a list of up to _TOP_K items:
      [{ title, url, snippet, text }, ...]
    """
    # Clean query FIRST before doing anything else
    q = _prep_query(query)
    
    # Only add location for truly LOCAL queries (restaurants, movies, weather, etc.)
    # Don't add location for technical/general knowledge queries
    is_local_query = any(word in q.lower() for word in [
        "near", "restaurant", "movie", "theater", "showtimes", 
        "weather", "store", "shop", "open", "hours", "nearby"
    ])
    
    if is_local_query and user_loc and user_loc.lower() not in q.lower():
        q = f"{q} near {user_loc}"

    results = web_search(q, max_results=_MAX_RESULTS)

    # pick up to _TOP_K distinct URLs
    picked: List[Dict] = []
    for r in results:
        if len(picked) >= _TOP_K:
            break
        u = r.get("url")
        if not u:
            continue
        picked.append({
            "title": r.get("title", ""),
            "url": u,
            "snippet": r.get("snippet", ""),
        })

    # fetch all URLs in parallel (5x faster!)
    import concurrent.futures
    
    out: List[Dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # Submit all fetches at once
        future_to_item = {
            executor.submit(fetch_url, item["url"], max_chars): item 
            for item in picked
        }
        
        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_item):
            item = future_to_item[future]
            try:
                doc = future.result()
                if not (doc.get("text") or doc.get("snippet")):
                    continue
                out.append({
                    "title": doc["title"] or item["title"] or "(link)",
                    "url": item["url"],
                    "snippet": doc.get("snippet") or item.get("snippet", ""),
                    "text": doc.get("text") or "",
                })
            except Exception:
                continue
    return out


def rag_search_stream(
    query: str,
    user_loc: str = "",
    max_chars: int = _MAX_PER_PAGE_CHARS
) -> Generator[Dict, None, None]:
    """
    OPTIONAL streaming version: yields each fetched document dict as soon as it's ready.
    Usage: for doc in rag_search_stream(q): yield doc
    Your FastAPI route can convert each yielded dict to SSE/NDJSON to populate UI incrementally.
    """
    # Clean query FIRST before doing anything else
    q = _prep_query(query)
    
    # Only add location for truly LOCAL queries
    is_local_query = any(word in q.lower() for word in [
        "near", "restaurant", "movie", "theater", "showtimes", 
        "weather", "store", "shop", "open", "hours", "nearby"
    ])
    
    if is_local_query and user_loc and user_loc.lower() not in q.lower():
        q = f"{q} near {user_loc}"

    results = web_search(q, max_results=_MAX_RESULTS)

    # select up to _TOP_K URLs
    picked: List[str] = []
    meta: Dict[str, Dict] = {}
    for r in results:
        if len(picked) >= _TOP_K:
            break
        u = r.get("url")
        if not u:
            continue
        picked.append(u)
        meta[u] = {
            "title": r.get("title", ""),
            "snippet": r.get("snippet", "")
        }

    for u in picked:
        try:
            doc = fetch_url(u, max_chars=max_chars)
            if not (doc.get("text") or doc.get("snippet")):
                continue
            yield {
                "title": doc.get("title") or meta[u].get("title") or "(link)",
                "url": u,
                "snippet": doc.get("snippet") or meta[u].get("snippet", ""),
                "text": doc.get("text") or "",
            }
        except Exception:
            # skip on single-page failure; continue streaming others
            continue