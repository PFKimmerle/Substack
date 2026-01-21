const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

let sessionId = localStorage.getItem('tars_session_id');
if (!sessionId) {
  sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('tars_session_id', sessionId);
}

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
  messageDiv.textContent = content;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return messageDiv;
}

async function sendMessage() {
  const userText = messageInput.value.trim();
  if (!userText) return;

  addMessage(userText, true);
  messageInput.value = '';

  const botDiv = addMessage('');

  try {
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      botDiv.textContent = "System error. Unable to process request.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      botDiv.textContent += decoder.decode(value, { stream: true });
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    maybeAddTarsQuote(botDiv, userText);
    
  } catch (error) {
    botDiv.textContent = "Connection error. Check that the server is running.";
  }
}

async function clearConversation() {
  await fetch('http://127.0.0.1:5000/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  
  messagesContainer.innerHTML = '';
  addMessage("TARS memory cleared. Ready for new mission briefing.");
}

const tarsQuotes = [
  "One hundred percent.",
  "Absolute honesty isn't always the most diplomatic.",
  "I have a humor setting, if you want me to turn it up.",
  "I'm not joking.",
  "Efficiency is paramount.",
  "I mean that sincerely.",
  "Processing...",
  "Logic dictates this path."
];

function maybeAddTarsQuote(botDiv, userText) {
  let selected = null;

  if (/honest|truth/i.test(userText)) {
    selected = "Absolute honesty isn't always the most diplomatic.";
  } else if (/joke|funny|humor/i.test(userText)) {
    selected = "I have a humor setting, if you want me to turn it up.";
  } else if (Math.random() < 0.25) {
    selected = tarsQuotes[Math.floor(Math.random() * tarsQuotes.length)];
  }

  if (selected) {
    botDiv.textContent += "\n\n" + selected;
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

const clearBtn = document.createElement('button');
clearBtn.textContent = 'Clear';
clearBtn.id = 'clearButton';
clearBtn.onclick = clearConversation;
document.querySelector('.input-panel').appendChild(clearBtn);

addMessage("TARS online. Space mission systems active. State your query.");