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

# Configuration from environment variables
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", "5000"))

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
        """Fetch camera URL and slot configuration from Next.js API"""
        try:
            url = f"{self.api_url}/api/internal/slots/{self.lot_id}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.camera_url = data.get("cameraUrl")
                self.slots = data.get("slots", [])
                print(f"✅ Loaded config for {self.lot_id}: {len(self.slots)} slots, URL: {self.camera_url}")
                return True
            else:
                print(f"⚠️ Failed to load config for {self.lot_id}: {response.status_code}")
                return False
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
                time.sleep(0.5) # Prevent CPU spin
                continue

            # Process frame for detection
            processed_frame = self.detect(frame)
            
            with self.lock:
                self.last_frame = processed_frame

            # Send updates periodically (every ~30 frames)
            self.frame_count += 1
            if self.frame_count % 30 == 0:
                self.send_updates()

        self.cap.release()

    def detect(self, frame):
        """Detect vehicles in slots"""
        # Resize for performance constraint if needed (e.g. 640x480) - optional
        # frame = cv2.resize(frame, (640, 480))

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Apply GaussianBlur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        current_status = {}
        
        for slot in self.slots:
            slot_id = slot.get("number") # assuming number is unique ID logic from API
            x, y = slot.get("x"), slot.get("y")
            w, h = slot.get("width"), slot.get("height")

            if x is None or y is None or w is None or h is None:
                continue
            
            # Boundary checks
            fh, fw = frame.shape[:2]
            if x < 0 or y < 0 or x+w > fw or y+h > fh:
                continue

            # ROI Analysis
            roi = edges[y:y+h, x:x+w]
            edge_count = np.count_nonzero(roi)
            
            # Thresholding - simple but effective for "texture"
            # Tunable: density = edge_count / (w * h)
            # If density > threshold -> Occupied
            if w * h > 0:
                density = edge_count / (w * h)
                is_occupied = density > 0.15  # 15% edges is a reasonable "car" threshold vs "asphalt"
            else:
                is_occupied = False

            status_str = "OCCUPIED" if is_occupied else "AVAILABLE"
            
            # Use existing status if available for color coding override logic, but here we just detect
            # The API/DB handles the "User Override" logic.
            # We just report "AI sees X".
            
            # Visual Feedback
            color = (0, 0, 255) if is_occupied else (0, 255, 0) # Red/Green
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, str(slot_id), (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

            current_status[slot_id] = status_str

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
            url = f"{self.api_url}/api/internal/slots/update"
            # Using a very short timeout to avoid blocking detection loop
            requests.post(url, json=payload, timeout=1)
            # print(f"✅ Posted update for {self.lot_id}") # verbose logging off
        except Exception as e:
            print(f"⚠️ Failed to post update for {self.lot_id}: {e}")

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
