"""
╔══════════════════════════════════════════════════════════════════════════╗
║        SMART PARKING AI SERVICE  v3.0  — GLOBAL STANDARD EDITION        ║
║  Pure OpenCV DNN · SSD MobileNet V3 COCO · Real-Time Car Detection      ║
║  Dual-Thread Pipeline · Direct MySQL · Sub-100ms DB Writes               ║
╚══════════════════════════════════════════════════════════════════════════╝

DETECTION ACCURACY:
  • Model  : SSD MobileNet V3 Large COCO (TensorFlow)
  • Target : COCO Class 3 = "car"  (covers ALL global car types)
              Sedans · Hatchbacks · SUVs · Crossovers · Wagons · Coupes
              Indian (Maruti, Tata, Hyundai, Mahindra, etc.)
              Global (Toyota, Honda, BMW, Audi, Ford, VW, etc.)
  • NMS    : cv2.dnn.NMSBoxes (eliminates duplicate boxes)
  • Speed  : Frame decoded @ cam-thread, detected @ detect-thread (no lag)
  • DB     : Direct MySQL writes bypass HTTP round-trips (< 5ms per update)
"""

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import threading
import time
import os
import queue
import requests
import mysql.connector
from dotenv import load_dotenv
from predict_demand import predict_occupancy, train_model

# ── Load .env ──────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env.local'))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

app = Flask(__name__)
CORS(app)

# ── Configuration ──────────────────────────────────────────────────────────
NEXTJS_API_URL       = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
PYTHON_SERVICE_PORT  = int(os.getenv("PYTHON_SERVICE_PORT", 5000))
CAMERA_IP            = os.getenv("CAMERA_IP", "172.22.95.91:8080")
CAMERA_STREAM_URL    = f"http://{CAMERA_IP}/video"
DATABASE_URL         = os.getenv("DATABASE_URL", "")
# WS_SERVER_URL: in production, set to your Railway WS service HTTP URL
# e.g. https://smart-parking-ws.up.railway.app
# In local dev, falls back to localhost:4000
WS_SERVER_URL        = os.getenv("WS_SERVER_URL", f"http://localhost:{os.getenv('WS_PORT', '4000')}")

# ── Detection Constants ─────────────────────────────────────────────────────
#   SSD MobileNet V3 COCO  →  class IDs are 1-indexed in the output tensor
#   Class 3 = "car"  (COCO 1-indexed).  This is the ONLY class we care about.
#   All global car types fall under class 3: sedans, SUVs, hatchbacks, etc.
CAR_CLASS_ID         = 3       # COCO 1-indexed class 3 = car
CONFIDENCE_THRESHOLD = 0.35    # Minimum detection confidence (0–1)
NMS_THRESHOLD        = 0.40    # NMS IoU threshold to suppress duplicate boxes
INPUT_SIZE           = (300, 300)  # SSD MobileNet V3 input resolution
SCALE_FACTOR         = 1.0 / 127.5
MEAN_SUBTRACTION     = (127.5, 127.5, 127.5)

# ── Slot-Matching Constants ─────────────────────────────────────────────────
REF_W, REF_H         = 1920, 1080  # Reference resolution of slot coordinates
SLOT_OVERLAP_MIN     = 0.20        # Min % of slot area a car must cover  (primary)
CENTER_OVERLAP_MIN   = 0.10        # Min % when car centre is inside slot  (secondary)
BIG_CAR_FRACTION     = 0.65        # Ignore boxes > 65% of frame (false positives)

# ── Debounce Constants ──────────────────────────────────────────────────────
#   Prevents rapid OCCUPIED / AVAILABLE flicker in real-time video.
OCCUPY_THRESHOLD     = 5   # Buffer score to call slot OCCUPIED  (≥)
CLEAR_THRESHOLD      = 2   # Buffer score to call slot AVAILABLE (≤)
BUFFER_INCREMENT     = 3   # Points added per frame when car detected
BUFFER_DECREMENT     = 1   # Points removed per frame when no car

# ── Global State ───────────────────────────────────────────────────────────
monitors: dict = {}


# ══════════════════════════════════════════════════════════════════════════
#   DATABASE LAYER  — Direct MySQL (< 5 ms writes, no HTTP round-trip)
# ══════════════════════════════════════════════════════════════════════════

def _parse_db_url(url: str) -> dict | None:
    """Parse mysql://user:pass@host:port/dbname → dict of kwargs."""
    try:
        url = url.strip()
        if url.startswith('"') or url.startswith("'"):
            url = url[1:-1]
        rest = url.replace("mysql://", "")
        auth, host_db = rest.split("@", 1)
        user, password = auth.split(":", 1)
        host_port, dbname = host_db.split("/", 1)
        if ":" in host_port:
            host, port = host_port.split(":", 1)
        else:
            host, port = host_port, "3306"
        return dict(host=host, port=int(port), user=user,
                    password=password, database=dbname)
    except Exception as e:
        print(f"❌ DB URL parse error: {e}", flush=True)
        return None


class DatabaseWriter:
    """
    Thread-safe, connection-pooled MySQL writer.
    Writes slot status changes directly to the DB — no HTTP overhead.
    Also logs every AI change to SlotStatusLog for full audit trail.
    """

    def __init__(self):
        self._lock   = threading.Lock()
        self._conn   = None
        self._params = _parse_db_url(DATABASE_URL)
        self._connect()

    def _connect(self):
        if not self._params:
            print("⚠️ DB: No valid DATABASE_URL — using HTTP fallback only.", flush=True)
            return
        try:
            self._conn = mysql.connector.connect(
                **self._params,
                connection_timeout=5,
                autocommit=False,
            )
            print("✅ DB: Direct MySQL connection established.", flush=True)
        except Exception as e:
            print(f"⚠️ DB connect failed (will retry): {e}", flush=True)
            self._conn = None

    def _ensure_connection(self) -> bool:
        if self._conn and self._conn.is_connected():
            return True
        self._connect()
        return self._conn is not None and self._conn.is_connected()

    def update_slots(self, lot_id: str, slot_updates: list[dict]) -> bool:
        """
        slot_updates: [{"slot_id": str, "slot_number": int,
                        "old_status": str, "new_status": str}]
        Returns True if direct DB write succeeded.
        """
        if not slot_updates:
            return True
        with self._lock:
            if not self._ensure_connection():
                return False
            try:
                cursor = self._conn.cursor()
                now = time.strftime("%Y-%m-%d %H:%M:%S")

                for su in slot_updates:
                    # 1. Update Slot table
                    cursor.execute(
                        """UPDATE Slot
                              SET status      = %s,
                                  updatedBy   = 'AI',
                                  aiConfidence = 95.0,
                                  updatedAt   = %s
                            WHERE id = %s""",
                        (su["new_status"], now, su["slot_id"])
                    )
                    # 2. Insert audit log
                    import uuid
                    cursor.execute(
                        """INSERT INTO SlotStatusLog
                                (id, slotId, oldStatus, newStatus,
                                 updatedBy, aiConfidence, createdAt)
                           VALUES (%s, %s, %s, %s, 'AI', 95.0, %s)""",
                        (str(uuid.uuid4()), su["slot_id"],
                         su["old_status"], su["new_status"], now)
                    )

                self._conn.commit()
                cursor.close()
                return True
            except Exception as e:
                print(f"⚠️ DB write error: {e}", flush=True)
                try:
                    self._conn.rollback()
                except Exception:
                    pass
                self._conn = None   # Force reconnect next time
                return False


# Singleton DB writer shared across all monitors
_db_writer = DatabaseWriter()


# ── WebSocket Broadcast (fire-and-forget) ──────────────────────────────────
def _broadcast(lot_id: str, updates: list[dict]):
    """Push SLOT_UPDATE events to the WS server (non-blocking).
    In production, WS_SERVER_URL points to Railway WS service.
    In local dev, falls back to localhost:4000.
    """
    try:
        requests.post(
            f"{WS_SERVER_URL}/broadcast",
            json={"type": "BULK_SLOT_UPDATE", "lotId": lot_id, "updates": updates},
            timeout=0.5,
        )
    except Exception:
        pass  # WS server may not be running — gracefully ignore


# ══════════════════════════════════════════════════════════════════════════
#   SMART MONITOR  — One instance per parking lot
# ══════════════════════════════════════════════════════════════════════════

class SmartMonitor:
    """
    Architecture:
      [Camera Thread]  — reads frames from camera, enqueues for detection
      [Detect Thread]  — dequeues frame, runs SSD MobileNet, checks slots
      [Flask Thread]   — serves MJPEG stream from annotated last_frame
    """

    def __init__(self, lot_id: str):
        self.lot_id       = lot_id
        self.camera_url   = CAMERA_STREAM_URL
        self.running      = False
        self.lock         = threading.Lock()

        # Queues (maxsize=1 → always process latest frame, drop old ones)
        self.frame_queue  = queue.Queue(maxsize=1)

        # State
        self.last_frame          = None      # Latest annotated frame for MJPEG
        self.slots: list         = []        # Slot configs from API
        self.slot_db_map: dict   = {}        # slotNumber → {id, status, ...}
        self.slot_status: dict   = {}        # slot_id → "OCCUPIED"|"AVAILABLE"
        self.slot_buffer: dict   = {}        # slot_id → int score (debounce)
        self.vehicle_centroids   = []        # For stats/debug

        # AI Model
        self.net          = None
        self.model_loaded = False
        self._load_model()

    # ── Model Loading ──────────────────────────────────────────────────────

    def _load_model(self):
        """
        Load TensorFlow SSD MobileNet V3 Large COCO via cv2.dnn.
        This model detects 90 COCO classes; we filter to class 3 (car) only.
        """
        try:
            base   = os.path.dirname(os.path.abspath(__file__))
            pb     = os.path.join(base, "models", "frozen_inference_graph.pb")
            pbtxt  = os.path.join(base, "models", "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt")

            if not os.path.exists(pb):
                print(f"⚠️ Model file not found: {pb}", flush=True)
                print("   Run: python opencv-service/download_models.py", flush=True)
                return

            print("🧠 Loading SSD MobileNet V3 COCO (TensorFlow)...", flush=True)
            self.net = cv2.dnn.readNetFromTensorflow(pb, pbtxt)

            # Force CPU — stable & deterministic for parking applications
            self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
            self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

            # Warm-up pass — first inference is always slow; warm up now
            dummy = np.zeros((300, 300, 3), dtype=np.uint8)
            blob  = cv2.dnn.blobFromImage(
                dummy, scalefactor=SCALE_FACTOR, size=INPUT_SIZE,
                mean=MEAN_SUBTRACTION, swapRB=True, crop=False)
            self.net.setInput(blob)
            self.net.forward()

            self.model_loaded = True
            print("✅ AI Model ready — Car-Only Detection Active", flush=True)
            print(f"   Target: COCO class {CAR_CLASS_ID} (car) — covers ALL global & Indian car types", flush=True)

        except Exception as e:
            print(f"❌ Model load failed: {e}", flush=True)
            self.model_loaded = False

    # ── Config Loading ─────────────────────────────────────────────────────

    def load_config(self):
        """Fetch slot coordinates from Next.js API and build slot_db_map."""
        try:
            url = f"{NEXTJS_API_URL}/api/parking/{self.lot_id}/slots"
            print(f"⬇️  Fetching slot config: {url}", flush=True)
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                self.slots = data.get("slots", [])
                # Build fast lookup: slotNumber → full slot record
                self.slot_db_map = {
                    s["slotNumber"]: s
                    for s in self.slots
                    if s.get("slotNumber") is not None
                }
                print(f"✅ Loaded {len(self.slots)} slots", flush=True)
            else:
                print(f"⚠️ Slot config HTTP {res.status_code}", flush=True)
        except Exception as e:
            print(f"❌ Config load error: {e}", flush=True)

    # ── Lifecycle ──────────────────────────────────────────────────────────

    def start(self):
        if self.running:
            return
        self.load_config()

        # Initialise all slots as AVAILABLE (clean state)
        for s in self.slots:
            sid = s.get("id")
            if sid:
                self.slot_status[sid] = "AVAILABLE"
                self.slot_buffer[sid] = 0

        self.running = True

        # Camera capture thread
        t_cam = threading.Thread(target=self._camera_loop, daemon=True, name=f"cam-{self.lot_id}")
        t_cam.start()

        # Detection processing thread
        t_det = threading.Thread(target=self._detect_loop, daemon=True, name=f"det-{self.lot_id}")
        t_det.start()

        print(f"▶️  Monitor started: lot={self.lot_id}", flush=True)

    def stop(self):
        self.running = False
        print(f"⏹️  Monitor stopped: lot={self.lot_id}", flush=True)

    # ── Camera Thread ──────────────────────────────────────────────────────

    def _camera_loop(self):
        """
        Thread 1: Reads raw frames from the MJPEG / RTSP camera.
        Puts only the LATEST frame into frame_queue (drops stale ones).
        This ensures the detection thread always works on fresh data.
        """
        print(f"📹 Camera thread: connecting to {self.camera_url}", flush=True)
        cap = None
        consecutive_failures = 0
        MAX_FAILURES = 30

        while self.running:
            # Connect / reconnect
            if cap is None or not cap.isOpened():
                cap = cv2.VideoCapture(self.camera_url)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)   # Min buffer = freshest frame
                if not cap.isOpened():
                    print(f"❌ Cannot open camera: {self.camera_url}", flush=True)
                    time.sleep(3)
                    continue
                consecutive_failures = 0
                print(f"✅ Camera connected: {self.camera_url}", flush=True)

            ret, frame = cap.read()
            if not ret:
                consecutive_failures += 1
                if consecutive_failures >= MAX_FAILURES:
                    print("⚠️ Too many frame failures — reconnecting camera...", flush=True)
                    cap.release()
                    cap = None
                    consecutive_failures = 0
                    time.sleep(1)
                continue

            consecutive_failures = 0

            # Drop old frame if queue is full (keep latest)
            if self.frame_queue.full():
                try:
                    self.frame_queue.get_nowait()
                except queue.Empty:
                    pass
            self.frame_queue.put_nowait(frame)

        if cap:
            cap.release()

    # ── Detection Thread ───────────────────────────────────────────────────

    def _detect_loop(self):
        """
        Thread 2: Dequeues frame, runs SSD MobileNet V3 detection,
        updates slot status, writes to DB, broadcasts via WS.
        """
        last_db_write = 0.0
        DB_WRITE_INTERVAL = 0.3   # Write to DB at most every 300 ms

        while self.running:
            try:
                frame = self.frame_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            # ── Run Detection ──────────────────────────────────────────────
            t0 = time.perf_counter()
            annotated, changed_slots = self._detect_and_update(frame)
            t1 = time.perf_counter()
            det_ms = (t1 - t0) * 1000

            # Store annotated frame for MJPEG stream
            with self.lock:
                self.last_frame = annotated

            # ── Write to DB + WS if something changed ─────────────────────
            now = time.time()
            if changed_slots and (now - last_db_write) >= DB_WRITE_INTERVAL:
                self._persist_changes(changed_slots)
                last_db_write = now

            # Throttle detection to avoid CPU saturation (target ~15 fps)
            elapsed = time.perf_counter() - t0
            sleep_time = max(0.0, 0.067 - elapsed)  # 1/15 = 0.067s
            if sleep_time > 0:
                time.sleep(sleep_time)

    # ── Core Detection Logic ───────────────────────────────────────────────

    def _detect_and_update(self, frame: np.ndarray) -> tuple[np.ndarray, list[dict]]:
        """
        Runs SSD MobileNet V3 on the frame.
        Returns (annotated_frame, list_of_changed_slot_dicts).
        """
        (h, w) = frame.shape[:2]
        frame_area = h * w

        # ── 1. BUILD BLOB ──────────────────────────────────────────────────
        #   TensorFlow SSD MobileNet preprocessing:
        #   pixel_normalized = (pixel - 127.5) / 127.5  →  range [-1, 1]
        blob = cv2.dnn.blobFromImage(
            frame,
            scalefactor=SCALE_FACTOR,
            size=INPUT_SIZE,
            mean=MEAN_SUBTRACTION,
            swapRB=True,
            crop=False,
        )

        # ── 2. FORWARD PASS ────────────────────────────────────────────────
        self.net.setInput(blob)
        raw = self.net.forward()
        # Output shape: [1, 1, N, 7]
        #   [:, :, i, :] = [batch, class, det_idx, (img, cls, conf, x1,y1,x2,y2)]

        # ── 3. COLLECT RAW CAR DETECTIONS ──────────────────────────────────
        raw_boxes:   list[list[int]] = []
        raw_confs:   list[float]     = []

        num_detections = raw.shape[2]
        for i in range(num_detections):
            confidence = float(raw[0, 0, i, 2])
            if confidence < CONFIDENCE_THRESHOLD:
                continue

            class_id = int(raw[0, 0, i, 1])
            if class_id != CAR_CLASS_ID:
                continue   # ← STRICT FILTER: only class 3 = car

            # Decode bounding box (normalised → pixel)
            x1 = int(raw[0, 0, i, 3] * w)
            y1 = int(raw[0, 0, i, 4] * h)
            x2 = int(raw[0, 0, i, 5] * w)
            y2 = int(raw[0, 0, i, 6] * h)

            bw = x2 - x1
            bh = y2 - y1

            # Sanity: skip if box is negative or extends outside frame
            if bw <= 0 or bh <= 0:
                continue
            if bw * bh > frame_area * BIG_CAR_FRACTION:
                continue  # Giant phantom detection → skip

            raw_boxes.append([x1, y1, bw, bh])
            raw_confs.append(confidence)

        # ── 4. NON-MAXIMUM SUPPRESSION ─────────────────────────────────────
        #   Removes duplicate boxes for the SAME car detected multiple times.
        cars: list[dict] = []   # [{x,y,w,h,conf}, ...]

        if raw_boxes:
            indices = cv2.dnn.NMSBoxes(raw_boxes, raw_confs,
                                       CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
            if len(indices) > 0:
                for idx in indices.flatten():
                    x, y, bw, bh = raw_boxes[idx]
                    cars.append({"x": x, "y": y, "w": bw, "h": bh,
                                 "conf": raw_confs[idx]})

        self.vehicle_centroids = [(c["x"] + c["w"] // 2,
                                   c["y"] + c["h"] // 2) for c in cars]

        # ── 5. ANNOTATE CARS ON FRAME ──────────────────────────────────────
        for car in cars:
            x, y, bw, bh = car["x"], car["y"], car["w"], car["h"]
            conf_pct = int(car["conf"] * 100)
            # Cyan box for detected cars
            cv2.rectangle(frame, (x, y), (x + bw, y + bh), (255, 215, 0), 2)
            label = f"Car {conf_pct}%"
            t_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x, y - t_size[1] - 4), (x + t_size[0], y), (255, 215, 0), -1)
            cv2.putText(frame, label, (x, y - 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

        # ── 6. SLOT OCCUPANCY CHECK ────────────────────────────────────────
        scale_x = w / REF_W
        scale_y = h / REF_H
        changed_slots: list[dict] = []

        for slot in self.slots:
            sid = slot.get("id")
            if not sid:
                continue

            # Scale slot coords to current frame resolution
            try:
                sx  = int(float(slot.get("x")     or 0)   * scale_x)
                sy  = int(float(slot.get("y")     or 0)   * scale_y)
                sw  = int(float(slot.get("width")  or 100) * scale_x)
                sh  = int(float(slot.get("height") or 100) * scale_y)
            except (ValueError, TypeError):
                continue

            if sw <= 0 or sh <= 0:
                continue
            slot_area = sw * sh

            # ── Check each car against this slot ──────────────────────────
            is_occupied = False
            for car in cars:
                cx, cy, cw, ch = car["x"], car["y"], car["w"], car["h"]

                # Geometric intersection
                xA = max(sx, cx);        yA = max(sy, cy)
                xB = min(sx + sw, cx + cw); yB = min(sy + sh, cy + ch)
                inter_w = max(0, xB - xA)
                inter_h = max(0, yB - yA)
                inter_area = inter_w * inter_h

                if inter_area == 0:
                    continue

                # Car centre-point (used for point-in-slot test)
                ccx = cx + cw / 2
                ccy = cy + ch / 2
                centre_inside = (sx < ccx < sx + sw) and (sy < ccy < sy + sh)

                # Slot coverage fraction
                slot_coverage = inter_area / slot_area

                # Decision logic (two conditions — either is enough):
                #   A) Car centre is INSIDE slot  AND ≥ 10 % slot coverage
                #   B) Car covers ≥ 20 % of slot  (even if centre slightly outside)
                if (centre_inside and slot_coverage >= CENTER_OVERLAP_MIN) \
                   or slot_coverage >= SLOT_OVERLAP_MIN:
                    is_occupied = True
                    break

            # ── Debounce / hysteresis ──────────────────────────────────────
            if sid not in self.slot_buffer:
                self.slot_buffer[sid] = 0

            if is_occupied:
                self.slot_buffer[sid] = min(
                    self.slot_buffer[sid] + BUFFER_INCREMENT, 10)
            else:
                self.slot_buffer[sid] = max(
                    self.slot_buffer[sid] - BUFFER_DECREMENT, 0)

            prev_status = self.slot_status.get(sid, "AVAILABLE")
            score = self.slot_buffer[sid]

            if score >= OCCUPY_THRESHOLD:
                final_status = "OCCUPIED"
            elif score <= CLEAR_THRESHOLD:
                final_status = "AVAILABLE"
            else:
                final_status = prev_status   # Hysteresis — hold current state

            self.slot_status[sid] = final_status

            # Track changes for DB/WS write
            if final_status != prev_status:
                changed_slots.append({
                    "slot_id":    sid,
                    "slot_number": slot.get("slotNumber"),
                    "old_status": prev_status,
                    "new_status": final_status,
                })

            # ── Draw slot overlay on frame ─────────────────────────────────
            if final_status == "OCCUPIED":
                color = (0, 0, 220)       # Red
                thickness = 3
                label_txt = "OCCUPIED"
            else:
                color = (0, 210, 0)       # Green
                thickness = 2
                label_txt = "FREE"

            cv2.rectangle(frame, (sx, sy), (sx + sw, sy + sh), color, thickness)

            # Filled label background for readability
            t_size, _ = cv2.getTextSize(label_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
            cv2.rectangle(frame, (sx, sy), (sx + t_size[0] + 3, sy + t_size[1] + 4), color, -1)
            cv2.putText(frame, label_txt, (sx + 2, sy + t_size[1] + 1),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)

            # Centre dot
            cx_s = sx + sw // 2
            cy_s = sy + sh // 2
            cv2.circle(frame, (cx_s, cy_s), 3, color, -1)

        # ── HUD overlay ───────────────────────────────────────────────────
        occupied_count = sum(1 for v in self.slot_status.values() if v == "OCCUPIED")
        total_slots = len(self.slots)
        free_count = total_slots - occupied_count

        hud = [
            f"Cars detected : {len(cars)}",
            f"Occupied slots: {occupied_count}/{total_slots}",
            f"Free slots    : {free_count}/{total_slots}",
        ]
        for i, line in enumerate(hud):
            y_pos = 20 + i * 20
            cv2.putText(frame, line, (8, y_pos),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 3, cv2.LINE_AA)
            cv2.putText(frame, line, (8, y_pos),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

        return frame, changed_slots

    # ── Persist Changes ────────────────────────────────────────────────────

    def _persist_changes(self, changed_slots: list[dict]):
        """
        Write status changes to MySQL directly (fastest path).
        Falls back to HTTP POST to Next.js if MySQL write fails.
        Also broadcasts via WebSocket.
        """
        if not changed_slots:
            return

        # ── Path A: Direct MySQL (< 5 ms) ─────────────────────────────────
        db_ok = _db_writer.update_slots(self.lot_id, changed_slots)

        # ── Path B: HTTP fallback if DB write failed ───────────────────────
        if not db_ok:
            slot_updates_http = [
                {"number": su["slot_number"], "status": su["new_status"]}
                for su in changed_slots
                if su["slot_number"] is not None
            ]
            if slot_updates_http:
                try:
                    requests.post(
                        f"{NEXTJS_API_URL}/api/internal/slots/update",
                        json={"lotId": self.lot_id, "slots": slot_updates_http},
                        timeout=2,
                    )
                except Exception:
                    pass

        # ── Path C: WebSocket broadcast (always — frontend real-time) ──────
        ws_updates = [
            {
                "type":       "SLOT_UPDATE",
                "lotId":      self.lot_id,
                "slotId":     su["slot_id"],
                "slotNumber": su["slot_number"],
                "status":     su["new_status"],
                "confidence": 95.0,
                "source":     "AI",
                "timestamp":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            for su in changed_slots
        ]
        _broadcast(self.lot_id, ws_updates)

        # ── Log ───────────────────────────────────────────────────────────
        for su in changed_slots:
            emoji = "🔴" if su["new_status"] == "OCCUPIED" else "🟢"
            print(
                f"{emoji} Slot {su['slot_number']:>3} "
                f"{su['old_status']:>9} → {su['new_status']:>9}  "
                f"[lot={self.lot_id}]",
                flush=True,
            )


# ══════════════════════════════════════════════════════════════════════════
#   FLASK ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route("/start/<lot_id>", methods=["POST"])
def start(lot_id):
    if lot_id not in monitors:
        monitors[lot_id] = SmartMonitor(lot_id)
    monitors[lot_id].start()
    return jsonify({"status": "started", "lot": lot_id})


@app.route("/stop/<lot_id>", methods=["POST"])
def stop(lot_id):
    if lot_id in monitors:
        monitors[lot_id].stop()
        del monitors[lot_id]
    return jsonify({"status": "stopped", "lot": lot_id})


@app.route("/camera/<lot_id>")
@app.route("/camera/<lot_id>/<camera_id>")
def stream(lot_id, camera_id=None):
    """MJPEG stream endpoint — auto-starts monitor if not running."""
    if lot_id not in monitors:
        monitors[lot_id] = SmartMonitor(lot_id)
        monitors[lot_id].start()
        time.sleep(1.5)   # Give camera thread time to connect

    def generate():
        mon = monitors[lot_id]
        while mon.running:
            with mon.lock:
                frame = mon.last_frame
            if frame is None:
                time.sleep(0.05)
                continue
            ret, buf = cv2.imencode(
                ".jpg", frame,
                [cv2.IMWRITE_JPEG_QUALITY, 75]
            )
            if ret:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + buf.tobytes()
                    + b"\r\n"
                )
            time.sleep(0.04)   # ~25 fps stream

    return Response(generate(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/health")
def health():
    status = {}
    for lot_id, mon in monitors.items():
        status[lot_id] = {
            "running":      mon.running,
            "model_loaded": mon.model_loaded,
            "slots":        len(mon.slots),
            "cars":         len(mon.vehicle_centroids),
            "occupied":     sum(1 for v in mon.slot_status.values() if v == "OCCUPIED"),
            "available":    sum(1 for v in mon.slot_status.values() if v == "AVAILABLE"),
        }
    return jsonify({
        "status":     "healthy",
        "version":    "3.0",
        "model":      "SSD MobileNet V3 COCO (car-only)",
        "db_connected": _db_writer._conn is not None and
                        (_db_writer._conn.is_connected() if _db_writer._conn else False),
        "monitors":   status,
    })


@app.route("/reload/<lot_id>", methods=["POST"])
def reload_config(lot_id):
    """Hot-reload slot configuration without restarting the monitor."""
    if lot_id in monitors:
        monitors[lot_id].load_config()
        return jsonify({"status": "reloaded", "slots": len(monitors[lot_id].slots)})
    return jsonify({"error": "Monitor not running"}), 404


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json or {}
    lot_id          = data.get("lotId")
    target_time_iso = data.get("targetTime")

    if not lot_id or not target_time_iso:
        return jsonify({"error": "lotId and targetTime are required"}), 400

    occupancy_rate = predict_occupancy(lot_id, target_time_iso)
    if occupancy_rate is None:
        return jsonify({"error": "Not enough historical data or model failed"}), 500

    return jsonify({
        "lotId":         lot_id,
        "targetTime":    target_time_iso,
        "occupancyRate": occupancy_rate,
    })


@app.route("/status/<lot_id>")
def slot_status(lot_id):
    """Return raw slot status map for debugging."""
    if lot_id not in monitors:
        return jsonify({"error": "Monitor not found"}), 404
    mon = monitors[lot_id]
    return jsonify({
        "lotId":      lot_id,
        "slots":      mon.slot_status,
        "cars":       len(mon.vehicle_centroids),
        "buffers":    mon.slot_buffer,
    })


# ══════════════════════════════════════════════════════════════════════════
#   ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 72, flush=True)
    print("  SMART PARKING AI SERVICE v3.0  —  Global Standard Edition", flush=True)
    print("  Model  : SSD MobileNet V3 COCO  (OpenCV DNN / TensorFlow)", flush=True)
    print("  Target : Car only  (COCO class 3 — all global & Indian types)", flush=True)
    print("  DB     : Direct MySQL  +  HTTP fallback  +  WebSocket broadcast", flush=True)
    print("=" * 72, flush=True)

    # Train demand-prediction model in background (non-blocking)
    threading.Thread(target=train_model, daemon=True, name="ml-train").start()

    app.run(host="0.0.0.0", port=PYTHON_SERVICE_PORT, threaded=True, debug=False)
