import cv2
import time
import sys

CAMERA_URLS = {
    1: "http://10.151.236.96:8080/video",
    2: "http://10.151.236.80:8080/video"
}

def check_camera(id, url):
    print(f"\n[TESTING CAMERA {id}] URL: {url}")
    try:
        cap = cv2.VideoCapture(url)
        if not cap.isOpened():
             print(f"[RESULT] Camera {id}: ❌ FAILED (Could not open stream)")
             return

        ret, frame = cap.read()
        cap.release()
        
        if ret and frame is not None:
             h, w = frame.shape[:2]
             print(f"[RESULT] Camera {id}: ✅ WORKING (Resolution: {w}x{h})")
        else:
             print(f"[RESULT] Camera {id}: ❌ FAILED (Connected but stream empty)")
             
    except Exception as e:
        print(f"[RESULT] Camera {id}: ❌ ERROR: {str(e)}")

print("--- STARTING DIAGNOSTIC ---")
for cam_id, url in CAMERA_URLS.items():
    check_camera(cam_id, url)
print("--- DIAGNOSTIC COMPLETE ---")
