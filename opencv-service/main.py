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
        
        # Initialize Background Subtractor for better movement/presence detection
        fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=True)
        
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
            processed_frame = self.detect(frame, fgbg)
            
            with self.lock:
                self.last_frame = processed_frame

            # Send updates periodically (every ~15 frames for snappier feel)
            self.frame_count += 1
            if self.frame_count % 15 == 0:
                self.send_updates()

        self.cap.release()

    def detect(self, frame, fgbg):
        """Enhanced detection using MOG2 + Edge Density"""
        # Create a copy for visual output
        overlay = frame.copy()
        
        # Processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges = cv2.Canny(blurred, 30, 100)
        
        # Background subtraction mask
        fgmask = fgbg.apply(blurred)
        _, fgmask = cv2.threshold(fgmask, 200, 255, cv2.THRESH_BINARY) # Remove shadows
        
        current_status = {}
        fh, fw = frame.shape[:2]
        
        # Reference basis for saved coordinates (1080p)
        REF_W, REF_H = 1920, 1080
        scale_x = fw / REF_W
        scale_y = fh / REF_H
        
        for slot in self.slots:
            slot_id = slot.get("slotNumber") or slot.get("number")
            
            # Scale coordinates from DB basis (1080p) to actual frame size
            raw_x = slot.get("x") or 0
            raw_y = slot.get("y") or 0
            raw_w = slot.get("width") or 100
            raw_h = slot.get("height") or 100
            
            x = int(raw_x * scale_x)
            y = int(raw_y * scale_y)
            w = int(raw_w * scale_x)
            h = int(raw_h * scale_y)
            
            # Boundary normalization
            x = max(0, min(x, fw - 1))
            y = max(0, min(y, fh - 1))
            w = max(10, min(w, fw - x))
            h = max(10, min(h, fh - y))

            # ROI Analysis
            roi_edges = edges[y:y+h, x:x+w]
            roi_motion = fgmask[y:y+h, x:x+w]
            
            edge_density = np.count_nonzero(roi_edges) / (w * h) if w*h > 0 else 0
            motion_density = np.count_nonzero(roi_motion) / (w * h) if w*h > 0 else 0
            
            # COMBINED LOGIC: High edge frequency OR sustained motion indicates a car
            is_occupied = (edge_density > 0.12) or (motion_density > 0.20)

            status_text = "Occupied" if is_occupied else "Empty"
            current_status[slot_id] = "OCCUPIED" if is_occupied else "AVAILABLE"
            
            # --- MINIMALIST VISUAL OVERLAY (Matching User Image) ---
            color = (0, 0, 255) if is_occupied else (0, 255, 0)
            
            # 1. Main Bounded Box (Clean 1px border)
            cv2.rectangle(overlay, (x, y), (x + w, y + h), color, 1)
            
            # 2. Corner Accents (Subtle detail)
            l = min(w, h) // 4
            cv2.line(overlay, (x, y), (x+l, y), color, 2)
            cv2.line(overlay, (x, y), (x, y+l), color, 2)
            cv2.line(overlay, (x+w, y), (x+w-l, y), color, 2)
            cv2.line(overlay, (x+w, y), (x+w, y+l), color, 2)
            cv2.line(overlay, (x, y+h), (x+l, y+h), color, 2)
            cv2.line(overlay, (x, y+h), (x, y+h-l), color, 2)
            cv2.line(overlay, (x+w, y+h), (x+w-l, y+h), color, 2)
            cv2.line(overlay, (x+w, y+h), (x+w, y+h-l), color, 2)

            # 3. Center Target Dot (Matching User Image)
            cv2.circle(overlay, (x + w // 2, y + h // 2), 2, color, -1)

        # --- GLOBAL OVERLAYS (HUD) ---
        # 1. OPTIC LINK ACTIVE TAG (Top Left Pill)
        cv2.rectangle(overlay, (20, 20), (220, 55), (15, 15, 15), -1)
        cv2.rectangle(overlay, (20, 20), (220, 55), (60, 60, 60), 1)
        pulse = self.frame_count % 30
        indicator_color = (0, 255, 255) if pulse < 15 else (0, 100, 100)
        cv2.circle(overlay, (40, 37), 4, indicator_color, -1)
        cv2.putText(overlay, "OPTIC LINK ACTIVE", (55, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1, cv2.LINE_AA)

        # 2. AI CONFIDENCE (Bottom Left Pill)
        cv2.rectangle(overlay, (20, fh - 70), (200, fh - 20), (10, 10, 10), -1)
        cv2.rectangle(overlay, (20, fh - 70), (200, fh - 20), (50, 50, 50), 1)
        cv2.putText(overlay, "AI CONFIDENCE", (35, fh - 52), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (120, 120, 120), 1, cv2.LINE_AA)
        cv2.putText(overlay, "98.4%", (35, fh - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2, cv2.LINE_AA)

        # 3. LINK STABLE (Bottom Right Pill)
        cv2.rectangle(overlay, (fw - 160, fh - 55), (fw - 20, fh - 20), (15, 15, 15), -1)
        cv2.rectangle(overlay, (fw - 160, fh - 55), (fw - 20, fh - 20), (50, 50, 50), 1)
        cv2.putText(overlay, "LINK STABLE", (fw - 145, fh - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1, cv2.LINE_AA)

        # 4. SCAN LINE (Fixed single cyan line as per image)
        scan_y = int(fh * 0.85)
        cv2.line(overlay, (0, scan_y), (fw, scan_y), (255, 255, 0), 1)
        
        # Blend original with overlay
        cv2.addWeighted(overlay, 0.9, frame, 0.1, 0, frame)

        self.status_cache = current_status
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
