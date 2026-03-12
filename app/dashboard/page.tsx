"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Search, Filter, MapPin, Clock, Car, Star, TrendingUp, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import ParkingAreaCard from "@/components/parking/parking-area-card"
import DashboardShell from "@/components/ui/DashboardShell"
import MapSkeleton from "@/components/map/MapSkeleton"
import CustomerNavbar from "@/components/navigation/CustomerNavbar"

// Dynamically import the map to prevent SSR issues
const ParkingMap = dynamic(() => import("@/components/map/parking-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

// WebSocket connection for real-time updates
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000"

// Parking area type from database
interface ParkingArea {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  totalSlots: number
  availableSlots: number
  occupiedSlots: number
  reservedSlots: number
  price: number
  status: "available" | "limited" | "full"
  ownerName: string
  ownerEmail: string
  cameraUrl: string | null
  features: string[]
  distance: number
  rating: number
  openingHours: string
  coordinates: [number, number]
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 150])
  const [selectedParkingArea, setSelectedParkingArea] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance")

  // Database connection states
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch parking areas from database
  const fetchParkingAreas = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/parking")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch parking areas")
      }

      setParkingAreas(data.parkingAreas || [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error("Error fetching parking areas:", err)
      setError(err instanceof Error ? err.message : "Failed to load parking areas")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchParkingAreas()
  }, [fetchParkingAreas])

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const MAX_RECONNECT_ATTEMPTS = 5
    const BASE_RECONNECT_DELAY = 3000

    const connectWebSocket = () => {
      // Prevent duplicate connections
      if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
        return
      }

      // Stop trying after max attempts
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.log("⚠️ Max WebSocket reconnection attempts reached. Stopping reconnection.")
        return
      }

      try {
        ws = new WebSocket(WS_URL)

        ws.onopen = () => {
          console.log("✅ Customer Dashboard WebSocket connected")
          setWsConnected(true)
          reconnectAttempts = 0 // Reset counter on successful connection

          // Subscribe to all parking lot updates
          ws?.send(JSON.stringify({
            type: "SUBSCRIBE",
            role: "CUSTOMER"
          }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            // Handle slot updates
            if (data.type === "SLOT_UPDATE" && data.lotId) {
              setParkingAreas(prev => prev.map(area => {
                if (area.id === data.lotId) {
                  // Update slot counts based on the status change
                  const newArea = { ...area }

                  if (data.status === "AVAILABLE") {
                    newArea.availableSlots = Math.min(area.availableSlots + 1, area.totalSlots)
                    newArea.occupiedSlots = Math.max(area.occupiedSlots - 1, 0)
                  } else if (data.status === "OCCUPIED") {
                    newArea.availableSlots = Math.max(area.availableSlots - 1, 0)
                    newArea.occupiedSlots = Math.min(area.occupiedSlots + 1, area.totalSlots)
                  } else if (data.status === "RESERVED") {
                    newArea.availableSlots = Math.max(area.availableSlots - 1, 0)
                    newArea.reservedSlots = Math.min(area.reservedSlots + 1, area.totalSlots)
                  }

                  // Recalculate status
                  const availabilityRatio = newArea.totalSlots > 0 ? newArea.availableSlots / newArea.totalSlots : 0
                  newArea.status = availabilityRatio > 0.5 ? "available" :
                    availabilityRatio > 0.2 ? "limited" : "full"

                  return newArea
                }
                return area
              }))

              setLastUpdate(new Date())
            }

            // Handle bulk updates
            if (data.type === "BULK_UPDATE" && data.lotId) {
              // Refresh all data for accuracy
              fetchParkingAreas()
            }
          } catch (err) {
            console.error("Error processing WebSocket message:", err)
          }
        }

        ws.onclose = (event) => {
          console.log(`❌ Customer Dashboard WebSocket disconnected (code: ${event.code}, reason: ${event.reason || 'No reason provided'})`)
          setWsConnected(false)

          // Attempt to reconnect with exponential backoff
          reconnectAttempts++
          const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 30000)
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)

          reconnectTimeout = setTimeout(connectWebSocket, delay)
        }

        ws.onerror = (error) => {
          // Log error details without causing console error spam
          const errorInfo = {
            type: error?.type || 'unknown',
            timestamp: new Date().toISOString(),
            readyState: ws?.readyState,
            url: WS_URL
          }
          console.warn("WebSocket connection issue:", errorInfo)
          setWsConnected(false)
          // Don't close here - let onclose handle reconnection
        }
      } catch (err) {
        console.error("Failed to create WebSocket connection:", err instanceof Error ? err.message : String(err))
        setWsConnected(false)
      }
    }

    connectWebSocket()

    // Cleanup
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws) {
        ws.onclose = null // Prevent reconnection attempts during cleanup
        ws.close()
      }
    }
  }, [fetchParkingAreas])

  // Filter logic
  let filteredAreas = parkingAreas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Apply price filter
  filteredAreas = filteredAreas.filter(
    (area) => area.price >= priceRange[0] && area.price <= priceRange[1]
  )

  // Apply sorting
  filteredAreas = [...filteredAreas].sort((a, b) => {
    if (sortBy === "distance") return a.distance - b.distance
    if (sortBy === "price") return a.price - b.price
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  const stats = {
    total: parkingAreas.length,
    available: parkingAreas.filter(a => a.status === "available").length,
    totalSpots: parkingAreas.reduce((sum, a) => sum + a.totalSlots, 0),
    avgRating: parkingAreas.length > 0
      ? (parkingAreas.reduce((sum, a) => sum + a.rating, 0) / parkingAreas.length).toFixed(1)
      : "0.0",
  }

  return (
    <DashboardShell>
      {/* Page Header – Unified Dark Minimal */}
      <div className="relative pt-8 pb-8 overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

        <div className="relative z-10 px-4 max-w-7xl mx-auto text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Find Your Perfect Spot
              </span>
            </h1>
            <div className="overflow-hidden">
              <p className="text-lg text-slate-400 max-w-none whitespace-nowrap text-ellipsis overflow-hidden leading-relaxed">
                Experience seamless parking across Tamil Nadu with real-time availability and smart booking.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto py-4 space-y-8 relative z-20 pb-20">

        {/* Quick Stats - Minimal Dark Glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="group bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Parking</p>
                <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Car className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="group bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Available</p>
                <p className="text-3xl font-bold text-emerald-400">{stats.available}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="group bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 hover:border-blue-500/30 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Spaces</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalSpots}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="group bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Rating</p>
                <p className="text-3xl font-bold text-amber-400">{stats.avgRating}★</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Star className="h-6 w-6 text-amber-400 fill-amber-400/20" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters - Minimal Dark bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-20 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1 shadow-2xl shadow-black/50"
        >
          <div className="flex flex-col md:flex-row gap-2 p-1">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              <Input
                placeholder="Search parking by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-transparent border-transparent text-white placeholder-slate-500 focus:bg-white/5 focus:border-white/10 focus:ring-0 transition-all rounded-xl text-lg"
              />
            </div>

            <div className="h-px md:h-14 w-full md:w-px bg-white/5" />

            {/* Filters Row */}
            <div className="flex gap-2">
              {/* Price Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-14 px-6 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                    <Filter className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price Range</span>
                      <span className="font-medium">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900 border-white/10 text-white p-5 rounded-2xl shadow-xl backdrop-blur-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white">Price Range (₹/hr)</h4>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 150]}
                      max={150}
                      step={5}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-14 w-px bg-white/5 hidden md:block" />

              {/* Sort Dropdown */}
              <div className="relative min-w-[180px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Sort By</span>
                  <TrendingUp className="h-0 w-0 hidden" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-14 w-full appearance-none bg-transparent hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl pl-4 pt-4 pb-1 pr-10 text-white font-medium focus:outline-none cursor-pointer transition-all"
                >
                  <option value="distance" className="bg-slate-900 text-slate-300">Distance</option>
                  <option value="price" className="bg-slate-900 text-slate-300">Price (Low to High)</option>
                  <option value="rating" className="bg-slate-900 text-slate-300">Rating (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-0 bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden h-[500px] shadow-2xl shadow-black/40"
        >
          <div className="absolute inset-0 z-0">
            <ParkingMap
              parkingAreas={filteredAreas}
              selectedId={selectedParkingArea}
              onSelectParkingArea={setSelectedParkingArea}
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="relative mx-auto h-16 w-16 mb-6">
              <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-r-2 border-indigo-500 rounded-full animate-spin-reverse"></div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Syncing real-time parking data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-sm mx-auto max-w-2xl">
            <p className="text-red-400 mb-6 flex items-center justify-center gap-2 font-medium"><span className="text-xl">⚠️</span> {error}</p>
            <Button
              onClick={fetchParkingAreas}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Parking Areas Grid */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8 scroll-mt-24" id="available-parking">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full block"></span>
                {filteredAreas.length === 0 ? "No Areas Found" : "Available Parking"}
              </h2>
              <div className="text-slate-400 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                Found <span className="text-white font-bold">{filteredAreas.length}</span> results
              </div>
            </div>

            {filteredAreas.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 border border-white/5 rounded-3xl backdrop-blur-sm">
                <p className="text-slate-400 mb-6 text-lg">No parking areas match your current filters.</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setPriceRange([0, 150])
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-xl border border-white/5"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAreas.map((area, index) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ParkingAreaCard
                      parkingArea={{
                        ...area,
                        availableSlots: area.availableSlots,
                        totalSlots: area.totalSlots,
                      }}
                      isSelected={selectedParkingArea === area.id}
                      onSelect={() => setSelectedParkingArea(area.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardShell>
  )
}
