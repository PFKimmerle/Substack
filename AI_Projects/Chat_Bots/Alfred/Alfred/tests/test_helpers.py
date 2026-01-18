# tests/test_helpers.py
"""
Basic tests for Alfred's core functions.
Run with: pytest tests/

Run from Alfred root directory.
"""
import pytest
import sys
from pathlib import Path

# Add server/app/services to path so we can import search_service
sys.path.insert(0, str(Path(__file__).parent.parent / "server" / "app" / "services"))

from search_service import _prep_query, is_safe_url

def test_query_cleaning_whitespace():
    """Test that query cleaning removes extra whitespace"""
    assert _prep_query("  hello  ") == "hello"
    assert _prep_query("test\n\n") == "test"
    assert _prep_query("  multiple   spaces  ") == "multiple spaces"

def test_query_cleaning_urls():
    """Test that URLs are removed from queries"""
    assert _prep_query("check https://example.com for info") == "check for info"
    assert _prep_query("http://test.com") == ""

def test_query_cleaning_instructiony_words():
    """Test that instructiony words are removed"""
    assert _prep_query("please search for cats") == "for cats"
    assert _prep_query("can you tell me about dogs") == "about dogs"
    assert _prep_query("find information on python") == "information on python"

def test_url_safety_localhost():
    """Test that localhost URLs are blocked"""
    assert is_safe_url("http://localhost") == False
    assert is_safe_url("http://127.0.0.1") == False
    assert is_safe_url("http://0.0.0.0") == False
    assert is_safe_url("http://[::1]") == False

def test_url_safety_private_ips():
    """Test that private IP addresses are blocked"""
    assert is_safe_url("http://192.168.1.1") == False
    assert is_safe_url("http://10.0.0.1") == False
    assert is_safe_url("http://172.16.0.1") == False

def test_url_safety_public_urls():
    """Test that public URLs are allowed"""
    assert is_safe_url("https://google.com") == True
    assert is_safe_url("https://github.com") == True
    assert is_safe_url("https://python.org") == True

def test_url_safety_invalid():
    """Test that invalid URLs are blocked"""
    assert is_safe_url("not a url") == False
    assert is_safe_url("") == False
    assert is_safe_url("ftp://example.com") == False  # no hostname parsed

# Optional: Memory tests (uncomment if you want to test memory functions)
# def test_memory_retrieval():
#     from memory import recall_all
#     mem = recall_all()
#     assert isinstance(mem, dict)
#     # Check for expected keys
#     assert "location" in mem or "name" in mem or "interests" in mem

if __name__ == "__main__":
    # Allow running tests directly with: python tests/test_helpers.py
    pytest.main([__file__, "-v"])