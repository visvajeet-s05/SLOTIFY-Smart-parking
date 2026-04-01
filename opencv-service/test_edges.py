import cv2
import numpy as np

img = cv2.imread('dumped_frame.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)

# The grid has 6 columns, 4 rows (24 slots)
# We can simulate checking a slot. Assume each slot is 240x140 at 150,150 + col*280...
# Wait, img is directly from camera, original size. Let's say 1920x1080.
orig_h, orig_w = img.shape[:2]
print(f"Image shape: {orig_w}x{orig_h}")

def check_slot(idx):
    cols = 6
    row = idx // cols
    col = idx % cols
    sx = 150 + col * 280
    sy = 150 + row * 180
    sw, sh = 240, 140
    
    # Crop
    sx = int(sx * orig_w / 1920)
    sy = int(sy * orig_h / 1080)
    sw = int(sw * orig_w / 1920)
    sh = int(sh * orig_h / 1080)
    
    crop = edges[sy:sy+sh, sx:sx+sw]
    if crop.size == 0: return 0
    density = np.sum(crop > 0) / (sw * sh)
    return density

print("Edge densities for all slots:")
densities = []
for i in range(24):
    d = check_slot(i)
    densities.append(d)
    print(f"Slot {i+1:02d}: {d:.4f}")
