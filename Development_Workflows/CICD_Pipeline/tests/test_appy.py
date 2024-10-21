import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import greet



@pytest.mark.parametrize("name,expected", [
    ("Intern", "Hello, Intern! Welcome to our CI/CD project!"),
    ("Developer", "Hello, Developer! Welcome to our CI/CD project!")
])
def test_greet(name, expected):
    assert greet(name) == expected
