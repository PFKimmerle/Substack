# ApexVora Bot

A chatbot for carnivorous plant care. Ask about sundews, Venus flytraps, pitcher plants, and more.

Side note: The demo video in the blog shows the deployed version with voice features. This repo is the core local version without voice/TTS.

## Setup

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create `.env` file in the `server/` folder:
   ```
   GROQ_API_KEY=your_groq_key_here
   GROQ_CHAT_MODEL=llama-3.1-8b-instant
   PERENUAL_KEY=your_perenual_key_here
   TREFLE_TOKEN=your_trefle_token_here
   ```
   - Get Groq key from [console.groq.com](https://console.groq.com)
   - Get Perenual key from [perenual.com](https://perenual.com/docs/api)
   - Get Trefle token from [trefle.io](https://trefle.io/)

3. Start the server:
   ```bash
   npm run dev
   ```

4. Open `web/index.html` in your browser.

## Notes

- Server runs on port 3000 by default
- Plant APIs (Perenual/Trefle) are optional but add context to responses
- Redis is optional (falls back to in-memory cache)
