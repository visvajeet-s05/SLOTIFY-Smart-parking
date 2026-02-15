from ultralytics import YOLO

def train():
    # 1. Initialize YOLOv8 Model
    # 'yolov8n.pt' is the nano version (fastest). 
    # Use 'yolov8m.pt' or 'yolov8l.pt' for higher accuracy if you have a powerful GPU (RTX 3060+).
    print("🚀 Initializing YOLOv8 model...")
    model = YOLO('yolov8n.pt') 

    # 2. Define Dataset Configuration
    # If you used the download script, ensure the path points to a valid data.yaml
    # For this example, we'll use the 'coco128.yaml' as a placeholder to verify the setup works.
    # To train on the downloaded Indian dataset, you must create a 'custom_data.yaml' pointing to those images.
    
    # Example custom_data.yaml content:
    # path: ../datasets/indian_vehicles
    # train: images/train
    # val: images/val
    # names:
    #   0: car
    #   1: auto
    #   2: bus
    #   3: truck
    #   4: motorcycle

    yaml_path = 'coco128.yaml' # REPLACE THIS with your custom yaml path after preparing data
    
    # 3. Start Training
    print(f"🔥 Starting training on {yaml_path}...")
    results = model.train(
        data=yaml_path,
        epochs=100,           # Train for 100 epochs for better convergence
        imgsz=640,            # Standard image size
        batch=16,             # Adjust based on your GPU VRAM
        name='indian_car_model', # Name of the run
        device=0,             # Use GPU 0. Set to 'cpu' if no GPU (very slow)
        patience=20,          # Stop if no improvement for 20 epochs
        augment=True,         # Use data augmentation (flip, scale, etc.) to generalize better
    )

    print("✅ Training Complete!")
    print(f"💾 Best model saved at: {results.save_dir}/weights/best.pt")

if __name__ == '__main__':
    train()
