import subprocess
import time

print("Checking Python service status...")
print("="*60)

# Kill any existing Python processes
print("\n1. Stopping existing Python processes...")
try:
    subprocess.run(["taskkill", "/F", "/IM", "python.exe"], 
                   capture_output=True, timeout=5)
    print("   ✅ Stopped existing processes")
except:
    print("   ℹ️  No existing processes to stop")

time.sleep(2)

# Start the service with output
print("\n2. Starting Python OpenCV service...")
print("   Command: python opencv-service/main.py")
print("   Port: 5000")
print("\n" + "="*60)
print("SERVICE OUTPUT:")
print("="*60 + "\n")

# Run the service in foreground to see output
subprocess.run(["python", "opencv-service/main.py"])
