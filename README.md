# ParkIt 🚗
A Smart Parking Spot Management System

## 📌 Project Overview
ParkIt is an intelligent parking management system that utilizes camera-based detection, license plate recognition (LPR), and real-time spot tracking to optimize parking space utilization.

## 🚀 Features
- Real-time Parking Spot Detection
- License Plate Recognition (LPR)
- Reservation & Payment System
- User Management & Notifications
- Admin Dashboard for Monitoring

## 🛠️ Tech Stack
- **Frontend**: React (Next.js)
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **Embedded System**: ESP32 (for camera & barrier control)
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)
- **AI Module**: Python (YOLO, OpenCV, TensorFlow/Keras)

## 📂 Project Structure
- frontend/ → React (Next.js) interface
- backend/ → Node.js (Express.js API)
- embedded/ → ESP32 Arduino code (camera & barrier)
- lpr-python/ → Licence Plate Recognition system
- docs/ → Documentation
- docker-compose.yml → Multi-service orchestration

## 💾 LPR Model Files (🔗 External Link Required)
The LPR (License Plate Recognition) module depends on large pre-trained models not stored in the GitHub repository.
Please download manually the following files and directory :
- lpr-python/Licence_plate_detection/lapi.weights
- lpr-python/Licence_plate_detection/model.weights
- lpr-python/Licence_plate_detection/darknet

👉 [Download from Google Drive](https://drive.google.com/drive/folders/1Cos3zO48QGrPQjBSwHmwHoUlq8QgcOk2?usp=drive_link) 

Then, place it in:
lpr-python/Licence_plate_detection/

## 💻 Getting Started  
1. Clone the repository:  
   git clone https://github.com/ghaithbenothmen/parkit.git
   cd parkit
2. Download the LPR weight file and darknet directory:
See section above and ensure weight file and darknet directory is placed in the correct path.

3.Start the system using Docker Compose:
  docker-compose up --build

🖥️ The app will be accessible at:

Frontend: http://localhost:3000

Backend API: http://localhost:4000

LPR Service: http://localhost:5000

## 📄 Notes
- For development mode, you can still run npm install separately in both frontend/ and backend/ to work without Docker if needed.

- For ESP32 firmware and wiring instructions, refer to the embedded/ directory.

