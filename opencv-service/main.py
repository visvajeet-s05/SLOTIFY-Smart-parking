import cv2
import numpy as np
import threading
import requests
import time
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import os
import signal
import sys


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Configuration ---
# Allow environment variable overrides
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000").rstrip("/")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", 5000))

# --- Global State ---
monitors = {}  # Dictionary to store active monitors: { lot_id: ParkingLotMonitor }

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
        
        # Initialize YOLOv8 Model (Auto-downloads 'yolov8n.pt' on first run)
        # Using the Nano model for speed. Use 'yolov8s.pt' or 'yolov8m.pt' for higher accuracy if GPU available.
        try:
            self.model = YOLO('yolov8n.pt')
            print(f"🧠 YOLOv8 Model loaded for {self.lot_id}")
        except Exception as e:
            print(f"❌ Failed to load YOLO model: {e}")
            self.model = None

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
            if self.model:
                processed_frame = self.detect_yolo(frame)
            else:
                # Fallback if model fails (though uncommon)
                processed_frame = frame
            
            with self.lock:
                self.last_frame = processed_frame

            # Send updates periodically
            self.frame_count += 1
            if self.frame_count % 30 == 0: # Checks every ~1s (assuming 30fps)
                self.send_updates()

        self.cap.release()

    def detect_yolo(self, frame):
        """Standard YOLOv8 Inference for Vehicle Detection"""
        overlay = frame.copy()
        
        # 1. Run inference on the frame
        # Classes: 2=car, 3=motorcycle, 5=bus, 7=truck (COCO dataset IDs)
        results = self.model(frame, classes=[2, 3, 5, 7], verbose=False, conf=0.4)
        
        # Get detections: [x1, y1, x2, y2, conf, cls]
        detections = results[0].boxes.data.cpu().numpy() if len(results) > 0 else []

        current_status = {}
        fh, fw = frame.shape[:2]
        
        # Reference basis for saved coordinates (1080p)
        REF_W, REF_H = 1920, 1080
        scale_x = fw / REF_W
        scale_y = fh / REF_H
        
        for slot in self.slots:
            slot_id = slot.get("slotNumber") or slot.get("number")
            
            # Map slot coordinates to current frame
            raw_x = slot.get("x") or 0
            raw_y = slot.get("y") or 0
            raw_w = slot.get("width") or 100
            raw_h = slot.get("height") or 100
            
            sx = int(raw_x * scale_x)
            sy = int(raw_y * scale_y)
            sw = int(raw_w * scale_x)
            sh = int(raw_h * scale_y)

            # Check for overlap with any detected vehicle
            is_occupied = False
            
            # Define slot center point
            slot_cx = sx + sw // 2
            slot_cy = sy + sh // 2

            for det in detections:
                dx1, dy1, dx2, dy2, conf, cls = det
                
                # Check if the CAR's center is inside the SLOT
                car_cx = (dx1 + dx2) / 2
                car_cy = (dy1 + dy2) / 2
                
                # Logic: If car center is within slot boundary (with some padding)
                if (sx < car_cx < sx + sw) and (sy < car_cy < sy + sh):
                    is_occupied = True
                    # Draw bounding box of the car itself (optional, helps debug)
                    cv2.rectangle(overlay, (int(dx1), int(dy1)), (int(dx2), int(dy2)), (0, 0, 255), 1)
                    break 

            status_text = "Occupied" if is_occupied else "Empty"
            current_status[slot_id] = "OCCUPIED" if is_occupied else "AVAILABLE"
            
            # --- VISUAL OVERLAY ---
            color = (0, 0, 255) if is_occupied else (0, 255, 0)
            
            # Slot Box
            cv2.rectangle(overlay, (sx, sy), (sx + sw, sy + sh), color, 2)
            
            # Center Target Dot
            cv2.circle(overlay, (slot_cx, slot_cy), 3, color, -1)
            
            # Label
            label_pos = (sx, sy - 10) if sy - 10 > 10 else (sx, sy + 20)
            cv2.putText(overlay, f"{slot_id}", label_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)

        # --- GLOBAL OVERLAYS (HUD) ---
        # 1. AI ACTIVE INDICATOR
        cv2.rectangle(overlay, (20, 20), (220, 55), (20, 20, 20), -1)
        cv2.rectangle(overlay, (20, 20), (220, 55), (100, 100, 100), 1)
        # Blipping light
        pulse_color = (0, 255, 0) if (time.time() * 10) % 10 > 5 else (0, 100, 0)
        cv2.circle(overlay, (40, 37), 5, pulse_color, -1)
        cv2.putText(overlay, "YOLO NEURAL NET", (55, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # 2. Car Counter
        car_count = len([d for d in detections if d[5] in [2, 7]]) # Count cars/trucks
        cv2.putText(overlay, f"VEHICLES DETECTED: {car_count}", (20, fh - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        self.status_cache = current_status
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.8, frame, 0.2, 0, frame)
        return frame


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
            print(f"✅ Posted update for {self.lot_id}", flush=True) 
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
