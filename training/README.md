
# 🚗 Car Detection Training Pipeline

This directory contains everything you need to train a "perfect" car detection model, specifically tuned for Indian and Global vehicle types (Cars).

## 1. Prerequisites
You need a GPU for training to happen in a reasonable time.
Install dependencies:
```bash
pip install ultralytics kaggle roboflow
```

## 2. Acquiring Datasets
To train a "perfect" model, we need diverse data. I have selected the best datasets for your requirements.

### A. Automatic Download (Kaggle)
1.  Go to your [Kaggle Account Settings](https://www.kaggle.com/settings) -> API -> Create New Token.
2.  Place the `kaggle.json` file in `C:\Users\<YourUser>\.kaggle\` or in this directory.
3.  Run the download script:
    ```bash
    python download_datasets.py
    ```
    This will download:
    - **Indian Vehicle Dataset**: Specific Indian vehicles (Auto, Truck, Bus).
    - **Global Car Dataset**: General high-quality car images.

### B. Manual Download (Highly Recommended for "Perfect" Results)
Some high-quality datasets require manual registration. Download these and extract them into a `datasets` folder:
1.  **Indian Driving Dataset (IDD)**: [Link](https://idd.insaan.iiit.ac.in/) - The Gold Standard for Indian roads.
2.  **COCO Car Subset**: [Link](https://cocodataset.org/) - Global standard.

## 3. Training
Once datasets are downloaded and organized, run:
```bash
python train_model.py
```
This will:
1.  Load the **YOLOv8** architecture (State-of-the-art detection).
2.  Fine-tune it on your combined dataset.
3.  Save the best model to `runs/detect/train/weights/best.pt`.

## 4. Integration
Copy `best.pt` to `../opencv-service/models/` and restart your backend.
