import os
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image, UnidentifiedImageError, ImageTk
import tkinter as tk
from tkinter import filedialog

# ---------------- CONFIG ----------------
BASE_DIR = "/data/type"  # Updated for Docker
CSV_PATH = os.path.join(BASE_DIR, "labels.csv")
SUBFOLDERS = ["acc", "bien placé", "mal stationner", "others"]
MODEL_SAVE_PATH = os.path.join("/app", "resnet_car_classifier.pth")  # Save in container's /app
IMG_SIZE = 224
NUM_CLASSES = 5
BATCH_SIZE = 8
EPOCHS = 5
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------- PATH SETUP FOR CSV GENERATION ----------------
FOLDERS = {
    "acc": "accident",
    "bien placé": "available",
    "mal stationner": "mal_placed",
    "others": "others"
}

# ---------------- IMAGE TRANSFORMS ----------------
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(),
    transforms.ToTensor(),
])

# ---------------- VERIFY IMAGE FILES ----------------
def is_valid_image(path):
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except (UnidentifiedImageError, FileNotFoundError, OSError):
        return False

# ---------------- GENERATE CSV ----------------
def generate_labels_csv():
    if os.path.exists(CSV_PATH):
        print(f"labels.csv already exists at {CSV_PATH}. Skipping generation.")
        return

    data = []
    for folder, label_type in FOLDERS.items():
        folder_path = os.path.join(BASE_DIR, folder)
        if not os.path.exists(folder_path):
            print(f"Folder not found: {folder_path}")
            continue

        for fname in os.listdir(folder_path):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                continue

            row = {
                "filename": fname,
                "available": 0,
                "occupied": 0,
                "wrong_parking": 0,
                "accident": 0,
                "others": 0
            }

            if label_type == "mal_placed":
                row["occupied"] = 1
                row["wrong_parking"] = 1
            else:
                row[label_type] = 1

            data.append(row)

    df = pd.DataFrame(data)
    df.to_csv(CSV_PATH, index=False)
    print(f"labels.csv generated with {len(df)} rows and saved to:\n{CSV_PATH}")

# ---------------- DATASET ----------------
class CarDataset(Dataset):
    def __init__(self, csv_path, base_dir, subfolders, transform=None):
        self.data = pd.read_csv(csv_path)
        self.base_dir = base_dir
        self.subfolders = subfolders
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        filename = row['filename']
        img_path = None
        for folder in self.subfolders:
            full_path = os.path.join(self.base_dir, folder, filename)
            if os.path.exists(full_path):
                img_path = full_path
                break
        if img_path is None:
            raise FileNotFoundError(f"Image not found: {filename}")
        try:
            image = Image.open(img_path).convert("RGB")
        except UnidentifiedImageError:
            raise RuntimeError(f"Corrupted image file: {img_path}")
        if self.transform:
            image = self.transform(image)
        labels = torch.tensor([
            row['available'],
            row['occupied'],
            row['wrong_parking'],
            row['accident'],
            row['others']
        ], dtype=torch.float32)
        return image, labels

# ---------------- GUI INFERENCE FUNCTION ----------------
def gui_image_selection_and_prediction(model, device):
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="Select a car image",
                                           filetypes=[("Image files", "*.jpg *.jpeg *.png")])
    if not file_path:
        print("No image selected.")
        root.destroy()
        return

    window = tk.Toplevel()
    window.title("Selected Image")

    try:
        image = Image.open(file_path).convert("RGB")
        resized = image.resize((300, 300))
        tk_image = ImageTk.PhotoImage(resized)
        label = tk.Label(window, image=tk_image)
        label.pack()

        transform_infer = transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
        ])
        tensor = transform_infer(image).unsqueeze(0).to(device)

        model.eval()
        with torch.no_grad():
            output = model(tensor)
            prediction = (output > 0.5).int().cpu().squeeze().tolist()

        labels = ['Occupied', 'Wrong Parking', 'Accident', 'Others']
        prediction = prediction[1:]  # Skip available
        result_text = "\n".join([f"{labels[i]}: {'OK' if val else 'NO'}" for i, val in enumerate(prediction)])
        result_label = tk.Label(window, text=result_text, font=("Arial", 12))
        result_label.pack()

        print("Prediction:")
        print(result_text)
        window.mainloop()
    except Exception as e:
        print(f"Error during inference: {e}")
        window.destroy()
    finally:
        root.destroy()

# ---------------- MAIN ----------------
if __name__ == "__main__":
    # --- GENERATE CSV (if needed) ---
    try:
        generate_labels_csv()
    except Exception as e:
        print(f"Error generating CSV: {e}")
        exit(1)

    # --- CLEAN CSV ---
    try:
        df = pd.read_csv(CSV_PATH)

        def resolve_full_path(filename):
            for folder in SUBFOLDERS:
                full_path = os.path.join(BASE_DIR, folder, filename)
                if os.path.exists(full_path) and is_valid_image(full_path):
                    return full_path
            return None

        df['full_path'] = df['filename'].apply(resolve_full_path)
        df = df[df['full_path'].notnull()]
        df = df.drop(columns=['full_path'])
        df.to_csv(CSV_PATH, index=False)
        print(f"Cleaned CSV saved with {len(df)} valid and readable image paths.")
    except Exception as e:
        print(f"Error cleaning CSV: {e}")
        exit(1)

    # --- DATASET & DATALOADER ---
    try:
        dataset = CarDataset(CSV_PATH, BASE_DIR, SUBFOLDERS, transform)
        dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)  # Updated for Docker
    except Exception as e:
        print(f"Error setting up dataset/dataloader: {e}")
        exit(1)

    # --- MODEL SETUP ---
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 128),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(128, NUM_CLASSES),
        nn.Sigmoid()
    )
    model = model.to(DEVICE)

    # --- TRAINING LOOP ---
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.0001)

    try:
        for epoch in range(EPOCHS):
            model.train()
            total_loss = 0
            for images, labels in dataloader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            print(f"Epoch [{epoch+1}/{EPOCHS}] - Loss: {total_loss / len(dataloader):.4f}")
    except Exception as e:
        print(f"Error during training: {e}")
        exit(1)

    # --- SAVE MODEL ---
    try:
        os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print(f"Model saved to {MODEL_SAVE_PATH}")
    except Exception as e:
        print(f"Error saving model: {e}")
        exit(1)

    # --- USER INFERENCE ---
    if os.getenv("DOCKER_ENV") != "true":  # Skip GUI in Docker
        try:
            gui_image_selection_and_prediction(model, DEVICE)
        except Exception as e:
            print(f"Error during inference: {e}")