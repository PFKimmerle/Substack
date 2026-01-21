from flask import Flask, request, Response, send_from_directory
from groq_api import ask_groq_model

app = Flask(__name__, static_folder="static", static_url_path="/static")

@app.get("/")
def root():
    return send_from_directory("static", "index.html")

@app.post("/chat")
def chat():
    data = request.get_json() or {}
    message = data.get("message", "")
    history = data.get("conversation_history", [])

    def generate():
        for chunk in ask_groq_model(message, history):
            yield chunk

    return Response(generate(), mimetype="text/plain")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)