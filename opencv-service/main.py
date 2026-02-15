import cv2
import numpy as np
import threading
import requests
import time
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import os
import signal
import signal
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ============================================================================
# MULTI-CAMERA URL CONFIGURATION (UP TO 30 CAMERAS)
# ============================================================================
# Configure individual camera URLs below. Each camera can have its own URL.
# If a camera URL is not specified, it will use the database/API configuration.
# 
# USAGE:
# - Camera 1-30: Set MANUAL_CAMERA_URL_1 through MANUAL_CAMERA_URL_30
# - Leave as None to use database configuration
# - Set to a URL string to override with manual configuration
# ============================================================================

MANUAL_CAMERA_URLS = {
    # Camera 1-10
    1: "http://10.227.24.164:8080/video",  # Camera 1 (Active)
    2: "http://10.227.24.80:8080/video",  # Camera 2 (Active)
    3: "http://10.227.24.164:8080/video",  # Camera 3 (Active)
    4: "http://10.227.24.164:8080/video",  # Camera 4 (Active)
    5: "http://10.227.24.164:8080/video",  # Camera 5 (Active)
    6: None,  # Camera 6 (Use database URL)
    7: None,  # Camera 7 (Use database URL)
    8: None,  # Camera 8 (Use database URL)
    9: None,  # Camera 9 (Use database URL)
    10: None,  # Camera 10 (Use database URL)
    
    # Camera 11-20
    11: None,  # Camera 11 (Use database URL)
    12: None,  # Camera 12 (Use database URL)
    13: None,  # Camera 13 (Use database URL)
    14: None,  # Camera 14 (Use database URL)
    15: None,  # Camera 15 (Use database URL)
    16: None,  # Camera 16 (Use database URL)
    17: None,  # Camera 17 (Use database URL)
    18: None,  # Camera 18 (Use database URL)
    19: None,  # Camera 19 (Use database URL)
    20: None,  # Camera 20 (Use database URL)
    
    # Camera 21-30
    21: None,  # Camera 21 (Use database URL)
    22: None,  # Camera 22 (Use database URL)
    23: None,  # Camera 23 (Use database URL)
    24: None,  # Camera 24 (Use database URL)
    25: None,  # Camera 25 (Use database URL)
    26: None,  # Camera 26 (Use database URL)
    27: None,  # Camera 27 (Use database URL)
    28: None,  # Camera 28 (Use database URL)
    29: None,  # Camera 29 (Use database URL)
    30: None,  # Camera 30 (Use database URL)
}

# Helper function to get camera URL by camera number or ID
def get_manual_camera_url(camera_id):
    """
    Get manual camera URL for a specific camera.
    
    Args:
        camera_id: Camera ID (can be string or int)
        
    Returns:
        Camera URL string if configured, None otherwise
    """
    if camera_id is None:
        return None
    
    # Try to extract camera number from camera_id
    # Supports formats like: "camera-1", "cam1", "1", 1, etc.
    try:
        if isinstance(camera_id, int):
            cam_num = camera_id
        elif isinstance(camera_id, str):
            # Extract number from string
            import re
            match = re.search(r'\d+', camera_id)
            if match:
                cam_num = int(match.group())
            else:
                return None
        else:
            return None
        
        # Return URL if configured
        return MANUAL_CAMERA_URLS.get(cam_num)
    except:
        return None

# ============================================================================
# EXAMPLE CONFIGURATIONS:
# ============================================================================
# 
# SCENARIO 1: All cameras use same URL (current setup)
# Set cameras 1-5 to same URL, rest to None
#
# SCENARIO 2: Each camera has different URL
# 1: "http://192.168.1.101:8080/video"
# 2: "http://192.168.1.102:8080/video"
# 3: "http://192.168.1.103:8080/video"
# etc.
#
# SCENARIO 3: Mixed configuration
# 1-5: "http://10.227.24.164:8080/video"  (IP Camera 1)
# 6-10: "http://10.227.24.165:8080/video" (IP Camera 2)
# 11-30: None (Use database configuration)
#
# ============================================================================

print("📹 Multi-Camera Configuration Loaded:")
print(f"   Total Cameras Configured: {len([url for url in MANUAL_CAMERA_URLS.values() if url is not None])}")
for cam_num, url in MANUAL_CAMERA_URLS.items():
    if url:
        print(f"   Camera {cam_num}: {url}")

# --- API Configuration ---
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000").rstrip("/")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", 5000))

# --- Global State ---
monitors = {}  # Dictionary to store active monitors: { lot_id: ParkingLotMonitor }

# COCO Class Labels (for SSD MobileNet V3)
# Note: TensorFlow Object Detection API models trained on COCO usually have 90 classes.
# We are only interested in 'car'. 'bus' and 'truck' are removed as per user request to detect ONLY cars.
CLASSES = {
    1: 'person', 2: 'bicycle', 3: 'car', 4: 'motorcycle', 5: 'airplane', 
    6: 'bus', 7: 'train', 8: 'truck', 9: 'boat', 10: 'traffic light', 
    11: 'fire hydrant', 13: 'stop sign', 14: 'parking meter', 15: 'bench', 
    16: 'bird', 17: 'cat', 18: 'dog', 19: 'horse', 20: 'sheep', 
    21: 'cow', 22: 'elephant', 23: 'bear', 24: 'zebra', 25: 'giraffe', 
    27: 'backpack', 28: 'umbrella', 31: 'handbag', 32: 'tie', 
    33: 'suitcase', 34: 'frisbee', 35: 'skis', 36: 'snowboard', 
    37: 'sports ball', 38: 'kite', 39: 'baseball bat', 40: 'baseball glove', 
    41: 'skateboard', 42: 'surfboard', 43: 'tennis racket', 44: 'bottle', 
    46: 'wine glass', 47: 'cup', 48: 'fork', 49: 'knife', 50: 'spoon', 
    51: 'bowl', 52: 'banana', 53: 'apple', 54: 'sandwich', 55: 'orange', 
    56: 'broccoli', 57: 'carrot', 58: 'hot dog', 59: 'pizza', 60: 'donut', 
    61: 'cake', 62: 'chair', 63: 'couch', 64: 'potted plant', 65: 'bed', 
    67: 'dining table', 70: 'toilet', 72: 'tv', 73: 'laptop', 74: 'mouse', 
    75: 'remote', 76: 'keyboard', 77: 'cell phone', 78: 'microwave', 
    79: 'oven', 80: 'toaster', 81: 'sink', 82: 'refrigerator', 84: 'book', 
    85: 'clock', 86: 'vase', 87: 'scissors', 88: 'teddy bear', 89: 'hair drier', 
    90: 'toothbrush'
}

# Targeted Vehicles
VEHICLES = {"car"} # USER REQUEST: Detect ONLY cars

class ParkingLotMonitor:
    def __init__(self, lot_id, api_url, camera_id=None):
        self.lot_id = lot_id
        self.api_url = api_url
        self.camera_id = camera_id
        self.camera_url = None
        self.slots = []
        self.cap = None
        self.running = False
        self.thread = None
        self.last_frame = None
        self.lock = threading.Lock()
        self.status_cache = {}
        self.frame_count = 0
        self.net = None
        self.model_loaded = False
        
        # Load Model
        self._load_model()

    def _load_model(self):
        """Load TensorFlow SSD MobileNet V3 model"""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            # Adjusted paths for TF model
            pb_path = os.path.join(base_dir, "models", "frozen_inference_graph.pb") 
            pbtxt_path = os.path.join(base_dir, "models", "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt")

            # Check if using the exact filenames from download script if name changed slightly
            if not os.path.exists(pb_path):
                 # Try searching for any .pb file in models
                 for f in os.listdir(os.path.join(base_dir, "models")):
                     if f.endswith(".pb"):
                         pb_path = os.path.join(base_dir, "models", f)
                         break

            if not os.path.exists(pb_path) or not os.path.exists(pbtxt_path):
                print(f"⚠️ Model files not found at {pb_path} or {pbtxt_path}.")
                print("Run 'python opencv-service/download_tf_model.py' to fetch them.")
                return

            print(f"🧠 Loading TensorFlow Neural Network from {pb_path}...", flush=True)
            self.net = cv2.dnn.readNetFromTensorflow(pb_path, pbtxt_path)
            
            # Use CUDA if available (optional, fallbacks to CPU)
            try:
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
                print("🚀 CUDA Backend set (if available)")
            except:
                print("ℹ️ Using CPU Backend")
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
                
            self.model_loaded = True
            print("✅ Model loaded successfully!", flush=True)
        except Exception as e:
            print(f"❌ Error loading model: {e}")

    def load_config(self):
        """Fetch camera URL and slot coordinates from Next.js API"""
        try:
            print(f"🔄 Fetching config for {self.lot_id}/{self.camera_id} from {self.api_url}...", flush=True)
            
            # Fetch slots filtered by camera if camera_id is provided
            url = f"{self.api_url}/api/parking/{self.lot_id}/slots"
            if self.camera_id:
                url += f"?cameraId={self.camera_id}"
                
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch config for {self.lot_id}: {response.status_code}", flush=True)
                return False
            
            data = response.json()
            
            # Extract camera URL for this specific camera
            if self.camera_id:
                # If we have a cameraId, look for that camera's specific URL if returned, 
                # or default to the lot's cameraUrl
                self.camera_url = data.get("cameraUrl") # Lot default
                # Check if camera details are provided in the response
                cameras = data.get("cameras", [])
                for cam in cameras:
                    if cam.get("id") == self.camera_id and cam.get("url"):
                        self.camera_url = cam.get("url")
            else:
                self.camera_url = data.get("cameraUrl")

            # Override with manual configuration if set in main.py
            # New multi-camera URL system - check for camera-specific URL
            manual_url = get_manual_camera_url(self.camera_id)
            if manual_url:
                self.camera_url = manual_url
                print(f"📹 Using Manual Camera URL (Camera {self.camera_id}): {self.camera_url}", flush=True)
            elif self.camera_url:
                print(f"🗄️ Using Database Camera URL: {self.camera_url}", flush=True)

            if not self.camera_url:
                print(f"❌ No camera URL found for {self.lot_id}/{self.camera_id}", flush=True)
                return False

            self.slots = data.get("slots", [])
            print(f"✅ Loaded config: {len(self.slots)} slots, URL: {self.camera_url}", flush=True)
            return True

        except Exception as e:
            print(f"❌ Error loading config for {self.lot_id}: {e}")
            return False

    def start(self):
        """Start the monitoring thread"""
        if self.running:
            print(f"⚠️ Monitor for {self.lot_id} is already running.")
            return

        if not self.load_config():
            print(f"❌ Cannot start monitor for {self.lot_id} - config load failed.")
            return

        if not self.camera_url:
            print(f"❌ Cannot start monitor for {self.lot_id} - No Camera URL provided.")
            return

        self.running = True
        self.thread = threading.Thread(target=self._process_stream, daemon=True)
        self.thread.start()
        print(f"🚀 Started monitor for {self.lot_id}")

    def stop(self):
        """Stop the monitoring thread"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=2)
        if self.cap:
            self.cap.release()
        print(f"🛑 Stopped monitor for {self.lot_id}")

    def check_camera_health(self):
        """Verify if camera URL is reachable before starting stream"""
        if not self.camera_url:
            return False
            
        print(f"🔍 Checking camera health for {self.lot_id} ({self.camera_url})...")
        try:
            # Try to open a stream connection with a short timeout
            cap = cv2.VideoCapture(self.camera_url)
            if not cap.isOpened():
                print(f"❌ Camera offline: {self.camera_url} (Unable to open stream)")
                return False
                
            # Read one frame to verify stream integrity
            ret, frame = cap.read()
            cap.release()
            
            if not ret or frame is None:
                print(f"⚠️ Camera connected but stream empty: {self.camera_url}")
                return False
                
            print(f"✅ Camera online and streaming: {self.camera_url}")
            return True
            
        except Exception as e:
            print(f"❌ Camera check failed: {e}")
            return False

    def _process_stream(self):
        """Main processing loop for this camera"""
        
        # Verify camera before starting loop
        if not self.check_camera_health():
            print(f"⚠️ specific camera {self.camera_url} failed health check. Retrying in loop...")
        
        self.cap = cv2.VideoCapture(self.camera_url)
        
        print(f"👁️ Starting AI Vision Analysis (Google TF Model) for {self.lot_id}")

        # Simple reconnection loop
        while self.running:
            if not self.cap.isOpened():
                print(f"🔄 Reconnecting camera for {self.lot_id}...")
                self.cap.release()
                time.sleep(2)
                self.cap = cv2.VideoCapture(self.camera_url)
                if not self.cap.isOpened():
                    continue

            ret, frame = self.cap.read()
            if not ret:
                print(f"⚠️ Failed to read frame for {self.lot_id}")
                time.sleep(0.5)
                continue

            # Process frame for detection
            if self.model_loaded:
                processed_frame = self.detect_dnn(frame)
            else:
                # Fallback or just show frame if model missing
                processed_frame = frame.copy()
                # Text overlay removed as per user request
            
            with self.lock:
                self.last_frame = processed_frame

            # Send updates periodically
            self.frame_count += 1
            if self.frame_count % 30 == 0: # Checks every ~1s (assuming 30fps)
                self.send_updates()

        self.cap.release()

    def detect_dnn(self, frame):
        """State-of-the-art Vehicle Detection using TensorFlow MobileNet V3"""
        overlay = frame.copy()
        current_status = {}
        
        (h, w) = frame.shape[:2]
        
        # Prepare input blob 
        # SSD MobileNet V3 expects 320x320 or 300x300 usually. 
        # swapRB=True, crop=False.
        blob = cv2.dnn.blobFromImage(frame, size=(300, 300), swapRB=True, crop=False)

        self.net.setInput(blob)
        detections = self.net.forward()

        # Extract vehicle centroids
        vehicle_centroids = []
        
        # Loop over the detections
        # shape: [1, 1, N, 7]
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            # Filter out weak detections
            if confidence > 0.5: # 50% confidence
                idx = int(detections[0, 0, i, 1])
                label = CLASSES.get(idx, "unknown")

                if label in VEHICLES:
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")

                    # Calculate centroid
                    cX = int((startX + endX) / 2)
                    cY = int((startY + endY) / 2)
                    vehicle_centroids.append((cX, cY))

                    # Draw bounding box (Green for vehicle)
                    cv2.rectangle(overlay, (startX, startY), (endX, endY), (0, 255, 0), 2)
                    y = startY - 15 if startY - 15 > 15 else startY + 15
                    cv2.putText(overlay, f"{label}: {confidence:.2f}", (startX, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Check occupancy against slots
        # Map slots to current frame coordinates
        REF_W, REF_H = 1920, 1080 
        scale_x = w / REF_W
        scale_y = h / REF_H
        
        occupied_count = 0

        for slot in self.slots:
            slot_id = slot.get("slotNumber") or slot.get("number") or "Unknown"
            
            # 1. Map Coordinates
            raw_x = slot.get("x") or 0
            raw_y = slot.get("y") or 0
            raw_w = slot.get("width") or 100
            raw_h = slot.get("height") or 100
            
            sx = int(raw_x * scale_x)
            sy = int(raw_y * scale_y)
            sw = int(raw_w * scale_x)
            sh = int(raw_h * scale_y)

            # Define Slot ROI
            slot_roi = (sx, sy, sw, sh)
            
            is_occupied = False
            
            # Check if any vehicle centroid is inside this slot
            for (vx, vy) in vehicle_centroids:
                if sx < vx < sx + sw and sy < vy < sy + sh:
                    is_occupied = True
                    break
            
            if is_occupied:
                occupied_count += 1
                current_status[slot_id] = "OCCUPIED"
                # Red rectangle and text removed as per user request
            else:
                current_status[slot_id] = "AVAILABLE"
                # Highlight available slot (optional, maybe faint green)
                # cv2.rectangle(overlay, (sx, sy), (sx + sw, sy + sh), (0, 255, 0), 1)

        # --- GLOBAL OVERLAYS (HUD) ---
        # 1. SYSTEM STATUS
        cv2.rectangle(overlay, (20, 20), (280, 70), (20, 20, 20), -1)
        cv2.rectangle(overlay, (20, 20), (280, 70), (0, 255, 255), 2)
        
        # Pulsing effect
        pulse = abs(np.sin(time.time() * 2))
        cv2.circle(overlay, (40, 45), 6, (0, 255, 255), -1 if pulse > 0.5 else 1)
        
        cv2.putText(overlay, "AI VISION: ACTIVE", (60, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(overlay, "MODEL: TF-MobileNetV3", (60, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)

        # 2. Occupancy Counter
        cv2.putText(overlay, f"CARS DETECTED: {len(vehicle_centroids)}", (20, h - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(overlay, f"OCCUPIED SLOTS: {occupied_count}", (20, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        self.status_cache = current_status
        return overlay


    def send_updates(self):
        """Post detection results to Next.js API"""
        if not self.status_cache:
            return

        payload = {
            "lotId": self.lot_id,
            "slots": [
                {"number": k, "status": v} for k, v in self.status_cache.items()
            ]
        }
        
        try:
            # CORRECT API ENDPOINT
            url = f"{self.api_url}/api/internal/slots/update"
            requests.post(url, json=payload, timeout=5)
            # print(f"✅ Posted update for {self.lot_id}", flush=True) 
        except Exception as e:
            print(f"⚠️ Failed to post update for {self.lot_id}: {e}", flush=True)

    def get_frame(self):
        """Return the latest processed frame as JPEG bytes"""
        with self.lock:
            if self.last_frame is None:
                return None
            ret, buffer = cv2.imencode('.jpg', self.last_frame)
            return buffer.tobytes()

# --- Flask Routes ---

@app.route("/start/<lot_id>", defaults={"camera_id": None}, methods=["POST"])
@app.route("/start/<lot_id>/<camera_id>", methods=["POST"])
def start_monitoring(lot_id, camera_id):
    key = f"{lot_id}_{camera_id}" if camera_id else lot_id
    
    if key in monitors and monitors[key].running:
        print(f"🔄 Reloading config for {key}...", flush=True)
        monitors[key].load_config()
        return jsonify({"status": "reloaded", "message": f"Monitor for {key} config reloaded"}), 200
    
    monitor = ParkingLotMonitor(lot_id, NEXTJS_API_URL, camera_id)
    monitors[key] = monitor
    monitor.start()
    return jsonify({"status": "started", "message": f"Monitor for {key} started"}), 200

@app.route("/stop/<lot_id>", defaults={"camera_id": None}, methods=["POST"])
@app.route("/stop/<lot_id>/<camera_id>", methods=["POST"])
def stop_monitoring(lot_id, camera_id):
    key = f"{lot_id}_{camera_id}" if camera_id else lot_id
    if key in monitors:
        monitors[key].stop()
        del monitors[key]
        return jsonify({"status": "stopped", "message": f"Monitor for {key} stopped"}), 200
    return jsonify({"status": "not_found", "message": "Monitor not active"}), 404

@app.route("/camera/<lot_id>", defaults={"camera_id": None})
@app.route("/camera/<lot_id>/<camera_id>")
def stream(lot_id, camera_id):
    """MJPEG stream for a specific lot/camera"""
    key = f"{lot_id}_{camera_id}" if camera_id else lot_id
    
    if key not in monitors or not monitors[key].running:
        try:
            print(f"🔄 Auto-starting monitor for {key} due to stream request...")
            monitor = ParkingLotMonitor(lot_id, NEXTJS_API_URL, camera_id)
            monitors[key] = monitor
            monitor.start()
        except Exception as e:
             print(f"❌ Auto-start failed: {e}")
             return Response("Monitor not running", status=404)

    def generate():
        monitor = monitors.get(key)
        while monitor and monitor.running:
            frame_bytes = monitor.get_frame()
            if frame_bytes:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                time.sleep(0.1)
                
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "active_monitors": list(monitors.keys())
    })

if __name__ == "__main__":
    print(f"🚀 Python Multi-Camera Service starting...")
    print(f"🔗 API URL: {NEXTJS_API_URL}")
    app.run(host="0.0.0.0", port=PYTHON_SERVICE_PORT, debug=False, threaded=True)
