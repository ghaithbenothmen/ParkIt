import torch
from torchvision import models, transforms
from PIL import Image
import os

# Define model loading
def load_model(model_path="resnet_car_classifier.pth", device=None):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = torch.nn.Sequential(
        torch.nn.Linear(model.fc.in_features, 128),
        torch.nn.ReLU(),
        torch.nn.Dropout(0.3),
        torch.nn.Linear(128, 5),  # 5 classes
        torch.nn.Sigmoid()
    )
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    return model.to(device)

# Define classification function
def classify_image(model, image_path, device):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        prediction = (output > 0.5).int().cpu().squeeze().tolist()

    labels = ['available', 'occupied', 'wrong_parking', 'accident', 'others']
    return {labels[i]: bool(prediction[i]) for i in range(len(labels))}