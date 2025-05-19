import cv2
import json

# List to store parking spot coordinates
parking_spots = []
drawing = False  # True if the mouse is being dragged
start_point = None  # Starting point of the rectangle

def draw_rectangle(event, x, y, flags, param):
    global drawing, start_point, parking_spots, image_copy

    if event == cv2.EVENT_LBUTTONDOWN:  # Left mouse button pressed
        drawing = True
        start_point = (x, y)

    elif event == cv2.EVENT_MOUSEMOVE:  # Mouse is moving
        if drawing:
            # Draw a rectangle on a copy of the image
            image_copy = image.copy()
            cv2.rectangle(image_copy, start_point, (x, y), (0, 255, 0), 2)
            cv2.imshow("Parking Lot", image_copy)

    elif event == cv2.EVENT_LBUTTONUP:  # Left mouse button released
        drawing = False
        end_point = (x, y)
        parking_spots.append((*start_point, *end_point))  # Save the rectangle coordinates
        print(f"Parking spot defined: {start_point} to {end_point}")
        # Draw the final rectangle on the original image
        cv2.rectangle(image, start_point, end_point, (0, 255, 0), 2)
        cv2.imshow("Parking Lot", image)

def main(image_path, output_file):
    global image, image_copy

    # Load the image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Unable to load image from path: {image_path}")
        return

    image_copy = image.copy()

    # Display the image and set the mouse callback
    cv2.imshow("Parking Lot", image)
    cv2.setMouseCallback("Parking Lot", draw_rectangle)

    # Wait for the user to press 'q' to quit
    print("Draw rectangles for parking spots. Press 'q' to finish.")
    while True:
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):  # Quit when 'q' is pressed
            break

    cv2.destroyAllWindows()

    # Save the parking spot coordinates to a JSON file
    with open(output_file, "w") as f:
        json.dump(parking_spots, f, indent=4)
    print(f"Parking spots saved to {output_file}")

if __name__ == "__main__":
    # Path to the image of your parking lot (empty)
    image_path = "Y:/ExperienceGhaith/4TWIN3/Pi/ParkIt/lpr-python/parkingspot_detection/esp324.jpg"  # Replace with your image path
    output_file = "parking_spots.json"  # File to save the parking spot coordinates

    main(image_path, output_file)