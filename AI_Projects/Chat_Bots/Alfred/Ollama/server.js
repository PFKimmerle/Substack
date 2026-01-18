// CommonJS version (works out of the box with Node on Windows)
const express = require('express');

const app = express();
app.use(express.json());

app.get('/chat', (req, res) =>
  res.type('text').send('Use POST /chat with JSON: {"user":"..."}')
);



app.post('/chat', async (req, res) => {
  try {
    const user = req.body?.user || '';
    const r = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: 'You are Alfred, a calm, natural assistant. Speak conversationally, Use contractions. vary sentence length. Ask clarifying questions naturally. Avoid lists unless asked,avoid exclamation marks or roleplay, and keep greetings short and friendly.' },
          { role: 'user', content: user }
        ],
        stream: false
      })
    });
    const j = await r.json();
    res.json({ text: j?.message?.content || '(no reply)' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(8788, () => {
  console.log('Local AI proxy running on http://localhost:8788/chat');
});
