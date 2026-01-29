"use client"

import { useEffect, useState } from "react"
import { Video, Wifi, WifiOff, Settings } from "lucide-react"

type Camera = {
  id: string
  name: string
  zone: string
  status: "online" | "offline"
  lastActive: string
}

export default function OwnerCameraManagementPage() {
  const [cameras, setCameras] = useState<Camera[]>([])

  useEffect(() => {
    // Mock camera data (API-ready)
    setCameras([
      {
        id: "CAM-01",
        name: "Entry Gate Camera",
        zone: "Entry",
        status: "online",
        lastActive: "Just now",
      },
      {
        id: "CAM-02",
        name: "Exit Gate Camera",
        zone: "Exit",
        status: "online",
        lastActive: "2 mins ago",
      },
      {
        id: "CAM-03",
        name: "Level 1 – Zone A",
        zone: "Slots A1–A10",
        status: "offline",
        lastActive: "1 hr ago",
      },
    ])
  }, [])

  const onlineCount = cameras.filter(c => c.status === "online").length
  const offlineCount = cameras.filter(c => c.status === "offline").length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Camera Management</h1>
        <p className="text-sm text-gray-400">
          Monitor CCTV cameras installed in your parking facility
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Cameras" value={cameras.length} icon={<Video />} />
        <StatCard
          title="Online"
          value={onlineCount}
          icon={<Wifi />}
          color="text-green-400"
        />
        <StatCard
          title="Offline"
          value={offlineCount}
          icon={<WifiOff />}
          color="text-red-400"
        />
      </div>

      {/* Camera List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-medium">Installed Cameras</h3>
        </div>

        <div className="divide-y divide-gray-800">
          {cameras.map(cam => (
            <div
              key={cam.id}
              className="flex items-center justify-between p-4 hover:bg-gray-800/40 transition"
            >
              <div>
                <div className="font-medium">{cam.name}</div>
                <div className="text-xs text-gray-400">
                  Zone: {cam.zone}
                </div>
                <div className="text-xs text-gray-500">
                  Last Active: {cam.lastActive}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-xs px-2 py-1 rounded border
                    ${
                      cam.status === "online"
                        ? "border-green-500 text-green-400 bg-green-500/10"
                        : "border-red-500 text-red-400 bg-red-500/10"
                    }
                  `}
                >
                  {cam.status.toUpperCase()}
                </span>

                <button className="text-gray-400 hover:text-white">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        Cameras integrate with occupancy detection, QR verification, and AI models.
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function StatCard({
  title,
  value,
  icon,
  color = "text-purple-400",
}: {
  title: string
  value: number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="admin-card flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="text-xl font-semibold mt-1">{value}</div>
      </div>
      <div className={color}>{icon}</div>
    </div>
  )
}