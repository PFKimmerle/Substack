# TARS Role Bot

A web app chatbot styled after TARS from *Interstellar*. Built with Flask, JavaScript, and the Groq API.

# How to Run
Follow these steps to get the TARS Role Bot running on your local machine.

1. **Install dependencies**  
Open your terminal in the project's root folder.

Install the required Python packages by running:
```bash
pip install flask flask-cors groq python-dotenv
```

2. **Set Up Your API Key**  
Create a file named .env inside the server folder.
Groq API Key (FREE - get from https://console.groq.com/)

Inside this file, add your Groq API key:GROQ_API_KEY=your-api-key-here
Note: Replace your-api-key-here with your Groq API key.

role_bot_tars/
├── server/
│   ├── app.py        # Flask backend, routes for '/' and '/chat'
│   └── groq_api.py   # Helper function for Groq API with TARS system message
├── index.html        # Chat UI
├── css/
│   └── style.css     #  UI design
├── js/
│   └── script.js     # Handles input/output and streaming
└── README.md         # Documentation


3. **Run the Backend Server**  
start the Python server by running:
```bash
cd server
python app.py
```

You should see a message in your terminal indicating that the server is running on http://127.0.0.1:5000
