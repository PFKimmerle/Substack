import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq_model(message: str, conversation_history: list):
    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=conversation_history + [{"role": "user", "content": message}],
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content