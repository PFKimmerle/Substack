# SkyPanel (Weather Bot)

A weather app that fetches live weather data from OpenWeatherMap.  
Built with HTML, CSS, JavaScript, and Node.js.


## Project Structure

SkyPanel-bot/
├─ public/
│   ├─ index.html     # UI
│   ├─ style.css      # Styling
│   └─ script.js      # Frontend logic
├─ server.js          # Backend proxy
├─ .env               # API key
└─ package.json


## Setup & Run

1. Clone/download this repo.  
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root with:
- Get a free API key from [OpenWeatherMap](https://openweathermap.org/).

   ```env
   API_KEY=your_openweathermap_api_key
   ```
4. Start the server:

   ```bash
   node server.js
   ```
5. Open browser at:

   http://localhost:3000
