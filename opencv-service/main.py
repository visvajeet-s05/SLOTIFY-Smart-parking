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
    def __init__(self, lot_id, api_url):
        self.lot_id = lot_id
        self.api_url = api_url
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
            print(f"🔄 Fetching config for {self.lot_id} from {self.api_url}...", flush=True)
            # Correct API endpoint to fetch parking lot and slot details
            response = requests.get(f"{self.api_url}/api/parking/{self.lot_id}/slots")
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch config for {self.lot_id}: {response.status_code} {response.text}", flush=True)
                return False
            
            data = response.json()
            
            # Extract camera URL
            self.camera_url = data.get("cameraUrl")
            if not self.camera_url:
                print(f"❌ No camera URL found for {self.lot_id}", flush=True)
                return False

            # Extract slots (Assuming data.slots is the list of slot objects)
            # Adjust this based on your actual API response structure!
            # Example expectation: { "id": "...", "cameraUrl": "...", "slots": [...] }
            self.slots = data.get("slots", [])
            print(f"✅ Loaded config for {self.lot_id}: {len(self.slots)} slots, URL: {self.camera_url}", flush=True)
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
        
        for slot in self.slots:
            slot_id = slot.get("slotNumber") or slot.get("number")
            x, y = slot.get("x"), slot.get("y")
            w, h = slot.get("width"), slot.get("height")

            if x is None or y is None or w is None or h is None:
                continue
            
            # Boundary checks
            if x < 0 or y < 0 or x+w > fw or y+h > fh:
                continue

            # ROI Analysis
            roi_edges = edges[y:y+h, x:x+w]
            roi_motion = fgmask[y:y+h, x:x+w]
            
            edge_density = np.count_nonzero(roi_edges) / (w * h) if w*h > 0 else 0
            motion_density = np.count_nonzero(roi_motion) / (w * h) if w*h > 0 else 0
            
            # COMBINED LOGIC: High edge frequency OR sustained motion indicates a car
            # Cars have complex textures (edges) compared to flat asphalt
            is_occupied = (edge_density > 0.12) or (motion_density > 0.20)

            current_status[slot_id] = "OCCUPIED" if is_occupied else "AVAILABLE"
            
            # --- PREMIUM VISUAL OVERLAY ---
            # Color palette (BGR)
            COLOR_OCCUPIED = (50, 50, 255) # Red-ish
            COLOR_AVAILABLE = (100, 255, 100) # Green-ish
            COLOR_SCAN = (255, 255, 0) # Cyan-ish
            
            color = COLOR_OCCUPIED if is_occupied else COLOR_AVAILABLE
            
            # Rounded Rectangle Look (Inner & Outer)
            cv2.rectangle(overlay, (x, y), (x + w, y + h), color, 2)
            cv2.rectangle(overlay, (x+2, y+2), (x + w-2, y + h-2), (0,0,0), 1)
            
            # Status Badge
            badge_h = 20
            cv2.rectangle(overlay, (x, y - badge_h), (x + 50, y), color, -1)
            label = f"S{slot_id}"
            cv2.putText(overlay, label, (x + 5, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,0,0), 2)
            cv2.putText(overlay, label, (x + 5, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255,255,255), 1)

            # Confidence bar
            conf_w = int(w * edge_density / 0.3) if is_occupied else int(w * (1 - edge_density / 0.12))
            conf_w = min(w, max(0, conf_w))
            cv2.rectangle(overlay, (x, y + h + 2), (x + conf_w, y + h + 5), color, -1)

        # Apply scanline effect to the MJPEG stream too
        scan_y = int((time.time() * 100) % fh)
        cv2.line(overlay, (0, scan_y), (fw, scan_y), (255, 255, 255), 1)

        # Blend original with overlay
        alpha = 0.8
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)

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

@app.route("/start/<lot_id>", methods=["POST"])
def start_monitoring(lot_id):
    if lot_id in monitors and monitors[lot_id].running:
        return jsonify({"status": "already_running", "message": f"Monitor for {lot_id} is active"}), 200
    
    monitor = ParkingLotMonitor(lot_id, NEXTJS_API_URL)
    monitors[lot_id] = monitor
    monitor.start()
    return jsonify({"status": "started", "message": f"Monitor for {lot_id} started"}), 200

@app.route("/stop/<lot_id>", methods=["POST"])
def stop_monitoring(lot_id):
    if lot_id in monitors:
        monitors[lot_id].stop()
        del monitors[lot_id]
        return jsonify({"status": "stopped", "message": f"Monitor for {lot_id} stopped"}), 200
    return jsonify({"status": "not_found", "message": "Monitor not active"}), 404

@app.route("/camera/<lot_id>")
def stream(lot_id):
    """MJPEG stream for a specific lot"""
    if lot_id not in monitors or not monitors[lot_id].running:
        # Try to auto-start if not running? Let's be smart.
        # If requesting stream, user wants to see it.
        try:
            print(f"🔄 Auto-starting monitor for {lot_id} due to stream request...")
            monitor = ParkingLotMonitor(lot_id, NEXTJS_API_URL)
            monitors[lot_id] = monitor
            monitor.start()
        except:
             return Response("Monitor not running", status=404)

    def generate():
        monitor = monitors.get(lot_id)
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
