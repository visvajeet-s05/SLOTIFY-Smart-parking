import cv2
from ultralytics import YOLO

net = YOLO('yolov8n.pt')
cap = cv2.VideoCapture('http://10.145.252.94:8080/video')
ret, frame = cap.read()
if frame is not None:
    results = net.predict(frame, conf=0.01)
    for det in results[0].boxes:
        cls_id = int(det.cls[0].item())
        conf = float(det.conf[0].item())
        x1, y1, x2, y2 = det.xyxy[0].tolist()
        name = results[0].names[cls_id]
        print(f"Detected: {name} (ID: {cls_id}) with conf {conf:.3f} at ({x1:.1f}, {y1:.1f}) to ({x2:.1f}, {y2:.1f})")
else:
    print("Could not read frame")
