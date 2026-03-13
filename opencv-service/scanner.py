import socket
import threading
import time
import requests
import cv2

class CameraScanner:
    """
    Automatic Camera Discovery Module
    Scans the local network for RTSP and ONVIF compatible cameras.
    """
    
    def __init__(self, subnet="192.168.1", ports=[554, 8000, 8080, 8554]):
        self.subnet = subnet
        self.ports = ports
        self.found_cameras = []
        self.is_scanning = False

    def scan_ip(self, ip):
        """Check if an IP has open RTSP/Video ports."""
        for port in self.ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.1)
            result = sock.connect_ex((ip, port))
            if result == 0:
                print(f"🔍 Found potential camera at {ip}:{port}")
                # Try to verify if it's an RTSP stream (simplified)
                url = f"rtsp://{ip}:{port}/live"
                cap = cv2.VideoCapture(url)
                if cap.isOpened():
                    self.found_cameras.append({
                        "ip": ip,
                        "port": port,
                        "url": url,
                        "type": "RTSP"
                    })
                    cap.release()
                sock.close()
                return
            sock.close()

    def run_scan(self):
        """Scan the entire subnet using threads."""
        print(f"🚀 Starting Auto-Discovery on {self.subnet}.0/24...")
        self.is_scanning = True
        threads = []
        for i in range(1, 255):
            ip = f"{self.subnet}.{i}"
            t = threading.Thread(target=self.scan_ip, args=(ip,))
            threads.append(t)
            t.start()
            
            # Throttle thread creation to avoid OS socket limits
            if i % 50 == 0:
                time.sleep(1)

        for t in threads:
            t.join()
        
        self.is_scanning = False
        print(f"✅ Scan complete. Found {len(self.found_cameras)} cameras.")
        return self.found_cameras

if __name__ == "__main__":
    # Example usage: Get local subnet and scan
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    
    subnet = ".".join(IP.split(".")[:-1])
    scanner = CameraScanner(subnet=subnet)
    cameras = scanner.run_scan()
    for cam in cameras:
        print(f"🎥 {cam['type']} Camera: {cam['url']}")
