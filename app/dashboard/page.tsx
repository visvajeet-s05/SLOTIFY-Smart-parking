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
      <CustomerNavbar />

      {/* Page Header – STATIC */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-900/70 border-b border-gray-800">
        <div className="px-4 max-w-7xl mx-auto py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Find Your Parking
          </h1>
          <p className="text-gray-300">
            Search and book the perfect parking spot in Tamil Nadu
          </p>
        </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto py-8 space-y-8">
        {/* Connection Status Bar */}
        <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm text-gray-400">
                {wsConnected ? "Live Updates" : "Offline Mode"}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchParkingAreas}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Parking</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Car className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-400">{stats.available}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spaces</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalSpots}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.avgRating}★</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 opacity-50 fill-current" />
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-20 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search parking areas or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>

            {/* Price Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-gray-700 hover:bg-gray-600 border-gray-600 border">
                  <Filter className="mr-2 h-4 w-4" />
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Price Range (₹/hr)</h4>
                  <Slider
                    defaultValue={[0, 150]}
                    max={150}
                    step={5}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-2"
                  />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="distance">Sort by Distance</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            Found <span className="text-purple-400 font-semibold">{filteredAreas.length}</span> parking areas
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden h-[500px]"
        >
          <ParkingMap
            parkingAreas={filteredAreas}
            selectedId={selectedParkingArea}
            onSelectParkingArea={setSelectedParkingArea}
          />
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading parking areas from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 bg-red-900/20 border border-red-800 rounded-xl">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <Button
              onClick={fetchParkingAreas}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
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
            <h2
              id="available-parking"
              className="text-2xl font-bold text-white mb-6 scroll-mt-24"
            >
              {filteredAreas.length === 0 ? "No Parking Areas Found" : `Available Parking Areas (${filteredAreas.length})`}
            </h2>

            {filteredAreas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No parking areas match your criteria</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setPriceRange([0, 150])
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Reset Filters
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
                        availableSpots: area.availableSlots,
                        totalSpots: area.totalSlots,
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
