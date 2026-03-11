import os
import requests
import tarfile
import shutil

# TensorFlow Model Zoo URL (Google hosted - very reliable)
# SSD MobileNet V3 Large COCO 2020/01/14
MODEL_URL = "http://download.tensorflow.org/models/object_detection/ssd_mobilenet_v3_large_coco_2020_01_14.tar.gz"
# Updated config URL (raw gist without commit ID for latest version)
CONFIG_URL = "https://gist.githubusercontent.com/dkurt/54a8e8b51beb3bd3f770b79e56927bd7/raw/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
TAR_PATH = os.path.join(MODELS_DIR, "ssd_mobilenet_v3_large_coco_2020_01_14.tar.gz")
PB_PATH = os.path.join(MODELS_DIR, "frozen_inference_graph.pb")
PBTXT_PATH = os.path.join(MODELS_DIR, "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt")

def download_file(url, path):
    print(f"Downloading {url} to {path}...", flush=True)
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Downloaded {path}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def extract_tar(tar_path, target_dir):
    print(f"Extracting {tar_path}...", flush=True)
    try:
        with tarfile.open(tar_path, "r:gz") as tar:
            target_model_file = None
            for member in tar.getmembers():
                if member.name.endswith("frozen_inference_graph.pb"):
                    member.name = os.path.basename(member.name) # Flatten path
                    tar.extract(member, path=target_dir)
                    target_model_file = os.path.join(target_dir, member.name)
            
            if target_model_file and os.path.exists(target_model_file):
                 print(f"✅ Extracted model to {target_model_file}")
                 return True
            else:
                 print("❌ Model file not found in archive.")
                 return False
    except Exception as e:
        print(f"❌ Extraction failed: {e}")
        return False

def main():
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)

    # 1. Download Model Tarball
    if not os.path.exists(PB_PATH):
        if download_file(MODEL_URL, TAR_PATH):
            extract_tar(TAR_PATH, MODELS_DIR)
            # Cleanup tar
            if os.path.exists(TAR_PATH):
                os.remove(TAR_PATH)
    else:
        print(f"✅ Found {PB_PATH}")

    # 2. Download Config (pbtxt)
    if not os.path.exists(PBTXT_PATH):
        download_file(CONFIG_URL, PBTXT_PATH)
    else:
        print(f"✅ Found {PBTXT_PATH}")

    print("🎉 TensorFlow MobileNet V3 setup complete.")

if __name__ == "__main__":
    main()
