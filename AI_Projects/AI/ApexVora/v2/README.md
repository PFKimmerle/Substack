# ApexVora v2

Carnivorous plant care chatbot with **vision capabilities**. Upload a photo of your sundew, Venus flytrap, or pitcher plant to get identification and health assessments.

## What's New in v2

- **Image analysis**: Upload, paste (Ctrl+V), or drag-and-drop plant photos
- **Plant ID from photos**: Identifies sundews, Venus flytraps, Nepenthes, Sarracenia, and butterworts
- **Health detection**: Spots mold, root rot, humidity issues, and other common problems
- **Usage tracking**: Visual meter showing daily API usage (Groq free tier: 1000/day)
- **Response caching**: Reduces API calls for repeated text queries

## Setup

### 1. Server

```bash
cd v2/server
npm install
```

Create `.env` in the server folder:

```env
GROQ_API_KEY=your_groq_key_here
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
```

Get your Groq API key at: https://console.groq.com/keys

Start the server:

```bash
npm run dev
```

### 2. Frontend

Open `v2/web/index.html` in your browser, or serve it locally:

```bash
cd v2/web
npx serve .
```

### 3. Verify

- Health check: http://localhost:3000/health should return `{"ok":true}`
- Frontend should connect automatically to `http://localhost:3000`

## Usage

1. Type a question about carnivorous plants, OR
2. Upload/paste a photo + add a description for best results
3. The bot identifies the plant and checks for health issues

**Tip**: Image + text description = most accurate identification

## Tech Stack

- **Backend**: Node.js, Express, Zod validation
- **LLM**: Groq API (Llama 3.3 for chat, Llama 4 Scout for vision)
- **Frontend**: Vanilla JS, Tailwind CSS
- **Caching**: Redis (optional) or in-memory

## API Keys

| Service | Required | Get it at |
|---------|----------|-----------|
| Groq | Yes | https://console.groq.com/keys |
| Perenual | Optional | https://perenual.com/docs/api |
| Trefle | Optional | https://trefle.io/ |

## Groq Free Tier Limits

- 1,000 requests/day
- 30 requests/minute
- Usage meter in header shows current consumption
