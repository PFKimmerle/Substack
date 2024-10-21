import pytest
import sys
import os
from app import greet

@pytest.mark.parametrize(
    "name,expected",
    [("Intern", "Welcome to our CI/CD project!"),
    ("Developer", "Welcome to our CI/CD project!")]
)
def test_greet(name, expected):
    assert greet(name) == expected
