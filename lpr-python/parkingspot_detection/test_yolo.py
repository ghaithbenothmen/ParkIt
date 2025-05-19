from ultralytics import YOLO
import cv2

# Load the YOLOv8 model
model = YOLO("yolov8n.pt")  # Ensure the model file exists in the current directory

# Path to a test image
image_path = "esp32_image2.jpg"  # Replace with a valid image path

# Perform inference using the file path
try:
    results = model(image_path)  # Pass the file path directly
    print("Results:", results)

    # Process the results list
    for detection in results:  # Iterate over the detections
        print("Detection Tensor:", detection)
        for box in detection:  # Iterate over each detection in the tensor
            x1, y1, x2, y2, confidence, class_id = box.tolist()
            print(f"Coordinates: ({x1}, {y1}, {x2}, {y2}), Confidence: {confidence}, Class ID: {class_id}")
except AttributeError as e:
    print(f"Error accessing boxes: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
