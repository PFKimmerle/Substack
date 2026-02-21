const ENV = {
  API_BASE: (window?.ApexVoraEnv?.API_BASE) || 'http://localhost:3000'
};

export async function fetchGroqResponse(chatHistory, plantContext){
  const messages = [];
  if(plantContext){
    messages.push({ role:"system", content:`PLANT_CONTEXT: ${JSON.stringify(plantContext)}` });
  }
  messages.push(...chatHistory);

  const res = await fetch(`${ENV.API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ messages, temperature:0.3, max_tokens:300 })
  });
  if(!res.ok){
    const text = await res.text().catch(()=> "");
    throw new Error(`Proxy error ${res.status}: ${text || res.statusText}`);
  }
  const { content } = await res.json();
  return String(content);
}
