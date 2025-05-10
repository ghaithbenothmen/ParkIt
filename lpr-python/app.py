from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import sys
from MainScripts.object_detection_yolo import LP_detection
from MainScripts.Hawk_Eye_LP_recognition import LP_recognition  # Import the recognition function
from cv2 import imwrite

# Prevent argparse from running when this script is executed
if __name__ == "__main__":
    sys.argv = [sys.argv[0]]

app = Flask(__name__)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Paths for YOLO files
CLASSES_PATH = './Licence_plate_detection/classes.names'
CONFIG_PATH = './Licence_plate_detection/darknet-yolov3.cfg'
WEIGHTS_PATH = './Licence_plate_detection/lapi.weights'

@app.route('/api/lpr', methods=['POST'])
def lpr():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # Step 1: License Plate Detection
        LP_extracted, newImage, top = LP_detection(filepath, CLASSES_PATH, CONFIG_PATH, WEIGHTS_PATH)
        if LP_extracted is None:
            return jsonify({"error": "License plate detection failed"}), 500

        # Step 2: License Plate Recognition
        final_img, plate_text = LP_recognition(LP_extracted, newImage, top)

        # Save the final result image
        final_image_path = os.path.join(app.config['UPLOAD_FOLDER'], "final_image.jpg")
        imwrite(final_image_path, final_img)

        # Return the response
        return jsonify({
            "plate_number": plate_text,
            "final_image_path": final_image_path
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(filepath)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
