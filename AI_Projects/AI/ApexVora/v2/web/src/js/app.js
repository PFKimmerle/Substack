// web/src/js/app.js
// Works with IDs: #chat, #userInput, #sendBtn, #status
// Uses your modules: getPlantContext/detectPlantName + fetchGroqResponse
// Vision support: image upload, paste, drag-and-drop

import { getPlantContext, detectPlantName } from './api/plantApi.js';
import { fetchGroqResponse } from './api/llmApi.js';

const LLM_CACHE_KEY = 'apexvora_cache';
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_IMAGE_DIMENSION = 2048;

// Pending image state
let pendingImage = null;

// Process and compress image
async function processImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing/compression
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize if needed
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG at 85% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Check size
        const base64Size = (dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75;
        if (base64Size > MAX_IMAGE_SIZE) {
          reject(new Error(`Image too large (${(base64Size / 1024 / 1024).toFixed(1)}MB). Max 4MB.`));
          return;
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Set pending image and update UI
function setPendingImage(dataUrl) {
  pendingImage = dataUrl;
  const previewEl = document.querySelector('#imagePreview');
  const previewImg = document.querySelector('#previewImg');
  const uploadBtn = document.querySelector('#uploadBtn');

  if (dataUrl) {
    previewImg.src = dataUrl;
    previewEl.classList.remove('hidden');
    uploadBtn?.classList.add('has-image');
  } else {
    previewImg.src = '';
    previewEl.classList.add('hidden');
    uploadBtn?.classList.remove('has-image');
  }
}

// Clear pending image
function clearPendingImage() {
  setPendingImage(null);
  const imageInput = document.querySelector('#imageInput');
  if (imageInput) imageInput.value = '';
}

function loadLlmCache() {
  try { return JSON.parse(localStorage.getItem(LLM_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function saveLlmCache(obj) {
  try { localStorage.setItem(LLM_CACHE_KEY, JSON.stringify(obj)); } catch {}
}

function appendMessage(chatEl, role, text, imageUrl = null) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role === 'user' ? 'msg--user' : 'msg--bot'}`;

  let html = '';
  if (imageUrl) {
    html += `<img src="${imageUrl}" alt="Uploaded plant" class="chat-image" />`;
  }
  if (text) {
    html += `<div class="body">${escapeHtml(text)}</div>`;
  }

  wrap.innerHTML = html;
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

// --- usage meter ---
function updateUsageMeter(usage) {
  const meter = document.querySelector('#usageMeter');
  const progress = document.querySelector('#usageProgress');
  const text = document.querySelector('#usageText');
  if (!meter || !progress || !text) return;

  const { requests, limit, percentUsed } = usage;

  // Update progress bar
  progress.style.width = `${Math.min(100, percentUsed)}%`;

  // Update text
  text.textContent = `${requests}/${limit} requests`;

  // Update colors based on usage level
  meter.classList.remove('warning', 'danger');
  progress.classList.remove('warning', 'danger');

  if (percentUsed >= 90) {
    meter.classList.add('danger');
    progress.classList.add('danger');
  } else if (percentUsed >= 70) {
    meter.classList.add('warning');
    progress.classList.add('warning');
  }
}

async function fetchUsage() {
  try {
    const ENV = { API_BASE: (window?.ApexVoraEnv?.API_BASE) || 'http://localhost:3000' };
    const res = await fetch(`${ENV.API_BASE}/api/usage`);
    if (res.ok) {
      const usage = await res.json();
      updateUsageMeter(usage);
    }
  } catch (e) {
    console.warn('[ApexVora] Could not fetch usage:', e);
  }
}
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const chatEl = document.querySelector('#chat');
  const inputEl = document.querySelector('#userInput');
  const sendBtn = document.querySelector('#sendBtn');
  const statusEl = document.querySelector('#status');
  const uploadBtn = document.querySelector('#uploadBtn');
  const imageInput = document.querySelector('#imageInput');
  const removeImageBtn = document.querySelector('#removeImageBtn');
  const dropZone = document.querySelector('#dropZone');

  if (!chatEl || !inputEl || !sendBtn || !statusEl) {
    console.error('[ApexVora] Missing required element(s). Check #chat #userInput #sendBtn #status in index.html');
    return;
  }

  const chatHistory = [];
  let busy = false;

  async function handleSend() {
    if (busy) return;
    const text = inputEl.value.trim();
    const hasImage = !!pendingImage;

    // Need either text or image
    if (!text && !hasImage) return;

    // Use default prompt if image-only
    const displayText = text || (hasImage ? "What's this plant? Any care tips?" : '');
    const sendText = text || (hasImage ? "What's this plant? Can you identify it and provide care tips?" : '');

    // Show user message with image if present
    appendMessage(chatEl, 'user', displayText, hasImage ? pendingImage : null);
    inputEl.value = '';

    // Capture image before clearing
    const imageToSend = pendingImage;
    clearPendingImage();

    setStatus(statusEl, 'Thinking…');
    showLoading(true);
    busy = true;

    // Skip cache for image queries
    if (!hasImage) {
      const llmCache = loadLlmCache();
      const cached = llmCache[sendText];
      if (cached) {
        appendMessage(chatEl, 'assistant', cached);
        setStatus(statusEl, 'Served from cache.');
        showLoading(false);
        busy = false;
        return;
      }
    }

    // Skip plant context lookup for image queries
    let plantCtx = null;
    let plantNote = 'No plant context.';
    if (!hasImage) {
      try {
        const candidate = detectPlantName(sendText);
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
    } else {
      plantNote = 'Analyzing image…';
    }

    try {
      setStatus(statusEl, plantNote || 'Thinking…');

      // Build message content
      let messageContent;
      if (imageToSend) {
        // Array content for vision
        messageContent = [
          { type: 'text', text: sendText },
          { type: 'image_url', image_url: { url: imageToSend } }
        ];
      } else {
        messageContent = sendText;
      }

      chatHistory.push({ role: 'user', content: messageContent });
      const { content: reply, usage } = await fetchGroqResponse(chatHistory, hasImage ? null : plantCtx);
      chatHistory.push({ role: 'assistant', content: reply });
      appendMessage(chatEl, 'assistant', reply);

      // Update usage meter if usage info returned
      if (usage) updateUsageMeter(usage);

      // Only cache text-only responses
      if (!hasImage) {
        const llmCache = loadLlmCache();
        llmCache[sendText] = reply;
        saveLlmCache(llmCache);
      }
      setStatus(statusEl, hasImage ? 'Image analyzed.' : (plantNote || 'Done.'));
    } catch (err) {
      console.error('[ApexVora] LLM error:', err);
      appendMessage(chatEl, 'assistant', 'Sorry—something went wrong reaching the model proxy.');
      setStatus(statusEl, 'LLM error. Check server port/API_BASE and console.');
      showError('⚠️ Unable to reach model or server.');
    } finally {
      busy = false;
      showLoading(false);
    }
  }

  // Handle image file selection
  async function handleImageFile(file) {
    try {
      setStatus(statusEl, 'Processing image…');
      const dataUrl = await processImage(file);
      setPendingImage(dataUrl);
      setStatus(statusEl, 'Image ready. Add text or send to analyze.');
    } catch (err) {
      console.error('[ApexVora] Image processing error:', err);
      showError(`⚠️ ${err.message}`);
      setStatus(statusEl, '');
    }
  }

  // Upload button click
  uploadBtn?.addEventListener('click', () => {
    imageInput?.click();
  });

  // File input change
  imageInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  });

  // Remove image button
  removeImageBtn?.addEventListener('click', () => {
    clearPendingImage();
    setStatus(statusEl, '');
  });

  // Clipboard paste (Ctrl+V with image)
  document.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await handleImageFile(file);
        break;
      }
    }
  });

  // Drag and drop
  let dragCounter = 0;

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer?.types?.includes('Files')) {
      dropZone?.classList.remove('hidden');
    }
  });

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      dropZone?.classList.add('hidden');
    }
  });

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropZone?.classList.add('hidden');

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageFile(file);
    }
  });

  // click + Enter
  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // hello line (optional)
  appendMessage(chatEl, 'assistant', 'Hi! Ask me about sundews, flytraps, or pitcher plants. Upload a photo + describe what you see for best ID.');
  setStatus(statusEl, '');

  // Fetch initial usage on page load
  fetchUsage();
});
