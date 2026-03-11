"""
Verify Full Stack Camera & AI Integration
"""
import requests
import time
import subprocess
import os
import signal

def run_test():
    print("--- STARTING VERIFICATION ---")

    # 1. Start Python Service
    print("\n[Step 1] Starting AI Camera Service...")
    # Kill existing
    subprocess.run("taskkill /F /IM python.exe", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Start new
    service_proc = subprocess.Popen(
        ["python", "-u", "opencv-service/full_service.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Wait for startup
    max_wait = 10
    started = False
    for _ in range(max_wait):
        line = service_proc.stdout.readline()
        if line: print(f"  SERVICE LOG: {line.strip()}")
        if "Running on" in line or "Press CTRL+C" in line:
            started = True
            break
        # Also check /health
        try:
             res = requests.get("http://localhost:5000/health", timeout=1)
             if res.status_code == 200:
                 started = True
                 break
        except: pass
        time.sleep(1)
        
    if not started:
        print("❌ Service failed to start!")
        return

    print("✅ Service Started.")

    # 2. Check AI Model Loading
    print("\n[Step 2] Checking AI Model Status...")
    try:
        res = requests.get("http://localhost:5000/health")
        data = res.json()
        print(f"  Health: {data}")
        if data.get("ai_active"):
            print("✅ AI Model is ACTIVE.")
        else:
            print("⚠️ AI Model NOT active (Running in Stream-Only mode).")
    except Exception as e:
        print(f"❌ Failed to reach service: {e}")

    # 3. Trigger Camera Monitor
    print("\n[Step 3] Triggering Camera Monitor (CHENNAI_CENTRAL)...")
    try:
        res = requests.post("http://localhost:5000/start/CHENNAI_CENTRAL")
        print(f"  Response: {res.json()}")
    except Exception as e:
        print(f"❌ Failed to trigger monitor: {e}")

    # 4. Check Stream
    print("\n[Step 4] Verifying Stream...")
    try:
        res = requests.get("http://localhost:5000/camera/CHENNAI_CENTRAL", stream=True, timeout=5)
        if res.status_code == 200:
            print("✅ Stream is accessible (200 OK).")
            # Read a few chunks
            count = 0
            for chunk in res.iter_content(chunk_size=1024):
                if chunk: count += 1
                if count > 5: break
            print(f"  Received {count} data chunks.")
        else:
            print(f"❌ Stream failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Stream error: {e}")
        
    print("\n--- VERIFICATION COMPLETE ---")
    
    # Cleanup: Keep service running for user!
    # service_proc.terminate() 

if __name__ == "__main__":
    run_test()
