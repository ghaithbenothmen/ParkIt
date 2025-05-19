from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import cv2
import os
import pickle
import requests  # We need this to make requests to ParkIt API
import time

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

# Update this to communicate with the ParkIt API (Docker container)
PARKIT_API_URL = "http://host.docker.internal:4000"  # ParkIt API running on Docker port 4000

@app.post("/register-face/")
def register_face(name: str = Form(...)):
    # Check if the face with the given name is already registered
    if os.path.exists(os.path.join(ENCODINGS_DIR, f"{name}.pkl")):
        return {"message": f"Face for '{name}' is already registered."}

    video_capture = cv2.VideoCapture(0)
    print("📸 Registering face...")

    face_saved = False
    face_detected_time = None  # Timer when face is detected after pressing 's'
    pressed_s = False  # To track if user has pressed 's'

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("❌ Failed to grab frame")
            break
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if not pressed_s:
            # Before pressing 's' — show instruction
            cv2.putText(frame, "Press 's' to register your face", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        else:
            if face_locations:
                if face_detected_time is None:
                    face_detected_time = time.time()  # Start 3-second timer

                elapsed = time.time() - face_detected_time

                # Show "Face detected" message
                cv2.putText(frame, "Face detected! Hold still...", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

                if elapsed >= 3:  # 3 seconds passed
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    if face_encodings:
                        save_face(name, face_encodings[0])
                        print(f"✅ Face for '{name}' saved.")
                        face_saved = True
                        break
            else:
                # If no face after pressing 's'
                face_detected_time = None
                cv2.putText(frame, "No face detected, adjust your position", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # 🖼️ Show the live feed
        cv2.imshow('Register Face', frame)

        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            pressed_s = True
            print("🛑 's' pressed — ready to capture face!")
        elif key == ord('q'):
            print("❌ Face registration cancelled.")
            break

    video_capture.release()
    cv2.destroyAllWindows()

    if face_saved:
        return {"message": f"Face for '{name}' registered successfully"}
    else:
        return {"message": "No face found or registration cancelled"}


@app.post("/verify-face/")
def verify_face():
    video_capture = cv2.VideoCapture(0)
    print("🔍 Verifying face... Please look at the camera 👀")

    known_encodings, known_names = load_known_faces()
    matched_user = None

    start_time = time.time()
    MAX_DURATION = 10  # How long to try verifying (seconds)

    verified_time = None  # To store when face got verified

    while True:
        ret, frame = video_capture.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations and matched_user is None:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(known_encodings, face_encoding)
                if True in matches:
                    match_index = matches.index(True)
                    matched_user = known_names[match_index]
                    print(f"👋 Hi, {matched_user}!")
                    verified_time = time.time()  # save the moment we verified
                    break

        display_frame = frame.copy()

        if matched_user:
            cv2.putText(display_frame, "✅ Face Verified", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
            # Wait 2 seconds after verification
            if time.time() - verified_time >= 2:
                break
        else:
            cv2.putText(display_frame, "Verifying Face...", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        cv2.imshow('Face Verification', display_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("❌ Verification cancelled by user.")
            break

        if time.time() - start_time > MAX_DURATION:
            print("⏰ Verification timed out.")
            break

    video_capture.release()
    cv2.destroyAllWindows()

    if matched_user:
        return {"isMatch": True, "userId": matched_user}
    else:
        return {"isMatch": False}
