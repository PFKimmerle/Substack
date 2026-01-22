"""Tests for Baby Book Writer."""

import os
import json
import tempfile
import pytest
from generator import TOPICS, save_image_prompts, validate_page, BLOCKLIST, MAX_WORDS, IMAGE_PROMPT_PREFIX
from pdf_builder import build_pdf, build_prompts_only_pdf

# Test 1: Topic validation
def test_valid_topics():
    """Verify all expected topics are available."""
    expected = ["shapes", "numbers", "animals", "food", "colors", "alphabet"]
    assert TOPICS == expected
    assert len(TOPICS) == 6

# Test 2: Page validation
def test_validate_page():
    """Test content validation for word count and blocklist."""
    # Valid pages
    valid, _ = validate_page({"text": "Red apple"})
    assert valid

    valid, _ = validate_page({"text": "One two three four five"})
    assert valid  # Exactly 5 words

    # Too many words
    valid, error = validate_page({"text": "One two three four five six"})
    assert not valid
    assert "Too many words" in error

    # Blocklist word
    valid, error = validate_page({"text": "Scary monster"})
    assert not valid
    assert "Inappropriate" in error

    # Empty is valid
    valid, _ = validate_page({"text": ""})
    assert valid

# Test 3: Image prompt saving
def test_save_image_prompts():
    """Test that image prompts are saved correctly."""
    pages = [
        {"text": "One apple", "image_prompt": "A red apple on white background"},
        {"text": "Two bananas", "image_prompt": "Two yellow bananas"},
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        output_dir = os.path.join(tmpdir, "prompts")
        save_image_prompts(pages, output_dir, "food")

        # Check content page files were created
        assert os.path.exists(os.path.join(output_dir, "page_01.txt"))
        assert os.path.exists(os.path.join(output_dir, "page_02.txt"))

        # Check cover and back cover prompts were created
        assert os.path.exists(os.path.join(output_dir, "book_cover.txt"))
        assert os.path.exists(os.path.join(output_dir, "back_cover.txt"))

        # Check content includes prefix
        with open(os.path.join(output_dir, "page_01.txt")) as f:
            content = f.read()
            assert content.startswith(IMAGE_PROMPT_PREFIX)
            assert "A red apple on white background" in content

        # Check cover includes topic
        with open(os.path.join(output_dir, "book_cover.txt")) as f:
            assert "food" in f.read()

# Test 4: PDF building with placeholders
def test_build_pdf_with_placeholders():
    """Test PDF builds correctly without images (shows placeholders)."""
    pages = [
        {"text": "Red circle", "image_prompt": "A bright red circle"},
        {"text": "Blue square", "image_prompt": "A blue square shape"},
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        # Test preview PDF
        preview_path = os.path.join(tmpdir, "preview.pdf")
        result = build_prompts_only_pdf(pages, preview_path)
        assert os.path.exists(result)
        assert os.path.getsize(result) > 0

        # Test main PDF (with missing images - shows placeholders)
        pdf_path = os.path.join(tmpdir, "book.pdf")
        images_dir = os.path.join(tmpdir, "images")
        os.makedirs(images_dir)
        result = build_pdf(pages, images_dir, pdf_path)
        assert os.path.exists(result)
        assert os.path.getsize(result) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
