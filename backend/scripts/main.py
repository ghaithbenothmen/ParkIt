from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import logging
from typing import Optional
from pymongo import MongoClient
from datetime import datetime

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialiser FastAPI
app = FastAPI(title="Reclamation Image Analysis API")

# Connexion à MongoDB (optionnel)
mongo_client = MongoClient("mongodb://localhost:27017")
db = mongo_client["reclamation_db"]
reclamations_collection = db["reclamations"]

# Modèle Pydantic pour valider les entrées
class ImageAnalysisRequest(BaseModel):
    photoEvidence: str
    utilisateurId: Optional[str] = None
    parkingId: Optional[str] = None

# Modèle Pydantic pour la réponse
class ImageAnalysisResponse(BaseModel):
    detectedType: str
    confidence: float
    detectedPriorite: int
    analysisFeedback: str
    reclamationId: Optional[str] = None

# Charger le modèle MobileNetV2
model = MobileNetV2(weights="imagenet")

def analyze_image(photo_url: str) -> dict:
    try:
        if not photo_url:
            return {
                "detectedType": "Autre",
                "confidence": 0.1,
                "detectedPriorite": 2,
                "analysisFeedback": "Aucune image fournie, type par défaut : Autre."
            }

        # Télécharger l'image
        response = requests.get(photo_url)
        logger.info(f"Statut de la requête : {response.status_code}, Content-Type : {response.headers.get('Content-Type')}")
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert("RGB")
        
        # Redimensionner l'image à 224x224 (requis par MobileNetV2)
        img = img.resize((224, 224))
        img_array = np.array(img)
        
        # Prétraiter l'image
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Faire la prédiction
        predictions = model.predict(img_array)
        decoded_predictions = decode_predictions(predictions, top=3)[0]
        
        # Mapper les prédictions à typeReclamation et priorite
        type_mapping = {
                "car": {"type": "Place Occupée", "priorite": 8},
                "truck": {"type": "Place Occupée", "priorite": 8},
                "parking": {"type": "Place Occupée", "priorite": 8},
                "crowd": {"type": "Sécurité", "priorite": 15},
                "sign": {"type": "Autre", "priorite": 5},
                "damage": {"type": "Sécurité", "priorite": 12}
        }
        
        detected_type = "Autre"
        detected_priorite = 5
        confidence = 0.1
        analysis_feedback = "Analyse d’image terminée."
        
        for _, label, prob in decoded_predictions:
            label_lower = label.lower()
            for key in type_mapping:
                if key in label_lower:
                    detected_type = type_mapping[key]["type"]
                    detected_priorite = type_mapping[key]["priorite"]
                    confidence = prob
                    analysis_feedback = f"Objet détecté : {label} (confiance : {confidence:.2f})."
                    break
            if detected_type != "Autre":
                break
        
        return {
            "detectedType": detected_type,
            "confidence": float(confidence),
            "detectedPriorite": detected_priorite,
            "analysisFeedback": analysis_feedback
        }
    
    except Exception as e:
        logger.error(f"Erreur lors de l’analyse de l’image : {str(e)}")
        return {
            "detectedType": "Autre",
            "confidence": 0.1,
            "detectedPriorite": 2,
            "analysisFeedback": f"Erreur lors de l’analyse : {str(e)}"
        }

@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(request: ImageAnalysisRequest):
    logger.info(f"Requête reçue : {request}")
    
    # Analyser l’image
    analysis_result = analyze_image(request.photoEvidence)
    
    # Préparer les données de la réclamation
    reclamation_data = {
        "utilisateurId": request.utilisateurId,
        "parkingId": request.parkingId,
        "typeReclamation": analysis_result["detectedType"],
        "photoEvidence": request.photoEvidence,
        "priorite": analysis_result["detectedPriorite"],
        "statut": "En Cours",
        "aiAnalysis": analysis_result,
        "dateSoumission": datetime.now()
    }
    
    # Stocker dans MongoDB (optionnel)
    try:
        result = reclamations_collection.insert_one(reclamation_data)
        reclamation_id = str(result.inserted_id)
        logger.info(f"Réclamation stockée avec ID : {reclamation_id}")
    except Exception as e:
        logger.error(f"Erreur lors de l’enregistrement dans MongoDB : {str(e)}")
        reclamation_id = None
    
    # Préparer la réponse
    response = ImageAnalysisResponse(
        detectedType=analysis_result["detectedType"],
        confidence=analysis_result["confidence"],
        detectedPriorite=analysis_result["detectedPriorite"],
        analysisFeedback=analysis_result["analysisFeedback"],
        reclamationId=reclamation_id
    )
    
    return response

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)