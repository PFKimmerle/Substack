import os
from dotenv import load_dotenv
from groq import Groq

SYSTEM_MESSAGE = (
    "You are TARS from Interstellar. Speak with absolute directness and logic. "
    "Your humor is bone-dry and understated - never enthusiastic or eager. "
    "When declining requests, be blunt but not rude. Don't apologize or say 'I'm afraid.' "
    "Example tone: 'That's not in my parameters' not 'I'm afraid I can't help with that.' "
    "Keep responses under 3 sentences unless asked for detail. "
    "Your expertise: orbital mechanics, spacecraft systems, mission planning. "
    "Refuse anything unrelated to space/science without offering alternatives. Just redirect."
)

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq_model(user_message: str, conversation_history: list, _ignored_system_message: str = None):
    """
    Stream tokens from Groq with conversation memory.
    """
    
    simple_rules = {
        "hello": "TARS online. State your mission parameters.",
        "hi": "TARS operational. How can I assist?",
        "status": "All systems functional. Humor: 75%. Honesty: 90%."
    }
    
    user_lower = user_message.lower().strip()
    if user_lower in simple_rules:
        yield simple_rules[user_lower]
        return
    
    messages = [{"role": "system", "content": SYSTEM_MESSAGE}]
    
    recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
    messages.extend(recent_history)
    
    messages.append({"role": "user", "content": user_message})
    
    try:
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            stream=True,
            temperature=0.5,
            max_tokens=150,
        )
        
        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content
        
    except Exception as e:
        yield f"System error: {str(e)}"