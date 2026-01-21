# app/utils/voice.py
from typing import Dict, Any
import tempfile, subprocess, os, shutil

# === TTS ===
try:
    import pyttsx3
    _engine = None
    
    def _get_engine():
        global _engine
        if _engine is None:
            _engine = pyttsx3.init()
            try:
                rate = _engine.getProperty('rate')
                _engine.setProperty('rate', int(rate*1.05))
            except Exception:
                pass
        return _engine
    
    def set_voice(name_substring: str) -> Dict[str, Any]:
        eng = _get_engine()
        wanted = (name_substring or "").lower()
        for v in eng.getProperty('voices'):
            if wanted in (v.name or '').lower():
                eng.setProperty('voice', v.id)
                return {"ok": True, "voice": v.name}
        return {"ok": False, "msg": "Voice not found"}
    
    def speak_text(text: str) -> Dict[str, Any]:
        eng = _get_engine()
        eng.say(text)
        eng.runAndWait()
        return {"ok": True}
except ImportError:
    def speak_text(text: str) -> Dict[str, Any]:
        return {"ok": False, "msg": "pyttsx3 not installed"}
    def set_voice(name_substring: str) -> Dict[str, Any]:
        return {"ok": False, "msg": "pyttsx3 not installed"}

# === STT ===
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny", device="cpu")
    FFMPEG = shutil.which("ffmpeg")
    
    def _convert_to_wav(webm_path: str) -> tuple:
        if not FFMPEG:
            return False, "FFmpeg not found"
        wav_path = webm_path.replace(".webm", ".wav")
        proc = subprocess.run(
            [FFMPEG, "-y", "-i", webm_path, "-ac", "1", "-ar", "16000", wav_path],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        if proc.returncode != 0 or not os.path.exists(wav_path):
            return False, "Audio conversion failed"
        return True, wav_path
    
    def transcribe_bytes(audio_bytes: bytes) -> Dict[str, Any]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(audio_bytes)
            tmp.flush()
            webm_path = tmp.name
        
        ok, out = _convert_to_wav(webm_path)
        if not ok:
            try: os.remove(webm_path)
            except: pass
            return {"ok": False, "text": "", "msg": out}
        
        wav_path = out
        try:
            segments, _ = model.transcribe(wav_path)
            text = " ".join(s.text.strip() for s in segments).strip()
            return {"ok": True, "text": text}
        except Exception as e:
            return {"ok": False, "text": "", "msg": f"Transcription error: {e}"}
        finally:
            for p in (webm_path, wav_path):
                try: os.remove(p)
                except: pass
except ImportError:
    def transcribe_bytes(audio_bytes: bytes) -> Dict[str, Any]:
        return {"ok": False, "text": "", "msg": "STT not installed"}