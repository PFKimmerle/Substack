const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const modeToggle = document.getElementById("modeToggle");
const allowInternet = document.getElementById("allowInternet");
const allowVoice = document.getElementById("allowVoice");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");
const waveformContainer = document.getElementById("waveformContainer");
const waveform = document.getElementById("waveform");
const stopSpeakBtn = document.getElementById("stopSpeakBtn");

let history = [];
let speechInitialized = false;

// Initialize speech synthesis on first interaction (required by browsers)
function initSpeech() {
  if (!speechInitialized && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.cancel();
    speechInitialized = true;
  }
}

// === FREQUENCY BARS SETUP ===
const barCount = 50; // More bars for full width
const bars = [];

// Create frequency bars
for (let i = 0; i < barCount; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  waveform.appendChild(bar);
  bars.push({
    element: bar,
    targetHeight: 8,
    currentHeight: 8,
    baseFrequency: Math.random() * 0.5 + 0.5
  });
}

let isActive = false;
let animationFrame = null;

// Animate bars
function animateBars() {
  const time = Date.now() / 1000;
  
  bars.forEach((bar, i) => {
    // Smooth transition to target
    bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.15;
    
    // Add subtle wave motion when idle
    const idleWave = Math.sin(time * 1.5 + i * 0.2) * 2;
    const finalHeight = Math.max(4, bar.currentHeight + (isActive ? 0 : idleWave));
    
    bar.element.style.height = finalHeight + 'px';
  });
  
  animationFrame = requestAnimationFrame(animateBars);
}

// Start animation loop
animateBars();

// Trigger bar pulses (simulates different frequencies)
function pulseBars() {
  if (!isActive) return;
  
  bars.forEach((bar, i) => {
    // Different bars respond differently (simulating frequency spectrum)
    const intensity = Math.random() * bar.baseFrequency;
    const minHeight = 10;
    const maxHeight = 60;
    bar.targetHeight = minHeight + intensity * (maxHeight - minHeight);
  });
}

// Set bars to idle state
function idleBars() {
  bars.forEach(bar => {
    bar.targetHeight = 8;
  });
}

// Set bars to active state
function activateBars() {
  bars.forEach(bar => {
    bar.targetHeight = 30 + Math.random() * 20;
  });
}

// Set initial idle state
waveformContainer.classList.add('idle');

// === STATUS ===
function setStatus(text, active = true) {
  statusText.textContent = text;
  statusPill.classList.toggle('active', active);
}

// === THEME TOGGLE ===
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeIcon.textContent = isDark ? 'light_mode' : 'bedtime';
});

// === MODE TOGGLE (FRIENDLY vs STUDY) ===
let currentMode = 'friendly';

if (modeToggle) {
  currentMode = localStorage.getItem('alfredMode') || 'friendly';
  
  function updateModeToggle() {
    if (!modeToggle) return;
    modeToggle.dataset.mode = currentMode;
    const icon = modeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = currentMode === 'study' ? 'cognition_2' : 'person_heart';
    }
  }

  updateModeToggle();

  modeToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    currentMode = currentMode === 'friendly' ? 'study' : 'friendly';
    localStorage.setItem('alfredMode', currentMode);
    updateModeToggle();
  });
}

// === VOICE SETUP ===
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

function speak(text) {
  if (!text || !("speechSynthesis" in window)) {
    console.log("Speech not available or no text");
    return;
  }
  
  // Cancel any existing speech
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  // Resume if suspended (Chrome bug fix)
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const speakAfterVoicesLoad = () => {
    console.log("Starting speech...");
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.length);

    const preferredNames = [
      "Google UK English Male",
      "Microsoft Ryan (Natural) - English (United Kingdom)",
      "Microsoft George - English (United Kingdom)",
      "Daniel"
    ];
    let v = voices.find(voice => 
      preferredNames.some(n => voice.name.toLowerCase() === n.toLowerCase())
    );

    if (!v) {
      v = voices.find(voice =>
        /en-(GB|AU)/i.test(voice.lang) && /male|ryan|daniel|george/i.test(voice.name)
      );
    }

    if (v) u.voice = v;
    else u.lang = "en-GB";

    u.pitch = 1;
    u.rate = 1;

    u.onstart = () => {
      console.log("Speech started");
      setStatus('Speaking...');
      waveformContainer.classList.remove('idle');
      waveformContainer.classList.add('active');
      isActive = true;
      activateBars();
      stopSpeakBtn.style.display = 'flex';
      
      // Start pulsing bars periodically
      pulseInterval = setInterval(pulseBars, 150);
    };

    u.onboundary = () => {
      // Pulse on word boundaries for more realistic feel
      pulseBars();
    };

    u.onend = () => {
      console.log("Speech ended");
      waveformContainer.classList.remove('active');
      waveformContainer.classList.add('idle');
      isActive = false;
      idleBars();
      setStatus('Ready', false);
      stopSpeakBtn.style.display = 'none';
      
      if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
      }
    };

    u.onerror = (e) => {
      console.error("Speech error:", e);
      waveformContainer.classList.remove('active');
      waveformContainer.classList.add('idle');
      isActive = false;
      idleBars();
      setStatus('Ready', false);
      stopSpeakBtn.style.display = 'none';
      
      if (pulseInterval) {
        clearInterval(pulseInterval);
        pulseInterval = null;
      }
    };

    console.log("Speaking text:", text.substring(0, 50) + "...");
    window.speechSynthesis.speak(u);
  };

  // Wait for voices to load with longer timeout and logging
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    console.log("Waiting for voices to load...");
    setTimeout(() => {
      console.log("Attempting speech after voice load delay");
      speakAfterVoicesLoad();
    }, 1000); // Increased from 500ms to 1000ms
  } else {
    speakAfterVoicesLoad();
  }
}

let pulseInterval = null;

// === STOP SPEAK BUTTON ===
stopSpeakBtn.addEventListener('click', () => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    waveformContainer.classList.remove('active');
    waveformContainer.classList.add('idle');
    isActive = false;
    idleBars();
    setStatus('Ready', false);
    stopSpeakBtn.style.display = 'none';
    
    if (pulseInterval) {
      clearInterval(pulseInterval);
      pulseInterval = null;
    }
  }
});

// === ADD MESSAGE ===
function addMsg(role, text, sources = []) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  
  // Use marked.js for assistant messages, plain text for user
  if (role === "assistant") {
    div.innerHTML = marked.parse(text);
  } else {
    div.innerText = text;
  }
  
  chat.appendChild(div);

  if (sources && sources.length && role === "assistant") {
    const details = document.createElement("details");
    details.className = "sources";

    const summary = document.createElement("summary");
    summary.textContent = `Sources (${sources.length})`;

    const content = document.createElement("div");
    content.className = "sources-content";
    
    sources.forEach(s => {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = `[${s.i}] ${s.title || s.host}`;
      content.appendChild(a);
    });

    details.appendChild(summary);
    details.appendChild(content);
    chat.appendChild(details);
  }

  chat.scrollTop = chat.scrollHeight;
}

// === SEND MESSAGE ===
async function send(fromVoice = false) {
  // Initialize speech synthesis on first user interaction
  initSpeech();
  
  const text = input.value.trim();
  if (!text) return;
  
  input.value = "";
  addMsg("user", text);
  history.push({ role: "user", content: text });

  setStatus("Thinking...");

  // Create placeholder for streaming response
  const div = document.createElement("div");
  div.className = "msg assistant";
  div.innerText = "";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  let sources = [];

  try {
    const res = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        allow_internet: !!allowInternet.checked,
        speak: false,
        mode: currentMode,
        history
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'status') {
              setStatus(data.text);
            } else if (data.type === 'sources') { 
              sources = data.sources;
            } else if (data.type === 'token') {
              fullText += data.text;
              div.innerHTML = marked.parse(fullText);
              chat.scrollTop = chat.scrollHeight;
            } else if (data.type === 'done') {
              setStatus('Ready', false);
              
              // Add sources dropdown after response
              if (sources && sources.length) {
                const details = document.createElement("details");
                details.className = "sources";
                const summary = document.createElement("summary");
                summary.textContent = `Sources (${sources.length})`;
                const content = document.createElement("div");
                content.className = "sources-content";
                
                sources.forEach(s => {
                  const a = document.createElement("a");
                  a.href = s.url;
                  a.target = "_blank";
                  a.rel = "noopener noreferrer";
                  a.textContent = `[${s.i}] ${s.title || s.host}`;
                  content.appendChild(a);
                });
                
                details.appendChild(summary);
                details.appendChild(content);
                chat.appendChild(details);
              }
              
              // Clean and speak
              // Clean markdown before speaking
              const clean = fullText
                .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
                .replace(/\*(.*?)\*/g, '$1')      // Remove italics
                .replace(/#{1,6}\s/g, '')         // Remove headers
                .replace(/\[\d+\]/g, '');         // Remove citations
              
              if (allowVoice.checked) {
                console.log("Attempting to speak response...", clean.substring(0, 50));
                speak(clean.trim());
              }
              
              history.push({ role: "assistant", content: fullText });
            }
          } catch (e) {
            console.error("Parse error:", e, line);
          }
        }
      }
    }
  } catch (err) {
    setStatus('Ready', false);
    div.innerText = "Sorry - request failed.";
    console.error(err);
  }
}

sendBtn.onclick = send;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

// === MIC (SPEECH-TO-TEXT) ===
micBtn.addEventListener("click", async () => {
  if (micBtn.classList.contains('recording')) return;
  
  try {
    setStatus('Listening...');
    micBtn.classList.add('recording');
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setStatus('Processing...');
      const blob = new Blob(chunks, { type: 'audio/webm' });

      try {
        const res = await fetch("/stt", {
          method: "POST",
          headers: { "Content-Type": "audio/webm" },
          body: blob
        });
        
        const data = await res.json();
        
        if (data.text) {
          input.value = data.text;
          setStatus('Ready', false);
          send();
        } else {
          setStatus('Ready', false);
          alert(data.msg || "Could not understand audio.");
        }
      } catch (err) {
        setStatus('Ready', false);
        alert("Voice transcription failed. Check server logs.");
        console.error(err);
      } finally {
        stream.getTracks().forEach((t) => t.stop());
        micBtn.classList.remove('recording');
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 3000);
    
  } catch (err) {
    setStatus('Ready', false);
    micBtn.classList.remove('recording');
    alert("Microphone access denied or unavailable.");
    console.error(err);
  }
});