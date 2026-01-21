const input = document.getElementById("input");
const send = document.getElementById("send");
const messages = document.getElementById("messages");

let conversation = [];

send.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("You", text);
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, conversation_history: conversation })
  });

  const reader = res.body.getReader();
  let botMsg = "";
  const botEl = addMessage("Bot", "");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    botMsg += new TextDecoder().decode(value);
    botEl.textContent = "Bot: " + botMsg;
  }
  conversation.push({ role: "user", content: text });
  conversation.push({ role: "assistant", content: botMsg });
});

function addMessage(sender, text) {
  const el = document.createElement("div");
  el.className = "message";
  el.textContent = sender + ": " + text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
  return el;
}