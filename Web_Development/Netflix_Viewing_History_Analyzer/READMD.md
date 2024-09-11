# Netflix Viewing History Analyzer

A Python-based tool for analyzing Netflix viewing history and providing insights such as total shows watched, most-watched genres, and viewing patterns over time.

## Features
- Analyze your Netflix viewing history from a CSV file.
- Get insights into your most-watched shows, genres, and time spent watching.
- Breakdown of your viewing habits by year, month, and day of the week.


## Setup and Installation

### Step 1: Clone the repository 
git clone https://github.com/PFKimmerle/Substack.git

### Step 2: Set up a virtual environment
python -m venv netflix_env
source netflix_env/Scripts/activate  # For Windows
source netflix_env/bin/activate # For Mac/Linux:

### Step 3: Install the required Python libraries
pip install -r requirements.txt

### Step 4: Run the analysis tool
python cli.py --file /path/to/your/NetflixViewingHistory.csv


## How It Works
1. You will need your **Netflix viewing history CSV file**, which you can download from Netflix's account settings.
2. Use the CLI tool to specify the path to your viewing history file:
python cli.py --file /path/to/your/NetflixViewingHistory.csv


## Example Output
Here are some of the insights the tool provides:
- Total shows/movies watched
- Most-watched shows
- Viewing breakdown by year, month, and day of the week
- Total time spent watching
- Most-watched genres