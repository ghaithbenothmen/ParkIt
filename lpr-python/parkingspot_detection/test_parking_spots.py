from yolo_detector import detect_parking_spots_yolo

# Path to a test image
image_path = "esp32_image2.jpg"  # Replace with a valid image path

# Test the function
parking_status = detect_parking_spots_yolo(image_path)
print("Parking Status:", parking_status)
