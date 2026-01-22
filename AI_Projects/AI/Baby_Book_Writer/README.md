# Baby Book Writer

Generate baby board books (ages 0-3) with AI-generated text and image prompts, output as print-ready PDF.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your GROQ_API_KEY
```

**Important:** Update `AUTHOR = "Your Name"` in `main.py` with your name before generating books.

## Get API Key

- Groq: https://console.groq.com/keys (free tier)

## Usage

### 1. Generate content
```bash
python main.py generate --topic colors
```
Topics: shapes, numbers, animals, food, colors, alphabet

### 2. Create images
Use the prompts in `output/{topic}/image-prompts/` with your image generator (ChatGPT, Leonardo.ai, etc.).

Save images as:
- `book_cover.png` - Cover image
- `page_01.png` through `page_12.png` - Content pages
- `back_cover.png` - Back cover

Place all images in `output/{topic}/images/`

### 3. Build final PDF
```bash
python main.py build-pdf --topic colors
```

## Output Structure
```
output/
└── colors/
    ├── content.json
    ├── image-prompts/
    │   ├── book_cover.txt
    │   ├── page_01.txt
    │   └── back_cover.txt
    ├── images/
    │   ├── book_cover.png
    │   ├── page_01.png
    │   └── back_cover.png
    └── colors_book.pdf
```

## Run Tests
```bash
pytest test_baby_book.py -v
```

## Design Specs
- 12 content pages (standard board book range: 10-16)
- 8x8 inch square format
- 36pt bold Helvetica for text
- Cover + back cover pages
- Groq llama-3.3-70b-versatile for text generation
