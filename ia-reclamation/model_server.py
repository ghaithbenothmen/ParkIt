from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image, UnidentifiedImageError
import torch
from torchvision import models, transforms
import io
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Determine device
DEVICE = torch.device("cpu")  # Force CPU usage
print(f"Using device: {DEVICE}")

# Load model
model = models.resnet18(weights=None)
model.fc = torch.nn.Sequential(
    torch.nn.Linear(model.fc.in_features, 128),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.3),
    torch.nn.Linear(128, 5),
    torch.nn.Sigmoid(),
)
model = model.to(DEVICE)

# Model path (match helmi.py output)
#MODEL_PATH = os.path.join("/app/type", "resnet_car_classifier.pth")
MODEL_PATH = os.path.join("C:\\Users\\helmi\\ParkIt\\ia-reclamation\\resnet_car_classifier.pth")


try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()
    print(f"Successfully loaded model from {MODEL_PATH}")
except Exception as e:
    import traceback
    print(f"Error loading model: {traceback.format_exc()}")
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}")

labels = ["available", "occupied", "wrong_parking", "accident", "others"]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    try:
        # Validate file extension
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise HTTPException(
                status_code=400,
                detail="Unsupported image format. Please upload JPG or PNG.",
            )
        
        # Load and process image
        image_data = await file.read()
        try:
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        except UnidentifiedImageError:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file. Could not identify image format.",
            )
        
        # Transform and classify
        tensor = transform(image).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            output = model(tensor)
            binary = (output > 0.5).int().squeeze().tolist()
        
        return {labels[i]: bool(binary[i]) for i in range(5)}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        print(f"Error processing image: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)