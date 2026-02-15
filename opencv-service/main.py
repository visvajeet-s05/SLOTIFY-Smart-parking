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

# --- Configuration ---
# Allow environment variable overrides
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000").rstrip("/")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", 5000))

# MANUAL_CAMERA_URL = "http://10.227.24.164:8080/video"  # <--- UNCOMMENT TO FORCE OVERRIDE
MANUAL_CAMERA_URL = "http://10.227.24.164:8080/video"

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
            if MANUAL_CAMERA_URL:
                self.camera_url = MANUAL_CAMERA_URL
                print(f"⚠️ Using MANUAL_CAMERA_URL override: {self.camera_url}", flush=True)

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

    def _process_stream(self):
        """Main processing loop for this camera"""
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
                cv2.putText(processed_frame, "MODEL MISSING - CHECK LOGS", (50, 50), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                # Attempt to load model again occasionally? No, heavy.
            
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
                # Highlight occupied slot
                cv2.rectangle(overlay, (sx, sy), (sx + sw, sy + sh), (0, 0, 255), 2)
                # Show label below slot
                cv2.putText(overlay, "OCCUPIED", (sx, sy + sh + 20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
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
