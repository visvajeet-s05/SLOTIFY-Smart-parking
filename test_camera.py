import cv2
import time

url = "http://10.145.252.94:8080/video"
cap = cv2.VideoCapture(url)

if not cap.isOpened():
    print(f"FAILED: Cannot open camera at {url}")
else:
    print(f"SUCCESS: Camera at {url} opened")
    ret, frame = cap.read()
    if ret:
        print("SUCCESS: Read frame from camera")
        cv2.imwrite("camera_test.jpg", frame)
    else:
        print("FAILED: Opened camera but cannot read frame")
    cap.release()
