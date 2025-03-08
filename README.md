# Uber Receipt Analysis Tool

A web application that analyzes Uber taxi receipts in Hong Kong using Google's Gemini AI vision model to extract and calculate fare information.

## Features

- Upload multiple receipt images via drag-and-drop or file selection
- Automatic receipt data extraction using Gemini AI vision model
- Calculation of expected fares based on Hong Kong taxi regulations
- Comparison between actual and calculated fares
- Waiting fee adjustment capability
- Dark mode support
- Copy results to clipboard
- Toggle calculation columns visibility

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Python, Flask
- **AI/ML**: Google Gemini AI
- **Container**: Docker
- **Production Server**: Gunicorn

## Requirements

- Python 3.10+
- Google Gemini API key
- Required Python packages listed in [requirements.txt](requirements.txt)

## Installation

1. Clone the repository
2. Create a `.env` file with your Gemini API key:
GEMINI_API_KEY=your_api_key_here

3. Install dependencies:
```sh
pip install -r requirements.txt
```

4. Run the application:
```sh
python app.py
```

Docker Deployment
Build and run using Docker:
```sh
docker build -t uber-receipt-analysis .
docker run -p 8080:8080 uber-receipt-analysis
```