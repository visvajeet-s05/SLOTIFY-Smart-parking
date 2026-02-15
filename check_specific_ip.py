import cv2
import sys
import socket

ip = "10.245.197.193"
port = 8080
url = f"http://{ip}:{port}/video"

print(f"Testing TCP connection to {ip}:{port}...")
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(3)
    result = sock.connect_ex((ip, port))
    if result == 0:
         print(f"✅ TCP Port {port} is OPEN.")
    else:
         print(f"❌ TCP Port {port} is CLOSED or UNREACHABLE (Code: {result})")
    sock.close()
except Exception as e:
    print(f"❌ Socket Error: {e}")

print(f"\nTesting Video Stream: {url}...")
try:
    cap = cv2.VideoCapture(url)
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
             print(f"✅ SUCCESS: Connected to video stream.")
        else:
             print("⚠️ CONNECTED but failed to read frame.")
    else:
        print(f"❌ FAILED: Could not open video stream (Error -138 likely).")
    cap.release()
except Exception as e:
    print(f"❌ Capture Error: {e}")
