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

4. Run the application:
python app.py

Environment Variables
GEMINI_API_KEY: Your Google Gemini API key
PYTHONDONTWRITEBYTECODE: Set to 1 to prevent Python from writing .pyc files
PYTHONUNBUFFERED: Set to 1 for unbuffered Python output

├── app.py             # Flask application entry point
├── backend.py         # Backend logic and AI processing
├── Dockerfile         # Docker configuration
├── requirements.txt   # Python dependencies
├── resources/         # Upload directory for images
└── templates/         # HTML templates
    └── index.html    # Main application interface

License
This project is for demonstration purposes. Use responsibly and in accordance with Uber's terms of service.


This README provides a comprehensive overview of your project, including its features, setup instructions, and structure. Feel free to modify or expand it based on your specific needs.This README provides a comprehensive overview of your project, including its features, setup instructions, and structure. Feel free to modify or expand it based on your specific needs.