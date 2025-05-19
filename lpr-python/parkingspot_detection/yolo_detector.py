from ultralytics import YOLO
import cv2

# Load the YOLOv8 model
model = YOLO("yolov8n.pt")  # Ensure the model file exists in the current directory

def calculate_iou(box1, box2):
    # Calculate the intersection over union (IoU) of two bounding boxes
    x1_inter = max(box1[0], box2[0])
    y1_inter = max(box1[1], box2[1])
    x2_inter = min(box1[2], box2[2])
    y2_inter = min(box1[3], box2[3])

    # Compute the area of intersection
    inter_area = max(0, x2_inter - x1_inter) * max(0, y1_inter - y1_inter)  # Fixed formula

    # Compute the area of both bounding boxes
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])

    # Compute the union area
    union_area = box1_area + box2_area - inter_area

    # Avoid division by zero
    if union_area == 0:
        return 0

    # Compute IoU
    return inter_area / union_area

def detect_parking_spots_yolo(image_path, parking_spots):
    # Perform inference using the YOLO model
    results = model(image_path)  # Pass the file path directly

    # Extract vehicle bounding boxes
    vehicle_boxes = []
    for detection in results:  # Iterate over the detections
        for box in detection:  # Iterate over each detection in the tensor
            x1, y1, x2, y2, confidence, class_id = box.tolist()
            if confidence > 0.3 and class_id in [2, 3, 5, 7]:  # Filter for cars, trucks, buses
                vehicle_boxes.append([x1, y1, x2, y2])

    if not vehicle_boxes:
        print("Warning: No vehicles detected by YOLO.")  # Debug: No vehicles detected

    print(f"Detected vehicle boxes: {vehicle_boxes}")  # Debug: Print detected vehicles

    # Load the image for annotation
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to load the image.")

    # Annotate parking spots and vehicles
    for idx, (x1, y1, x2, y2) in enumerate(parking_spots):
        color = (0, 255, 0)  # Green for vacant spots
        label = "Vacant"

        # Check for overlap with detected vehicles
        for vehicle_box in vehicle_boxes:
            iou = calculate_iou([x1, y1, x2, y2], vehicle_box)
            print(f"Parking spot {idx}: IoU with vehicle box {vehicle_box} = {iou}")  # Debug: Print IoU
            if iou > 0.3:  # Consider the spot occupied if IoU > 0.3
                color = (0, 0, 255)  # Red for occupied spots
                label = "Occupied"
                break

        # Draw the parking spot rectangle
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Draw detected vehicle boxes
    for (x1, y1, x2, y2) in vehicle_boxes:
        cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)  # Blue for vehicles
        cv2.putText(image, "Vehicle", (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    # Save the annotated image
    annotated_image_path = "annotated_image.jpg"
    cv2.imwrite(annotated_image_path, image)
    print(f"Annotated image saved to {annotated_image_path}")

    # Determine parking spot occupancy
    status = {}
    for idx, (x1, y1, x2, y2) in enumerate(parking_spots):
        occupied = False

        # Check for overlap with detected vehicles
        for vehicle_box in vehicle_boxes:
            iou = calculate_iou([x1, y1, x2, y2], vehicle_box)
            if iou > 0.3:  # Consider the spot occupied if IoU > 0.3
                occupied = True
                break

        # If no vehicle detected, use image processing to analyze the spot
        if not occupied:
            spot = image[y1:y2, x1:x2]
            if spot.size == 0:
                status[idx] = "unknown"
                continue

            # Convert the spot to grayscale
            gray_spot = cv2.cvtColor(spot, cv2.COLOR_BGR2GRAY)

            # Apply preprocessing
            gray_spot = cv2.GaussianBlur(gray_spot, (5, 5), 0)
            gray_spot = cv2.equalizeHist(gray_spot)

            # Apply adaptive thresholding
            thresholded = cv2.adaptiveThreshold(
                gray_spot, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )

            # Analyze the intensity of the cropped spot
            white_pixels = cv2.countNonZero(thresholded)
            total_pixels = thresholded.size
            occupancy_ratio = white_pixels / total_pixels

            # Debug: Print occupancy ratio and decision
            print(f"Parking spot {idx}: occupancy_ratio = {occupancy_ratio}")
            print(f"Parking spot {idx}: Threshold decision = {'occupied' if occupancy_ratio < 0.6 else 'vacant'}")

            # Adjust the threshold based on your prototype
            occupied = occupancy_ratio < 0.6  # Adjusted threshold

        status[idx] = "occupied" if occupied else "vacant"

    return status, annotated_image_path
