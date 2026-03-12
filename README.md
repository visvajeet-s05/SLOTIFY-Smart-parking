# Smart Parking System

A comprehensive Smart Parking solution featuring a Next.js frontend, Node.js WebSocket server, and a Python-based AI service for real-time vehicle detection and slot management.

## 🚀 Features

- **Real-time Slot Monitoring**: Uses OpenCV and TensorFlow to detect vehicles in parking slots.
- **Interactive Dashboard**: Next.js-based admin and user interfaces.
- **Booking System**: Reserve parking spots in advance.
- **Payment Integration**: Stripe integration for payments.
- **Live Updates**: WebSocket-based real-time status updates on the dashboard.

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Prisma, MySQL/PostgreSQL
- **AI Service**: Python, Flask, OpenCV, TensorFlow/Inception
- **Real-time**: Socket.io / WebSocket

## 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)
- [MySQL](https://www.mysql.com/) (or PostgreSQL)

## ⚙️ Installation

### 1. Clone & Setup Frontend/Backend
```bash
# Install Node dependencies
npm install

# Setup Environment Variables
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### 2. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push Schema to Database
npx prisma db push

# (Optional) Seed Database
npx prisma db seed
```

### 3. AI Service Setup
Navigate to the `opencv-service` directory:
```bash
cd opencv-service

# Create Virtual Environment (Optional but recommended)
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install Python Requirements
pip install -r requirements.txt
```

## 🏃‍♂️ Running the Application

You need to run three separate services:

### 1. Next.js App (Frontend & API)
```bash
npm run dev
# Runs on http://localhost:3000
```

### 2. AI Camera Service
```bash
# In a new terminal
cd opencv-service
python main.py
# Runs on http://localhost:5000
```
*Note: Configure your camera IP in `.env` or `main.py` if using a real IP camera.*

### 3. WebSocket Server
```bash
# In a new terminal
npm run ws-server
# Runs on configured port (default 3001 or as specified)
```

## 📷 Camera Configuration

- The AI service expects a video stream.
- Default Camera IP: `10.151.236.96:8080` (Update `CAMERA_IP` in `.env`).
- Ensure models are present in `opencv-service/models/`.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

6. ## CI/CD Status

All workflows validated and passing ✅
