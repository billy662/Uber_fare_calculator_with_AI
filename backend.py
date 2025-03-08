import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import PIL.Image
from io import BytesIO
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UberRide(BaseModel):
    time: str
    duration_minutes: float
    distance_km: float
    surge_hkd: Optional[float] = None
    waiting_fee: Optional[str] = None
    price_hkd: float
    type_of_ride: str

def create_session_with_retries():
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504]
    )
    session.mount('http://', HTTPAdapter(max_retries=retries))
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

def generate(image_urls):
    """
    Process Uber ride receipt images and extract structured data.
    
    Args:
        image_urls: List of image URLs or file paths to process
        
    Returns:
        List of parsed UberRide objects
    """
    # Load environment variables from .env file
    load_dotenv()
    # Get API key from environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        return {"error": "API key not configured"}
    
    client = genai.Client(
        api_key=api_key,
    )
    model = "gemini-2.0-flash"
    
    # Prepare content parts
    content_parts = ["Please analyze these Uber ride receipts and create the requested table:"]
    
    # Create a session with retries
    session = create_session_with_retries()
    
    # Add each image to the parts list using requests
    for image_url in image_urls:
        try:
            if image_url.startswith('file://'):
                # Local file path
                file_path = image_url[7:]  # Remove 'file://' prefix
                pil_image = PIL.Image.open(file_path)
                content_parts.append(pil_image)
            else:
                # Remote URL
                response = session.get(image_url, timeout=10)
                response.raise_for_status()
                pil_image = PIL.Image.open(BytesIO(response.content))
                content_parts.append(pil_image)
        except Exception as e:
            logger.error(f"Error processing image {image_url}: {str(e)}")
            continue

    if len(content_parts) <= 1:  # Only has the initial text, no images
        logger.warning("No images were successfully processed")
        return {"error": "No images were successfully processed"}
    
    # System instruction
    system_instruction = """I will provide screenshots of my Uber ride history in Hong Kong. I need you to extract the data from it summarizing the details of each trip and turn the data in JSON.
The JSON should include the following columns and sort by time, from earliest to latest, and exclude rides that are canceled:
*Time of the ride
*Duration (minutes): Numeric value (e.g., 20.43).
*Distance (km):
*Surge (HK$): Amount of 加乘費用 or blank if none. Do not treat 通行費 as 加乘費用.
*Waiting Fee?:  If, within the ride details, there is a visual indicator consisting of a small, green colored box containing an upward pointing arrow icon, and the text "已增加" displayed alongside or within that box, then in the "Waiting Fee?" column, enter "X". Otherwise, leave the cell blank. 
*Price (HK$):
*Type of ride: Usually "的士(預定價錢)", "咪錶的士" or "咪錶的士(乘客八五折)"
Please ensure the JSON accurately reflects the information in the screenshot. Show the JSON only."""
    
    try:
        # Send request with JSON configuration
        response = client.models.generate_content(
            model=model,
            contents=content_parts,
            config={
                'response_mime_type': 'application/json',
                'response_schema': list[UberRide],
                'system_instruction': system_instruction,
            }
        )
        
        # Get parsed response
        rides: List[UberRide] = response.parsed
        
        # Convert to the expected frontend format
        result = []
        for ride in rides:
            formatted_ride = {
                "Time of the ride": ride.time,
                "Duration (minutes)": ride.duration_minutes,
                "Distance (km)": ride.distance_km,
                "Surge (HK$)": str(ride.surge_hkd) if ride.surge_hkd is not None else "",
                "Waiting Fee?": ride.waiting_fee if ride.waiting_fee else "",
                "Price (HK$)": ride.price_hkd,
                "Type of ride": ride.type_of_ride
            }
            result.append(formatted_ride)
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        
        # Provide error message if there's an error
        error_message = [
            {
                "Duration (minutes)": 0,
                "Distance (km)": 0,
                "Surge (HK$)": "0",
                "Waiting Fee?": "0",
                "Price (HK$)": 0
            }
        ]
        
        return error_message

if __name__ == "__main__":
    # For testing in standalone mode
    """
    image_urls = [
        "http://easystat.rf.gd/uber/res/ub_receipt1.jpg",
        "http://easystat.rf.gd/uber/res/ub_receipt2.jpg",
        "http://easystat.rf.gd/uber/res/ub_receipt3.jpg"
    ]
    

    result = generate(image_urls)
    print(json.dumps(result, indent=2))
    """