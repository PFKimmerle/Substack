from flask import Flask, request, Response, send_from_directory, jsonify
from flask_cors import CORS
from groq_api import ask_groq_model
import os
import json
from datetime import datetime

# Serve static files from the project root
APP_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app = Flask(__name__, static_folder=APP_ROOT, static_url_path="")
CORS(app)

# In-memory conversation storage (resets on server restart)
conversations = {}

# Analytics storage
analytics = {
    "total_messages": 0,
    "total_conversations": 0,
    "fallback_triggers": 0,
    "avg_message_length": 0
}

@app.get("/")
def root():
    return send_from_directory(app.static_folder, "index.html")

@app.get("/favicon.ico")
def favicon():
    return ("", 204)

@app.post("/chat")
def chat():
    data = request.get_json(force=True) or {}
    user_msg = data.get("message", "")
    session_id = data.get("session_id", "default")
    
    if not user_msg:
        return ("", 400)
    
    if session_id not in conversations:
        conversations[session_id] = []
        analytics["total_conversations"] += 1
    
    analytics["total_messages"] += 1
    analytics["avg_message_length"] = (
        (analytics["avg_message_length"] * (analytics["total_messages"] - 1) + len(user_msg)) 
        / analytics["total_messages"]
    )
    
    conversations[session_id].append({
        "role": "user",
        "content": user_msg,
    })
    
    def generate():
        assistant_response = ""
        for token in ask_groq_model(user_msg, conversations[session_id], None):
            assistant_response += token
            yield token
        
        conversations[session_id].append({
            "role": "assistant",
            "content": assistant_response,
        })
        
        if "outside my" in assistant_response.lower() or "exceeds my" in assistant_response.lower():
            analytics["fallback_triggers"] += 1
    
    return Response(generate(), mimetype="text/plain")

@app.get("/analytics")
def get_analytics():
    """Endpoint to view basic analytics"""
    return jsonify({
        **analytics,
        "active_conversations": len(conversations),
        "fallback_rate": round(analytics["fallback_triggers"] / max(analytics["total_messages"], 1) * 100, 2)
    })

@app.post("/clear")
def clear_conversation():
    """Clear conversation history for a session"""
    data = request.get_json(force=True) or {}
    session_id = data.get("session_id", "default")
    if session_id in conversations:
        conversations[session_id] = []
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)