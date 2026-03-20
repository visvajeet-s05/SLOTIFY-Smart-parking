import os
from dotenv import load_dotenv

load_dotenv()

CAMERA_IP = os.getenv("CAMERA_IP", "10.151.236.96:8080")
URLS = {
    "Camera 1 (Main)": f"http://{CAMERA_IP}/video"
}

print("Starting Camera Diagnostics...")

for name, url in URLS.items():
    print(f"\nChecking {name}...")
    print(f"  URL: {url}")
    
    # 1. HTTP Check
    try:
        r = requests.head(url, timeout=2)
        print(f"  [HTTP] Status: {r.status_code}")
    except Exception as e:
        print(f"  [HTTP] Failed: {e}")
        
    # 2. OpenCV Check
    try:
        cap = cv2.VideoCapture(url)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                print(f"  [OpenCV] Success! Frame size: {frame.shape}")
                # Save a test frame
                # cv2.imwrite(f"test_{name.replace(' ', '_')}.jpg", frame)
            else:
                 print(f"  [OpenCV] Connected but failed to read frame (Stream verify failed).")
        else:
             print(f"  [OpenCV] Failed to open stream.")
        cap.release()
    except Exception as e:
        print(f"  [OpenCV] Error: {e}")

print("\nDone.")
