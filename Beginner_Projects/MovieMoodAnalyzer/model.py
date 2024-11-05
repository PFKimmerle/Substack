from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import logging
from typing import Dict, Any

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MovieSentimentAnalyzer:
    def __init__(self):
        """Initialize the VADER sentiment analyzer"""
        self.analyzer = SentimentIntensityAnalyzer()

    def predict_sentiment(self, review_text: str) -> Dict[str, Any]:
        """Analyze sentiment using VADER and return detailed results"""
        try:
            # Get the sentiment scores
            scores = self.analyzer.polarity_scores(review_text)

            # Log raw scores for debugging
            logger.info(f"Analyzing: {review_text}")
            logger.info(f"Raw scores: {scores}")

            # Determine sentiment and confidence based on the compound score
            if scores['compound'] >= 0:
                sentiment = "Positive! 🎬👍"
                is_positive = True
                confidence = scores['compound'] * 100  # Normalize to 0-100%
            else:
                sentiment = "Negative! 🎬👎"
                is_positive = False
                confidence = abs(scores['compound']) * 100  # Normalize to 0-100%

            # Ensure confidence is between 0 and 100
            confidence = max(0, min(100, confidence))

            return {
                'sentiment': sentiment,
                'confidence': f"{confidence:.1f}%",
                'is_positive': is_positive,
                'debug_info': {
                    'compound': f"{scores['compound']:.3f}"  # Only include compound for essential info
                }
            }

        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            return {
                'sentiment': "Error in analysis",
                'confidence': "0%",
                'is_positive': None,
                'debug_info': {'error': str(e)}
            }

# Create analyzer instance
analyzer = MovieSentimentAnalyzer()
