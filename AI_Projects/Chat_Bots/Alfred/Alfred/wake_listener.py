import time, queue, os, tempfile, requests, numpy as np
import sounddevice as sd
from openwakeword import Model
from faster_whisper import WhisperModel
import soundfile as sf

# -------- Config --------
SERVER_URL = "http://127.0.0.1:8790"   # our FastAPI server port (NO conflict)
WAKE_THRESHOLD = 0.5                   # raise to 0.6-0.7 if too sensitive
SAMPLE_RATE = 16000
CHANNELS = 1
POST_SILENCE_SEC = 0.8
MAX_UTTERANCE_SEC = 30
ALLOW_INTERNET = False                 # set True to allow web search by default
SPEAK_REPLY = True                     # let server TTS speak reply
WHISPER_MODEL = "small"                # tiny/base/small/medium
# ------------------------

print("[wake] loading wake model...")
wake_model = Model()
print("[wake] loading whisper model...")
whisper = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")

audio_q = queue.Queue()

def audio_callback(indata, frames, time_info, status):
    audio_q.put(indata.copy())

def rms(y): return float(np.sqrt(np.mean(np.square(y), axis=0)))

def detect_wake(audio_block):
    prob = max(wake_model.predict(audio_block.flatten()).values())
    return prob

def record_until_silence():
    print("[rec] recording... speak now")
    buf = []
    start = time.time()
    silence_start = None
    while True:
        chunk = audio_q.get()
        buf.append(chunk)
        energy = rms(chunk)
        if energy > 0.015:
            silence_start = None
        else:
            silence_start = silence_start or time.time()
            if time.time() - silence_start >= POST_SILENCE_SEC:
                break
        if time.time() - start > MAX_UTTERANCE_SEC:
            break
    return np.concatenate(buf, axis=0)

def transcribe(audio_np):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, audio_np, SAMPLE_RATE, subtype="PCM_16")
        path = tmp.name
    try:
        segments, _ = whisper.transcribe(path, beam_size=1)
        return "".join([s.text for s in segments]).strip()
    finally:
        try: os.remove(path)
        except: pass

def ask_server(text):
    print(f"[ask] {text}")
    try:
        r = requests.post(f"{SERVER_URL}/chat", json={
            "text": text,
            "allow_internet": bool(ALLOW_INTERNET),
            "speak": bool(SPEAK_REPLY),
            "history": []
        }, timeout=120)
        r.raise_for_status()
        print("[alfred]", r.json().get("text","").strip())
    except Exception as e:
        print("[err] server call failed:", e)

def main():
    print("[wake] listening for: hey alfred")
    block_len = int(SAMPLE_RATE * 0.5)
    ring = np.zeros((block_len, CHANNELS), dtype=np.float32)
    idx = 0
    with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, dtype="float32", callback=audio_callback):
        while True:
            chunk = audio_q.get()
            n = len(chunk)
            if n >= block_len:
                ring = chunk[-block_len:]
            else:
                end = idx + n
                if end <= block_len:
                    ring[idx:end] = chunk
                else:
                    first = block_len - idx
                    ring[idx:] = chunk[:first]
                    ring[:(n-first)] = chunk[first:]
                idx = (idx + n) % block_len

            prob = detect_wake(ring)
            if prob >= WAKE_THRESHOLD:
                try: requests.post(f"{SERVER_URL}/wake", timeout=3)
                except: pass
                utter = record_until_silence()
                text = transcribe(utter)
                if text: ask_server(text)
                else:    print("[rec] empty transcription")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[bye] exiting")
