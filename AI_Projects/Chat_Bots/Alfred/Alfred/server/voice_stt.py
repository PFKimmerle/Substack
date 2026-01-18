# server/voice_stt.py
from faster_whisper import WhisperModel
import tempfile, subprocess, os, shutil

# Load a tiny CPU model (first call may download weights)
model = WhisperModel("tiny", device="cpu")

FFMPEG = shutil.which("ffmpeg")

def _convert_to_wav(webm_path: str) -> tuple[bool, str]:
    if not FFMPEG:
        return False, "FFmpeg not found on PATH. Install it (e.g., `winget install Gyan.FFmpeg`) and reopen your terminal."

    wav_path = webm_path.replace(".webm", ".wav")
    proc = subprocess.run(
        [FFMPEG, "-y", "-i", webm_path, "-ac", "1", "-ar", "16000", wav_path],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    if proc.returncode != 0 or not os.path.exists(wav_path):
        return False, "Audio conversion failed. Check that FFmpeg is installed and accessible."
    return True, wav_path

def transcribe_bytes(audio_bytes: bytes):
    # Write raw browser blob to a temp .webm file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        webm_path = tmp.name

    ok, out = _convert_to_wav(webm_path)
    if not ok:
        try:
            os.remove(webm_path)
        except Exception:
            pass
        return {"ok": False, "text": "", "msg": out}

    wav_path = out
    try:
        segments, _ = model.transcribe(wav_path)
        text = " ".join(s.text.strip() for s in segments).strip()
        return {"ok": True, "text": text}
    except Exception as e:
        return {"ok": False, "text": "", "msg": f"Transcription error: {e}"}
    finally:
        # Clean up temp files
        for p in (webm_path, wav_path):
            try:
                os.remove(p)
            except Exception:
                pass
