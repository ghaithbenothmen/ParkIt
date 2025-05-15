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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NODE_BACKEND_BASE_URL = "http://api:3000/api/voice"

class DialogflowWebhookBody(BaseModel):
    session: str
    queryResult: dict
    originalDetectIntentRequest: dict

INTENT_ROUTE_MAP = {
    "BookParking": "",
    "CancelParking": "/cancelParking",
    "CheckAvailability": "/checkAvailability",
}

@app.post("/voice")
async def dialogflow_webhook(request: Request, body: DialogflowWebhookBody):
    query_result = body.queryResult
    intent = query_result.get("intent", {}).get("displayName")

    # Get userId from Dialogflow payload
    user_id = (
        body.originalDetectIntentRequest
        .get("payload", {})
        .get("fields", {})
        .get("userId", {})
        .get("stringValue")
    ) or body.session.rsplit("/", 1)[-1]

    print("User ID:", user_id)

    if intent not in INTENT_ROUTE_MAP:
        return {"fulfillmentText": f"Sorry, I don't know how to handle intent '{intent}'."}

    node_route = INTENT_ROUTE_MAP[intent]
    endpoint_url = NODE_BACKEND_BASE_URL + node_route

    params = query_result.get("parameters", {})
    payload = {"userId": user_id}
    fulfillment_text = ""

    if intent == "BookParking":
        parking_name = params.get("parkingName") or "Esprit Parking"
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
        try:
            date = dateutil.parser.isoparse(date_str)
        except Exception:
            return {"fulfillmentText": "Invalid date format."}
        payload.update({"lot": lot_name, "date": date.date().isoformat()})
        fulfillment_text = f"Checking availability for {lot_name} on {date.date().isoformat()}."

    try:
        resp = requests.post(endpoint_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        reply = data.get("reply")
        reservation_id = data.get("data", {}).get("_id")
        if resp.status_code == 201 and reservation_id:
            return {
                "fulfillmentText": fulfillment_text,
                "payload": {
                    "redirect": f"http://localhost:3000/providers/booking/{reservation_id}"
                }
            }
        else:
            return {"fulfillmentText": reply}

    except requests.RequestException as e:
        print(f"Error calling {endpoint_url}: {e}")
        return {"fulfillmentText": "Sorry, I'm having trouble connecting to the service right now."}

def parse_duration(duration_str):
    if isinstance(duration_str, (int, float)):
        duration_str = f"PT{int(duration_str)}H"
    return isodate.parse_duration(duration_str)
