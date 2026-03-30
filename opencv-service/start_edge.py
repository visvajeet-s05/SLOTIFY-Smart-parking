#!/usr/bin/env python3
"""
SLOTIFY Edge Node Startup Script
Automatically detects and registers the camera, then starts the AI service.

Run: python opencv-service/start_edge.py
"""

import os
import sys
import socket
import requests
import subprocess
import time
import threading
from dotenv import load_dotenv

# Load env
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, '..', '.env.local'))
load_dotenv(os.path.join(base_dir, '..', '.env'))

CENTRAL_API_URL = os.getenv("CENTRAL_API_URL", "http://localhost:3000")
EDGE_TOKEN      = os.getenv("EDGE_TOKEN", "")
LOT_ID          = os.getenv("PARKING_LOT_ID", "CHENNAI_CENTRAL")
CAMERA_PORT     = int(os.getenv("CAMERA_PORT", 8080))
PARKING_LOT_ID  = LOT_ID

def get_local_ip():
    """Get the PC's current local IP on the WiFi subnet."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def get_subnet():
    ip = get_local_ip()
    return ".".join(ip.split(".")[:-1])


def scan_for_camera(subnet: str, port: int = 8080) -> str | None:
    """
    Quick scan for IP Webcam (Android) on the local subnet.
    Returns the first reachable camera URL or None.
    """
    print(f"[Scan] Scanning {subnet}.0/24 for cameras on port {port}...", flush=True)
    
    found = []
    lock = threading.Lock()

    def check(ip):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.3)
            if s.connect_ex((ip, port)) == 0:
                # Verify it's an IP Webcam stream
                try:
                    r = requests.get(f"http://{ip}:{port}/video", timeout=2, stream=True)
                    if r.status_code == 200:
                        with lock:
                            found.append(f"http://{ip}:{port}/video")
                        print(f"[Scan] Camera found at {ip}:{port}", flush=True)
                    r.close()
                except Exception:
                    pass
            s.close()
        except Exception:
            pass

    threads = []
    for i in range(1, 255):
        ip = f"{subnet}.{i}"
        t = threading.Thread(target=check, args=(ip,), daemon=True)
        threads.append(t)
        t.start()
        if i % 50 == 0:
            time.sleep(0.1)

    for t in threads:
        t.join(timeout=1.0)

    return found[0] if found else None


def register_camera_url(camera_url: str):
    """Register the discovered camera URL with the central API."""
    try:
        r = requests.post(
            f"{CENTRAL_API_URL}/api/parking/{PARKING_LOT_ID}/camera/update",
            json={
                "lotId":     LOT_ID,
                "edgeToken": EDGE_TOKEN,
                "cameraUrl": camera_url,
            },
            timeout=10
        )
        if r.status_code == 200:
            print(f"[Registry] Camera URL registered: {camera_url}", flush=True)
            return True
        else:
            print(f"[Registry] Error {r.status_code}: {r.text}", flush=True)
    except Exception as e:
        print(f"[Registry] API error: {e}", flush=True)
    return False


def main():
    print("=" * 60, flush=True)
    print("  SLOTIFY EDGE NODE STARTUP", flush=True)
    print(f"  Lot     : {LOT_ID}", flush=True)
    print(f"  Central : {CENTRAL_API_URL}", flush=True)
    print("=" * 60, flush=True)

    # 1. Check if central API is reachable
    print("\n[Step 1] Checking Central API...", flush=True)
    try:
        r = requests.get(f"{CENTRAL_API_URL}/api/health", timeout=15)
        if r.status_code == 200:
            print("[Step 1] OK: Central API is up", flush=True)
        else:
            print(f"[Step 1] Error: Central API returned {r.status_code}", flush=True)
    except Exception as e:
        print(f"[Step 1] Error: Central API unreachable: {e}", flush=True)
        print("[Step 1]   Make sure `npm run dev` is running!", flush=True)

    # 2. Check configured camera URL
    print("\n[Step 2] Checking camera connectivity...", flush=True)
    camera_url = os.getenv("CAMERA_IP", "")
    if camera_url:
        if not camera_url.startswith("http"):
            camera_url = f"http://{camera_url}/video"
    
    camera_ok = False
    if camera_url:
        try:
            r = requests.get(camera_url, timeout=5, stream=True)
            if r.status_code == 200:
                print(f"[Step 2] OK: Camera reachable: {camera_url}", flush=True)
                camera_ok = True
                r.close()
        except Exception:
            print(f"[Step 2] Error: Camera at {camera_url} is unreachable", flush=True)

    # 3. Auto-discover camera if not reachable
    if not camera_ok:
        print("\n[Step 3] Auto-discovering cameras on local network...", flush=True)
        subnet = get_subnet()
        discovered = scan_for_camera(subnet, CAMERA_PORT)
        if discovered:
            camera_url = discovered
            print(f"[Step 3] OK: Discovered: {camera_url}", flush=True)
            # Update .env.local
            env_path = os.path.join(base_dir, '..', '.env.local')
            try:
                ip_port = camera_url.replace("http://", "").replace("/video", "")
                
                # Use a cleaner way to update env
                with open(env_path, 'r') as f:
                    lines = f.readlines()
                
                found_key = False
                new_lines = []
                for line in lines:
                    if line.startswith("CAMERA_IP="):
                        new_lines.append(f"CAMERA_IP={ip_port}\n")
                        found_key = True
                    else:
                        new_lines.append(line)
                
                if not found_key:
                    new_lines.append(f"\nCAMERA_IP={ip_port}\n")
                
                with open(env_path, 'w') as f:
                    f.writelines(new_lines)
                print(f"[Step 3] OK: Updated .env.local with CAMERA_IP={ip_port}", flush=True)
            except Exception as e:
                print(f"[Step 3] Error: Could not update .env.local: {e}", flush=True)
        else:
            print("[Step 3] Error: No cameras found on local network", flush=True)
            print("[Step 3]   Please ensure IP Webcam app is running on your phone and port matches.", flush=True)

    # 4. Register camera URL with central API
    if camera_url:
        print("\n[Step 4] Registering camera URL...", flush=True)
        register_camera_url(camera_url)

    # 5. Start the AI service
    print("\n[Step 5] Starting AI Service...", flush=True)
    main_py = os.path.join(base_dir, 'main.py')
    
    # Set env var for this process
    env = os.environ.copy()
    if camera_url:
        ip_port = camera_url.replace("http://", "").replace("/video", "")
        env["CAMERA_IP"] = ip_port

    try:
        subprocess.run([sys.executable, main_py], env=env)
    except KeyboardInterrupt:
        print("\n[Shutdown] AI Service stopped.", flush=True)


if __name__ == "__main__":
    main()
