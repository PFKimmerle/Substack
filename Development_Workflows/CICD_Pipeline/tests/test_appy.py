import pytest
from Development_Workflows.CICD_Pipeline.app import greet


@pytest.mark.parametrize(
    "name, expected", [
        ("Intern", "Hello, Intern!"),
        ("Developer", "Hello, Developer!")
    ]
)
def test_greet(name, expected):
    assert greet(name) == expected