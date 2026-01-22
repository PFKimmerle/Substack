"""Text and image prompt generation using Groq."""

import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

TOPICS = ["shapes", "numbers", "animals", "food", "colors", "alphabet"]

# Basic blocklist - words inappropriate for baby books
BLOCKLIST = {
    "death", "dead", "die", "kill", "blood", "scary", "fear", "hate",
    "stupid", "dumb", "ugly", "fat", "violence", "fight", "gun", "knife",
    "poison", "dangerous", "evil", "demon", "hell", "damn"
}

MAX_WORDS = 5
MAX_RETRIES = 3

def validate_page(page: dict) -> tuple[bool, str]:
    """
    Validate a page's text content.

    Returns (is_valid, error_message).
    """
    text = page.get("text", "").lower()
    words = text.split()

    # Check word count
    if len(words) > MAX_WORDS:
        return False, f"Too many words ({len(words)} > {MAX_WORDS}): '{text}'"

    # Check blocklist
    for word in words:
        clean_word = word.strip(".,!?")
        if clean_word in BLOCKLIST:
            return False, f"Inappropriate word found: '{clean_word}'"

    return True, ""

def get_client():
    """Get Groq client."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment")
    return Groq(api_key=api_key)

def regenerate_page(client, topic: str, page_num: int, style_reference: str, failed_text: str, error: str) -> dict:
    """Regenerate a single page that failed validation."""
    prompt = f"""Regenerate ONE page for a baby board book about {topic} (ages 0-3).

This is page {page_num}. The previous attempt failed: {error}

Requirements:
- text: 1-5 simple words only (STRICT LIMIT)
- image_prompt: Match this style exactly: "{style_reference}"
- Use simple words toddlers know
- No scary/violent/inappropriate words

Return ONLY valid JSON object:
{{"text": "...", "image_prompt": "..."}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300
    )

    content = response.choices[0].message.content.strip()

    # Parse JSON
    if "```" in content:
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]

    return json.loads(content)

def generate_book_content(topic: str, num_pages: int = 12) -> list[dict]:
    """
    Generate text and image prompts for a baby book.

    Returns list of dicts: [{"text": "...", "image_prompt": "..."}, ...]
    """
    if topic not in TOPICS:
        raise ValueError(f"Topic must be one of: {TOPICS}")

    client = get_client()

    prompt = f"""Create a baby board book about {topic} for ages 0-3.

Generate exactly {num_pages} pages. For each page provide:
1. text: Simple text (1-5 words only)
2. image_prompt: Detailed prompt for AI image generation

Requirements:
- Use simple, common words toddlers recognize
- Each page should teach one concept
- Image prompts should specify: cute, friendly style, bright colors, simple background

Return ONLY valid JSON array, no other text:
[{{"text": "One red apple", "image_prompt": "A single bright red apple..."}}]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2000
    )

    content = response.choices[0].message.content.strip()

    # Parse JSON from response
    try:
        # Handle potential markdown code blocks
        if "```" in content:
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        pages = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {e}")

    # Get style reference from first valid page for consistency
    style_reference = pages[0].get("image_prompt", "cute, friendly style, bright colors")[:100]

    # Validate and retry failed pages
    for i, page in enumerate(pages):
        page_num = i + 1
        is_valid, error = validate_page(page)

        if not is_valid:
            print(f"Page {page_num} failed validation: {error}")

            for retry in range(1, MAX_RETRIES + 1):
                print(f"  Retry {retry}/{MAX_RETRIES} for page {page_num}...")
                try:
                    new_page = regenerate_page(
                        client, topic, page_num, style_reference,
                        page.get("text", ""), error
                    )
                    is_valid, error = validate_page(new_page)

                    if is_valid:
                        pages[i] = new_page
                        print(f"  Page {page_num} regenerated successfully")
                        break
                    else:
                        print(f"  Retry {retry} failed: {error}")
                except Exception as e:
                    print(f"  Retry {retry} error: {e}")

            if not is_valid:
                print(f"  Warning: Page {page_num} still invalid after {MAX_RETRIES} retries")

    return pages

IMAGE_PROMPT_PREFIX = "Create an image for a baby book that is age appropriate photograph of:"

def save_image_prompts(pages: list[dict], output_dir: str = "image-prompts", topic: str = ""):
    """Save image prompts to files for use with image generator."""
    os.makedirs(output_dir, exist_ok=True)

    # Cover prompt
    cover_path = os.path.join(output_dir, "book_cover.txt")
    with open(cover_path, "w") as f:
        f.write(f"{IMAGE_PROMPT_PREFIX} cover image for a baby book about {topic}. "
                f"Should match the style of the content pages. Title: {topic.capitalize()}")

    # Content page prompts
    for i, page in enumerate(pages, 1):
        filepath = os.path.join(output_dir, f"page_{i:02d}.txt")
        with open(filepath, "w") as f:
            f.write(f"{IMAGE_PROMPT_PREFIX} {page['image_prompt']}")

    # Back cover prompt
    back_path = os.path.join(output_dir, "back_cover.txt")
    with open(back_path, "w") as f:
        f.write(f"{IMAGE_PROMPT_PREFIX} back cover for a baby book about {topic}. "
                f"Simple design that matches the style of the content pages.")

    return output_dir
