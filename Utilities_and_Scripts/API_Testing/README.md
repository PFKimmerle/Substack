# Free API Tester

A collection of lightweight tools and scripts to test and demo free public APIs. 

# Files Included

- `apiTester.py` – Python script to test a wide variety of free public APIs.
- `test-weather-api.js` – Node.js script to fetch current weather using Open Meteo API.
- `nasa.html` – HTML demo fetching NASA's Astronomy Picture of the Day (APOD) API.

## Description

Each tool sends a basic test query and reports if the API is responding correctly.

## Installation

1. Clone the repository: https://github.com/PFKimmerle/Substack.git
2. Install the required packages: pip install requests
3. npm install node-fetch (otional for the weather script)


## Usage

1. Open the script `apiTester.py` in a text editor
2. Update the URL to the API you want to test
3. Run the script: python apiTester.py

--

1. `test-weather-api.js` Fetch current weather for a specific location (Okinawa, Japan).
2. Run it with: node test-weather-api.js
3. Output is a JSON response in the terminal

--

1. `nasa.html` Get a free API key from: https://api.nasa.gov
2. Open nasa.html in a text editor and replace DEMO_KEY with your key:
fetch('https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY_HERE')
3. Save and open the file in a browser.


## Note

Free APIs may have rate limits, can be unstable, or may change without notice.