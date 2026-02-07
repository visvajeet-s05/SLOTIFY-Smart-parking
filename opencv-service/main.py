import cv2
import numpy as np
import threading
import requests
from flask import Flask, Response, jsonify
import os

# Configuration from environment variables
IP_CAMERA_URL = os.getenv("IP_CAMERA_URL", "http://10.245.197.193:8080/video")
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
PYTHON_SERVICE_PORT = int(os.getenv("PYTHON_SERVICE_PORT", "5000"))

app = Flask(__name__)

# Global cache for parking slots per lot
parking_slots_cache = {}
slot_status = {}


def load_parking_slots(lot_id):
    """Fetch parking slot configuration from Next.js API"""
    try:
        url = f"{NEXTJS_API_URL}/api/internal/slots/{lot_id}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("slots", [])
        else:
            print(f"⚠️ Failed to load slots for {lot_id}: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error loading slots for {lot_id}: {e}")
        return []


def send_detection_result(lot_id, slots_status):
    """Send detection results to Next.js API"""
    try:
        url = f"{NEXTJS_API_URL}/api/internal/slots/update"
        payload = {
            "lotId": lot_id,
            "slots": [
                {"number": slot_num, "status": status}
                for slot_num, status in slots_status.items()
            ]
        }
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✅ Sent detection results for {lot_id}")
        else:
            print(f"⚠️ Failed to send results: {response.status_code}")
    except Exception as e:
        print(f"❌ Error sending detection results: {e}")


def detect(frame, lot_id="default"):
    """Detect vehicles in parking slots for a specific lot"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    # Load slots from cache or fetch from API
    if lot_id not in parking_slots_cache:
        parking_slots_cache[lot_id] = load_parking_slots(lot_id)
    
    slots = parking_slots_cache[lot_id]
    
    # If no slots configured, return frame unchanged
    if not slots:
        cv2.putText(frame, "No slots configured", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        return frame

    current_status = {}
    
    for slot in slots:
        # Skip slots without coordinates
        if slot.get("x") is None or slot.get("y") is None:
            continue
            
        x, y = slot["x"], slot["y"]
        w, h = slot.get("width", 100), slot.get("height", 100)
        slot_number = slot["number"]
        
        # Ensure coordinates are within frame bounds
        frame_h, frame_w = frame.shape[:2]
        x = max(0, min(x, frame_w - 1))
        y = max(0, min(y, frame_h - 1))
        w = min(w, frame_w - x)
        h = min(h, frame_h - y)
        
        if w <= 0 or h <= 0:
            continue
        
        # Detect edges in slot area
        area = edges[y:y + h, x:x + w]
        edge_count = np.count_nonzero(area)
        occupied = edge_count > 4000
        
        status = "OCCUPIED" if occupied else "EMPTY"
        current_status[slot_number] = status
        slot_status[slot_number] = status

        # Draw rectangle
        color = (0, 0, 255) if occupied else (0, 255, 0)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 3)
        
        # Draw slot number
        cv2.putText(frame, str(slot_number), (x + 5, y + 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Send results to API periodically (every 30 frames ~ 1 second at 30fps)
    if hasattr(detect, 'frame_count'):
        detect.frame_count += 1
    else:
        detect.frame_count = 1
    
    if detect.frame_count % 30 == 0 and current_status:
        send_detection_result(lot_id, current_status)

    return frame


def camera_stream(lot_id="default"):
    """Stream camera feed with slot detection for a specific lot"""
    cap = cv2.VideoCapture(IP_CAMERA_URL)
    
    # Reset frame counter for this stream
    detect.frame_count = 0
    
    while True:
        success, frame = cap.read()
        if not success:
            print("⚠️ Failed to read frame from camera")
            # Try to reconnect
            cap.release()
            cap = cv2.VideoCapture(IP_CAMERA_URL)
            continue

        frame = detect(frame, lot_id)
        _, buffer = cv2.imencode(".jpg", frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
               buffer.tobytes() + b"\r\n")


@app.route("/camera")
def camera():
    """Default camera stream (for backward compatibility)"""
    return Response(camera_stream("default"),
        mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/camera/<lot_id>")
def camera_by_lot(lot_id):
    """Camera stream for specific parking lot"""
    return Response(camera_stream(lot_id),
        mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/slots-status")
def slots():
    """Get current slot status"""
    return jsonify(slot_status)


@app.route("/slots-status/<lot_id>")
def slots_by_lot(lot_id):
    """Get slot status for specific lot"""
    # Refresh slots from API
    parking_slots_cache[lot_id] = load_parking_slots(lot_id)
    return jsonify({
        "lotId": lot_id,
        "slots": parking_slots_cache.get(lot_id, []),
        "status": slot_status
    })


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "cameraUrl": IP_CAMERA_URL,
        "apiUrl": NEXTJS_API_URL
    })


if __name__ == "__main__":
    print(f"🚀 Python OpenCV Service starting...")
    print(f"📷 Camera URL: {IP_CAMERA_URL}")
    print(f"🔗 API URL: {NEXTJS_API_URL}")
    print(f"🌐 Port: {PYTHON_SERVICE_PORT}")
    app.run(host="0.0.0.0", port=PYTHON_SERVICE_PORT, debug=False)
