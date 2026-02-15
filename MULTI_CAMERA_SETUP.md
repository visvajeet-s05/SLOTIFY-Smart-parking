# 📹 MULTI-CAMERA URL CONFIGURATION GUIDE

## ✅ **COMPLETE MULTI-CAMERA SYSTEM IMPLEMENTED**

Your Smart Parking system now supports **up to 30 individual cameras** with separate URL configurations!

---

## 🎯 **What's New**

### **Before:**
- ❌ Single camera URL for all cameras
- ❌ Had to manually change code for different cameras
- ❌ No flexibility

### **After:**
- ✅ **30 individual camera URLs**
- ✅ Each camera can have its own URL
- ✅ Mix manual URLs and database URLs
- ✅ Easy configuration in one place
- ✅ Automatic camera ID detection

---

## 📁 **Configuration Location**

**File:** `opencv-service/main.py`

**Lines:** 16-125 (Multi-Camera Configuration Section)

---

## 🔧 **How to Configure**

### **Step 1: Open the Configuration File**

```bash
opencv-service/main.py
```

### **Step 2: Find the MANUAL_CAMERA_URLS Dictionary**

Located at the top of the file (around line 28):

```python
MANUAL_CAMERA_URLS = {
    # Camera 1-10
    1: "http://10.227.24.164:8080/video",  # Camera 1 (Active)
    2: "http://10.227.24.164:8080/video",  # Camera 2 (Active)
    3: "http://10.227.24.164:8080/video",  # Camera 3 (Active)
    4: "http://10.227.24.164:8080/video",  # Camera 4 (Active)
    5: "http://10.227.24.164:8080/video",  # Camera 5 (Active)
    6: None,  # Camera 6 (Use database URL)
    7: None,  # Camera 7 (Use database URL)
    # ... continues to camera 30
}
```

### **Step 3: Configure Your Cameras**

**Option A: Use Manual URL**
```python
1: "http://10.227.24.164:8080/video",  # Your camera URL
```

**Option B: Use Database URL**
```python
1: None,  # Will fetch URL from database
```

---

## 📊 **Configuration Examples**

### **Example 1: All Cameras Same URL (Current Setup)**

```python
MANUAL_CAMERA_URLS = {
    1: "http://10.227.24.164:8080/video",
    2: "http://10.227.24.164:8080/video",
    3: "http://10.227.24.164:8080/video",
    4: "http://10.227.24.164:8080/video",
    5: "http://10.227.24.164:8080/video",
    6: None,  # Rest use database
    7: None,
    # ... etc
}
```

**Result:**
- Cameras 1-5: Use `http://10.227.24.164:8080/video`
- Cameras 6-30: Use database configuration

---

### **Example 2: Each Camera Different URL**

```python
MANUAL_CAMERA_URLS = {
    1: "http://192.168.1.101:8080/video",  # Camera 1
    2: "http://192.168.1.102:8080/video",  # Camera 2
    3: "http://192.168.1.103:8080/video",  # Camera 3
    4: "http://192.168.1.104:8080/video",  # Camera 4
    5: "http://192.168.1.105:8080/video",  # Camera 5
    6: "http://192.168.1.106:8080/video",  # Camera 6
    # ... etc
}
```

**Result:**
- Each camera has its own unique IP address

---

### **Example 3: Mixed Configuration**

```python
MANUAL_CAMERA_URLS = {
    # Parking Area 1 (Cameras 1-5)
    1: "http://10.227.24.164:8080/video",
    2: "http://10.227.24.164:8080/video",
    3: "http://10.227.24.164:8080/video",
    4: "http://10.227.24.164:8080/video",
    5: "http://10.227.24.164:8080/video",
    
    # Parking Area 2 (Cameras 6-10)
    6: "http://10.227.24.165:8080/video",
    7: "http://10.227.24.165:8080/video",
    8: "http://10.227.24.165:8080/video",
    9: "http://10.227.24.165:8080/video",
    10: "http://10.227.24.165:8080/video",
    
    # Rest use database (Cameras 11-30)
    11: None,
    12: None,
    # ... etc
}
```

**Result:**
- Cameras 1-5: IP Camera at `.164`
- Cameras 6-10: IP Camera at `.165`
- Cameras 11-30: Database configuration

---

### **Example 4: RTSP Cameras**

```python
MANUAL_CAMERA_URLS = {
    1: "rtsp://admin:password@192.168.1.101:554/stream1",
    2: "rtsp://admin:password@192.168.1.102:554/stream1",
    3: "rtsp://admin:password@192.168.1.103:554/stream1",
    # ... etc
}
```

**Result:**
- Each camera uses RTSP protocol (for IP cameras)

---

## 🔄 **How It Works**

### **1. Camera ID Detection**

The system automatically detects camera IDs from various formats:

```python
# All these work:
"1" → Camera 1
"camera-1" → Camera 1
"cam1" → Camera 1
1 → Camera 1
"camera_1" → Camera 1
```

### **2. URL Priority**

```
1. Manual URL (MANUAL_CAMERA_URLS) ← Highest Priority
2. Database URL (from API)
3. Error if neither found
```

### **3. Automatic Logging**

When the service starts, you'll see:

```
📹 Multi-Camera Configuration Loaded:
   Total Cameras Configured: 5
   Camera 1: http://10.227.24.164:8080/video
   Camera 2: http://10.227.24.164:8080/video
   Camera 3: http://10.227.24.164:8080/video
   Camera 4: http://10.227.24.164:8080/video
   Camera 5: http://10.227.24.164:8080/video
```

When loading a camera:

```
📹 Using Manual Camera URL (Camera 1): http://10.227.24.164:8080/video
```

Or:

```
🗄️ Using Database Camera URL: http://from-database.com/video
```

---

## 🗄️ **Database Integration**

### **How Cameras Connect to Database**

1. **Parking Lot** → Has multiple cameras
2. **Camera** → Has camera_id and URL in database
3. **Slots** → Belong to specific camera_id
4. **Detection** → Updates slots for specific camera

### **Database Schema**

```sql
-- Cameras are linked to parking lots
cameras:
  - id (camera_id)
  - parking_lot_id
  - url (optional, can be overridden)
  - name

-- Slots are linked to cameras
slots:
  - id
  - parking_lot_id
  - camera_id  ← Links slot to camera
  - slot_number
  - x, y, width, height  ← Coordinates
  - status
```

### **API Endpoint**

```
GET /api/parking/{lot_id}/slots?cameraId={camera_id}
```

**Response:**
```json
{
  "cameraUrl": "http://database-url.com/video",
  "cameras": [
    {
      "id": "camera-1",
      "url": "http://camera-specific-url.com/video"
    }
  ],
  "slots": [
    {
      "slotNumber": 1,
      "cameraId": "camera-1",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 200,
      "status": "AVAILABLE"
    }
  ]
}
```

---

## 🚀 **Usage**

### **Starting a Camera Monitor**

```bash
# Start camera 1 for parking lot "lot-123"
POST http://localhost:5000/start/lot-123/camera-1

# Start camera 2 for parking lot "lot-123"
POST http://localhost:5000/start/lot-123/camera-2
```

### **Viewing Camera Stream**

```bash
# View camera 1 stream
http://localhost:5000/camera/lot-123/camera-1

# View camera 2 stream
http://localhost:5000/camera/lot-123/camera-2
```

### **Stopping a Camera**

```bash
# Stop camera 1
POST http://localhost:5000/stop/lot-123/camera-1
```

---

## 📝 **Configuration Checklist**

### **For Each Camera:**

- [ ] **Set camera URL** in `MANUAL_CAMERA_URLS` (or use `None` for database)
- [ ] **Create camera** in database with `camera_id`
- [ ] **Assign slots** to camera in database (set `camera_id` field)
- [ ] **Set slot coordinates** (x, y, width, height) for detection
- [ ] **Test camera stream** URL is accessible
- [ ] **Start monitor** via API endpoint
- [ ] **Verify detection** is working

---

## 🔍 **Troubleshooting**

### **Camera not connecting?**

1. **Check URL is accessible:**
   ```bash
   # Test in browser or VLC
   http://10.227.24.164:8080/video
   ```

2. **Check configuration:**
   ```python
   # In main.py, verify:
   1: "http://10.227.24.164:8080/video",  # Correct URL?
   ```

3. **Check logs:**
   ```
   📹 Using Manual Camera URL (Camera 1): http://...
   👁️ Starting AI Vision Analysis...
   ```

### **Slots not detecting?**

1. **Verify camera_id matches:**
   ```sql
   SELECT * FROM slots WHERE camera_id = 'camera-1';
   ```

2. **Check slot coordinates:**
   ```sql
   SELECT slot_number, x, y, width, height FROM slots;
   ```

3. **Verify slots are assigned to correct camera**

### **Wrong camera URL being used?**

**Priority order:**
1. Manual URL (highest)
2. Database URL
3. Error

**Check which is being used in logs:**
```
📹 Using Manual Camera URL (Camera 1): ...
OR
🗄️ Using Database Camera URL: ...
```

---

## 🎯 **Quick Start Guide**

### **1. Configure Cameras (5 minutes)**

Edit `opencv-service/main.py`:

```python
MANUAL_CAMERA_URLS = {
    1: "http://YOUR_CAMERA_IP:8080/video",
    2: "http://YOUR_CAMERA_IP:8080/video",
    3: "http://YOUR_CAMERA_IP:8080/video",
    4: "http://YOUR_CAMERA_IP:8080/video",
    5: "http://YOUR_CAMERA_IP:8080/video",
    # ... rest as None or add more URLs
}
```

### **2. Restart Python Service**

```bash
# Stop current service (Ctrl+C in terminal)
python opencv-service/main.py
```

### **3. Verify Configuration**

Check terminal output:

```
📹 Multi-Camera Configuration Loaded:
   Total Cameras Configured: 5
   Camera 1: http://...
   Camera 2: http://...
```

### **4. Start Cameras**

```bash
# Start each camera
curl -X POST http://localhost:5000/start/lot-123/camera-1
curl -X POST http://localhost:5000/start/lot-123/camera-2
curl -X POST http://localhost:5000/start/lot-123/camera-3
```

### **5. View Streams**

```
http://localhost:5000/camera/lot-123/camera-1
http://localhost:5000/camera/lot-123/camera-2
http://localhost:5000/camera/lot-123/camera-3
```

---

## 📊 **System Architecture**

```
┌─────────────────────────────────────────────────────────┐
│         MULTI-CAMERA SMART PARKING SYSTEM               │
└─────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Camera 1    │     │  Camera 2    │     │  Camera 3    │
│  (Slots 1-30)│     │ (Slots 31-60)│     │ (Slots 61-90)│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                ┌───────────▼────────────┐
                │  Python AI Service     │
                │  (opencv-service)      │
                │                        │
                │  • Multi-Camera URLs   │
                │  • TensorFlow Model    │
                │  • Car Detection       │
                │  • Slot Monitoring     │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  Next.js API           │
                │  /api/internal/slots   │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  MySQL Database        │
                │                        │
                │  • Parking Lots        │
                │  • Cameras             │
                │  • Slots               │
                │  • Real-time Status    │
                └────────────────────────┘
```

---

## ✨ **Features**

✅ **30 Camera Support** - Configure up to 30 individual cameras  
✅ **Flexible URLs** - Each camera can have different URL  
✅ **Database Integration** - Automatic slot-to-camera mapping  
✅ **Smart Detection** - Automatic camera ID extraction  
✅ **Mixed Mode** - Combine manual and database URLs  
✅ **Real-time Updates** - Live slot status updates  
✅ **Easy Configuration** - Single file, clear structure  
✅ **Comprehensive Logging** - See exactly what's happening  

---

## 🎉 **You're All Set!**

Your multi-camera system is now **fully configured** and ready to use!

**Next steps:**
1. Configure your camera URLs in `main.py`
2. Restart the Python service
3. Start your cameras via API
4. Monitor real-time parking detection

**Need help?** Check the logs for detailed information about each camera!
