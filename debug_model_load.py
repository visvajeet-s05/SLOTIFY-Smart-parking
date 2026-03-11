import cv2
import os

print("--- Testing TensorFlow Model Loading ---")

base_dir = r"d:\Visvajeet\Projects\Parking\Smart-parking\opencv-service\models"
pb_path = os.path.join(base_dir, "frozen_inference_graph.pb")
pbtxt_path = os.path.join(base_dir, "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt")

print(f"PB Path: {pb_path}")
print(f"PBTXT Path: {pbtxt_path}")

try:
    print("Checking file existence...")
    if not os.path.exists(pb_path):
        print("Error: PB file NOT found.")
    else:
        print("PB file FOUND.")

    if not os.path.exists(pbtxt_path):
        print("Error: PBTXT file NOT found.")
    else:
        print("PBTXT file FOUND.")

    print("Attempting to load network via OpenCV DNN...")
    # Attempting to load without config first, then with config if needed to pinpoint
    try:
        net = cv2.dnn.readNetFromTensorflow(pb_path, pbtxt_path)
        print("SUCCESS: Model loaded with Config.")
    except Exception as e:
        print(f"FAIL: Loading with config failed. Error: {e}")
        try:
             net = cv2.dnn.readNetFromTensorflow(pb_path)
             print("SUCCESS: Model loaded WITHOUT Config (weights only).")
        except Exception as e2:
             print(f"FAIL: Loading weights only failed. Error: {e2}")

except Exception as e:
    print(f"General Error: {e}")
