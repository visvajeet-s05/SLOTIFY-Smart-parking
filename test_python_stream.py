"""
Test the Python service stream endpoint directly
"""
import requests
import time

print("Testing Python Service Stream Endpoint")
print("="*60)

# Step 1: Start the monitor
print("\n1. Starting monitor...")
try:
    response = requests.post("http://localhost:5000/start/CHENNAI_CENTRAL", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Step 2: Wait for initialization
print("\n2. Waiting 3 seconds for initialization...")
time.sleep(3)

# Step 3: Check health
print("\n3. Checking service health...")
try:
    response = requests.get("http://localhost:5000/health", timeout=3)
    data = response.json()
    print(f"   Status: {data.get('status')}")
    print(f"   Active Monitors: {data.get('active_monitors')}")
except Exception as e:
    print(f"   Error: {e}")

# Step 4: Test stream with short timeout
print("\n4. Testing stream endpoint (10 second timeout)...")
try:
    response = requests.get(
        "http://localhost:5000/camera/CHENNAI_CENTRAL",
        timeout=10,
        stream=True
    )
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("\n   Reading stream data...")
        chunk_num = 0
        total_bytes = 0
        
        start_time = time.time()
        for chunk in response.iter_content(chunk_size=4096):
            if chunk:
                chunk_num += 1
                total_bytes += len(chunk)
                elapsed = time.time() - start_time
                print(f"   Chunk {chunk_num}: {len(chunk)} bytes (Total: {total_bytes}, Time: {elapsed:.2f}s)")
                
                if chunk_num >= 5 or elapsed > 8:
                    break
        
        if chunk_num > 0:
            print(f"\n   ✅ SUCCESS! Stream is working ({chunk_num} chunks, {total_bytes} bytes)")
        else:
            print(f"\n   ❌ FAILED! No data received from stream")
    else:
        print(f"\n   ❌ FAILED! Status code: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
        
except requests.exceptions.Timeout:
    print(f"\n   ❌ TIMEOUT! Stream did not send data within 10 seconds")
    print(f"\n   This means:")
    print(f"      - Monitor's get_frame() is returning None")
    print(f"      - Camera connection in monitor failed")
    print(f"      - Processing loop is stuck")
except Exception as e:
    print(f"\n   ❌ ERROR: {e}")

print("\n" + "="*60)
