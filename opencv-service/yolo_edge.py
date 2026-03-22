"""
SLOTIFY Edge AI Node - YOLOv8 Alternative
Uses ultralytics YOLOv8 for more robust detection.
"""

import os
import time
import requests
import cv2
from ultralytics import YOLO
from dotenv import load_dotenv

# Load env
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, '..', '.env.local'))

CENTRAL_API_URL = os.getenv("CENTRAL_API_URL", "http://localhost:3000")
EDGE_TOKEN      = os.getenv("EDGE_TOKEN", "")
LOT_ID          = os.getenv("PARKING_LOT_ID", "CHENNAI_CENTRAL")
CAMERA_IP       = os.getenv("CAMERA_IP", "")
CAMERA_URL      = f"http://{CAMERA_IP}/video"

# Model
model = YOLO('yolov8n.pt')  # Nano version for edge efficiency

def run_edge_ai():
    print(f"🚀 Starting YOLOv8 Edge Node for {LOT_ID}...")
    cap = cv2.VideoCapture(CAMERA_URL)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("✗ Camera disconnected. Reconnecting...")
            cap.release()
            time.sleep(5)
            cap = cv2.VideoCapture(CAMERA_URL)
            continue
            
        # Run detection
        results = model(frame, verbose=False)[0]
        
        # Filter for cars (COCO class 2 in YOLOv8)
        car_results = [r for r in results.boxes if int(r.cls) == 2]
        
        # Simplified JSON output logic (send to server)
        # In production this would do slot matching similar to main.py
        payload = {
            "lotId": LOT_ID,
            "edgeNodeId": os.getenv("EDGE_NODE_ID"),
            "edgeToken": EDGE_TOKEN,
            "slots": [
                {"number": 1, "status": "OCCUPIED" if len(car_results) > 0 else "AVAILABLE"}
            ]
        }
        
        try:
            requests.post(f"{CENTRAL_API_URL}/api/edge/update", json=payload, timeout=2)
            print(f"✓ AI Scan: {len(car_results)} cars detected.")
        except:
            pass
            
        time.sleep(1) # AI scan frequency

if __name__ == "__main__":
    run_edge_ai()
