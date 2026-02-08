"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, Video, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Import components
import CameraPanel from "./CameraPanel"
import SlotConfigGrid from "./SlotConfigGrid"
import AiConfidence from "./AiConfidence"
import BulkActions from "./BulkActions"

import { useSession } from "next-auth/react"

interface ParkingLot {
  id: string
  name: string
  slug: string
  location: string
  priceHr: number
  totalSlots: number
}

export default function OwnerParkingLotPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { id: parkingLotId } = use(params)
  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  // Verify owner role from session
  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "OWNER") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);


  // Fetch parking lot data
  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        // Fetch from API
        const response = await fetch(`/api/parking/${parkingLotId}/slots`)
        if (!response.ok) throw new Error("Failed to fetch parking lot")

        const data = await response.json()

        // For now, construct parking lot info from slots
        // In production, you'd have a separate endpoint for lot details
        setParkingLot({
          id: parkingLotId,
          name: "Chennai Central", // This should come from API
          slug: "chennai-central",
          location: "Chennai Central Station", // This should come from API
          priceHr: 50,
          totalSlots: data.slots?.length || 40
        })
      } catch (err) {
        console.error("Error fetching parking lot:", err)
        setError("Failed to load parking lot data")

        // Fallback data for demo
        setParkingLot({
          id: parkingLotId,
          name: "Chennai Central",
          slug: "chennai-central",
          location: "Chennai Central Station",
          priceHr: 50,
          totalSlots: 40
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchParkingLot()
  }, [parkingLotId])

  const handleBulkActionComplete = () => {
    // Refresh slot data after bulk action
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-cyan-500"></div>
          <p className="text-gray-400">Loading owner dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !parkingLot) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Parking lot not found"}</p>
          <Link
            href="/dashboard/owner"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-800 bg-gray-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Link href="/dashboard/owner" className="hover:text-cyan-400 transition">
                  Dashboard
                </Link>
                <span>/</span>
                <span>Parking Lots</span>
                <span>/</span>
                <span className="text-cyan-400">Management</span>
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {parkingLot.name}
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30">
                  Owner View
                </span>
              </h1>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <MapPin className="h-4 w-4" />
                <span>{parkingLot.location}</span>
                <span className="mx-2">•</span>
                <span>₹{parkingLot.priceHr}/hr</span>
                <span className="mx-2">•</span>
                <span>{parkingLot.totalSlots} slots</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Camera Live</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                <Settings className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">AI + Manual</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - 12 Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - 8 spans */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Camera Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CameraPanel
                parkingLotId={parkingLotId}
                streamUrl="http://localhost:5000/video_feed"
              />
            </motion.div>

            {/* Slot Configuration Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SlotConfigGrid
                parkingLotId={parkingLotId}
                lotSlug={parkingLot.slug}
              />
            </motion.div>
          </div>

          {/* Right Column - 4 spans */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* AI Confidence Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AiConfidence parkingLotId={parkingLotId} />
            </motion.div>

            {/* Bulk Actions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <BulkActions
                lotSlug={parkingLot.slug}
                totalSlots={parkingLot.totalSlots}
                slotsPerRow={8}
                onActionComplete={handleBulkActionComplete}
              />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4"
            >
              <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Revenue Today</span>
                  <span className="text-emerald-400 font-medium">₹12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Active Bookings</span>
                  <span className="text-blue-400 font-medium">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">AI Accuracy</span>
                  <span className="text-purple-400 font-medium">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">System Uptime</span>
                  <span className="text-cyan-400 font-medium">99.9%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
