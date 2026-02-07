"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Settings, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SlotGrid from "@/components/SlotGrid"
import { useParkingSocket } from "@/hooks/useParkingSocket"

type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER" | "SYSTEM"
  updatedAt: string
  price: number
  slotType?: string
}

interface OwnerDashboardProps {
  parkingLotId: string
}

export default function OwnerDashboard({ parkingLotId }: OwnerDashboardProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [stats, setStats] = useState({
    total: 120,
    available: 0,
    occupied: 0,
    reserved: 0,
    disabled: 0,
    occupancyRate: 0
  })

  // Fetch real slot data from backend
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(`/api/parking/${parkingLotId}/slots`)
        if (response.ok) {
          const data = await response.json()
          const formattedSlots: Slot[] = data.slots.map((slot: any) => ({
            id: slot.id || slot.slotId,
            slotNumber: slot.slotNumber || slot.index,
            row: slot.row,
            status: slot.status,
            aiConfidence: slot.aiConfidence || slot.confidence || 0,
            updatedBy: slot.updatedBy || slot.source || "SYSTEM",
            updatedAt: slot.updatedAt || new Date().toISOString(),
            price: slot.price || 50,
            slotType: slot.slotType
          }))
          setSlots(formattedSlots)
          updateStats(formattedSlots)
        } else {
          // Fallback to mock data if API fails
          const mockSlots: Slot[] = []
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

          rows.forEach(row => {
            for (let index = 1; index <= 15; index++) {
              const slotId = `CEN-${row}-${index.toString().padStart(2, '0')}`
              const random = Math.random()
              let status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" = "AVAILABLE"

              if (random > 0.8) status = "DISABLED"
              else if (random > 0.6) status = "OCCUPIED"
              else if (random > 0.4) status = "RESERVED"

              mockSlots.push({
                id: slotId,
                slotNumber: index,
                row,
                status,
                aiConfidence: Math.floor(Math.random() * 20) + 80,
                updatedBy: status === "OCCUPIED" ? "AI" : "SYSTEM",
                updatedAt: new Date().toISOString(),
                price: 50
              })
            }
          })

          setSlots(mockSlots)
          updateStats(mockSlots)
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error)
        // Use mock data as fallback
        const mockSlots: Slot[] = []
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

        rows.forEach(row => {
          for (let index = 1; index <= 15; index++) {
            const slotId = `CEN-${row}-${index.toString().padStart(2, '0')}`
            const random = Math.random()
            let status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" = "AVAILABLE"

            if (random > 0.8) status = "DISABLED"
            else if (random > 0.6) status = "OCCUPIED"
            else if (random > 0.4) status = "RESERVED"

            mockSlots.push({
              id: slotId,
              slotNumber: index,
              row,
              status,
              aiConfidence: Math.floor(Math.random() * 20) + 80,
              updatedBy: status === "OCCUPIED" ? "AI" : "SYSTEM",
              updatedAt: new Date().toISOString(),
              price: 50
            })
          }
        })

        setSlots(mockSlots)
        updateStats(mockSlots)
      }
    }

    fetchSlots()
  }, [parkingLotId])

  // Listen for real-time slot updates
  useParkingSocket({
    lotId: parkingLotId,
    onSlotUpdate: (data) => {
      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.id === data.slotId
            ? { ...slot, status: data.status, aiConfidence: data.confidence || 0, updatedBy: data.updatedBy || "SYSTEM" }
            : slot
        )
      )
    },
    onBulkUpdate: () => {
      // Refresh all slots after bulk update
      fetch(`/api/parking/${parkingLotId}/slots`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) {
            const formattedSlots: Slot[] = data.slots.map((slot: any) => ({
              id: slot.id || slot.slotId,
              slotNumber: slot.slotNumber || slot.index,
              row: slot.row,
              status: slot.status,
              aiConfidence: slot.aiConfidence || slot.confidence || 0,
              updatedBy: slot.updatedBy || slot.source || "SYSTEM",
              updatedAt: slot.updatedAt || new Date().toISOString(),
              price: slot.price || 50,
              slotType: slot.slotType
            }))
            setSlots(formattedSlots)
            updateStats(formattedSlots)
          }
        })
    }
  })

  const updateStats = (slotList: Slot[]) => {
    const newStats = {
      total: slotList.length,
      available: slotList.filter(s => s.status === "AVAILABLE").length,
      occupied: slotList.filter(s => s.status === "OCCUPIED").length,
      reserved: slotList.filter(s => s.status === "RESERVED").length,
      disabled: slotList.filter(s => s.status === "DISABLED").length,
      occupancyRate: 0
    }
    newStats.occupancyRate = Math.round((newStats.occupied / newStats.total) * 100)
    setStats(newStats)
  }

  useEffect(() => {
    updateStats(slots)
  }, [slots])

  const handleBulkAction = async (action: "AVAILABLE" | "DISABLED", slotIds: string[]) => {
    try {
      // Send bulk update to backend
      const response = await fetch("/api/owner/slots/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotIds,
          status: action,
          lotId: parkingLotId,
          updatedBy: "OWNER"
        })
      })

      if (response.ok) {
        // Update local state
        setSlots(prevSlots =>
          prevSlots.map(slot =>
            slotIds.includes(slot.id)
              ? {
                  ...slot,
                  status: action,
                  updatedBy: "OWNER",
                  updatedAt: new Date().toISOString()
                }
              : slot
          )
        )
        setSelectedSlots([])
      } else {
        console.error("Failed to update slots")
      }
    } catch (error) {
      console.error("Bulk update error:", error)
    }
  }

  const toggleCamera = () => {
    setCameraActive(!cameraActive)
    // In real implementation, this would control the camera server
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Owner Dashboard</h1>
          <p className="text-gray-400">Manage your Chennai Central parking lot</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={toggleCamera}
            className={`${cameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Camera className="mr-2 h-4 w-4" />
            {cameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Slots</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.available}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Occupied</CardTitle>
            <Users className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.occupied}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Occupancy</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedSlots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleBulkAction("AVAILABLE", selectedSlots)}
                className="bg-green-600 hover:bg-green-700"
              >
                Enable Slots
              </Button>
              <Button
                size="sm"
                onClick={() => handleBulkAction("DISABLED", selectedSlots)}
                className="bg-red-600 hover:bg-red-700"
              >
                Disable Slots
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedSlots([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="management">Slot Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Live Slot Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SlotGrid
                slots={slots}
                selectable={true}
                onSelect={(slot) => {
                  const slotId = slot.id
                  if (selectedSlots.includes(slotId)) {
                    setSelectedSlots(prev => prev.filter(id => id !== slotId))
                  } else {
                    setSelectedSlots(prev => [...prev, slotId])
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Slot Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Click on slots to select them for bulk operations. Use the controls above to enable/disable multiple slots at once.
                </p>
                <SlotGrid
                  slots={slots}
                  selectable={true}
                  onSelect={(slot) => {
                    const slotId = slot.id
                    if (selectedSlots.includes(slotId)) {
                      setSelectedSlots(prev => prev.filter(id => id !== slotId))
                    } else {
                      setSelectedSlots(prev => [...prev, slotId])
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">₹2,450</div>
                <p className="text-gray-400 text-sm">+12% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">9AM - 6PM</div>
                <p className="text-gray-400 text-sm">Average 85% occupancy</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
