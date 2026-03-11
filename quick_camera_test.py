"""Quick Camera Stream Test"""
import requests

print("\n🔍 Testing Camera Stream...")

try:
    # Test if monitor is running
    health = requests.get("http://localhost:5000/health", timeout=3).json()
    print(f"✅ Service Health: {health}")
    
    # Test camera stream
    response = requests.get("http://localhost:5000/camera/CHENNAI_CENTRAL", timeout=5, stream=True)
    print(f"✅ Stream Status: {response.status_code}")
    print(f"✅ Content-Type: {response.headers.get('Content-Type')}")
    
    # Read first chunk
    chunk = next(response.iter_content(chunk_size=2048), None)
    if chunk:
        print(f"✅ Stream Active: Received {len(chunk)} bytes")
        print("\n🎉 CAMERA STREAM IS WORKING!")
        print("\n📱 Access the stream at:")
        print("   Frontend: http://localhost:3000/dashboard/owner/parking-lots/CHENNAI_CENTRAL")
        print("   Direct Stream: http://localhost:5000/camera/CHENNAI_CENTRAL")
    else:
        print("⚠️  Stream opened but no data")
        
except Exception as e:
    print(f"❌ Error: {e}")
