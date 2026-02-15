import cv2
import sys

url = "http://10.227.24.164:8080/video"
print(f"Testing connection to: {url}...")

try:
    cap = cv2.VideoCapture(url)
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            print(f"✅ SUCCESS: Connected to {url} and received a frame.")
            print(f"Resolution: {frame.shape[1]}x{frame.shape[0]}")
        else:
            print("⚠️ CONNECTED but failed to read frame.")
    else:
        print("❌ FAILED: Could not open video stream.")
    cap.release()
except Exception as e:
    print(f"❌ ERROR: {e}")
