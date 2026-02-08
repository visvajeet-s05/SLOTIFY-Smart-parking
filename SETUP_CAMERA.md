# Real-time Parking Camera Integration Setup

This guide explains how to run the real-time AI parking camera system, including the Python detection service, WebSocket server, and Next.js frontend.

## 1. Prerequisites

- **Node.js** (v18+)
- **Python** (v3.8+)
- **MySQL** Database (handled via Prisma)
- **Logitech Capture** or **IP Webcam App** (for camera streams)

## 2. Environment Setup

Ensure your `.env.local` contains the following:

```env
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4000
```

## 3. Running the Services

You need to run three separate terminals for the full system.

### Terminal 1: WebSocket Server

Handles real-time updates between AI, Owners, and Customers.

```bash
npx ts-node ws-server/index.ts
```

*Expected output: `✅ WebSocket Server running on port 4000`*

### Terminal 2: AI Detection Service (Python)

Processes camera feeds and detects cars.

```bash
# Install requirements (first time only)
pip install flask flask-cors opencv-python numpy requests

# Run the service
python opencv-service/main.py
```

*Expected output: `🚀 AI Service running on port 5000`*

### Terminal 3: Next.js Frontend

The main application.

```bash
npm run dev
```

*Expected output: `Ready on http://localhost:3000`*

## 4. Usage Flow

1.  **Configure Camera**:
    *   Log in as an Owner.
    *   Go to **Settings** or use API to set a `cameraUrl` for your parking lot (e.g., `http://192.168.1.100:8080/video`).
    *   *Note: Currently, configuration is fetched from the database. You can manually set it in DB or use the provided API endpoints.*

2.  **Start Monitoring**:
    *   Navigate to **Parking Lots -> [Your Lot] -> Camera**.
    *   Click **Start AI**.
    *   The system will connect to the camera, start processing, and you should see the live feed with overlays.

3.  **View Results**:
    *   **Owner Slots Page**: Updates in real-time as cars enter/leave.
    *   **Customer Portal**: Availablity counts update instantly.

## 5. Troubleshooting

*   **Camera not loading**: Ensure the PC running the Python service can access the Camera URL. Check firewall settings.
*   **No updates on frontend**: Check if WebSocket server is running and `NEXT_PUBLIC_WEBSOCKET_URL` is correct.
*   **"System Error" in AI Service**: Check Python console for traceback. Ensure `slot_coordinates.json` is generated or coordinates are available via API.
