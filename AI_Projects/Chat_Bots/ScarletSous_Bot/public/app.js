const form = document.getElementById("qform");
const input = document.getElementById("q");
const out = document.getElementById("out");
const send = document.getElementById("send");

/**
 * Parse ingredient input into normalized array
 * Handles formats: "eggs and rice", "eggs, rice", "eggs, rice and garlic"
 * @param {string} text - Raw user input
 * @returns {string[]} - Array of trimmed ingredients
 */
function parseIngredients(text) {
  // Replace "and" with commas, then split on commas
  // This handles: "eggs and rice" → ["eggs", "rice"]
  //               "eggs, rice" → ["eggs", "rice"]
  //               "eggs, rice and garlic" → ["eggs", "rice", "garlic"]
  return text
    .replace(/\s+and\s+/gi, ",") // Replace " and " with ","
    .split(",")                   // Split on commas
    .map(ingredient => ingredient.trim()) // Remove whitespace
    .filter(Boolean);              // Remove empty strings
}

/**
 * Create skeleton loading cards
 * Shows 3 pulsing placeholder cards while waiting for API response
 */
function createSkeletonCards() {
  const container = document.createElement("div");
  container.className = "skeleton-cards";
  container.setAttribute("aria-label", "Loading recipes");

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    
    const image = document.createElement("div");
    image.className = "skeleton-image";
    
    const body = document.createElement("div");
    body.className = "skeleton-body";
    
    const title = document.createElement("div");
    title.className = "skeleton-title";
    
    const meta = document.createElement("div");
    meta.className = "skeleton-meta";
    
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(image);
    card.appendChild(body);
    container.appendChild(card);
  }

  return container;
}

/**
 * Parse and render recipe cards from API response
 * Expected format: • Name | 30 min | url | image
 */
function renderBotList(text) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const container = document.createElement("div");
  container.className = "cards";
  container.setAttribute("role", "list");

  let hasCards = false;

  for (const line of lines) {
    // Remove bullet points and split by pipe
    const parts = line.replace(/^[-•]\s*/, "").split("|").map(p => p.trim());
    if (parts.length < 3) continue;

    const [name, mins, url, img] = parts;
    if (!url) continue;

    // Create card as an anchor for better accessibility
    const card = document.createElement("a");
    card.className = "card";
    card.href = url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("role", "listitem");

    // Add image if available
    if (img) {
      const image = document.createElement("img");
      image.src = img;
      image.alt = `${name} recipe photo`;
      image.loading = "lazy";
      card.appendChild(image);
    }

    // Card body with title and metadata
    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("span");
    title.textContent = name;
    body.appendChild(title);

    if (mins) {
      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = mins;
      body.appendChild(meta);
    }

    card.appendChild(body);
    container.appendChild(card);
    hasCards = true;
  }

  return hasCards ? container : null;
}

/**
 * Add a message to the chat
 * @param {string} text - Message content
 * @param {string} who - 'me' or 'bot'
 * @param {boolean} isLoading - Whether this is a loading state
 */
function addMsg(text, who = "bot", isLoading = false) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `msg ${who === "me" ? "me" : "bot"}`;

  if (isLoading) {
    // Add skeleton cards for loading state
    const skeleton = createSkeletonCards();
    msgWrapper.appendChild(skeleton);
  } else if (who === "bot") {
    // Try to render as recipe cards, fallback to text
    const list = renderBotList(text);
    if (list) {
      msgWrapper.appendChild(list);
    } else {
      msgWrapper.textContent = text;
    }
  } else {
    // User message - simple text
    msgWrapper.textContent = text;
  }

  out.appendChild(msgWrapper);
  
  // Smooth scroll to bottom
  requestAnimationFrame(() => {
    out.scrollTo({
      top: out.scrollHeight,
      behavior: "smooth"
    });
  });

  return msgWrapper;
}

/**
 * Handle form submission
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const text = input.value.trim();
  if (!text) return;

  // Parse ingredients into array
  const ingredients = parseIngredients(text);

  // Add user message (show original input)
  addMsg(text, "me");
  input.value = "";
  send.disabled = true;

  // Add skeleton loading state
  const loadingMsg = addMsg("", "bot", true);

  try {
    const response = await fetch("/api/rolebot", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        message: text,
        ingredients: ingredients // Send parsed array to backend
      })
    });

    // Remove loading skeleton
    loadingMsg.remove();

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    const reply = data.reply || data.message || "I couldn't generate a response.";
    
    // Add actual bot response
    addMsg(String(reply), "bot");

  } catch (error) {
    // Remove loading skeleton
    loadingMsg.remove();
    
    // Show user-friendly error message
    console.error("Request failed:", error);
    addMsg(
      "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      "bot"
    );
  } finally {
    send.disabled = false;
    input.focus();
  }
});

/**
 * Auto-focus input on page load
 */
document.addEventListener("DOMContentLoaded", () => {
  input.focus();
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener("keydown", (e) => {
  // Focus input when user starts typing (and not already focused)
  if (
    e.key.length === 1 && 
    !e.ctrlKey && 
    !e.metaKey && 
    !e.altKey &&
    document.activeElement !== input
  ) {
    input.focus();
  }
});