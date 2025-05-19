from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import cv2
import os
import pickle

app = FastAPI()

# Allow CORS (you can restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or set to ["http://localhost:3000"] etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ENCODINGS_DIR = "encodings"

def save_face(name, encoding):
    if not os.path.exists(ENCODINGS_DIR):
        os.makedirs(ENCODINGS_DIR)
    file_path = os.path.join(ENCODINGS_DIR, f"{name}.pkl")
    with open(file_path, 'wb') as f:
        pickle.dump(encoding, f)

def load_known_faces():
    known_encodings = []
    known_names = []
    if not os.path.exists(ENCODINGS_DIR):
        return known_encodings, known_names

    for file in os.listdir(ENCODINGS_DIR):
        if file.endswith(".pkl"):
            name = os.path.splitext(file)[0]
            with open(os.path.join(ENCODINGS_DIR, file), 'rb') as f:
                encoding = pickle.load(f)
                known_encodings.append(encoding)
                known_names.append(name)
    return known_encodings, known_names

@app.post("/register-face/")
def register_face(name: str = Form(...)):
    video_capture = cv2.VideoCapture(0)
    print("📸 Registering face...")

    face_saved = False

    while True:
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            if face_encodings:
                save_face(name, face_encodings[0])
                print(f"✅ Face for '{name}' saved.")
                face_saved = True
                break

    video_capture.release()
    cv2.destroyAllWindows()

    if face_saved:
        return {"message": f"Face for '{name}' registered"}
    else:
        return {"message": "No face found"}

@app.post("/verify-face/")
def verify_face():
    video_capture = cv2.VideoCapture(0)
    print("🔍 Recognizing face...")

    known_encodings, known_names = load_known_faces()
    matched_user = None

    while True:
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_encodings, face_encoding)
                if True in matches:
                    match_index = matches.index(True)
                    matched_user = known_names[match_index]
                    print(f"👋 Hi, {matched_user}!")
                    break

        if matched_user:
            break

    video_capture.release()
    cv2.destroyAllWindows()

    return {"matched_user": matched_user}

# Add these functions to enable CLI for both registering and recognizing face
def register_face_cli(name: str):
    video_capture = cv2.VideoCapture(0)
    print("📸 Registering face...")

    face_saved = False

    while True:
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            if face_encodings:
                save_face(name, face_encodings[0])
                print(f"✅ Face for '{name}' saved.")
                face_saved = True
                break

    video_capture.release()
    cv2.destroyAllWindows()


def recognize_face_cli():
    video_capture = cv2.VideoCapture(0)
    print("🔍 Recognizing face...")

    known_encodings, known_names = load_known_faces()
    matched_user = None

    while True:
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_encodings, face_encoding)
                if True in matches:
                    match_index = matches.index(True)
                    matched_user = known_names[match_index]
                    print(f"👋 Hi, {matched_user}!")
                    break

        if matched_user:
            break

    video_capture.release()
    cv2.destroyAllWindows()
    return matched_user
