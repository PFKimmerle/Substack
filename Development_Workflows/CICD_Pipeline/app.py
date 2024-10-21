import pytest
from app import greet

@pytest.mark.parametrize(
    "name, expected", [
        ("Intern", "Hello, Intern!"),
        ("Developer", "Hello, Developer!")
    ]
)
def test_greet(name, expected):
    assert greet(name) == expected
