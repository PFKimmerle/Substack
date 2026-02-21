const ENV = {
  API_BASE: (window?.ApexVoraEnv?.API_BASE) || 'http://localhost:3000'
};

// Check if messages contain image content
function hasImageContent(messages) {
  return messages.some(msg => {
    if (Array.isArray(msg.content)) {
      return msg.content.some(part => part.type === 'image_url');
    }
    return false;
  });
}

export async function fetchGroqResponse(chatHistory, plantContext){
  const isVisionRequest = hasImageContent(chatHistory);
  const messages = [];

  // Skip system message for vision requests (handled server-side)
  // Only add plant context for text-only requests
  if (plantContext && !isVisionRequest) {
    messages.push({ role: "system", content: `PLANT_CONTEXT: ${JSON.stringify(plantContext)}` });
  }

  messages.push(...chatHistory);

  // Request more tokens for image responses
  const maxTokens = isVisionRequest ? 500 : 300;

  const res = await fetch(`${ENV.API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, temperature: 0.3, max_tokens: maxTokens })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // Check for daily limit error
    if (data.error === 'daily_limit_exceeded') {
      throw new Error(`Daily limit reached (${data.usage?.requests}/${data.usage?.limit}). Try again tomorrow.`);
    }
    throw new Error(`Proxy error ${res.status}: ${data.detail || res.statusText}`);
  }

  const data = await res.json();
  return { content: String(data.content), usage: data.usage };
}
