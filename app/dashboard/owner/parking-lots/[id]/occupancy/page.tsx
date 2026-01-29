"use client"

import { useEffect, useState } from "react"
import { Car, Activity, AlertTriangle } from "lucide-react"

type Slot = {
  id: number
  label: string
  status: "available" | "occupied" | "reserved"
}

export default function OwnerRealTimeOccupancyPage() {
  const [slots, setSlots] = useState<Slot[]>([])

  // Simulated real-time updates
  useEffect(() => {
    const initialSlots: Slot[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i + 1,
      label: `S-${i + 1}`,
      status: Math.random() > 0.6 ? "occupied" : "available",
    }))

    setSlots(initialSlots)

    const interval = setInterval(() => {
      setSlots(prev =>
        prev.map(slot =>
          Math.random() > 0.85
            ? {
                ...slot,
                status:
                  slot.status === "occupied" ? "available" : "occupied",
              }
            : slot
        )
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const total = slots.length
  const occupied = slots.filter(s => s.status === "occupied").length
  const available = slots.filter(s => s.status === "available").length
  const reserved = slots.filter(s => s.status === "reserved").length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Real-Time Occupancy</h1>
        <p className="text-sm text-gray-400">
          Live parking slot usage for this facility
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Slots" value={total} icon={<Car />} />
        <StatCard
          title="Occupied"
          value={occupied}
          icon={<Activity />}
          color="text-red-400"
        />
        <StatCard
          title="Available"
          value={available}
          icon={<Activity />}
          color="text-green-400"
        />
        <StatCard
          title="Reserved"
          value={reserved}
          icon={<AlertTriangle />}
          color="text-yellow-400"
        />
      </div>

      {/* Slot Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="font-medium mb-4">Slot Status</h3>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {slots.map(slot => (
            <div
              key={slot.id}
              className={`rounded-md border text-xs text-center py-2 transition
                ${
                  slot.status === "occupied"
                    ? "bg-red-500/10 border-red-500 text-red-400"
                    : slot.status === "reserved"
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                    : "bg-green-500/10 border-green-500 text-green-400"
                }
              `}
            >
              {slot.label}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        This view supports live feeds from cameras, IoT sensors, and QR entry logs.
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