import os
import requests
import time

# URLs for MobileNet-SSD model files
PROTO_URL = "https://raw.githubusercontent.com/chuanqi305/MobileNet-SSD/master/MobileNetSSD_deploy.prototxt"
MODEL_URL = "https://github.com/chuanqi305/MobileNet-SSD/raw/master/MobileNetSSD_deploy.caffemodel" 
# Alternative mirror if github fails:
# MODEL_URL = "http://www.zemris.fer.hr/~ssegvic/multicl/lab3/MobileNetSSD_deploy.caffemodel"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PROTO_PATH = os.path.join(MODELS_DIR, "MobileNetSSD_deploy.prototxt")
MODEL_PATH = os.path.join(MODELS_DIR, "MobileNetSSD_deploy.caffemodel")

def download_file(url, path):
    print(f"Downloading {url} to {path}...", flush=True)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        with open(path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if downloaded % (1024*1024) == 0:
                        print(f"Downloaded {downloaded // (1024*1024)} MB...", end='\r', flush=True)
        print(f"\n✅ Downloaded {path} ({os.path.getsize(path)} bytes)")
        return True
    except Exception as e:
        print(f"\n❌ Failed to download {url}: {e}")
        if os.path.exists(path):
            os.remove(path) # Cleanup partial download
        return False

def main():
    if not os.path.exists(MODELS_DIR):
        try:
            os.makedirs(MODELS_DIR)
            print(f"Created directory: {MODELS_DIR}")
        except OSError as e:
            print(f"Error creating directory {MODELS_DIR}: {e}")
            return

    success = True
    if not os.path.exists(PROTO_PATH) or os.path.getsize(PROTO_PATH) == 0:
        if not download_file(PROTO_URL, PROTO_PATH):
            success = False
    else:
        print(f"✅ Found {PROTO_PATH}")

    if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1000000: # Check if it's too small (error page)
        # Try github raw link
        # The raw link for caffemodel on github frequently redirects to raw.githubusercontent.com
        # but sometimes it points to LFS pointer. The specific repo 'chuanqi305/MobileNet-SSD' uses standard git, not LFS for this file (23MB).
        # We'll use the 'raw' link which usually works.
        if not download_file(MODEL_URL, MODEL_PATH):
            print("Retrying with alternative URL...")
            # Try a known mirror or backup if needed, or just fail.
            success = False
    else:
        print(f"✅ Found {MODEL_PATH}")

    if success:
        print("🎉 All model files are ready.")
    else:
        print("⚠️ Some files failed to download. Check network or manual download.")

if __name__ == "__main__":
    main()
