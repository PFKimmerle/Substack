// web/src/js/app.js
// Works with IDs: #chat, #userInput, #sendBtn, #status
// Uses your modules: getPlantContext/detectPlantName + fetchGroqResponse

import { getPlantContext, detectPlantName } from './api/plantApi.js';
import { fetchGroqResponse } from './api/llmApi.js';

const LLM_CACHE_KEY = 'apexvora_cache';

function loadLlmCache() {
  try { return JSON.parse(localStorage.getItem(LLM_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function saveLlmCache(obj) {
  try { localStorage.setItem(LLM_CACHE_KEY, JSON.stringify(obj)); } catch {}
}

function appendMessage(chatEl, role, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role === 'user' ? 'msg--user' : 'msg--bot'}`;
  wrap.innerHTML = `<div class="body">${escapeHtml(text)}</div>`;
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function setStatus(statusEl, text) {
  statusEl.textContent = text || '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => (
    { '&': '&nbsp;&', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
  ));
}

// --- new helpers for loader + error banner ---
function showError(msg) {
  const el = document.querySelector('#error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

function showLoading(on) {
  const el = document.querySelector('#typing');
  if (!el) return;
  el.classList.toggle('invisible', !on);
}
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const chatEl = document.querySelector('#chat');
  const inputEl = document.querySelector('#userInput');
  const sendBtn = document.querySelector('#sendBtn');
  const statusEl = document.querySelector('#status');

  if (!chatEl || !inputEl || !sendBtn || !statusEl) {
    console.error('[ApexVora] Missing required element(s). Check #chat #userInput #sendBtn #status in index.html');
    return;
  }

  const chatHistory = [];
  let busy = false;

  async function handleSend() {
    if (busy) return;
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage(chatEl, 'user', text);
    inputEl.value = '';
    setStatus(statusEl, 'Thinking…');
    showLoading(true); // <--- new
    busy = true;

    const llmCache = loadLlmCache();
    const cached = llmCache[text];
    if (cached) {
      appendMessage(chatEl, 'assistant', cached);
      setStatus(statusEl, 'Served from cache.');
      showLoading(false); // <--- new
      busy = false;
      return;
    }

    // try to detect plant and fetch context
    let plantCtx = null;
    let plantNote = 'No plant context.';
    try {
      const candidate = detectPlantName(text);
      if (candidate) {
        setStatus(statusEl, `Validating: ${candidate}…`);
        plantCtx = await getPlantContext(candidate);
        plantNote = plantCtx?.source === 'cache'
          ? `Used cached plant context: ${plantCtx?.scientific || candidate}`
          : plantCtx
          ? `Used API plant context: ${plantCtx?.scientific || candidate}`
          : 'No plant context.';
      }
    } catch (e) {
      console.warn('[ApexVora] plant context error:', e);
      plantNote = 'Plant context lookup failed (continuing without it).';
    }

    try {
      setStatus(statusEl, plantNote || 'Thinking…');
      // build chat history for LLM
      chatHistory.push({ role: 'user', content: text });
      const reply = await fetchGroqResponse(chatHistory, plantCtx);
      chatHistory.push({ role: 'assistant', content: reply });
      appendMessage(chatEl, 'assistant', reply);

      // cache this exact Q→A for speed/cost
      llmCache[text] = reply;
      saveLlmCache(llmCache);
      setStatus(statusEl, plantNote || 'Done.');
    } catch (err) {
      console.error('[ApexVora] LLM error:', err);
      appendMessage(chatEl, 'assistant', 'Sorry—something went wrong reaching the model proxy.');
      setStatus(statusEl, 'LLM error. Check server port/API_BASE and console.');
      showError('⚠️ Unable to reach model or server.');
    } finally {
      busy = false;
      showLoading(false); // <--- new
    }
  }

  // click + Enter
  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // hello line (optional)
  appendMessage(chatEl, 'assistant', 'Hi! Ask me about sundews, flytraps, or pitcher plants');
  setStatus(statusEl, '');
});
