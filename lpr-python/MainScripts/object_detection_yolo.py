import os
from numpy import argmax, uint8
from cv2.dnn import readNetFromDarknet, DNN_BACKEND_OPENCV, DNN_TARGET_CPU, NMSBoxes, blobFromImage
from cv2 import imwrite, rectangle, FILLED, putText, FONT_HERSHEY_SIMPLEX, getTextSize, VideoCapture, getTickFrequency

# Initialize the parameters
confThreshold = 0.5  # Confidence threshold
nmsThreshold = 0.4  # Non-maximum suppression threshold
inpWidth = 416  # Width of network's input image
inpHeight = 416  # Height of network's input image

# Resolve paths relative to the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load the network
def load_network(classes_path, config_path, weights_path):
    """Load YOLO network and classes."""
    if not os.path.isfile(classes_path):
        raise FileNotFoundError(f"Classes file '{classes_path}' not found.")
    with open(classes_path, 'rt') as f:
        classes = f.read().rstrip('\n').split('\n')

    if not os.path.isfile(config_path) or not os.path.isfile(weights_path):
        raise FileNotFoundError("Config or weights file not found.")
    
    net = readNetFromDarknet(config_path, weights_path)
    net.setPreferableBackend(DNN_BACKEND_OPENCV)
    net.setPreferableTarget(DNN_TARGET_CPU)
    return net, classes

# Get the names of the output layers
def getOutputsNames(net):
    layersNames = net.getLayerNames()
    return [layersNames[i[0] - 1] for i in net.getUnconnectedOutLayers()]

# Draw the predicted bounding box
def drawPred(classId, conf, left, top, right, bottom, frame, classes):
    global LP_extracted
    LP_extracted = frame[top+6:bottom-6, left+6:right-6]
    imwrite("Licence_Plate_extracted.jpg", LP_extracted)
    rectangle(frame, (left, top), (right, bottom), (128, 190, 82), 3)
    label = f'{classes[classId]}:{conf:.2f}' if classes else f'{conf:.2f}'
    labelSize, baseLine = getTextSize(label, FONT_HERSHEY_SIMPLEX, 0.5, 1)
    top = max(top, labelSize[1])
    rectangle(frame, (left, top - round(1.5 * labelSize[1])), 
              (left + round(1.5 * labelSize[0]), top + baseLine), (128, 190, 82), FILLED)
    putText(frame, label, (left, top), FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 2)

# Remove the bounding boxes with low confidence using non-maxima suppression
def postprocess(frame, outs, classes):
    frameHeight, frameWidth = frame.shape[:2]
    classIds, confidences, boxes = [], [], []
    for out in outs:
        for detection in out:
            scores = detection[5:]
            classId = argmax(scores)
            confidence = scores[classId]
            if confidence > confThreshold:
                center_x, center_y = int(detection[0] * frameWidth), int(detection[1] * frameHeight)
                width, height = int(detection[2] * frameWidth), int(detection[3] * frameHeight)
                left, top = int(center_x - width / 2), int(center_y - height / 2)
                classIds.append(classId)
                confidences.append(float(confidence))
                boxes.append([left, top, width, height])
    indices = NMSBoxes(boxes, confidences, confThreshold, nmsThreshold)
    for i in indices:
        i = i[0]
        box = boxes[i]
        drawPred(classIds[i], confidences[i], box[0], box[1], box[0] + box[2], box[1] + box[3], frame, classes)

# Main function for license plate detection
def LP_detection(image_path, classes_path, config_path, weights_path):
    net, classes = load_network(classes_path, config_path, weights_path)

    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Image file '{image_path}' not found.")
        
    cap = VideoCapture(image_path)
    hasFrame, frame = cap.read()
    if not hasFrame:
        raise ValueError("Error: Unable to read the image.")
        
    try:
        blob = blobFromImage(frame, 1/255, (inpWidth, inpHeight), [0, 0, 0], 1, crop=False)
        net.setInput(blob)
        outs = net.forward(getOutputsNames(net))
        postprocess(frame, outs, classes)
        t, _ = net.getPerfProfile()
        print(f"Inference time: {t * 1000.0 / getTickFrequency():.2f} ms")
        imwrite("output.jpg", frame.astype(uint8))
        print("Output saved as 'output.jpg' and license plate as 'Licence_Plate_extracted.jpg'.")
        return LP_extracted, frame, 0  # Return dummy top value if not used
    except Exception as e:
        print(f"Error during license plate detection: {e}")
        return None

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Object Detection using YOLO in OpenCV')
    parser.add_argument('--image', help='Path to image file.', required=True)
    parser.add_argument('--classes', help='Path to classes file.', default=os.path.join(script_dir, '../Licence_plate_detection/classes.names'))
    parser.add_argument('--config', help='Path to YOLO config file.', default=os.path.join(script_dir, '../Licence_plate_detection/darknet-yolov3.cfg'))
    parser.add_argument('--weights', help='Path to YOLO weights file.', default=os.path.join(script_dir, '../Licence_plate_detection/lapi.weights'))
    args = parser.parse_args()

    LP_detection(args.image, args.classes, args.config, args.weights)