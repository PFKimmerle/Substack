# ScarletSous (Recipe Bot)

A chatbot that suggests recipes based on ingredients you provide.  
Built with Flask and the Groq API. Uses Spoonacular and TheMealDB for recipe data.


## Setup & Run

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file in the root (see `.env.example` for format):
   - Groq API Key (FREE): https://console.groq.com/
   - Spoonacular API Key (FREE tier): https://spoonacular.com/food-api

3. Start the server:
   ```bash
   python server.py
   ```

4. Open in your browser:
   ```
   http://localhost:3000
   ```


## Notes

- `GROQ_MODEL` is optional. Default is `openai/gpt-oss-120b`. Update to whatever model you're using.
- TheMealDB is the fallback if Spoonacular doesn't return results. It's free and requires no API key.


## License

MIT - free to use, learn from, and adapt.
