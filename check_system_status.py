"""
Complete Camera System Status Check
Run this to see the current state of all components
"""

import requests
import subprocess
import socket

def check_port(port, name):
    """Check if a port is open"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    
    if result == 0:
        print(f"   ✅ {name} (Port {port}): RUNNING")
        return True
    else:
        print(f"   ❌ {name} (Port {port}): NOT RUNNING")
        return False

print("\n" + "="*70)
print(" SMART PARKING - SYSTEM STATUS CHECK")
print("="*70)

print("\n📊 SERVICE STATUS:\n")

# Check all services
services_ok = True
services_ok &= check_port(3000, "Next.js Dev Server")
services_ok &= check_port(4000, "WebSocket Server")
services_ok &= check_port(5000, "Python OpenCV Service")

print("\n📹 CAMERA CONFIGURATION:\n")
print("   Camera IP: 10.151.236.96:8080")
print("   Stream URL: http://10.151.236.96:8080/video")

# Test camera connectivity
print("\n🔌 CAMERA CONNECTIVITY:\n")
try:
    import subprocess
    result = subprocess.run(["ping", "-n", "2", "10.151.236.96"], 
                          capture_output=True, text=True, timeout=5)
    if "Reply from" in result.stdout:
        print("   ✅ Camera IP is reachable")
    else:
        print("   ❌ Camera IP is NOT reachable")
        print(f"   Output: {result.stdout}")
except Exception as e:
    print(f"   ⚠️  Could not test connectivity: {e}")

# Check Python service
if check_port(5000, ""):
    print("\n🐍 PYTHON SERVICE STATUS:\n")
    try:
        health = requests.get("http://localhost:5000/health", timeout=3).json()
        print(f"   Status: {health.get('status', 'unknown')}")
        monitors = health.get('active_monitors', [])
        print(f"   Active Monitors: {len(monitors)}")
        for monitor in monitors:
            print(f"      - {monitor}")
    except Exception as e:
        print(f"   ⚠️  Could not get health status: {e}")

print("\n🌐 FRONTEND ACCESS:\n")
print("   Owner Dashboard: http://localhost:3000/dashboard/owner")
print("   CHENNAI_CENTRAL: http://localhost:3000/dashboard/owner/parking-lots/CHENNAI_CENTRAL")
print("   Direct Stream: http://localhost:5000/camera/CHENNAI_CENTRAL")

print("\n" + "="*70)

if services_ok:
    print("\n✅ ALL SERVICES ARE RUNNING")
    print("\n📝 TO VIEW CAMERA:")
    print("   1. Open: http://localhost:3000")
    print("   2. Login as owner")
    print("   3. Go to Dashboard → Parking Lots → CHENNAI_CENTRAL")
    print("   4. The camera feed should be visible in the 'LIVE OPTIC FEED' panel")
else:
    print("\n⚠️  SOME SERVICES ARE NOT RUNNING")
    print("\n🔧 TO START SERVICES:")
    print("   Terminal 1: npx ts-node ws-server/index.ts")
    print("   Terminal 2: npm run dev")
    print("   Terminal 3: python opencv-service/main.py")

print("\n" + "="*70 + "\n")
