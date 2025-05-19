import cv2
import numpy as np
import os

def display_image(image_path):
    image = cv2.imread(image_path)

    # Resize the image to fit the screen (e.g., width=800 pixels)
    scale_percent = 50  # Adjust this percentage to control the size
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    resized_image = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)

    # Display the resized image
    cv2.imshow("Parking Lot", resized_image)

    # Set the mouse callback to get coordinates
    cv2.setMouseCallback("Parking Lot", get_coordinates, param={"scale": scale_percent})
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def get_coordinates(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:  # Left mouse button click
        print(f"Clicked at: ({x}, {y})")

if __name__ == "__main__":
    # Path to the image of your parking lot
    image_path = "Y:/ExperienceGhaith/4TWIN3/Pi/ParkIt/lpr-python/parkingspot_detection/esp32_image-vide.jpg" # Replace with the actual path to your image

    # Display the image and get coordinates by clicking
    display_image(image_path)
    
def detect_parking_spots(image_path, parking_spots):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to load the image.")

    status = {}
    height, width, _ = image.shape  # Get image dimensions

    for idx, (x1, y1, x2, y2) in enumerate(parking_spots):
        # Debug: Print parking spot coordinates
        print(f"Processing parking spot {idx}: ({x1}, {y1}, {x2}, {y2})")

        # Check if coordinates are within image bounds
        if x1 < 0 or y1 < 0 or x2 > width or y2 > height:
            print(f"Warning: Parking spot {idx} coordinates are out of bounds.")
            status[idx] = "unknown"
            continue

        spot = image[y1:y2, x1:x2]
        if spot.size == 0:  # Check if the cropped spot is valid
            print(f"Warning: Parking spot {idx} is empty or invalid.")
            status[idx] = "unknown"
            continue

        # Convert the spot to grayscale
        gray_spot = cv2.cvtColor(spot, cv2.COLOR_BGR2GRAY)

        # Apply adaptive thresholding
        thresholded = cv2.adaptiveThreshold(
            gray_spot, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Analyze the intensity of the cropped spot
        white_pixels = cv2.countNonZero(thresholded)
        total_pixels = thresholded.size
        occupancy_ratio = white_pixels / total_pixels

        # Debug: Print occupancy ratio
        print(f"Parking spot {idx}: occupancy_ratio = {occupancy_ratio}")

        # Adjust the threshold based on your prototype
        status[idx] = "vacant" if occupancy_ratio > 0.5 else "occupied"

    return status

def detect_parking_spots_template_matching(image_path, parking_spots, templates_folder):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to load the image.")

    status = {}
    for idx, (x1, y1, x2, y2) in enumerate(parking_spots):
        print(f"Processing parking spot {idx}: ({x1}, {y1}, {x2}, {y2})")

        # Crop the parking spot region
        spot = image[y1:y2, x1:x2]
        if spot.size == 0:
            print(f"Warning: Parking spot {idx} is empty or invalid.")
            status[idx] = "unknown"
            continue

        # Load the corresponding template
        template_path = os.path.join(templates_folder, f"template_{idx}.jpg")
        template = cv2.imread(template_path, cv2.IMREAD_GRAYSCALE)
        if template is None:
            print(f"Warning: Template for parking spot {idx} not found.")
            status[idx] = "unknown"
            continue

        # Convert the spot to grayscale
        gray_spot = cv2.cvtColor(spot, cv2.COLOR_BGR2GRAY)

        # Resize the spot to match the template dimensions
        resized_spot = cv2.resize(gray_spot, (template.shape[1], template.shape[0]), interpolation=cv2.INTER_AREA)

        # Debug: Print dimensions
        print(f"Resized spot dimensions: {resized_spot.shape}, Template dimensions: {template.shape}")

        # Perform template matching
        result = cv2.matchTemplate(resized_spot, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(result)

        # Debug: Print the matching score
        print(f"Parking spot {idx}: max_val = {max_val}")

        # Determine if the spot is vacant or occupied based on a lower threshold
        status[idx] = "vacant" if max_val > 0.6 else "occupied"

    return status

