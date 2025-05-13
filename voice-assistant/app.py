from fastapi import FastAPI, Request
from datetime import datetime, timedelta
import isodate
import dateutil.parser
import requests
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base URL for your Node.js backend
NODE_BACKEND_BASE_URL = "http://api:3000/api/voice"

class DialogflowWebhookBody(BaseModel):
    session: str                # e.g. "projects/…/agent/sessions/<USER_ID>"
    queryResult: dict

# Map Dialogflow intent names to Node.js route paths
INTENT_ROUTE_MAP = {
    "BookParking": "",
    "CancelParking": "/cancelParking",
    "CheckAvailability": "/checkAvailability",
    # Add more intent-to-route mappings here
}

@app.post("/voice")
async def dialogflow_webhook(request: Request, body: DialogflowWebhookBody):
    # Extract Dialogflow payload
    query_result = body.queryResult
    intent = query_result.get("intent", {}).get("displayName")

    # Default fallback if intent not recognized
    if intent not in INTENT_ROUTE_MAP:
        return {"fulfillmentText": f"Sorry, I don't know how to handle intent '{intent}'."}

    # Determine which Node.js route to call
    node_route = INTENT_ROUTE_MAP[intent]
    endpoint_url = NODE_BACKEND_BASE_URL + node_route

    # Common parameters
    params = query_result.get("parameters", {})
    user_id = body.session.rsplit("/", 1)[-1]

    # Build payload and fulfillment
    payload = {"userId": "67c73ea3191de590b7f141ad"}
    fulfillment_text = ""
    redirect = ""

    # Handle each intent's parameters
    if intent == "BookParking":
        parking_name = params.get("parkingName") or "mourouj"
        if parking_name.lower().startswith("m"):
            parking_name = "mourouj"
        start_str = params.get("startDate")
        end_str = params.get("endDate")
        duration = params.get("duration")

        # Validate dates
        start_time_str = start_str["date_time"]
        start = dateutil.parser.isoparse(start_time_str)

        # Compute end
        if end_str:
            end = dateutil.parser.isoparse(end_str)
        elif duration:
            duration_timedelta = parse_duration(duration)
            end = start + duration_timedelta
        else:
            return {"fulfillmentText": "How long do you want to park?"}

        if end <= start:
            return {"fulfillmentText": "End time must be after start time."}

        payload.update({
            "lot": parking_name,
            "start": start.isoformat(),
            "end": end.isoformat(),
        })
        fulfillment_text = f"Parking at {parking_name} booked successfully."

    elif intent == "CancelParking":
        booking_id = params.get("bookingId")
        if not booking_id:
            return {"fulfillmentText": "Please provide your booking ID to cancel."}
        payload.update({"bookingId": booking_id})
        fulfillment_text = f"Your booking {booking_id} has been cancelled."

    elif intent == "CheckAvailability":
        lot_name = params.get("parkingName")
        date_str = params.get("date")
        if not lot_name or not date_str:
            return {"fulfillmentText": "Which lot and date would you like to check?"}
        date = dateutil.parser.isoparse(date_str)
        payload.update({"lot": lot_name, "date": date.date().isoformat()})
        fulfillment_text = f"Checking availability for {lot_name} on {date.date().isoformat()}."
        

    # Call the Node.js backend
    try:
        resp = requests.post(endpoint_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        reservation_id = data.get("data", {}).get("_id")
        if resp.status_code == 201 and reservation_id:
            return {
                "fulfillmentText": fulfillment_text,
                "payload": {
                    "redirect": f"http://localhost:3000/providers/booking/{reservation_id}"
                }
            }

        else:
            return {"fulfillmentText": data.get("message", "Operation failed. Please try again.")}

    except requests.RequestException as e:
        # Log error and notify user
        print(f"Error calling {endpoint_url}: {e}")
        return {"fulfillmentText": "Sorry, I'm having trouble connecting to the service right now."}


def parse_duration(duration_str):
    if isinstance(duration_str, (int, float)):
        duration_str = f"PT{int(duration_str)}H"
    return isodate.parse_duration(duration_str)