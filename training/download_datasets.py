import os
import shutil
from kaggle.api.kaggle_api_extended import KaggleApi

def download_kaggle_dataset(dataset_name, target_dir):
    """Downloads and unzips a dataset from Kaggle."""
    api = KaggleApi()
    
    # Check if credentials exist
    if not os.path.exists(os.path.expanduser("~/.kaggle/kaggle.json")) and not os.path.exists("kaggle.json"):
        print(f"❌ Error: 'kaggle.json' not found. Please put your Kaggle API key in {os.path.expanduser('~/.kaggle/')} or current directory.")
        return

    api.authenticate()
    
    print(f"⬇️ Downloading {dataset_name}...")
    try:
        api.dataset_download_files(dataset_name, path=target_dir, unzip=True)
        print(f"✅ Automatically downloaded & extracted {dataset_name} to {target_dir}")
    except Exception as e:
        print(f"⚠️ Failed to download {dataset_name}: {e}")
        print(f"   Please download manually from: https://www.kaggle.com/datasets/{dataset_name}")

def main():
    base_dir = "datasets"
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    # 1. Indian Vehicle Dataset (Diverse Indian Traffic)
    # Includes: Auto, Bus, Car, Truck, Motorcycle
    download_kaggle_dataset("dataclusterlabs/indian-vehicle-dataset", os.path.join(base_dir, "indian_vehicles"))

    # 2. Car Object Detection (Global)
    # High quality global car images
    download_kaggle_dataset("sshikamaru/car-object-detection", os.path.join(base_dir, "global_cars"))
    
    # 3. Indian Traffic Signs and Vehicles
    download_kaggle_dataset("pkdarabi/vehicle-detection-image-dataset", os.path.join(base_dir, "vehicle_detection"))

    print("\n🏁 Download process complete.")
    print("👉 Next: Organize these into YOLO format if they aren't already, or use 'train_model.py' which handles the auto-downloaded YOLO formatted data.")

if __name__ == "__main__":
    main()
