"use client"

import { useEffect, useState, useRef } from "react"
import { Video, Wifi, WifiOff, RefreshCw } from "lucide-react"

interface CameraPanelProps {
  parkingLotId: string
  streamUrl?: string
}

export default function CameraPanel({ parkingLotId, streamUrl }: CameraPanelProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Default stream URL from Flask server
  const defaultStreamUrl = "http://localhost:5000/video_feed"
  const actualStreamUrl = streamUrl || defaultStreamUrl

  useEffect(() => {
    // Connect to WebSocket for status updates
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:4000")

        ws.onopen = () => {
          console.log("✅ CameraPanel connected to WebSocket")
          setIsConnected(true)
          setError(null)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastUpdate(new Date())
          } catch (err) {
            // Ignore non-JSON messages
          }
        }

        ws.onclose = () => {
          console.log("⚠️ CameraPanel disconnected from WebSocket")
          setIsConnected(false)
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (err) => {
          console.error("❌ CameraPanel WebSocket error:", err)
          setError("Connection error")
          setIsConnected(false)
        }

        wsRef.current = ws
      } catch (err) {
        console.error("Failed to connect WebSocket:", err)
        setError("Failed to connect")
      }
    }

    connectWebSocket()

    // Simulate loading complete after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [parkingLotId])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Live Camera Feed</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400">Offline</span>
              </>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative bg-black">
        {isLoading ? (
          <div className="flex items-center justify-center h-[420px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
              <p className="text-gray-400 text-sm">Initializing camera feed...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[420px]">
            <div className="text-center">
              <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-400 font-medium">{error}</p>
              <p className="text-gray-500 text-sm mt-1">Check camera connection</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* MJPEG Stream */}
            <img
              src={actualStreamUrl}
              alt="Camera Feed"
              className="w-full h-[420px] object-cover"
              onError={() => {
                setError("Failed to load video stream")
                setIsLoading(false)
              }}
              onLoad={() => {
                setIsLoading(false)
                setError(null)
              }}
            />
            
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">
                Parking Lot: {parkingLotId}
              </p>
              {lastUpdate && (
                <p className="text-gray-400 text-xs">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* AI Detection Overlay (simulated) */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-xs">AI Detection Active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Stream: MJPEG over HTTP</span>
          <span>WebSocket: {isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>
    </div>
  )
}
