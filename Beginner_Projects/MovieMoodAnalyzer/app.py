from flask import Flask, render_template, request
from model import analyzer  # Importing the VADER sentiment analyzer
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    debug_info = None
    
    examples = [
        "This movie was an absolute masterpiece! The acting was superb and the plot kept me on the edge of my seat!",
        "Complete waste of time and money. The worst movie I've seen in years. Terrible acting and plot holes everywhere.",
        "It was okay. Some good moments but nothing spectacular."
    ]
    
    if request.method == 'POST':
        review = request.form.get('review', '').strip()
        if review:
            analysis = analyzer.predict_sentiment(review)  # Analyze the input review
            result = analysis
            debug_info = analysis.get('debug_info') if app.debug else None
            logger.info(f"Analysis complete: {analysis}")
    
    return render_template('index.html', result=result, debug_info=debug_info, examples=examples)

if __name__ == '__main__':
    app.run(debug=True)
