import pytest
from app import greet

@pytest.mark.parametrize("name,expected", [
    ("Intern", "Hello, Intern! Welcome to our CI/CD project!"),
    ("Developer", "Hello, Developer! Welcome to our CI/CD project!")
])
def test_greet(name, expected):
    assert greet(name) == expected
