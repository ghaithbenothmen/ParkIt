from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel, HttpUrl
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np
from PIL import Image
import logging
from typing import Optional, Union
from pymongo import MongoClient
from datetime import datetime
import pytesseract
import io
import requests

# Configure pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Claim Image Analysis API")

# Connect to MongoDB
mongo_client = MongoClient("mongodb://localhost:27017")
db = mongo_client["claim_db"]
claims_collection = db["claims"]

# Pydantic models
class ImageAnalysisRequest(BaseModel):
    userId: Optional[str] = None
    parkingId: Optional[str] = None
    claimType: Optional[str] = None

class ImageAnalysisResponse(BaseModel):
    detectedType: str
    confidence: float
    detectedPriority: int
    analysisFeedback: str
    claimId: Optional[str] = None

# Load MobileNetV2 model
model = MobileNetV2(weights="imagenet")

def analyze_image(image: Image.Image, claim_type: Optional[str]) -> dict:
    try:
        # Claim type specified manually
        if claim_type and claim_type.lower() == "payment issue":
            return {
                "detectedType": "Payment Issue",
                "confidence": 1.0,
                "detectedPriority": 10,
                "analysisFeedback": "Type de claim spécifié : Payment Issue."
            }

        # OCR text detection
        text = pytesseract.image_to_string(image).lower()
        if "payment failed" in text or "payment issue" in text or "damage" in text:
            return {
                "detectedType": "Payment Issue" if "payment" in text else "Security",
                "confidence": 0.95,
                "detectedPriority": 10 if "payment" in text else 12,
                "analysisFeedback": f"Texte détecté : {text[:50]}... ({'Payment Issue' if 'payment' in text else 'Security (Damage)'} identifié)."
            }

        # Image classification
        img = image.resize((224, 224))
        img_array = np.array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        decoded_predictions = decode_predictions(predictions, top=3)[0]

        type_mapping = {
            "car": {"type": "Spot Occupied", "priority": 8},
            "truck": {"type": "Spot Occupied", "priority": 8},
            "parking": {"type": "Spot Occupied", "priority": 8},
            "crowd": {"type": "Security", "priority": 15},
            "sign": {"type": "Other", "priority": 2},
            "damage": {"type": "Security", "priority": 12},
            "payment issue": {"type": "Payment Issue", "priority": 10}
        }

        detected_type = "Other"
        detected_priority = 1
        confidence = 0.1
        analysis_feedback = "Analyse d’image terminée."

        for _, label, prob in decoded_predictions:
            label_lower = label.lower()
            for key in type_mapping:
                if key in label_lower:
                    detected_type = type_mapping[key]["type"]
                    detected_priority = type_mapping[key]["priority"]
                    confidence = prob
                    analysis_feedback = f"Objet détecté : {label} (confiance : {confidence:.2f})."
                    break
            if detected_type != "Other":
                break

        return {
            "detectedType": detected_type,
            "confidence": float(confidence),
            "detectedPriority": detected_priority,
            "analysisFeedback": analysis_feedback
        }

    except Exception as e:
        logger.error(f"Erreur lors de l’analyse de l’image : {str(e)}")
        return {
            "detectedType": "Other",
            "confidence": 0.1,
            "detectedPriority": 0,
            "analysisFeedback": f"Erreur lors de l’analyse : {str(e)}"
        }

@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(
    file: Union[UploadFile, None] = File(default=None),
    imageUrl: Optional[str] = Form(default=None),
    userId: Optional[str] = Form(default=None),
    parkingId: Optional[str] = Form(default=None),
    claimType: Optional[str] = Form(default=None)
):
    logger.info(f"Requête reçue : userId={userId}, parkingId={parkingId}, claimType={claimType}")

    try:
        if file is not None:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            photo_evidence = "Uploaded"

        elif imageUrl is not None:
            response = requests.get(imageUrl)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Image URL not accessible.")
            img = Image.open(io.BytesIO(response.content)).convert("RGB")
            photo_evidence = imageUrl

        else:
            return ImageAnalysisResponse(
                detectedType="Other",
                confidence=0.1,
                detectedPriority=0,
                analysisFeedback="Aucune image fournie.",
                claimId=None
            )

        analysis_result = analyze_image(img, claimType)

        # Save to MongoDB
        claim_data = {
            "userId": userId,
            "parkingId": parkingId,
            "claimType": analysis_result["detectedType"],
            "photoEvidence": photo_evidence,
            "priority": analysis_result["detectedPriority"],
            "status": "Pending",
            "aiAnalysis": analysis_result,
            "submissionDate": datetime.now()
        }
        result = claims_collection.insert_one(claim_data)
        claim_id = str(result.inserted_id)

        return ImageAnalysisResponse(
            detectedType=analysis_result["detectedType"],
            confidence=analysis_result["confidence"],
            detectedPriority=analysis_result["detectedPriority"],
            analysisFeedback=analysis_result["analysisFeedback"],
            claimId=claim_id
        )

    except Exception as e:
        logger.error(f"Erreur dans le endpoint analyze-image : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@app.post("/analyze-image-url", response_model=ImageAnalysisResponse)
async def analyze_image_from_url(
    imageUrl: HttpUrl,
    userId: Optional[str] = Query(None),
    parkingId: Optional[str] = Query(None),
    claimType: Optional[str] = Query(None)
):
    logger.info(f"Requête reçue pour URL : {imageUrl}")
    try:
        response = requests.get(imageUrl)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Image URL not accessible.")

        img = Image.open(io.BytesIO(response.content)).convert("RGB")
        analysis_result = analyze_image(img, claimType)

        claim_data = {
            "userId": userId,
            "parkingId": parkingId,
            "claimType": analysis_result["detectedType"],
            "photoEvidence": imageUrl,
            "priority": analysis_result["detectedPriority"],
            "status": "Pending",
            "aiAnalysis": analysis_result,
            "submissionDate": datetime.now()
        }
        result = claims_collection.insert_one(claim_data)
        claim_id = str(result.inserted_id)

        return ImageAnalysisResponse(
            detectedType=analysis_result["detectedType"],
            confidence=analysis_result["confidence"],
            detectedPriority=analysis_result["detectedPriority"],
            analysisFeedback=analysis_result["analysisFeedback"],
            claimId=claim_id
        )

    except Exception as e:
        logger.error(f"Erreur lors de l’analyse via URL : {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)