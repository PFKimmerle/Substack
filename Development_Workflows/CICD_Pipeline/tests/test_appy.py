import pytest
from Development_Workflows.CICD_Pipeline.app import greet


def test_greet():
    assert greet() == "Hello!"