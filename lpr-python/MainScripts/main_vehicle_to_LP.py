import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Disable GPU usage

import object_detection_yolo as LP_detection
import Hawk_Eye_LP_recognition as LP_reco
from cv2 import imwrite
import sys

# License plate detection
result = LP_detection.LP_detection()
if result is None:
    print("License plate detection failed.")
    sys.exit(1)

LP_extracted, newImage, top = result

# License plate recognition
try:
    final_img, plate_text = LP_reco.LP_recognition(LP_extracted, newImage, top)
except FileNotFoundError as e:
    print(e)
    sys.exit(1)

# Save the final result image
output_dir = os.path.dirname(os.path.abspath(__file__))
path_to_final_img = os.path.join(output_dir, "final_image.jpg")
imwrite(path_to_final_img, final_img)

# Save the recognized license plate text to a file
text_file_path = os.path.join(output_dir, "recognized_plate.txt")
with open(text_file_path, "w") as text_file:
    text_file.write(f"Recognized License Plate: {plate_text}\n")
print(f"Recognized license plate saved to: {text_file_path}")
print(f"Final image saved at: {path_to_final_img}")

