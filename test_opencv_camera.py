import cv2
import time

print("Testing direct camera connection...")
print("Camera URL: http://10.151.236.96:8080/video")

cap = cv2.VideoCapture("http://10.151.236.96:8080/video")

if not cap.isOpened():
    print("❌ FAILED: Cannot open camera stream")
    print("\nPossible reasons:")
    print("  1. Camera is offline")
    print("  2. URL is incorrect")
    print("  3. Network issue")
    print("  4. OpenCV cannot handle this stream format")
    exit(1)

print("✅ Camera stream opened successfully")

# Try to read frames
print("\nAttempting to read frames...")
for i in range(5):
    ret, frame = cap.read()
    if ret and frame is not None:
        h, w = frame.shape[:2]
        print(f"✅ Frame {i+1}: {w}x{h} pixels, {frame.shape[2]} channels")
    else:
        print(f"❌ Frame {i+1}: Failed to read")
    time.sleep(0.5)

cap.release()
print("\n✅ Test complete - Camera is working!")
