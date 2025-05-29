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
    tip: Optional[float] = None
    price_hkd: float
    type_of_ride: str
    airport_trip: str

def create_session_with_retries():
    """Creates a requests session with retry logic."""
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504]
    )
    session.mount('http://', HTTPAdapter(max_retries=retries))
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

def generate(image_urls, selected_model="Model1"):
    """
    Process Uber ride receipt images and extract structured data using the specified model.

    Args:
        image_urls: List of image URLs or file paths to process.
        selected_model: The model choice ("Model1" or "Model2") from the frontend.

    Returns:
        List of parsed UberRide objects or an error dictionary.
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

    logger.info(f"Using model: {selected_model}") # Log the received model name
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
    system_instruction = """
I will provide screenshots of my Uber ride history in Hong Kong. I need you to extract the data from these screenshots, summarizing the details of each trip, and return the data in JSON format. Do not include any text in your reply other than the JSON. All extracted numeric values should be rounded to two decimal places.

The JSON output should be an array of objects, where each object represents a single ride. Please sort the rides by their start time, from earliest to latest. Be mindful of '上午' (AM) and '下午' (PM) indicators for correct chronological sorting before converting to 24-hour format.

Exclude any rides that were cancelled (e.g., those showing "顧客取消了訂單" or having a price of HK$0.00 due to cancellation). If duplicate ride entries are found across multiple images (based on time, price, and type), please ensure each unique ride appears only once in the final JSON output.

For each ride, extract the following fields, the JSON should use the exact field names provided:

* Time: This is the start time of the ride. The times in the images are in 12-hour format. '上午' denotes AM, and '下午' denotes PM. Convert this to a 24-hour format string (e.g., '上午 9:26' becomes "09:26", '下午 1:45' becomes "13:45", and '下午 11:35' becomes "23:35").
* Duration: Extract the ride duration. This is often shown as "X 分鐘 Y 秒" (X minutes Y seconds) or "X 分鐘" (X minutes). Convert this into a single numeric value representing total minutes. For example, "17 分鐘 27 秒" should be calculated as 17 + (27/60) = 17.45. If only minutes are shown, use that value. The result should be a numeric value (e.g., 20.43).
* Distance: Extract the distance of the ride in kilometers. This should be a numeric value (e.g., 5.72).
* Surge: Identify any surge pricing. This is usually indicated by text like "加乘費用" or "加乘計費" followed by an amount (e.g., "HK$4.44 加乘計費"). Extract only the numeric amount of the surge. If no surge is indicated, this field should be an empty string "". Do not confuse "通行費" (tolls) with surge pricing.
* Waiting Fee?: Check for a waiting fee indicator. If you see a small, green-colored box with an upward-pointing arrow icon and the text "已增加" near the ride details, set this field to "X". Otherwise, it should be an empty string "".
* Tip: Look for text explicitly stating "貼士" (Tip). If present, extract the numeric amount of the tip that is in front this text. If no tip is mentioned, this field should be an empty string "".
* Price: This is the final price of the ride displayed prominently (e.g., HK$101.25). Extract this as a numeric value.
* Type: Extract the type of ride. This will typically be text such as "的士(預定價錢)", "咪錶的士", "咪錶的士(乘客八五折)", "UberX", "Uber Pet", "Comfort", "UberXL", "UberXXL", or "Black". Capture the full text as shown for the ride type.

Please ensure the highest level of accuracy in extracting and formatting this information according to the specifications above.
"""
    
    try:
        # --- INTENTIONAL ERROR FOR TESTING ---
        #raise ValueError("Intentional test error")
        # ------------------------------------

        # Send request with JSON configuration
        response = client.models.generate_content(
            model=selected_model, # Directly use the model name received from frontend
            contents=content_parts,
            config={
                'response_mime_type': 'application/json',
                'response_schema': list[UberRide],
                'system_instruction': system_instruction,
                'temperature': 0.2,
                'top_p': 0.95,
                'top_k': 50,
            }
        )
        
        # Get parsed response
        rides: List[UberRide] = response.parsed
        
        # Convert to the expected frontend format
        result = []
        for ride in rides:
            formatted_ride = {
                "Time": ride.time,
                "Duration": ride.duration_minutes,
                "Distance": ride.distance_km,
                "Surge": str(ride.surge_hkd) if ride.surge_hkd is not None else "",
                "Waiting Fee?": ride.waiting_fee if ride.waiting_fee else "",
                "Tip": str(ride.tip) if ride.tip is not None else "",
                "Price": ride.price_hkd,
                "Type": ride.type_of_ride
            }
            result.append(formatted_ride)
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        # Return the actual error message
        return {"error": f"An error occurred during processing: {str(e)}"}

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
