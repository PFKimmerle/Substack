
# Movie Mood Analyzer

A beginner-friendly project to analyze the sentiment of movie reviews using machine learning. This web app uses Flask for the backend and VADER for sentiment analysis to determine if a movie review is positive or negative. 

## Features
- Simple HTML form to enter movie reviews
- Sentiment analysis using **VADER** (Valence Aware Dictionary and sEntiment Reasoner)
- Instant feedback on whether the review is positive or negative

## How It Works
1. The user enters a movie review in the form.
2. Flask handles the request and sends the review to the backend.
3. VADER processes the text and returns the sentiment (positive or negative) along with a confidence score.
4. The result is displayed back on the page.

## Setup Instructions

1. **Clone the repository**:
    git clone https://github.com/PFKimmerle/Substack.git 
    cd Movie-Mood-Analyzer

2. **Install dependencies**:
    pip install -r requirements.txt

3. **Run the app**:
    python app.py

4. **Open the app**:  
   Go to `http://127.0.0.1:5000` in your web browser to access the app.

## Optional: Using Environment Variables
If you'd like more control over configuration (like enabling debug mode or managing API keys), you can use `python-dotenv` to handle environment variables.
Simply install it with:  pip install python-dotenv
Then create a `.env` file to store settings like `DEBUG=True`.

## Dependencies
- **Flask**: Web framework to handle routing and HTTP requests
- **vaderSentiment**: Pre-trained sentiment analysis model for quick and simple sentiment scoring

## Example Reviews
Here are some sample reviews to try:
- "This movie was an absolute masterpiece!"
- "Complete waste of time and money."
- "It was okay, nothing spectacular."

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.