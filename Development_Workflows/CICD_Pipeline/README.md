## CI/CD Pipeline

A demonstration of modern CI/CD practices using GitHub Actions, showcasing automated testing and code quality checks for Python applications.

## Features
- Automated testing with pytest
- Code quality checks using flake8
- Python version testing (3.10)
- Automated workflow triggers on push and pull requests

## CI/CD Pipeline Steps

- Code Checkout: Fetches latest code
- Environment Setup: Configures Python
- Linting: Runs flake8 for code quality
- Testing: Executes pytest suite
- Application Run: Verifies application execution

## Running Tests
This project is configured to run tests automatically through GitHub - Actions. To see test results:

1. Push changes to GitHub
2. Visit the Actions tab in your repository
3. View the latest workflow run