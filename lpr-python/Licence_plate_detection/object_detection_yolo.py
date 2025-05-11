import cv2 as cv
import argparse
import sys
import numpy as np
import os

# Initialize the parameters
confThreshold = 0.5  # Confidence threshold
nmsThreshold = 0.4  # Non-maximum suppression threshold
inpWidth = 416  # Width of network's input image
inpHeight = 416  # Height of network's input image

# Directory for saving extracted license plates
directory = "D:/Hawk_Eye_version_1.0_LP_recog/Hawk_Eye_version_1.0_LP_recog"

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Object Detection using YOLO in OpenCV')
parser.add_argument('--image', help='Path to image file.')
parser.add_argument('--video', help='Path to video file.')
args = parser.parse_args()

# Load names of classes
classesFile = "./Licence_plate_detection/classes.names"
classes = None
with open(classesFile, 'rt') as f:
    classes = f.read().rstrip('\n').split('\n')

# Load YOLO model configuration and weights
modelConfiguration = "./Licence_plate_detection/darknet-yolov3.cfg"
modelWeights = "./Licence_plate_detection/lapi.weights"

net = cv.dnn.readNetFromDarknet(modelConfiguration, modelWeights)
net.setPreferableBackend(cv.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv.dnn.DNN_TARGET_CPU)

# Get the names of the output layers
def getOutputsNames(net):
    layersNames = net.getLayerNames()
    return [layersNames[i[0] - 1] for i in net.getUnconnectedOutLayers()]

# Draw the predicted bounding box
def drawPred(classId, conf, left, top, right, bottom, frame):
    global LP_extracted
    # Extract the license plate region
    LP_extracted = frame[top+6:bottom-6, left+6:right-6]
    cv.imwrite(os.path.join(directory, "Licence_Plate_extracted.jpg"), LP_extracted)

    # Draw the bounding box
    cv.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 3)
    label = f'{classes[classId]}:{conf:.2f}' if classes else f'{conf:.2f}'

    # Display the label at the top of the bounding box
    labelSize, baseLine = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.5, 1)
    top = max(top, labelSize[1])
    cv.rectangle(frame, (left, top - round(1.5 * labelSize[1])),
                 (left + round(1.5 * labelSize[0]), top + baseLine), (0, 0, 255), cv.FILLED)
    cv.putText(frame, label, (left, top), cv.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 2)

# Remove the bounding boxes with low confidence using non-maxima suppression
def postprocess(frame, outs):
    frameHeight, frameWidth = frame.shape[:2]
    classIds, confidences, boxes = [], [], []

    # Scan through all the bounding boxes output from the network
    for out in outs:
        for detection in out:
            scores = detection[5:]
            classId = np.argmax(scores)
            confidence = scores[classId]
            if confidence > confThreshold:
                center_x, center_y = int(detection[0] * frameWidth), int(detection[1] * frameHeight)
                width, height = int(detection[2] * frameWidth), int(detection[3] * frameHeight)
                left, top = int(center_x - width / 2), int(center_y - height / 2)
                classIds.append(classId)
                confidences.append(float(confidence))
                boxes.append([left, top, width, height])

    # Perform non-maximum suppression
    indices = cv.dnn.NMSBoxes(boxes, confidences, confThreshold, nmsThreshold)
    for i in indices:
        i = i[0]
        box = boxes[i]
        drawPred(classIds[i], confidences[i], box[0], box[1], box[0] + box[2], box[1] + box[3], frame)

# Main function for license plate detection
def LP_detection():
    global LP_extracted
    LP_extracted = None  # Initialize LP_extracted to None

    # Process inputs
    outputFile = "yolo_out_py.avi"
    if args.image:
        if not os.path.isfile(args.image):
            print(f"Input image file {args.image} doesn't exist")
            sys.exit(1)
        cap = cv.VideoCapture(args.image)
        outputFile = args.image[:-4] + '_yolo_out_py.jpg'
    elif args.video:
        if not os.path.isfile(args.video):
            print(f"Input video file {args.video} doesn't exist")
            sys.exit(1)
        cap = cv.VideoCapture(args.video)
        outputFile = args.video[:-4] + '_yolo_out_py.avi'
    else:
        cap = cv.VideoCapture(0)

    # Process frames
    while cv.waitKey(1) < 0:
        hasFrame, frame = cap.read()
        if not hasFrame:
            print("Done processing!")
            print(f"Output file is stored as {outputFile}")
            break

        # Create a 4D blob from a frame
        blob = cv.dnn.blobFromImage(frame, 1 / 255, (inpWidth, inpHeight), [0, 0, 0], 1, crop=False)
        net.setInput(blob)

        # Run the forward pass to get output of the output layers
        outs = net.forward(getOutputsNames(net))

        # Remove the bounding boxes with low confidence
        postprocess(frame, outs)

        # Write the frame with the detection boxes
        if args.image:
            cv.imwrite(os.path.join(directory, outputFile), frame.astype(np.uint8))
        else:
            vid_writer = cv.VideoWriter(os.path.join(directory, outputFile),
                                        cv.VideoWriter_fourcc('M', 'J', 'P', 'G'), 30,
                                        (round(cap.get(cv.CAP_PROP_FRAME_WIDTH)),
                                         round(cap.get(cv.CAP_PROP_FRAME_HEIGHT))))
            vid_writer.write(frame.astype(np.uint8))

    return LP_extracted