"""
Comprehensive Camera Stream Diagnostic
Tests the entire camera pipeline from hardware to frontend
"""

import requests
import cv2
import time

print("\n" + "="*80)
print(" COMPREHENSIVE CAMERA STREAM DIAGNOSTIC")
print("="*80)

# Test 1: Camera Hardware
print("\n[1/6] Testing Camera Hardware...")
print("   Camera IP: 10.151.236.96:8080")
print("   Stream URL: http://10.151.236.96:8080/video")

try:
    cap = cv2.VideoCapture("http://10.151.236.96:8080/video")
    if cap.isOpened():
        ret, frame = cap.read()
        if ret and frame is not None:
            print(f"   ✅ Camera is ONLINE and streaming")
            print(f"   ✅ Frame size: {frame.shape[1]}x{frame.shape[0]}")
        else:
            print(f"   ❌ Camera opened but no frames received")
    else:
        print(f"   ❌ Cannot open camera stream")
    cap.release()
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Python Service Health
print("\n[2/6] Testing Python Service...")
try:
    response = requests.get("http://localhost:5000/health", timeout=3)
    data = response.json()
    print(f"   ✅ Service Status: {data.get('status')}")
    print(f"   ✅ Active Monitors: {data.get('active_monitors', [])}")
except Exception as e:
    print(f"   ❌ Service Error: {e}")

# Test 3: Start Monitor
print("\n[3/6] Starting Monitor for CHENNAI_CENTRAL...")
try:
    response = requests.post("http://localhost:5000/start/CHENNAI_CENTRAL", timeout=10)
    data = response.json()
    print(f"   ✅ Response: {data}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Wait for monitor to initialize
print("\n[4/6] Waiting 5 seconds for monitor initialization...")
time.sleep(5)

# Test 4: Check if monitor is running
print("\n[5/6] Verifying Monitor Status...")
try:
    response = requests.get("http://localhost:5000/health", timeout=3)
    data = response.json()
    monitors = data.get('active_monitors', [])
    if 'CHENNAI_CENTRAL' in monitors:
        print(f"   ✅ Monitor is ACTIVE for CHENNAI_CENTRAL")
    else:
        print(f"   ⚠️  Monitor not found. Active: {monitors}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 5: Test Stream Endpoint
print("\n[6/6] Testing Stream Endpoint...")
try:
    response = requests.get("http://localhost:5000/camera/CHENNAI_CENTRAL", 
                          timeout=10, stream=True)
    print(f"   Status Code: {response.status_code}")
    print(f"   Content-Type: {response.headers.get('Content-Type')}")
    
    if response.status_code == 200:
        # Try to read first chunk
        chunk_count = 0
        total_bytes = 0
        
        print("   Reading stream chunks...")
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                chunk_count += 1
                total_bytes += len(chunk)
                print(f"   ✅ Chunk {chunk_count}: {len(chunk)} bytes (Total: {total_bytes} bytes)")
                
                if chunk_count >= 3:  # Read 3 chunks to verify stream
                    break
        
        if chunk_count > 0:
            print(f"\n   ✅ STREAM IS WORKING! Received {chunk_count} chunks, {total_bytes} bytes")
        else:
            print(f"\n   ❌ Stream opened but no data received")
    else:
        print(f"   ❌ Stream endpoint returned {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
except requests.exceptions.Timeout:
    print(f"   ❌ Stream request TIMED OUT")
    print(f"   This usually means:")
    print(f"      - Monitor is not processing frames")
    print(f"      - Camera connection failed")
    print(f"      - get_frame() is returning None")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*80)
print(" DIAGNOSTIC COMPLETE")
print("="*80)

print("\n📝 FRONTEND ACCESS:")
print("   Camera Page: http://localhost:3000/dashboard/owner/parking-lots/CHENNAI_CENTRAL/camera")
print("   Direct Stream: http://localhost:5000/camera/CHENNAI_CENTRAL")

print("\n🔍 IF STREAM IS NOT WORKING:")
print("   1. Check Python service logs for errors")
print("   2. Verify camera IP is reachable: ping 10.151.236.96")
print("   3. Check if OpenCV can connect to camera")
print("   4. Ensure no firewall is blocking port 5000")
print("\n")
