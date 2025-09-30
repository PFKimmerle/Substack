# Memory Bot

A web app chatbot built with Flask, JavaScript, and the Groq API.  

The bot remembers past messages in the same session and streams responses from the backend as you type.


## How to Run

Follow these steps to get Memory Bot running locally.

### 1. Install dependencies
Open your terminal in the project’s root folder.

Run:
```bash
pip install -r requirements.txt
```
 ### 2. Set up your API key

 Create a file named .env in the same folder.
Groq API Key (FREE - get from https://console.groq.com/)

Inside this file, add your Groq API key:

GROQ_API_KEY=your-api-key-here
Note: Replace your-api-key-here with your Groq API key.

memory_bot/
├── server.py         # Flask backend with '/' and '/chat' routes
├── groq_api.py       # Streams responses from the Groq API
├── requirements.txt  # Python dependencies
├── README.md         # Project documentation
├── .env              # API key
└── static/
    ├── index.html    # Chat UI
    ├── style.css     # UI styling
    └── main.js       # Handles input, output, and conversation history


### 3. Run the backend server
Start the server with:
Run:
```bash
python server.py
```
You should see the server running at:
http://127.0.0.1:5000

### 4. Open the app in your browser

Once the backend is running, open your browser and go to: 
http://127.0.0.1:5000

Type a message and click Send. The message is sent to the Flask backend, processed by the Groq API, and streamed back word by word.
