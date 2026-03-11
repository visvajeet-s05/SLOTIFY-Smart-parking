import requests
import time

print("=" * 60)
print("CAMERA SERVICE DIAGNOSTIC TEST")
print("=" * 60)

# Test 1: Health Check
print("\n1. Testing Health Endpoint...")
try:
    response = requests.get("http://localhost:5000/health", timeout=5)
    print(f"   ✅ Health Check: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Health Check Failed: {e}")

# Test 2: Start Monitor for CHENNAI_CENTRAL
print("\n2. Starting Monitor for CHENNAI_CENTRAL...")
try:
    response = requests.post("http://localhost:5000/start/CHENNAI_CENTRAL", timeout=10)
    print(f"   ✅ Start Monitor: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Start Monitor Failed: {e}")

# Wait for monitor to initialize
print("\n3. Waiting 3 seconds for monitor initialization...")
time.sleep(3)

# Test 3: Check Camera Stream Endpoint
print("\n4. Testing Camera Stream Endpoint...")
try:
    response = requests.get("http://localhost:5000/camera/CHENNAI_CENTRAL", timeout=5, stream=True)
    print(f"   ✅ Camera Stream: {response.status_code}")
    print(f"   Content-Type: {response.headers.get('Content-Type')}")
    
    # Read first few bytes to verify stream
    chunk = next(response.iter_content(chunk_size=1024), None)
    if chunk:
        print(f"   ✅ Stream is active (received {len(chunk)} bytes)")
    else:
        print(f"   ⚠️ Stream opened but no data received")
except Exception as e:
    print(f"   ❌ Camera Stream Failed: {e}")

# Test 4: Verify Camera URL Configuration
print("\n5. Checking Camera Configuration...")
print(f"   Expected Camera URL: http://10.151.236.96:8080/video")

print("\n" + "=" * 60)
print("DIAGNOSTIC TEST COMPLETE")
print("=" * 60)
