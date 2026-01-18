# Local TTS using pyttsx3 (Windows voices)
import pyttsx3
_engine = None

def _get_engine():
    global _engine
    if _engine is None:
        _engine = pyttsx3.init()
        try:
            rate = _engine.getProperty('rate')
            _engine.setProperty('rate', int(rate*0.92))
        except Exception:
            pass
    return _engine

def set_voice(name_substring: str):
    eng = _get_engine()
    wanted = (name_substring or "").lower()
    for v in eng.getProperty('voices'):
        if wanted in (v.name or '').lower():
            eng.setProperty('voice', v.id)
            return {"ok": True, "voice": v.name}
    return {"ok": False, "msg": "Voice not found. Try /voice with part of the voice name (e.g., 'ryan')."}

def speak_text(text: str):
    eng = _get_engine()
    eng.say(text)
    eng.runAndWait()
    return {"ok": True}
