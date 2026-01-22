"""PDF builder for baby books."""

import os
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# Page dimensions (8x8 inches square)
PAGE_SIZE = 8 * inch
PAGE_WIDTH = PAGE_SIZE
PAGE_HEIGHT = PAGE_SIZE

# Layout constants
MARGIN = 0.5 * inch
IMAGE_SIZE = 6.5 * inch  # Square image area
TEXT_FONT = "Helvetica-Bold"
TEXT_SIZE = 36  # Adjusted for square format
TITLE_SIZE = 48

def _draw_cover(c, images_dir: str, title: str, author: str):
    """Draw cover page with author name only (image has title)."""
    cover_path = os.path.join(images_dir, "book_cover.png")

    # Draw cover image (full page with margins)
    if os.path.exists(cover_path):
        c.drawImage(cover_path, MARGIN, MARGIN,
                   PAGE_SIZE - 2*MARGIN, PAGE_SIZE - 2*MARGIN,
                   preserveAspectRatio=True)

    # Author name in bottom right corner only
    c.setFillColor(HexColor("#333333"))
    c.setFont("Helvetica", 16)
    c.drawRightString(PAGE_WIDTH - MARGIN - 0.2*inch, MARGIN + 0.3*inch, f"by {author}")

    c.showPage()

def _draw_back_cover(c, images_dir: str):
    """Draw back cover page."""
    back_path = os.path.join(images_dir, "back_cover.png")

    if os.path.exists(back_path):
        c.drawImage(back_path, MARGIN, MARGIN,
                   PAGE_SIZE - 2*MARGIN, PAGE_SIZE - 2*MARGIN,
                   preserveAspectRatio=True)
    else:
        # Simple blank back cover
        c.setFillColor(HexColor("#F5F5F5"))
        c.rect(0, 0, PAGE_SIZE, PAGE_SIZE, fill=1)

    c.showPage()

def _draw_content_page(c, page: dict, page_num: int, images_dir: str):
    """Draw a content page with image and text."""
    image_path = os.path.join(images_dir, f"page_{page_num:02d}.png")

    # Center image on page
    image_x = (PAGE_WIDTH - IMAGE_SIZE) / 2
    image_y = PAGE_HEIGHT - MARGIN - IMAGE_SIZE + 0.3 * inch

    if os.path.exists(image_path):
        c.drawImage(image_path, image_x, image_y, IMAGE_SIZE, IMAGE_SIZE,
                   preserveAspectRatio=True)
    else:
        # Placeholder
        c.setStrokeColor(HexColor("#CCCCCC"))
        c.setFillColor(HexColor("#F5F5F5"))
        c.rect(image_x, image_y, IMAGE_SIZE, IMAGE_SIZE, fill=1)
        c.setFillColor(HexColor("#999999"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(PAGE_WIDTH / 2, image_y + IMAGE_SIZE / 2,
                           f"[Image: page_{page_num:02d}.png]")

    # Draw text below image
    text = page.get("text", "")
    text_y = image_y - 0.4 * inch

    c.setFillColor(HexColor("#333333"))
    c.setFont(TEXT_FONT, TEXT_SIZE)
    c.drawCentredString(PAGE_WIDTH / 2, text_y, text)

    c.showPage()

def build_pdf(pages: list[dict], images_dir: str = "images", output_path: str = "baby_book.pdf",
              title: str = "My Book", author: str = "Your Name"):
    """
    Build PDF from pages data and images.

    Args:
        pages: List of dicts with "text" key
        images_dir: Directory containing page images
        output_path: Output PDF file path
        title: Book title for cover
        author: Author name for cover
    """
    c = canvas.Canvas(output_path, pagesize=(PAGE_SIZE, PAGE_SIZE))

    # Cover page
    _draw_cover(c, images_dir, title, author)

    # Content pages
    for i, page in enumerate(pages, 1):
        _draw_content_page(c, page, i, images_dir)

    # Back cover
    _draw_back_cover(c, images_dir)

    c.save()
    return output_path

def build_prompts_only_pdf(pages: list[dict], output_path: str = "baby_book_prompts.pdf",
                           title: str = "My Book"):
    """Build PDF with placeholders and prompts (before images are generated)."""
    c = canvas.Canvas(output_path, pagesize=(PAGE_SIZE, PAGE_SIZE))

    # Simple cover placeholder
    c.setFillColor(HexColor("#333333"))
    c.setFont(TEXT_FONT, TITLE_SIZE)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT * 0.5, title.upper())
    c.setFont("Helvetica", 18)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT * 0.4, "[PREVIEW]")
    c.showPage()

    # Content pages
    for i, page in enumerate(pages, 1):
        image_x = (PAGE_WIDTH - IMAGE_SIZE) / 2
        image_y = PAGE_HEIGHT - MARGIN - IMAGE_SIZE + 0.3 * inch

        # Placeholder with prompt preview
        c.setStrokeColor(HexColor("#CCCCCC"))
        c.setFillColor(HexColor("#F5F5F5"))
        c.rect(image_x, image_y, IMAGE_SIZE, IMAGE_SIZE, fill=1)

        # Show truncated prompt
        prompt = page.get("image_prompt", "")[:80] + "..."
        c.setFillColor(HexColor("#666666"))
        c.setFont("Helvetica", 9)

        words = prompt.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(" ".join(current_line)) > 40:
                lines.append(" ".join(current_line[:-1]))
                current_line = [word]
        if current_line:
            lines.append(" ".join(current_line))

        y_offset = image_y + IMAGE_SIZE / 2 + len(lines) * 5
        for line in lines[:5]:
            c.drawCentredString(PAGE_WIDTH / 2, y_offset, line)
            y_offset -= 11

        # Draw text
        text = page.get("text", "")
        text_y = image_y - 0.4 * inch
        c.setFillColor(HexColor("#333333"))
        c.setFont(TEXT_FONT, TEXT_SIZE)
        c.drawCentredString(PAGE_WIDTH / 2, text_y, text)

        c.showPage()

    c.save()
    return output_path
