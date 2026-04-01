import cv2
cap = cv2.VideoCapture('http://10.145.252.94:8080/video')
ret, frame = cap.read()
if ret:
    cv2.imwrite('dumped_frame.jpg', frame)
    print("Frame saved.")
else:
    print("Failed to read frame.")
