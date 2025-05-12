from tensorflow.keras.models import load_model
from numpy import array, ones, zeros, arange, uint8
from cv2 import reduce, copyMakeBorder, BORDER_CONSTANT, CV_32S, REDUCE_SUM, COLOR_BGR2GRAY, cvtColor, rectangle, resize, addWeighted, putText, FONT_HERSHEY_DUPLEX, FONT_HERSHEY_SIMPLEX
import os

# Use relative paths instead of hardcoded paths
script_dir = os.path.dirname(os.path.abspath(__file__))
ocr_model_path = os.path.join(script_dir, "../Licence_Plate_Recognition/ocrmodel.h5")

def histogram_of_pixel_projection(img):
    """
    This method is responsible for licence plate segmentation with histogram of pixel projection approach
    :param img: input image
    :return: list of image, each one contain a digit
    """
    # list that will contains all digits
    caracrter_list_image = list()

    # img = crop(img)

    # Add black border to the image
    BLACK = [0, 0, 0]
    img = copyMakeBorder(img, 3, 3, 3, 3, BORDER_CONSTANT, value=BLACK)

    # change to gray
    gray = cvtColor(img, COLOR_BGR2GRAY)

    # Change to numpy array format
    nb = array(gray)

    # Binarization
    nb[nb > 120] = 255
    nb[nb < 120] = 0

    # compute the sommation
    x_sum = reduce(nb, 0, REDUCE_SUM, dtype=CV_32S)
    y_sum = reduce(nb, 1, REDUCE_SUM, dtype=CV_32S)

    # rotate the vector x_sum
    x_sum = x_sum.transpose()

    # get height and weight
    x = gray.shape[1]
    y = gray.shape[0]

    # division the result by height and weight
    x_sum = x_sum / y
    y_sum = y_sum / x

    # x_arr and y_arr are two vector weight and height to plot histogram projection properly
    x_arr = arange(x)
    y_arr = arange(y)

    # convert x_sum to numpy array
    z = array(x_sum)

    # convert y_arr to numpy array
    w = array(y_sum)

    # convert to zero small details
    z[z < 15] = 0
    z[z > 15] = 1

    # convert to zero small details and 1 for needed details
    w[w < 20] = 0
    w[w > 20] = 1

    # vertical segmentation
    test = z.transpose() * nb

    # horizontal segmentation
    test = w * test

    # plot histogram projection result using pyplot
    #horizontal = plt.plot(w, y_arr)
    #plt.show()
    #vertical = plt.plot(x_arr ,z)
    #plt.show()
    #plt.show(horizontal)
    #plt.show(vertical)

    f = 0
    ff = z[0]
    t1 = list()
    t2 = list()
    for i in range(z.size):
        if z[i] != ff:
            f += 1
            ff = z[i]
            t1.append(i)
    rect_h = array(t1)

    f = 0
    ff = w[0]
    for i in range(w.size):
        if w[i] != ff:
            f += 1
            ff = w[i]
            t2.append(i)
    rect_v = array(t2)

    # take the appropriate height
    rectv = []
    rectv.append(rect_v[0])
    rectv.append(rect_v[1])
    max = int(rect_v[1]) - int(rect_v[0])
    for i in range(len(rect_v) - 1):
        diff2 = int(rect_v[i + 1]) - int(rect_v[i])

        if diff2 > max:
            rectv[0] = rect_v[i]
            rectv[1] = rect_v[i + 1]
            max = diff2

    # extract caracter
    for i in range(len(rect_h) - 1):

        # eliminate slice that can't be a digit, a digit must have width bigger then 8
        diff1 = int(rect_h[i + 1]) - int(rect_h[i])

        if (diff1 > 5) and (z[rect_h[i]] == 1):
            # cutting nb (image) and adding each slice to the list caracrter_list_image
            caracrter_list_image.append(nb[int(rectv[0]):int(rectv[1]), rect_h[i]:rect_h[i + 1]])

            # draw rectangle on digits
            rectangle(img, (rect_h[i], rectv[0]), (rect_h[i + 1], rectv[1]), (0, 255, 0), 1)

    # Show segmentation result
    #image = plt.imshow(img)
    #plt.show() ################################################################
    #plt.show(image)

    return caracrter_list_image

"""
def show_segments(char):
    for i in range(len(char)):
	    #img=char[i]
	    #img=img.reshape(66,16)
	    plt.subplot(1, 10, i+1)
	    plt.imshow(char[i], cmap='gray')
	    plt.axis('off')
	    #print(char[i].shape)
"""  
def fix_dimension(img): 
  new_img = zeros((28,28,3))
  for i in range(3):
    new_img[:,:,i] = img
  return new_img
  
def show_results(char,model):
    dic = {}
    characters = '0123456789T'
    for i,c in enumerate(characters):
        dic[i]=c

    output = []
    for i,ch in enumerate(char): #iterating over the characters
        img_ = resize(ch, (28,28))
        img = fix_dimension(img_)
        img = img.reshape(1,28,28,3) #preparing image for the model
        y_ = model.predict_classes(img)[0] #predicting the class
        #print(y_)
        character = dic[y_] #
        if(character=="T"):
            output.append(" Tunisia ")
        else:
            output.append(character) #storing the result in a list
        
    plate_number = ''.join(output)
    #print(show_results())
    return(output)

def draw_text_on_image(img, title, text, x=150, y=250, w=500, h=100):
    """
    Draw the recognized text on the image.
    """
    # Create a semi-transparent white rectangle
    sub_img = img[y:y+h, x:x+w]
    white_rect = ones(sub_img.shape, dtype=uint8) * 255
    res = addWeighted(sub_img, 0.6, white_rect, 0.5, 1.0)
    img[y:y+h, x:x+w] = res

    # Add the title (e.g., "Licence Plate :")
    putText(img, title, (x + 10, y + 30), FONT_HERSHEY_DUPLEX, 1, (128, 190, 82), 2)

    # Add the recognized text (e.g., "171 Tunisia 9707")
    putText(img, text, (x + 10, y + 70), FONT_HERSHEY_SIMPLEX, 1, (118, 82, 26), 2)
    return img

def LP_recognition(img, newImg, top):
    """
    Perform license plate recognition and overlay the result on the image.
    """
    if not os.path.isfile(ocr_model_path):
        raise FileNotFoundError(f"OCR model not found at {ocr_model_path}")
    model = load_model(ocr_model_path)

    char = histogram_of_pixel_projection(img)
    output = show_results(char, model)
    text = ''.join(output)
    print(f"Recognized License Plate: {text}")  # Print the recognized license plate to the console
    title = "Licence Plate :"
    newImg_width = newImg.shape[1]

    # Ensure the text is drawn on the image
    final_img = draw_text_on_image(newImg, title, text, newImg_width // 2 - 200, top // 2 - 50, newImg_width // 2 + 25, 100)
    return final_img, text
